import { readJson, writeJson, ok, isAuthed } from './_util.js';

const SEED = [
  { img: 'sp-garmin.webp', gid: '1A0MGo5Qapa3LJ4yiSQ0fR1E4mO3wqImI', name: 'Garmin', url: 'https://www.garmin.com/en-GB/' },
  { img: 'sp-snows.webp', gid: '1kY1k3QuHzCDcLiK9Swd8Tz2uuLharcfO', name: 'Snows Motor Group', url: 'https://www.snows.co.uk' },
  { img: 'sp-paultons-park.webp', gid: '18FGjH5b_K4IoKg51oKhyabL40ebIPy1t', name: 'Paultons Park', url: 'https://paultonspark.co.uk' },
  { img: 'sp-eric-robinson.webp', gid: '1uGuCr6wwQLTV33GTXIIXHMCIJCjyqcDl', name: 'Eric Robinson Solicitors', url: 'https://www.ericrobinson.co.uk' },
  { img: 'sp-grahams-plumbing.webp', gid: '1aY9xZgRmGT5VphOyGIjKsHBS348NOf_P', name: 'Graham Plumbers’ Merchant', url: 'https://www.grahams.co.uk' },
  { img: 'sp-ips.webp', gid: '1n9bGGhGT3y_4P_qnM18R_9MBKFf_hMP_', name: 'Independent Plumbing Supplies', url: '' },
  { img: 'sp-ace-liftway.webp', gid: '18sgPG377BKlXJwFvi-J4o6gHL8iaYaXv', name: 'Ace Liftaway', url: '' },
  { img: 'sp-airlynx.webp', gid: '1eqSgoiRRNPdghKZyWmPgzf5Yu3cTzOCm', name: 'Airlynx', url: '' },
  { img: 'sp-armada.webp', gid: '1Dlapu7dtPfDYhUjzUMHOsSabs417hgPf', name: 'Armada', url: '' },
  { img: 'sp-below-the-hook.webp', gid: '1i3oJhuReenpylHCoDX2ezYkOpr18nWQc', name: 'Below The Hook', url: '' },
  { img: 'sp-enterprise-league-sponsor.webp', gid: '1LEPyN71muMUot9iGr7hydvCuYu6nlXrU', name: 'Enterprise · League Sponsor', url: '' },
  { img: 'sp-evr.webp', gid: '1jvVdIuHc2qXZy7EMl-RfuutkjUYGetPs', name: 'EVR', url: '' },
  { img: 'sp-gascare.webp', gid: '1Hb6CkvibnyriGZ81ITV1jXVzuM6zIoqm', name: 'Gascare', url: '' },
  { img: 'sp-gentlemans-league.webp', gid: '118wnrNv84blg1UOTJ-DA44axg30mgtiE', name: 'The Gentleman’s League', url: '' },
  { img: 'sp-hampshire-foster-caring.webp', gid: '1V8Vv3Gq26SdE9OZRGU2l4-OZLItskobK', name: 'Hampshire Foster Caring', url: '' },
  { img: 'sp-handi-hire.webp', gid: '17DslZ2n7JJ_IO6ZwbYtfnP_muRSzqPKY', name: 'Handi Hire', url: '' },
  { img: 'sp-harrison-hire.webp', gid: '1XHFblLpDtoDQiyQ3EJwKGHkN73CuRptM', name: 'Harrison Hire', url: '' },
  { img: 'sp-langleyarb.webp', gid: '1F4CMHahopYaZUFBUUFxMPCewdM7o0zpc', name: 'Langley Arb', url: '' },
  { img: 'sp-lion-cleaning.webp', gid: '1fc0SGpddr8KSgEU5K5qnJhCH2JgeHXTT', name: 'Lion Cleaning', url: '' },
  { img: 'sp-parkway-cars.webp', gid: '1RKcfIIftAAKiLYiGqkjEupW7d711sx3U', name: 'Parkway Cars', url: '' },
  { img: 'sp-scp.webp', gid: '1f-R7dBbc70HGxV7EWcUMArVPR7eEVpek', name: 'SCP', url: '' },
  { img: 'sp-ses-environmental.webp', gid: '1ncUh1t13yoCNF69fEx4VHArvadJgUS-o', name: 'SES Environmental', url: '' },
  { img: 'sp-sfs.webp', gid: '1TnOW1u0BU6EkQk-H5XzGTiQnDuDzQbuH', name: 'SFS', url: '' },
  { img: 'sp-tichealth-league-sponsor.webp', gid: '1e1NM9asdqB2xkLDMGqNEKZOUeblQ6bhh', name: 'TIC Health · League Sponsor', url: '' },
  { img: 'sp-trou-digital.webp', gid: '1V5W75JO472drrBgNPEsi0fovjfZU5DyG', name: 'Trou Digital', url: '' }
];

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return ok(res, await readJson('data/sponsors.json', SEED));
  }
  if (!isAuthed(req)) return res.status(401).json({ error: 'unauthorised' });
  if (req.method === 'POST') {
    const b = req.body || {};
    if (!Array.isArray(b.list) || !b.list.length) return res.status(400).json({ error: 'list required' });
    const cur = await readJson('data/sponsors.json', SEED);
    const gids = {}; cur.forEach(s => { if (s.gid) gids[s.img] = s.gid; });
    const list = b.list.slice(0, 60).map(s => ({
      img: String((s && s.img) || '').slice(0, 80),
      gid: gids[String((s && s.img) || '')] || String((s && s.gid) || '').slice(0, 60),
      name: String((s && s.name) || '').slice(0, 80),
      url: String((s && s.url) || '').slice(0, 300)
    })).filter(s => s.img);
    await writeJson('data/sponsors.json', list);
    return ok(res, { saved: list.length });
  }
  res.status(405).json({ error: 'method not allowed' });
}
