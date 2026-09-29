import { readJson, writeJson, ok, isAuthed } from './_util.js';

const SEED = [
  { img: 'sp-garmin.webp', name: 'Garmin', url: 'https://www.garmin.com/en-GB/' },
  { img: 'sp-snows.webp', name: 'Snows Motor Group', url: 'https://www.snows.co.uk' },
  { img: 'sp-paultons-park.webp', name: 'Paultons Park', url: 'https://paultonspark.co.uk' },
  { img: 'sp-eric-robinson.webp', name: 'Eric Robinson Solicitors', url: 'https://www.ericrobinson.co.uk' },
  { img: 'sp-grahams-plumbing.webp', name: 'Graham Plumbers’ Merchant', url: 'https://www.grahams.co.uk' },
  { img: 'sp-ips.webp', name: 'Independent Plumbing Supplies', url: '' },
  { img: 'sp-ace-liftway.webp', name: 'Ace Liftaway', url: '' },
  { img: 'sp-airlynx.webp', name: 'Airlynx', url: '' },
  { img: 'sp-armada.webp', name: 'Armada', url: '' },
  { img: 'sp-below-the-hook.webp', name: 'Below The Hook', url: '' },
  { img: 'sp-enterprise-league-sponsor.webp', name: 'Enterprise · League Sponsor', url: '' },
  { img: 'sp-evr.webp', name: 'EVR', url: '' },
  { img: 'sp-gascare.webp', name: 'Gascare', url: '' },
  { img: 'sp-gentlemans-league.webp', name: 'The Gentleman’s League', url: '' },
  { img: 'sp-hampshire-foster-caring.webp', name: 'Hampshire Foster Caring', url: '' },
  { img: 'sp-handi-hire.webp', name: 'Handi Hire', url: '' },
  { img: 'sp-harrison-hire.webp', name: 'Harrison Hire', url: '' },
  { img: 'sp-langleyarb.webp', name: 'Langley Arb', url: '' },
  { img: 'sp-lion-cleaning.webp', name: 'Lion Cleaning', url: '' },
  { img: 'sp-parkway-cars.webp', name: 'Parkway Cars', url: '' },
  { img: 'sp-scp.webp', name: 'SCP', url: '' },
  { img: 'sp-ses-environmental.webp', name: 'SES Environmental', url: '' },
  { img: 'sp-sfs.webp', name: 'SFS', url: '' },
  { img: 'sp-tichealth-league-sponsor.webp', name: 'TIC Health · League Sponsor', url: '' },
  { img: 'sp-trou-digital.webp', name: 'Trou Digital', url: '' }
];

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return ok(res, await readJson('data/sponsors.json', SEED));
  }
  if (!isAuthed(req)) return res.status(401).json({ error: 'unauthorised' });
  if (req.method === 'POST') {
    const b = req.body || {};
    if (!Array.isArray(b.list) || !b.list.length) return res.status(400).json({ error: 'list required' });
    const list = b.list.slice(0, 60).map(s => ({
      img: String((s && s.img) || '').slice(0, 80),
      name: String((s && s.name) || '').slice(0, 80),
      url: String((s && s.url) || '').slice(0, 300)
    })).filter(s => s.img);
    await writeJson('data/sponsors.json', list);
    return ok(res, { saved: list.length });
  }
  res.status(405).json({ error: 'method not allowed' });
}
