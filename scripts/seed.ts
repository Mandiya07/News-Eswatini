import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../src/lib/firebase';
import { TINKHUNDLA_DATA } from '../src/constants';

const ARTICLES_COLLECTION = 'articles';

const mockArticles = [
  // Nationwide
  {
    title: "Nationwide Infrastructure Project Announced",
    content: "A new nationwide infrastructure project has been announced, promising to improve roads and connectivity across the Kingdom.",
    category: "Politics",
    status: 'published',
    featured: true,
  },
  {
    title: "National Health Initiative Launched",
    content: "The Ministry of Health has launched a new initiative to improve healthcare access in rural areas.",
    category: "Health",
    status: 'published',
  },
  // Regions
  {
    title: "Hhohho Region Celebrates Harvest",
    content: "Farmers in the Hhohho region are celebrating a record-breaking harvest this season.",
    category: "Community",
    region: "Hhohho",
    status: 'published',
  },
  {
    title: "Manzini Hub Expansion Plans",
    content: "New plans for the expansion of the Manzini hub have been unveiled, aiming to boost local business.",
    category: "Business",
    region: "Manzini",
    status: 'published',
  },
  // Constituencies
  {
    title: "New School Opened in Mbabane East",
    content: "A new primary school has been opened in the Mbabane East constituency, providing better education facilities for local children.",
    category: "Education",
    inkhundla: "Mbabane East",
    status: 'published',
  },
  {
    title: "Water Project Completed in Siphofaneni",
    content: "A major water project has been completed in the Siphofaneni constituency, ensuring reliable water supply for residents.",
    category: "Community",
    inkhundla: "Siphofaneni",
    status: 'published',
  }
];

async function seed() {
  console.log("Seeding mock data...");
  for (const article of mockArticles) {
    await addDoc(collection(db, ARTICLES_COLLECTION), {
      ...article,
      authorId: 'mock-author',
      authorName: 'Mock Reporter',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      views: 0,
      likes: 0,
      commentsCount: 0,
    });
  }
  console.log("Seeding complete!");
}

seed().catch(console.error);
