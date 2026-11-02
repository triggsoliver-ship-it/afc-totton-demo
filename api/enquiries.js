import { put, list, del } from '@vercel/blob';
import { randomBytes } from 'node:crypto';
import { ok, isAuthed, privateName, readJson, writeJson } from './_util.js';

// Youth recruitment enquiries (form on the Youth page).
//   POST {action:'youth', first, last, dob, teamType, position, club, parent, email, phone, message, consent}  (public)
//        -> saves the enquiry, then emails the youth recruitment inbox via Resend (Reply goes to the parent)
//   GET  (admin)                                  -> { items (newest first), to, emailReady }   ?format=csv for a download
//   POST (admin) {action:'status', id, status}    status: new | contacted | closed
//   POST (admin) {action:'delete', id}
//   POST (admin) {action:'resend', id}            re-send the email alert for one enquiry
//   POST (admin) {action:'test'}                  send a test alert to the recipients
//   POST (admin) {action:'settings', to}          alert recipients, comma separated (max 5)
// Children's data: every enquiry is its own blob under a secret folder (see privateName in _util.js),
// so nothing sits at a guessable public address. Enquiries are deleted automatically after 12 months.

const DEFAULT_TO = ['recruitment@afctottonyouth.com'];
const FROM = process.env.ENQUIRY_FROM || 'AFC Totton Youth website <youth@notify.afctotton.com>';
const STATUSES = ['new', 'contacted', 'closed'];
const KEEP_DAYS = 365;
const S = (v, n) => String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, n);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const folder = () => privateName('youth-enquiries/');
const settingsName = () => privateName('youth-enquiry-settings.json');

// FA age groups run from the player's age on 31 August at the start of the season.
// Enquiries from June onwards are treated as being for the season that starts that summer.
function seasonStart(now = new Date()) { return now.getUTCMonth() >= 5 ? now.getUTCFullYear() : now.getUTCFullYear() - 1; }
function ageGroupFor(dob) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob || '');
  if (!m) return null;
  const sy = seasonStart();
  const age = sy - Number(m[1]) - (Number(m[2]) > 8 ? 1 : 0);
  return { group: age + 1, season: sy + '/' + String(sy + 1).slice(2) };
}
function ukTime(iso) {
  try { return new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso)); }
  catch (e) { return iso; }
}
function prettyDob(dob) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob || '');
  if (!m) return dob || '';
  return Number(m[3]) + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Number(m[2]) - 1] + ' ' + m[1];
}

async function recipients() {
  const s = await readJson(settingsName(), null);
  return (s && Array.isArray(s.to) && s.to.length) ? s.to : DEFAULT_TO;
}

async function findBlob(id) {
  const { blobs } = await list({ prefix: folder() + id + '.json' });
  return blobs.find(b => b.pathname === folder() + id + '.json') || null;
}
async function readItem(b) {
  const r = await fetch(b.url + '?ts=' + Date.now(), { cache: 'no-store' });
  if (!r.ok) throw new Error('read failed');
  return r.json();
}
async function saveItem(e) {
  await put(folder() + e.id + '.json', JSON.stringify(e), {
    access: 'public', addRandomSuffix: false, allowOverwrite: true,
    contentType: 'application/json', cacheControlMaxAge: 60
  });
}
async function allBlobs() {
  const out = []; let cursor;
  do {
    const r = await list({ prefix: folder(), cursor, limit: 1000 });
    out.push(...r.blobs); cursor = r.hasMore ? r.cursor : null;
  } while (cursor);
  return out;
}
function idTime(pathname) {
  const id = String(pathname).split('/').pop().replace(/\.json$/, '');
  const t = parseInt(id.split('-')[0], 36);
  return isFinite(t) ? t : 0;
}

function rows(e) {
  return [
    ['Player', e.first + ' ' + e.last],
    ['Date of birth', prettyDob(e.dob)],
    ['Age group (' + e.season + ')', 'Under-' + e.ageGroup + 's'],
    ['Team', e.teamType],
    ['Position', e.position || 'Not sure / any'],
    ['Current club', e.club || '—'],
    ['Parent / guardian', e.parent],
    ['Email', e.email],
    ['Phone', e.phone],
    ['Message', e.message || '—'],
    ['Sent', ukTime(e.ts)]
  ];
}

async function sendAlert(e, to, test) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { sent: false, error: 'Email alerts are not switched on yet', at: new Date().toISOString() };
  const subject = (test ? 'TEST — ' : '') + 'Youth enquiry: ' + e.first + ' ' + e.last + ' (U' + e.ageGroup + ', ' + e.teamType + ')';
  const r = rows(e);
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;color:#151C36">
<div style="background:#151C36;color:#fff;padding:16px 20px;border-bottom:4px solid #C9A227"><b style="font-size:16px;letter-spacing:.04em">AFC TOTTON YOUTH</b><br><span style="font-size:13px;color:#C9D0E0">${test ? 'TEST ALERT — not a real enquiry' : 'New player enquiry from the website'}</span></div>
<table style="width:100%;border-collapse:collapse;font-size:14px;margin:6px 0 14px">${r.map(([k, v]) => `<tr><td style="padding:9px 12px;border-bottom:1px solid #E3E7EF;color:#5B7AB8;font-weight:bold;width:170px;vertical-align:top">${esc(k)}</td><td style="padding:9px 12px;border-bottom:1px solid #E3E7EF;white-space:pre-wrap">${k === 'Email' ? `<a href="mailto:${esc(v)}">${esc(v)}</a>` : k === 'Phone' ? `<a href="tel:${esc(String(v).replace(/[^\d+]/g, ''))}">${esc(v)}</a>` : esc(v)}</td></tr>`).join('')}</table>
<p style="font-size:13px;color:#5b6272;line-height:1.6">Hit <b>Reply</b> to answer ${esc(e.parent)} directly. Every enquiry is also saved in the website admin under <b>Youth enquiries</b>.</p>
<p style="font-size:12px;color:#8a90a0;line-height:1.6">This email contains a child&rsquo;s personal details. Please don&rsquo;t forward it outside the AFC Totton Youth recruitment team. Ref ${esc(e.id)}</p></div>`;
  const text = (test ? 'TEST ALERT — not a real enquiry\n\n' : 'New AFC Totton Youth player enquiry\n\n') + r.map(([k, v]) => k + ': ' + v).join('\n') +
    '\n\nReply to this email to answer ' + e.parent + ' directly. This email contains a child\'s personal details — please don\'t forward it outside the youth recruitment team. Ref ' + e.id;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to, reply_to: e.email, subject, html, text })
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) return { sent: false, error: S(j.message || j.name || ('HTTP ' + res.status), 200), at: new Date().toISOString() };
    return { sent: true, id: j.id || '', to, at: new Date().toISOString() };
  } catch (err) {
    return { sent: false, error: 'Could not reach the email service', at: new Date().toISOString() };
  }
}

export default async function handler(req, res) {
  const b = req.body || {};
  try {
    // ---------- public: new enquiry ----------
    if (req.method === 'POST' && b.action === 'youth') {
      if (b.website || !(Number(b.el) > 2500)) return ok(res, { thanks: true }); // honeypot / too fast = bot
      const e = {
        first: S(b.first, 60), last: S(b.last, 60), dob: S(b.dob, 10), teamType: S(b.teamType, 40),
        position: S(b.position, 40), club: S(b.club, 80), parent: S(b.parent, 80),
        email: S(b.email, 120).toLowerCase(), phone: S(b.phone, 30),
        message: String(b.message == null ? '' : b.message).trim().slice(0, 1000)
      };
      if (!e.first || !e.last) return res.status(400).json({ error: 'Please enter the player’s first and last name.' });
      const ag = ageGroupFor(e.dob);
      if (!ag || ag.group < 5 || ag.group > 21) return res.status(400).json({ error: 'Please check the player’s date of birth.' });
      if (!['Boys / mixed team', 'Girls team', 'Not sure yet'].includes(e.teamType)) return res.status(400).json({ error: 'Please choose a team.' });
      if (!e.parent) return res.status(400).json({ error: 'Please enter the parent or guardian’s name.' });
      if (!EMAIL_RE.test(e.email)) return res.status(400).json({ error: 'Please enter a valid email address.' });
      if (e.phone.replace(/\D/g, '').length < 10) return res.status(400).json({ error: 'Please enter a contact phone number.' });
      if (b.consent !== true) return res.status(400).json({ error: 'Please tick the box to confirm you’re happy to be contacted.' });
      e.ageGroup = ag.group; e.season = ag.season;
      e.id = Date.now().toString(36) + '-' + randomBytes(5).toString('hex');
      e.ts = new Date().toISOString(); e.status = 'new';
      await saveItem(e);                              // saved first, so nothing is lost if the email fails
      e.alert = await sendAlert(e, await recipients());
      try { await saveItem(e); } catch (err) {}
      return ok(res, { thanks: true });
    }

    if (!isAuthed(req)) return res.status(401).json({ error: 'unauthorised' });

    // ---------- admin: list / csv ----------
    if (req.method === 'GET') {
      const blobs = await allBlobs();
      const cutoff = Date.now() - KEEP_DAYS * 864e5;
      const old = blobs.filter(x => idTime(x.pathname) && idTime(x.pathname) < cutoff);
      if (old.length) { try { await del(old.map(x => x.url)); } catch (err) {} }
      const keep = blobs.filter(x => !old.includes(x));
      const items = [];
      for (let i = 0; i < keep.length; i += 20) {
        const chunk = await Promise.all(keep.slice(i, i + 20).map(x => readItem(x).catch(() => null)));
        chunk.forEach(x => { if (x && x.id) items.push(x); });
      }
      items.sort((a, c) => String(c.ts).localeCompare(String(a.ts)));
      if (req.query.format === 'csv') {
        const out = [['ref', 'submitted', 'status', 'player_first', 'player_last', 'date_of_birth', 'age_group', 'season', 'team', 'position', 'current_club', 'parent_guardian', 'email', 'phone', 'message', 'email_alert']]
          .concat(items.map(e => [e.id, ukTime(e.ts), e.status, e.first, e.last, e.dob, 'U' + e.ageGroup, e.season, e.teamType, e.position, e.club, e.parent, e.email, e.phone, e.message, e.alert && e.alert.sent ? 'sent' : 'not sent']))
          .map(r => r.map(v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"').join(',')).join('\r\n');
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="youth-enquiries.csv"');
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).send(out);
      }
      return ok(res, { items, to: await recipients(), emailReady: !!process.env.RESEND_API_KEY, from: FROM });
    }

    if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });

    if (b.action === 'settings') {
      const to = String(b.to || '').split(/[,;\s]+/).map(x => x.trim().toLowerCase()).filter(Boolean);
      if (!to.length || to.length > 5 || !to.every(x => EMAIL_RE.test(x))) return res.status(400).json({ error: 'Enter up to 5 valid email addresses, separated by commas.' });
      await writeJson(settingsName(), { to });
      return ok(res, { to });
    }
    if (b.action === 'test') {
      const sample = {
        id: 'test', ts: new Date().toISOString(), first: 'Test', last: 'Player', dob: '2016-03-12', ageGroup: (ageGroupFor('2016-03-12') || {}).group,
        season: (ageGroupFor('2016-03-12') || {}).season, teamType: 'Boys / mixed team', position: 'Midfielder', club: 'None',
        parent: 'Website test', email: 'recruitment@afctottonyouth.com', phone: '023 8086 8981', message: 'This is a test of the Youth page enquiry form alerts.'
      };
      const to = await recipients();
      const r = await sendAlert(sample, to, true);
      return r.sent ? ok(res, r) : res.status(502).json({ error: r.error || 'not sent' });
    }

    const id = String(b.id || '');
    if (!/^[a-z0-9]{6,12}-[a-f0-9]{10}$/.test(id)) return res.status(400).json({ error: 'bad id' });
    const blob = await findBlob(id);
    if (!blob) return res.status(404).json({ error: 'enquiry not found' });

    if (b.action === 'delete') { await del(blob.url); return ok(res, { deleted: id }); }
    const e = await readItem(blob);
    if (b.action === 'status') {
      if (!STATUSES.includes(b.status)) return res.status(400).json({ error: 'bad status' });
      e.status = b.status; e.statusAt = new Date().toISOString();
      await saveItem(e);
      return ok(res, { id, status: e.status });
    }
    if (b.action === 'resend') {
      e.alert = await sendAlert(e, await recipients());
      await saveItem(e);
      return e.alert.sent ? ok(res, { id, alert: e.alert }) : res.status(502).json({ error: e.alert.error });
    }
    return res.status(400).json({ error: 'unknown action' });
  } catch (err) {
    return res.status(500).json({ error: 'Something went wrong — please try again, or email recruitment@afctottonyouth.com.' });
  }
}
