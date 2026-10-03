import { put, list } from '@vercel/blob';
import { readJson, writeJson, ok, isAuthed } from './_util.js';

const CFG = 'data/fanzone.json';

// Each vote is its own tiny blob (votes/<voteId>/<optionIndex>-<ts>-<rand>),
// so concurrent voting can never lose counts to read-modify-write races.
async function countVotes(voteId, optionCount) {
  const out = new Array(optionCount).fill(0);
  let total = 0;
  try {
    let cursor;
    do {
      const r = await list({ prefix: 'votes/' + voteId + '/', cursor, limit: 1000 });
      r.blobs.forEach(b => {
        const idx = parseInt(String(b.pathname.split('/').pop()).split('-')[0], 10);
        if (idx >= 0 && idx < optionCount) { out[idx]++; total++; }
      });
      cursor = r.hasMore ? r.cursor : null;
    } while (cursor);
  } catch (e) {}
  return { counts: out, total };
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const cfg = await readJson(CFG, {});
    if (cfg.vote && cfg.vote.id && Array.isArray(cfg.vote.options)) {
      const v = await countVotes(cfg.vote.id, cfg.vote.options.length);
      cfg.vote.counts = v.counts; cfg.vote.total = v.total;
    }
    return ok(res, cfg);
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });
  const b = req.body || {};

  // public: cast a vote
  if (b.cast !== undefined) {
    const cfg = await readJson(CFG, {});
    if (!cfg.vote || !cfg.vote.open) return res.status(400).json({ error: 'voting is closed' });
    const idx = parseInt(b.cast, 10);
    if (!(idx >= 0 && idx < cfg.vote.options.length)) return res.status(400).json({ error: 'bad option' });
    await put('votes/' + cfg.vote.id + '/' + idx + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8), '1', {
      access: 'public', contentType: 'text/plain', addRandomSuffix: false
    });
    return ok(res, { voted: true });
  }

  // everything else needs the admin key
  if (!isAuthed(req)) return res.status(401).json({ error: 'unauthorised' });
  const cfg = await readJson(CFG, {});

  if (b.setVote) {
    const options = (Array.isArray(b.setVote.options) ? b.setVote.options : [])
      .map(o => String(o).trim().slice(0, 60)).filter(Boolean).slice(0, 20);
    if (options.length < 2) return res.status(400).json({ error: 'need at least 2 options' });
    cfg.vote = {
      id: Date.now().toString(36),
      title: String(b.setVote.title || "Fans' Man of the Match").slice(0, 120),
      options, open: true, opened: new Date().toISOString()
    };
  } else if (b.closeVote) {
    if (cfg.vote) cfg.vote.open = false;
  } else if (b.reopenVote) {
    if (cfg.vote) cfg.vote.open = true;
  } else if (b.clearVote) {
    delete cfg.vote;
  } else if (b.setQuiz) {
    const qs = (Array.isArray(b.setQuiz.questions) ? b.setQuiz.questions : []).map(q => ({
      q: String((q && q.q) || '').slice(0, 240),
      opts: (Array.isArray(q.opts) ? q.opts : []).map(o => String(o).slice(0, 120)).filter(Boolean).slice(0, 4),
      correct: parseInt(q.correct, 10) || 0
    })).filter(q => q.q && q.opts.length >= 2).slice(0, 20);
    if (!qs.length) return res.status(400).json({ error: 'no valid questions' });
    cfg.quiz = { id: Date.now().toString(36), title: String(b.setQuiz.title || 'Stags Quiz').slice(0, 120), questions: qs };
  } else if (b.clearQuiz) {
    delete cfg.quiz;
  } else {
    return res.status(400).json({ error: 'nothing to do' });
  }
  await writeJson(CFG, cfg);
  return ok(res, { saved: true, vote: cfg.vote ? { id: cfg.vote.id, open: cfg.vote.open } : null, quiz: cfg.quiz ? { id: cfg.quiz.id } : null });
}
