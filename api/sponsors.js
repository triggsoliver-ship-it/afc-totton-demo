import { readJson, writeJson, ok, isAuthed } from './_util.js';

const B = 'https://cumfagvcuihevgzv.public.blob.vercel-storage.com/uploads/';

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
  { img: 'sp-evr.webp', gid: '1jvVdIuHc2qXZy7EMl-RfuutkjUYGetPs', name: 'EVR Energy', url: 'https://www.evrltd.co.uk' },
  { img: 'sp-lion-cleaning.webp', gid: '1fc0SGpddr8KSgEU5K5qnJhCH2JgeHXTT', name: 'Lion Cleaning Group', url: 'https://www.lioncleaninggroup.co.uk' },
  { img: 'sp-trou-digital.webp', gid: '1V5W75JO472drrBgNPEsi0fovjfZU5DyG', name: 'Trou Digital', url: 'https://www.troudigital.com' },
  { img: 'heineken', src: B + '1791025732912-sp-heineken.png', name: 'Heineken', url: 'https://www.heineken.co.uk' },
  { img: 'sos-storage', src: B + '1791025733117-sp-sos.png', name: 'SOS Storage', url: 'https://storageonsite.co.uk' },
  { img: 'bidfood', src: B + '1791025733479-sp-bidfood.png', name: 'Bidfood', url: 'https://www.bidfood.co.uk' },
  { img: 'matthew-clark', src: B + '1791025733749-sp-matthew-clark.jpg', name: 'Matthew Clark', url: 'https://www.mcbdrinks.co.uk' },
  { img: 'oakhaven', src: B + '1791025733991-sp-oakhaven.png', name: 'Oakhaven Hospice', url: 'https://www.oakhavenhospice.co.uk' },
  { img: 'bodyworx', src: B + '1791025734187-sp-bodyworx.png', name: 'Bodyworx Health', url: 'https://www.bodyworxphysio.co.uk' },
  { img: 'absolute-car', src: B + '1791025734445-sp-absolute-car.png', name: 'Absolute Car Company', url: 'https://www.absolutecarco.com' },
  { img: 'scents-of-occasion', src: B + '1791025734677-sp-scents.png', name: 'Scents of Occasion', url: 'https://www.scentsofoccasion.co.uk' },
  { img: 'best-buy-diy', src: B + '1791025757593-sp-best-buy-diy.png', name: 'Best Buy DIY', url: 'https://www.bestbuydiy.uk' },
  { img: 'fiesta-fm', src: B + '1791025758012-sp-fiesta-fm.png', name: 'Fiesta FM', url: 'https://www.fiestafm.co.uk' },
  { img: 'harvest-fine-foods', src: B + '1791025758346-sp-harvest.png', name: 'Harvest Fine Foods', url: 'https://www.harvestfinefood.co.uk' },
  { img: 'lfs', src: B + '1791025758556-sp-lfs.jpg', name: 'LFS', url: 'https://www.lfs.co.uk' },
  { img: 'octave-accountants', src: B + '1791025758765-sp-octave.png', name: 'Octave Accountants', url: 'https://www.octaveaccountants.co.uk' },
  { img: 'romsey-dental', src: B + '1791025759145-sp-romsey-dental.png', name: 'Romsey Dental Care', url: 'https://www.romseydentalcare.co.uk' },
  { img: 'its-holdings', src: B + '1791025759458-sp-its-holdings.png', name: 'ITS Holdings', url: 'https://www.itsconstruction.co.uk' },
  { img: 'charles-edwardson', src: B + '1791215498670-sp-charles-edwardson.png', name: 'Charles Edwardson', url: 'https://charles-edwardson.co.uk' },
  { img: 'set-tyres', src: B + '1791215499462-sp-setyres.png', name: 'Setyres', url: 'https://www.setyres.com' },
  { img: 'specsavers-hearing', src: B + '1791215500101-sp-specsavers.png', name: 'Specsavers Hearing', url: 'https://www.specsavers.co.uk' },
  { img: 'calmore-service-station', src: B + '1791222520426-sp-calmore-v4.jpg', name: 'Calmore Service Station', url: 'https://calmoreservicestation.co.uk' },
  { img: 'flag-man', src: B + '1791215501345-sp-flagman.png', name: 'The Badgeman / The Flag Man', url: 'https://theflagmanltd.co.uk' },
  { img: 'neil-cooper', name: 'Neil Cooper', url: '' },
  { img: 'bridge-rubber-plastics', src: B + '1791215502940-sp-bridge-rubber.png', name: 'Bridge Rubber & Plastics', url: 'https://bridgerubber.co.uk' },
  { img: 'abbey-croft-nursery', src: B + '1791222319581-sp-abbey-croft-v3.jpg', name: 'Abbey Croft Nursery', url: 'https://abbeycroftnursery.co.uk' },
  { img: 'nick-illingsworth', src: B + '1791287796107-sp-pil-southampton.png', name: 'Protection & Investment Ltd (Nick Illingsworth)', url: 'https://pilsouthampton.co.uk' },
  { img: 'totton-walking-club', name: 'Totton Walking Football', url: '/teams.html' },
  { img: 'silhouette-building-group', src: B + '1791215505111-sp-silhouette.png', name: 'Silhouette Building Group', url: 'https://sbg-ltd.co.uk' },
  { img: 'liftability', src: B + '1791215523633-sp-liftability.png', name: 'Liftability', url: 'https://www.liftabilityltd.com' },
  { img: 'apollo-business-supplies', src: B + '1791285961774-sp-apollo-bs.png', name: 'Apollo Business Supplies', url: 'https://www.apollo-bs.co.uk' },
  { img: 'new-forest-estate-agents', src: B + '1791215526811-sp-nfea.png', name: 'New Forest Estate Agents', url: 'https://nfea.co.uk' },
  { img: 'totton-grill', src: B + '1791215527536-sp-totton-grill.png', name: 'Totton Grill', url: 'https://tottongrillonline.co.uk' },
  { img: 'weightwash', src: B + '1791025770928-sp-weightwash.png', name: 'WeightWash', url: 'https://www.weightwash.co.uk' },
  { img: 'vision-scaffolding', src: B + '1791025769565-sp-vision-scaffolding.png', name: 'Vision Scaffolding', url: 'https://www.vision-scaffolding.co.uk' },
  { img: 'canon', src: B + '1791025770731-sp-canon.jpg', name: 'Canon', url: 'https://www.canon.co.uk' },
  { img: 'harrison-carpentry', src: B + '1791220972958-sp-harrison-carpentry-navy.png', name: 'Harrison Carpentry & Construction', url: 'https://www.harrisoncarpentryandconstruction.com' },
  { img: 'anytime-fitness', src: B + '1791025759737-sp-anytime-fitness.png', name: 'Anytime Fitness', url: 'https://www.anytimefitness.com' },
  { img: 'whelan-hygiene', src: B + '1791216527865-sp-whelan-hygiene.png', name: 'Whelan Hygiene', url: 'https://whelanhygiene.co.uk' },
  { img: 'aes-cleaning', src: B + '1791025769312-sp-aes.png', name: 'AES Cleaning Services', url: 'https://www.aescleaningservice.com' },
  { img: 'proline-pointing', src: B + '1791222466543-sp-proline-v4.jpg', name: 'Proline Pointing', url: 'https://prolinepointing.com' },
  { img: 'hurst-autos', src: B + '1791025770501-sp-hurst.png', name: 'Hurst Auto Assistance', url: 'https://www.hurstautoassistance.co.uk' },
  { img: 'relay-fire-safety', src: B + '1791025770045-sp-relay-fire.png', name: 'Relay Fire Safety', url: 'https://www.relayfiresafety.co.uk' },
  { img: 'hampshire-pat-testing', src: B + '1791215534995-sp-hampshire-pat.png', name: 'Hampshire PAT Testing', url: 'https://www.hampshirepattesting.co.uk' },
  { img: 'agent-legend', src: B + '1791046451466-sp-agent-legend-v2.png', name: 'Agent Legend', url: 'https://agentlegend.co.uk' },
  { img: 'hhs-capital', src: B + '1791046325355-sp-hhs-capital.png', name: 'HHS Capital', url: 'https://hhscapital.org' }
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
    SEED.forEach(s => { if (s.gid && !gids[s.img]) gids[s.img] = s.gid; if (s.src) srcs[s.img] = s.src; });
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
