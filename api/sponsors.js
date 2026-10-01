import { readJson, writeJson, ok, isAuthed } from './_util.js';

const A = 'https://www.afctotton.com/application/files/thumbnails/sponsor/';

const SEED = [
  { img: 'sp-garmin.webp', gid: '1A0MGo5Qapa3LJ4yiSQ0fR1E4mO3wqImI', name: 'Garmin', url: 'https://www.garmin.com' },
  { img: 'sp-snows.webp', gid: '1kY1k3QuHzCDcLiK9Swd8Tz2uuLharcfO', name: 'Snows Motor Group', url: 'https://www.snows.co.uk' },
  { img: 'sp-ips.webp', gid: '1n9bGGhGT3y_4P_qnM18R_9MBKFf_hMP_', name: 'IPS Solutions', url: 'https://www.ips-online.co.uk' },
  { img: 'sp-paultons-park.webp', gid: '18FGjH5b_K4IoKg51oKhyabL40ebIPy1t', name: 'Paultons Park', url: 'https://www.paultonspark.co.uk' },
  { img: 'sp-eric-robinson.webp', gid: '1uGuCr6wwQLTV33GTXIIXHMCIJCjyqcDl', name: 'Eric Robinson Solicitors', url: 'https://www.ericrobinson.co.uk' },
  { img: 'sp-grahams-plumbing.webp', gid: '1aY9xZgRmGT5VphOyGIjKsHBS348NOf_P', name: 'Graham The Plumbers’ Merchant', url: 'https://www.grahamdirect.co.uk' },
  { img: 'sp-langleyarb.webp', gid: '1F4CMHahopYaZUFBUUFxMPCewdM7o0zpc', name: 'Langley Arb', url: 'https://www.langleyarb.com' },
  { img: 'sp-parkway-cars.webp', gid: '1RKcfIIftAAKiLYiGqkjEupW7d711sx3U', name: 'Parkway Specialist Cars', url: 'https://www.parkwayspecialistcars.co.uk' },
  { img: 'sp-gascare.webp', gid: '1Hb6CkvibnyriGZ81ITV1jXVzuM6zIoqm', name: 'Gas Care', url: 'https://www.gas.care' },
  { img: 'sp-sfs.webp', gid: '1TnOW1u0BU6EkQk-H5XzGTiQnDuDzQbuH', name: 'Southampton Freight Services', url: 'https://www.sotonfreight.co.uk' },
  { img: 'sp-hampshire-foster-caring.webp', gid: '1V8Vv3Gq26SdE9OZRGU2l4-OZLItskobK', name: 'Hampshire Foster Carers', url: 'https://www.hants.gov.uk/socialcareandhealth/childrenandfamilies/fostering' },
  { img: 'sp-handi-hire.webp', gid: '17DslZ2n7JJ_IO6ZwbYtfnP_muRSzqPKY', name: 'Handi Hire', url: 'https://www.handihire.co.uk' },
  { img: 'sp-harrison-hire.webp', gid: '1XHFblLpDtoDQiyQ3EJwKGHkN73CuRptM', name: 'Harrison Hire', url: 'https://www.harrisonhire.uk' },
  { img: 'sp-below-the-hook.webp', gid: '1i3oJhuReenpylHCoDX2ezYkOpr18nWQc', name: 'Below The Hook', url: 'https://www.bthservices.co.uk' },
  { img: 'sp-scp.webp', gid: '1f-R7dBbc70HGxV7EWcUMArVPR7eEVpek', name: 'Solent Streetworks', url: 'https://www.solentstreetworks.com' },
  { img: 'sp-enterprise-league-sponsor.webp', gid: '1LEPyN71muMUot9iGr7hydvCuYu6nlXrU', name: 'Enterprise · League Sponsor', url: 'https://www.enterprise.co.uk' },
  { img: 'sp-ace-liftway.webp', gid: '18sgPG377BKlXJwFvi-J4o6gHL8iaYaXv', name: 'Ace Liftaway', url: '' },
  { img: 'sp-airlynx.webp', gid: '1eqSgoiRRNPdghKZyWmPgzf5Yu3cTzOCm', name: 'Airlynx', url: '' },
  { img: 'sp-armada.webp', gid: '1Dlapu7dtPfDYhUjzUMHOsSabs417hgPf', name: 'Armada', url: '' },
  { img: 'sp-evr.webp', gid: '1jvVdIuHc2qXZy7EMl-RfuutkjUYGetPs', name: 'EVR', url: '' },
  { img: 'sp-gentlemans-league.webp', gid: '118wnrNv84blg1UOTJ-DA44axg30mgtiE', name: 'The Gentleman’s League', url: '' },
  { img: 'sp-lion-cleaning.webp', gid: '1fc0SGpddr8KSgEU5K5qnJhCH2JgeHXTT', name: 'Lion Cleaning', url: '' },
  { img: 'sp-ses-environmental.webp', gid: '1ncUh1t13yoCNF69fEx4VHArvadJgUS-o', name: 'SES Environmental', url: '' },
  { img: 'sp-tichealth-league-sponsor.webp', gid: '1e1NM9asdqB2xkLDMGqNEKZOUeblQ6bhh', name: 'TIC Health · League Sponsor', url: '' },
  { img: 'sp-trou-digital.webp', gid: '1V5W75JO472drrBgNPEsi0fovjfZU5DyG', name: 'Trou Digital', url: '' },
  { img: 'heineken', src: A + '4517/1827/5814/Heineken-Logo-166x88PX.png', name: 'Heineken', url: 'https://www.heineken.co.uk' },
  { img: 'sos-storage', src: A + '9817/1827/7311/SOS-Logo-166x88PX.png', name: 'SOS Storage', url: 'https://storageonsite.co.uk' },
  { img: 'bidfood', src: A + '9717/4914/0363/Bidfood_Inspired_by_You_logo.png', name: 'Bidfood', url: 'https://www.bidfood.co.uk' },
  { img: 'matthew-clark', src: A + '3417/4914/5868/Matthew_Clark_wine_logo.jpg', name: 'Matthew Clark', url: 'https://www.mcbdrinks.co.uk' },
  { img: 'oakhaven', src: A + '6317/1827/7289/Oakhaven-Hospice-Logo-166x88PX.png', name: 'Oakhaven Hospice', url: 'https://www.oakhavenhospice.co.uk' },
  { img: 'bodyworx', src: A + '7217/4914/0016/Bodyworx_Health.png', name: 'Bodyworx Health', url: 'https://www.bodyworxphysio.co.uk' },
  { img: 'absolute-car', src: A + '9317/8282/7958/absolute_car.png', name: 'Absolute Car Company', url: 'https://www.absolutecarco.com' },
  { img: 'scents-of-occasion', src: A + '2217/4914/7410/Scents_of_Occasion_logo.png', name: 'Scents of Occasion', url: 'https://www.scentsofoccasion.co.uk' },
  { img: 'best-buy-diy', src: A + '2117/4913/9662/BEST_BUY_DIY_logo.png', name: 'Best Buy DIY', url: 'https://www.bestbuydiy.uk' },
  { img: 'fiesta-fm', src: A + '9817/4914/1264/Fiesta_FM_logo.png', name: 'Fiesta FM', url: 'https://www.fiestafm.co.uk' },
  { img: 'harvest-fine-foods', src: A + '3017/4914/1617/Harvest_Fine_Foods_logo.png', name: 'Harvest Fine Foods', url: 'https://www.harvestfinefood.co.uk' },
  { img: 'lfs', src: A + '7217/8282/7600/LFS_Investments.jpg', name: 'LFS', url: 'https://www.lfs.co.uk' },
  { img: 'octave-accountants', src: A + '1717/6000/3568/Octavave_accountants_logo.png', name: 'Octave Accountants', url: 'https://www.octaveaccountants.co.uk' },
  { img: 'romsey-dental', src: A + '4717/1827/7303/Romsey-Dental-Care-Logo-166x88PX.png', name: 'Romsey Dental Care', url: 'https://www.romseydentalcare.co.uk' },
  { img: 'its-holdings', src: A + '5117/4914/5468/ITS-Construction-Logo-Full_Dark_Text.png', name: 'ITS Holdings', url: 'https://www.itsconstruction.co.uk' },
  { img: 'charles-edwardson', name: 'Charles Edwardson', url: 'https://www.charlesedwardson.co.uk' },
  { img: 'set-tyres', name: 'Setyres', url: 'https://www.setyres.com' },
  { img: 'specsavers-hearing', name: 'Specsavers Hearing', url: 'https://www.specsavers.co.uk' },
  { img: 'calmore-service-station', name: 'Calmore Service Station', url: 'https://www.calmoreservicestation.co.uk' },
  { img: 'flag-man', name: 'The Flag Man', url: 'https://www.flagmanltd.co.uk' },
  { img: 'neil-cooper', name: 'Neil Cooper', url: '' },
  { img: 'bridge-rubber-plastics', name: 'Bridge Rubber & Plastics', url: 'https://www.bridgerubberplastics.co.uk' },
  { img: 'abbey-croft-nursery', name: 'Abbey Croft Nursery', url: 'https://www.abbeycroftnursery.co.uk' },
  { img: 'nick-illingsworth', name: 'Nick Illingsworth', url: '' },
  { img: 'totton-walking-club', name: 'Totton Walking Football', url: '/teams.html' },
  { img: 'silhouette-building-group', name: 'Silhouette Building Group', url: 'https://www.sbg-ltd.co.uk' },
  { img: 'liftability', name: 'Liftability', url: 'https://www.liftabilityltd.com' },
  { img: 'apollo-business-supplies', name: 'Apollo Business Supplies', url: 'https://www.appolloservices.co.uk' },
  { img: 'new-forest-estate-agents', name: 'New Forest Estate Agents', url: 'https://www.nfea.co.uk' },
  { img: 'totton-grill', name: 'Totton Grill', url: 'https://www.tottongrillonline.co.uk' }
];

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return ok(res, await readJson('data/sponsors.json', SEED));
  }
  if (!isAuthed(req)) return res.status(401).json({ error: 'unauthorised' });
  if (req.method === 'POST') {
    const b = req.body || {};
    if (!Array.isArray(b.list) || !b.list.length) return res.status(400).json({ error: 'list required' });
    if (b.reset === true) { await writeJson('data/sponsors.json', SEED); return ok(res, { saved: SEED.length, reset: true }); }
    const cur = await readJson('data/sponsors.json', SEED);
    const gids = {}, srcs = {};
    cur.forEach(s => { if (s.gid) gids[s.img] = s.gid; if (s.src) srcs[s.img] = s.src; });
    SEED.forEach(s => { if (s.gid && !gids[s.img]) gids[s.img] = s.gid; if (s.src && !srcs[s.img]) srcs[s.img] = s.src; });
    const list = b.list.slice(0, 80).map(s => ({
      img: String((s && s.img) || '').slice(0, 80),
      gid: gids[String((s && s.img) || '')] || String((s && s.gid) || '').slice(0, 60),
      src: srcs[String((s && s.img) || '')] || String((s && s.src) || '').slice(0, 300),
      name: String((s && s.name) || '').slice(0, 80),
      url: String((s && s.url) || '').slice(0, 300)
    })).filter(s => s.img);
    await writeJson('data/sponsors.json', list);
    return ok(res, { saved: list.length });
  }
  res.status(405).json({ error: 'method not allowed' });
}
