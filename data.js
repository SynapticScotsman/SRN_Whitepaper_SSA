/* Data for SSA whitepaper site */
window.SSA_DATA = {
  // Map sites (x,y in 900x520 viewBox)
  sites: [
    { id: 'exmouth', x: 195, y: 205, name: 'Exmouth', type: 'DARC · SST · C-Band', desc: 'USSF / AUKUS deep-space radar + space surveillance telescope. Full OC August 2025.' },
    { id: 'collie', x: 225, y: 345, name: 'Collie', type: 'LeoLabs WASR', desc: 'Two S-band phased-array radars. Tracks LEO debris to ~2 cm. Commissioned January 2023.' },
    { id: 'perth', x: 215, y: 360, name: 'Perth / Gingin', type: 'WAOGS · Zadko', desc: 'First laser ground station in Southern Hemisphere. Robotic 0.7 m telescope.' },
    { id: 'murchison', x: 235, y: 270, name: 'Murchison', type: 'MWA · Passive Radar', desc: '4,096 dipole antennas. Curtin CIRA passive radar SSA using FM reflections.' },
    { id: 'swanreach', x: 520, y: 395, name: 'Swan Reach', type: 'Oculus Observatory', desc: "Silentium Defence + WSU. World's first commercial passive radar observatory for space." },
    { id: 'peterborough', x: 500, y: 370, name: 'Peterborough', type: 'Nova Space Precinct', desc: 'Multi-mode passive array. 24/7 all-weather. SatPing initiative with Curtin.' },
    { id: 'stromlo', x: 700, y: 385, name: 'Mt Stromlo', type: 'ANU · EOS', desc: 'Adaptive optics for GEO characterisation. Laser ranging to 3,000 km. 10,000+ tracks/week.' },
    { id: 'sidingspring', x: 720, y: 350, name: 'Siding Spring', type: 'Huntsman', desc: 'Macquarie daytime photometry pathfinder. Canon lens array. V=4.6 at midday.' },
    { id: 'parkes', x: 685, y: 330, name: 'Parkes', type: 'CSIRO Radio', desc: 'Artemis II deep-space communications support. Dual-use with SSA infrastructure.' }
  ],

  // Growth chart data: [year, active sats]
  growth: [
    [1960, 30], [1965, 180], [1970, 420], [1975, 680], [1980, 950],
    [1985, 1220], [1990, 1600], [1995, 1900], [2000, 2250], [2005, 2560],
    [2010, 2870], [2015, 3380], [2018, 4450], [2019, 5100],
    [2020, 6200], [2021, 7800], [2022, 9800], [2023, 11800],
    [2024, 13400], [2025, 14600], [2026, 15000]
  ],
  growthPlan: [
    [2026, 15000], [2027, 22000], [2028, 32000], [2029, 46000], [2030, 60000]
  ],

  // Benchmark rows
  benchmarks: [
    { nation: 'United States', spend: '~US$42B', cap: '29 SSN sensors, 47,000+ objects tracked. Space Fence (Kwajalein). TraCSS civil SSA transfer.', lesson: 'Scale not replicable. TraCSS civil-military handoff model is relevant.' },
    { nation: 'United Kingdom', spend: '£85M + £1.4B (10y)', cap: 'NSpOC with ~70 civil-military staff. Fylingdales AN/FPS-132 radar. UK Space Command 500+ personnel.', lesson: 'NSpOC civil-military integration is the directly applicable blueprint.' },
    { nation: 'ESA / EU', spend: '€955M (3y)', cap: 'EU SST consortium across 15 states. ClearSpace-1 debris removal. Zero Debris Charter.', lesson: 'Networked multi-national model validates coordination over scale.' },
    { nation: 'France', spend: '~€30M GRAVES', cap: 'GRAVES bistatic radar. Space Command 500 personnel Toulouse. AsterX exercise with 15 partners.', lesson: 'Military space exercise model. Australia already participates.' },
    { nation: 'Germany', spend: 'GSSAC ops', cap: 'Civil-military co-location (Bundeswehr + DLR). TIRA radar, GESTRA, iSpace catalogue.', lesson: 'Co-location works without large budgets.' },
    { nation: 'Canada', spend: 'C$96.4M', cap: 'Only Five Eyes space-based SSA sensor (Sapphire). 12,000+ objects imaged monthly since 2013.', lesson: 'Space-based SSA precedent within Five Eyes — model for Inovor Hyperion.' },
    { nation: 'Japan', spend: 'FY22 upgrade', cap: 'Kamisaibara radar: 10 cm objects at 650 km. 10,000 obs/day (50x increase).', lesson: 'Rapid capability uplift through radar modernisation.' },
    { nation: 'New Zealand', spend: 'Growing', cap: 'Pacific Cell lead in JCO. Rocket Lab infrastructure. SmartSat–MBIE collaboration (2024).', lesson: 'Small nations can anchor major operational roles.' }
  ],

  recommendations: [
    {
      title: 'Establish a national SSA/SDA coordination body by 2028.',
      body: 'Modelled on the UK National Space Operations Centre (NSpOC). Must plan for the SmartSat CRC transition — the primary civil-defence coordination mechanism currently in its final year of Commonwealth funding.',
      tag: 'Foundational'
    },
    {
      title: 'Create a sovereign catalogue and data framework within three years.',
      body: 'Australia maintains no sovereign space object catalogue today. A tiered classification model would enable researcher access while protecting defence-sensitive data, and directly generate commercial value from operator tracking and conjunction alerts.',
      tag: 'Data'
    },
    {
      title: 'Develop an Australian Space Traffic Management policy by 2028.',
      body: 'The Space (Launches and Returns) Act 2018 does not address on-orbit coordination. With STM frameworks being shaped internationally — including the Cologne Manual — developing Australia\u2019s position now is how the country becomes a rule-shaper rather than a rule-taker.',
      tag: 'Policy'
    },
    {
      title: 'Reform FOR codes within the current ANZSRC review cycle.',
      body: 'The FOR code system does not recognise space engineering as distinct from aerospace. ARC funding analysis reveals very limited SSA-specific awards with multiple zero-award years — a visibility problem as much as a capability one.',
      tag: 'Classification'
    },
    {
      title: 'Invest in sovereign sensor technologies within five years.',
      body: 'Neuromorphic event-based cameras and passive radar are Australian-developed, proven, and arms-restriction-free. Domestic deployment and an export pathway would turn two pockets of world-leading capability into national infrastructure.',
      tag: 'Capability'
    }
  ],

  timeline: [
    { year: 2019, milestone: true, title: 'Civil Space Strategy', detail: 'Australian Space Agency identifies SSA and debris monitoring as one of seven national priority areas.' },
    { year: 2020, title: 'JP9360 launched', detail: 'Defence acquisition programme consolidates six projects into a rolling SDA capability build across all orbital regimes.' },
    { year: 2020, milestone: true, title: 'SST first light at Exmouth', detail: 'Space Surveillance Telescope captures first image, 5 March 2020. First SSN sensor in the Southern Hemisphere.' },
    { year: 2021, title: 'M2 CubeSat carries neuromorphic cameras to orbit', detail: 'UNSW Canberra / DSTG — first Australian in-orbit SSA sensor demonstration.' },
    { year: 2022, milestone: true, title: 'Defence Space Command established', detail: '18 January 2022. 1 Space Surveillance Unit operates SST, C-Band radar, and will operate DARC.' },
    { year: 2022, title: 'SST reaches initial operational capability', detail: '4 October 2022. Boeing–ExoAnalytic JP9360 optical network established for the RAAF across 10+ sites.' },
    { year: 2023, milestone: true, title: 'DARC breaks ground', detail: 'AUKUS Deep Space Advanced Radar Capability construction begins at Exmouth. US$341M Northrop Grumman contract.' },
    { year: 2024, title: 'DARC construction complete', detail: '27-antenna array at Exmouth completed December 2024 — three months ahead of schedule.' },
    { year: 2024, title: 'ASA–US Office of Space Commerce cooperation', detail: 'Statement of Intent signed on re-entry monitoring at IAC 2024, Milan.' },
    { year: 2025, milestone: true, title: 'DARC tracks GEO · SST reaches full OC', detail: 'Seven antennas successfully track multiple GEO satellites. SST reaches full operational capability, August 2025.' },
    { year: 2025, title: 'ESA commits €955M to Space Safety at CM25', detail: '30% increase signalled by the November 2025 Ministerial Council — a benchmark for allied investment.' },
    { year: 2026, milestone: true, title: 'Continuum-1 RPO announced', detail: "HEO / UNSW Canberra announce Australia's first sovereign satellite rendezvous and proximity operations mission, February 2026." },
    { year: 2026, title: 'Starlink passes 10,000', detail: '10,020 Starlink satellites active as of 17 March 2026 — roughly two-thirds of all active spacecraft.' }
  ],

  glossary: [
    { term: 'SSA', short: 'Space Situational Awareness', def: 'The ability to detect, track, and predict the behaviour of objects in Earth orbit. Underpins safe, secure, and sustainable access to space.' },
    { term: 'SDA', short: 'Space Domain Awareness', def: 'The defence-flavoured sibling of SSA — adds intent assessment and threat characterisation to detection and tracking.' },
    { term: 'Kessler syndrome', short: 'Cascading collision', def: 'A scenario proposed by Donald J. Kessler in 1978 in which the density of objects in LEO becomes high enough that collisions generate debris that cause further collisions.' },
    { term: 'LEO / MEO / GEO', short: 'Orbital shells', def: 'Low Earth Orbit (160–2,000 km), Medium Earth Orbit (2,000–35,000 km), and Geostationary Orbit (35,786 km) — the three operational shells where most spacecraft reside.' },
    { term: 'DARC', short: 'Deep Space Advanced Radar', data: 'darc', def: 'Deep Space Advanced Radar Capability — AUKUS-funded 27-antenna radar at Exmouth, WA, for tracking objects in geosynchronous orbit.' },
    { term: 'Passive radar', short: 'No-emission surveillance', data: 'passive', def: 'A radar technique that uses reflections of commercial broadcast signals (e.g. FM radio) rather than emitting its own signal. No spectrum licence; all-weather; 24/7.' },
    { term: 'Event-based camera', short: 'Neuromorphic sensor', data: 'event', def: 'A sensor that reports only changes in brightness at each pixel rather than capturing full frames. Enables microsecond-precision tracking with dramatically lower data volumes.' },
    { term: 'Conjunction', short: 'Close approach', def: 'A predicted close pass between two orbiting objects. Operators receive conjunction data messages and decide whether a collision-avoidance manoeuvre is justified.' },
    { term: 'STM', short: 'Space Traffic Management', def: 'Rules and procedures for coordinating activity in orbit. Analogous to air traffic management but without a universally accepted framework.' },
    { term: 'Starlink', short: 'SpaceX megaconstellation', data: 'starlink', def: '10,020 active satellites as of 17 March 2026 — roughly two-thirds of all active spacecraft in orbit.' },
    { term: 'JCO', short: 'Joint Commercial Office', def: 'A 20-nation "follow-the-sun" SDA fusion model with three cells: Pacific (NZ lead), Meridian (UK lead), and Americas (US lead).' },
    { term: 'FOR codes', short: 'Field of Research', def: 'ANZSRC taxonomy used to classify research. Places all space engineering under a single aerospace code — 510901 Astrodynamics and SSA is the only code to explicitly name the field.' }
  ],

  arcFunding: [
    { year: 2006, amount: 90992,  n: 1 },
    { year: 2007, amount: 0,      n: 0 },
    { year: 2008, amount: 0,      n: 0 },
    { year: 2009, amount: 0,      n: 0 },
    { year: 2010, amount: 0,      n: 0 },
    { year: 2011, amount: 0,      n: 0 },
    { year: 2012, amount: 0,      n: 0 },
    { year: 2013, amount: 840542, n: 2 },
    { year: 2014, amount: 0,      n: 0 },
    { year: 2015, amount: 286947, n: 1 },
    { year: 2016, amount: 780000, n: 1 },
    { year: 2017, amount: 410675, n: 1 },
    { year: 2018, amount: 0,      n: 0 },
    { year: 2019, amount: 0,      n: 0 },
    { year: 2020, amount: 553877, n: 1 },
    { year: 2021, amount: 0,      n: 0 },
    { year: 2022, amount: 788194, n: 2 },
    { year: 2023, amount: 280000, n: 1 },
    { year: 2024, amount: 0,      n: 0 },
    { year: 2025, amount: 0,      n: 0 },
    { year: 2026, amount: 0,      n: 0 }
  ],

  starlinkCumulative: [
    [2006,0],[2007,0],[2008,0],[2009,0],[2010,0],[2011,0],[2012,0],[2013,0],
    [2014,0],[2015,0],[2016,0],[2017,0],[2018,0],[2019,120],[2020,900],
    [2021,1800],[2022,3500],[2023,5500],[2024,7000],[2025,9000],[2026,10020]
  ],

  diagnosticMatrix: [
    { nation: 'UK (NSpOC)',       civilMil: true,  catalogue: true,  sensor: false, lesson: 'Directly applicable blueprint.' },
    { nation: 'Germany (GSSAC)', civilMil: true,  catalogue: true,  sensor: false, lesson: 'Co-location works without large budgets.' },
    { nation: 'EU (SST)',         civilMil: true,  catalogue: true,  sensor: false, lesson: 'Networked national assets outperform silos.' },
    { nation: 'Canada (Sapphire)',civilMil: false, catalogue: false, sensor: true,  lesson: 'Feasible Five Eyes space-based contribution.' },
    { nation: 'Australia (Current)', civilMil: false, catalogue: false, sensor: false, lesson: 'Fragmented structure blocks capability.', highlight: true }
  ],

  coordinationMatrix: [
    { num: '01', title: 'Reform FOR Codes',          deadline: 'Current review cycle', body: 'Separate space engineering from aerospace to unblock the ARC research funding pipeline. 510901 is the only code that explicitly names SSA — it needs visibility.', tag: 'Classification' },
    { num: '02', title: 'Develop STM Policy',         deadline: 'By 2028',             body: 'Establish an Australian Space Traffic Management framework. International STM rules are being written now — act as a rule-shaper, not a rule-taker.', tag: 'Policy' },
    { num: '03', title: 'National Coordination Body', deadline: 'By 2028',             body: 'Establish a UK NSpOC-style central hub integrating civil, defence, and academic inputs. Plan for SmartSat CRC funding transition now.', tag: 'Foundational' },
    { num: '04', title: 'Sovereign Catalogue',        deadline: 'Within 3 years',      body: 'Build a tiered-access national space object data framework. Australia currently has no sovereign catalogue — raw data is exported and bought back at premium.', tag: 'Data' },
    { num: '05', title: 'Invest in Sovereign Sensors',deadline: 'Within 5 years',      body: 'Procure and deploy neuromorphic and passive radar technologies domestically. Both are Australian-developed, proven, and arms-restriction-free.', tag: 'Capability' }
  ],

  outcomes: [
    { title: 'Space Safety',           body: 'Better tracking protects the orbital environment for all users — commercial, civil, and military.' },
    { title: 'Commercial Growth',      body: 'Sovereign data access opens global procurement pathways for Australian firms currently forced to establish overseas offices.' },
    { title: 'National Security',      body: 'Civil SSA directly strengthens Defence Space Domain Awareness with no duplicated capability.' },
    { title: 'International Influence',body: 'Sovereign sensors make Australia a vital, non-reliant partner across Five Eyes and allied SSA networks.' }
  ]
};
