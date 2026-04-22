import { serverTimestamp } from 'firebase/firestore';

export const DEMO_ARTICLES = [
  {
    title: "The Silent Valley: A Hidden Gem in the High-Country",
    content: "# Beauty in the Mountains\n\nNestled deep within the Hhohho region lies a valley so quiet you can hear your own heartbeat. \n\n### The Trek\nReaching the Silent Valley is no easy feat. It requires a four-hour hike through dense mist-forests and over rocky outcrops. But for those who make the journey, the reward is a landscape untouched by time.\n\n*   Crystal clear springs\n*   Ancient rock formations\n*   Rare bird species found nowhere else in the Kingdom\n\nLocal guide, Thabani Dlamini, says the valley has been a secret of the elders for centuries. \"We only bring people here who respect the earth,\" he explains.\n\n[Visit Eswatini Tourism](https://www.theswatini.com) for more information on guided hikes.",
    category: "Community",
    region: "Hhohho",
    imageURL: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=2070",
    featured: true,
    breaking: false,
    status: "published",
    views: 3420,
    likes: 215,
    commentsCount: 24,
    authorName: "Nomsa Dlamini",
    authorPhoto: "https://i.pravatar.cc/150?u=nomsa"
  },
  {
    title: "Tech Innovation Hub Opens in Matsapha",
    content: "Matsapha officially welcomed its first dedicated Tech Innovation Hub this week. The facility aims to support local startups and provide training in coding, AI, and cybersecurity.\n\n\"The future of our economy is digital,\" said the Minister of ICT during the ribbon-cutting ceremony. The hub is already hosting ten local startups focusing on fintech and agritech solutions.",
    category: "Business",
    region: "Manzini",
    imageURL: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=2070",
    featured: true,
    breaking: true,
    status: "published",
    views: 1890,
    likes: 89,
    commentsCount: 15,
    authorName: "Sipho Magagula",
    authorPhoto: "https://i.pravatar.cc/150?u=sipho"
  },
  {
    title: "Eswatini Football Teams Prepare for International Tournament",
    content: "The national football squad is intensifying their training ahead of the regional championships starting next month. The coach expressed confidence in the young talent recently added to the roster.\n\nKey matches will be held in the national stadium, and tickets are expected to sell out within hours of release.",
    category: "Sports",
    region: "National",
    imageURL: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=2070",
    featured: false,
    breaking: false,
    status: "published",
    views: 5600,
    likes: 432,
    commentsCount: 56,
    authorName: "Joy Masuku",
    authorPhoto: "https://i.pravatar.cc/150?u=joy"
  },
  {
    title: "Preserving the Ancient Songs of Lubombo",
    content: "A new cultural initiative is recording the traditional songs of the Lubombo mountains to ensure they are passed down to future generations.\n\nElderly residents are being interviewed about the meanings behind specific chants and rhythms used during traditional ceremonies.",
    category: "Health",
    region: "Lubombo",
    imageURL: "https://images.unsplash.com/photo-1523810192022-5a0fb9aa7bc8?auto=format&fit=crop&q=80&w=2067",
    featured: false,
    breaking: false,
    status: "published",
    views: 1200,
    likes: 78,
    commentsCount: 9,
    authorName: "Musa Shongwe",
    authorPhoto: "https://i.pravatar.cc/150?u=musa"
  },
  {
    title: "New Health Clinic in Shiselweni Brings Hope",
    content: "Residents of rural Shiselweni no longer have to travel long distances for primary healthcare. The new clinic is equipped with a modern maternity ward and a pediatric unit.",
    category: "Health",
    region: "Shiselweni",
    imageURL: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2053",
    featured: false,
    breaking: false,
    status: "published",
    views: 900,
    likes: 45,
    commentsCount: 3,
    authorName: "Bheki Fakudze",
    authorPhoto: "https://i.pravatar.cc/150?u=bheki"
  }
];

export const DEMO_POLLS = [
  {
    question: "What is the most important issue facing Swazi youth today?",
    options: [
      { text: "Employment Opportunities", votes: 850 },
      { text: "Access to Education", votes: 420 },
      { text: "Digital Skills", votes: 310 },
      { text: "Healthcare", votes: 150 }
    ],
    active: true
  }
];

export const DEMO_SUBMISSIONS = [
  {
    title: "Burst Pipe in Mbabane Sector 4",
    content: "There is a major water leak near the post office. It's been running for 3 days and wasting precious water. Please help get the word out so authorities can fix it.",
    submitterName: "Themba Zulu",
    submitterEmail: "themba@example.com",
    status: "pending",
    createdAt: new Date().toISOString()
  },
  {
    title: "Local Youth Soccer Tournament Success",
    content: "Our community just completed a 3-day soccer tournament. 12 teams participated and the finals were watched by over 200 people. It was a great success for local youth engagement.",
    submitterName: "Sarah Dube",
    submitterEmail: "sarah@example.com",
    status: "pending",
    createdAt: new Date().toISOString()
  }
];
