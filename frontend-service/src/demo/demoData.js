// Sample events for the GitHub Pages demo, which runs without a backend. The organizations and volunteers are
// fictional. Same events as profile-service's DemoEventSeeder; keep the two in step.

export const DEMO_ACCOUNTS = [
  { username: 'org', email: 'org@gmail.com', password: 'org123', role: 'ORGANIZER', fullName: 'Demo Organizer', organizationName: 'Green Singapore Community' },
  { username: 'test', email: 'test@gmail.com', password: 'test123', role: 'VOLUNTEER', fullName: 'Test Volunteer', organizationName: null },
];

export const CATEGORIES = [
  ['Animals', 'Shelters, rescue and animal welfare'],
  ['Community', 'Neighbourhood support and local events'],
  ['Disaster relief', 'Emergency response and relief supplies'],
  ['Education', 'Tutoring, mentoring and literacy'],
  ['Environment', 'Clean-ups, tree planting and conservation'],
  ['Health', 'Blood drives, health camps and wellbeing'],
];

export const VOLUNTEER_NAMES = [
  'Aisyah Rahman', 'Wei Jie Tan', 'Priya Nair', 'Marcus Lim', 'Nurul Huda', 'Jun Hao Ong',
  'Kavitha Subramaniam', 'Daniel Goh', 'Siti Aminah', 'Ethan Koh', 'Farah Iskandar', 'Ravi Menon',
  'Chloe Ng', 'Hafiz Ismail', 'Mei Ling Chua', 'Arjun Pillai', 'Rachel Teo', 'Zul Hakim', 'Sarah Lee',
  'Bryan Wong', 'Divya Krishnan', 'Amirul Hassan', 'Grace Yeo', 'Kenneth Chew', 'Nadia Salleh',
  'Vikram Das', 'Jasmine Low', 'Irfan Aziz', 'Hui Min Seah', 'Joel Fernandez',
];

// Where each fictional volunteer likes to help (cycled), and causes picked by position in CATEGORIES.
// Same as DemoEventSeeder's AREAS and CAUSES.
export const AREAS = ['Tampines', 'Ang Mo Kio', 'Jurong West', 'Bedok', 'Toa Payoh', 'Woodlands', 'Sengkang', 'Queenstown', 'Pasir Ris', 'Bishan'];

const GREEN_SG = ['Green Singapore Community', 'org'];
const COASTLINE = ['Coastline Keepers', 'coastlinekeepers'];
const TUTORS = ['Kampung Tutors', 'kampungtutors'];
const HEALTH = ['Heartland Health Volunteers', 'heartlandhealth'];
const SILVER = ['Silver Friends SG', 'silverfriends'];
const FOOD = ['Heartland Food Share', 'heartlandfood'];
const PAWS = ['Paws in the Heartlands', 'pawsheartlands'];

// day: days from today (negative = already happened). joined: fictional volunteers signed up, plus the demo
// volunteer when demoVolunteer is set.
export const SAMPLES = [
  { name: 'Beach clean-up at Pasir Ris', category: 'Environment', org: COASTLINE, day: 3, start: '08:00', hours: 3, spots: 40, joined: 23,
    area: 'Pasir Ris', address: 'Pasir Ris Park, Carpark C', pincode: '519639',
    description: "Help us clear plastic and fishing line from the shore before it washes back out to sea. Gloves, tongs and bags are provided. Bring a hat, a water bottle and shoes you don't mind getting sandy. We finish with a quick tally of what we found." },
  { name: 'Tree planting at Sengkang Riverside Park', category: 'Environment', org: GREEN_SG, day: 6, start: '08:30', hours: 3, spots: 30, joined: 12, demoVolunteer: true,
    area: 'Sengkang', address: 'Sengkang Riverside Park, Anchorvale St', pincode: '544964',
    description: "Plant native saplings along the riverside with our park team. No gardening experience needed: we'll show you how to dig, plant and mulch. Wear covered shoes and bring water. Tools and gloves provided." },
  { name: 'Weekend maths tutoring for Primary 5', category: 'Education', org: TUTORS, day: 4, start: '10:00', hours: 2, spots: 10, joined: 7,
    area: 'Toa Payoh', address: 'Blk 177 Toa Payoh Central, Level 2', pincode: '310177',
    description: 'Sit with a small group of Primary 5 pupils and help them work through fractions and word problems. Worksheets and answer keys are ready for you. Patience matters more than being a maths whiz.' },
  { name: 'Reading buddies at Jurong West library', category: 'Education', org: TUTORS, day: 10, start: '14:00', hours: 2, spots: 12, joined: 4,
    area: 'Jurong West', address: 'Jurong West Public Library, Jurong West St 64', pincode: '648886',
    description: 'Read picture books with children aged 5 to 8 and help them sound out new words. Great for first-time volunteers. English, Mandarin, Malay and Tamil readers are all welcome.' },
  { name: 'Blood donation drive helpers', category: 'Health', org: HEALTH, day: 8, start: '09:00', hours: 6, spots: 20, joined: 18,
    area: 'Tampines', address: 'Our Tampines Hub, Festive Plaza', pincode: '528523',
    description: "Welcome donors, guide them through registration and hand out drinks and snacks after they donate. You don't need to donate yourself. Shifts are flexible: stay for two hours or the whole day." },
  { name: 'Befriending seniors: kopi and a chat', category: 'Community', org: SILVER, day: 2, start: '15:00', hours: 2, spots: 15, joined: 9, demoVolunteer: true,
    area: 'Ang Mo Kio', address: 'Blk 420 Ang Mo Kio Ave 10, Activity Centre', pincode: '560420',
    description: 'Spend an afternoon with seniors who live alone: play a round of carrom, share kopi and swap stories. A short briefing at the start covers everything you need. Dialect speakers especially welcome.' },
  { name: 'Pack and deliver food rations', category: 'Community', org: FOOD, day: 5, start: '09:00', hours: 4, spots: 25, joined: 25,
    area: 'Bedok', address: 'Blk 216 Bedok North St 1, void deck', pincode: '460216',
    description: 'Pack rice, oil and canned food into bags, then deliver them door to door to families in the estate. Drivers with a car are a big help. Wear comfortable clothes; there is some lifting.' },
  { name: 'Dog walking at the shelter', category: 'Animals', org: PAWS, day: 7, start: '07:30', hours: 2.5, spots: 12, joined: 5,
    area: 'Sungei Tengah', address: 'Sungei Tengah Rd, Shelter Block B', pincode: '699012',
    description: "Our shelter dogs need their morning walk and some company. We'll pair you with a calm dog after a 10-minute safety briefing. Wear closed shoes. Minimum age 16." },
  { name: 'Adoption day helpers', category: 'Animals', org: PAWS, day: 13, start: '11:00', hours: 6, spots: 8, joined: 2,
    area: 'Tiong Bahru', address: 'Tiong Bahru Community Centre, Hall 1', pincode: '168898',
    description: "Help cats and dogs meet their future families. You'll set up pens, chat with visitors and help with adoption forms. Animal lovers who enjoy talking to people are perfect for this." },
  { name: 'Emergency supply packing', category: 'Disaster relief', org: GREEN_SG, day: 9, start: '10:00', hours: 4, spots: 30, joined: 11,
    area: 'Jurong East', address: 'Jurong East Community Club, Multi-purpose Hall', pincode: '609601',
    description: "Pack hygiene kits and dry rations for families affected by the floods in the region. It's an assembly line, so it's easy to join at any point. Great for groups of friends or colleagues." },
  { name: 'Community garden harvest day', category: 'Environment', org: GREEN_SG, day: 15, start: '08:00', hours: 3, spots: 20, joined: 3,
    area: 'Queenstown', address: 'Commonwealth Close community garden', pincode: '140042',
    description: 'Harvest kang kong, chilli and pandan with the residents who tend this garden, then help share it out to neighbours. Bring a hat and a bag for your own share.' },
  { name: 'Coding club for teens', category: 'Education', org: TUTORS, day: 12, start: '14:00', hours: 3, spots: 15, joined: 6,
    area: 'Woodlands', address: 'Woodlands Regional Library, Level 3', pincode: '738875',
    description: 'Help teenagers build their first simple game in Scratch or Python. If you can write a loop, you can help. Laptops are provided.' },
  // Already happened: these give the demo accounts attendance records and verified hours.
  { name: 'Beach clean-up at East Coast Park', category: 'Environment', org: COASTLINE, day: -14, start: '08:00', hours: 3, spots: 40, joined: 26, demoVolunteer: true,
    area: 'Marine Parade', address: 'East Coast Park, Area C', pincode: '449876',
    description: 'Our monthly clean-up of the East Coast shoreline.' },
  { name: 'Tree planting at Bishan-Ang Mo Kio Park', category: 'Environment', org: GREEN_SG, day: -10, start: '08:30', hours: 3, spots: 25, joined: 15, demoVolunteer: true,
    area: 'Bishan', address: 'Bishan-Ang Mo Kio Park, Pond Gardens', pincode: '569931',
    description: 'Planting native trees along the river with the park team.' },
  { name: 'Reading buddies at Jurong West library', category: 'Education', org: TUTORS, day: -21, start: '14:00', hours: 2, spots: 12, joined: 9, demoVolunteer: true,
    area: 'Jurong West', address: 'Jurong West Public Library, Jurong West St 64', pincode: '648886',
    description: 'Reading picture books with young children.' },
  { name: 'Pack and deliver food rations', category: 'Community', org: FOOD, day: -30, start: '09:00', hours: 4, spots: 25, joined: 20, demoVolunteer: true,
    area: 'Bedok', address: 'Blk 216 Bedok North St 1, void deck', pincode: '460216',
    description: 'Packing and delivering rations to families in the estate.' },
];
