export interface FacilityArea {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  features: string[];
  imageSrc: string;
  imageAlt: string;
}

export const FACILITIES: FacilityArea[] = [
  {
    "id": "cafe-bar",
    "name": "The Cafe",
    "subtitle": "Coffee, tea, and food",
    "description": "The volunteer-run cafe offered drinks and food on a pay-what-you-can basis. Visitors were welcome regardless of their ability to pay.",
    "features": [
      "Coffee and tea",
      "Pay-what-you-can approach"
    ],
    "imageSrc": "/images/archival/cafe-bar.jpg",
    "imageAlt": "Preparing a drink at the cafe counter"
  },
  {
    "id": "art-supply-room",
    "name": "The Art Supply Room",
    "subtitle": "Materials for making art",
    "description": "Visitors could use art materials during open hours, including colored pencils, markers, paints, and textiles.",
    "features": [
      "Art supplies for visitors to use",
      "Space for creative projects"
    ],
    "imageSrc": "/images/archival/art-room.jpg",
    "imageAlt": "Shelves of art supplies at Liminal"
  },
  {
    "id": "radical-library",
    "name": "The Radical Library",
    "subtitle": "Books to read at the center",
    "description": "The library held books exploring left-wing and anti-capitalist ideas. Visitors could read at the center; the archived facilities page described lending as a future plan.",
    "features": [
      "Books on politics and social issues",
      "Reading at the center"
    ],
    "imageSrc": "/images/archival/radical-library.jpg",
    "imageAlt": "People gathered beside the library shelves"
  },
  {
    "id": "multimedia-room",
    "name": "The Multimedia Room",
    "subtitle": "Art-making and community events",
    "description": "The room was used for art-making during the day and community events in the evening, including film screenings, presentations, and meetings.",
    "features": [
      "Audiovisual equipment",
      "Round-table seating"
    ],
    "imageSrc": "/images/archival/multimedia-room.jpg",
    "imageAlt": "Tables and work areas in the multimedia room"
  },
  {
    "id": "harm-reduction-station",
    "name": "Harm Reduction Supplies",
    "subtitle": "Free supplies and information",
    "description": "Liminal offered harm reduction supplies and hosted kit-making with Sonoran Prevention Works. Kits included hygiene, wound-care, and safer-use materials.",
    "features": [
      "Free harm reduction kits",
      "Kit-making gatherings"
    ],
    "imageSrc": "/images/archival/harm-reduction-spw.jpg",
    "imageAlt": "Harm reduction resources at Liminal"
  }
];
