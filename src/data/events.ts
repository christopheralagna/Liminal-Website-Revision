export interface HistoricalEvent {
  id: string;
  title: string;
  dateStr?: string;
  timeStr?: string;
  category: "mutual-aid" | "music" | "education" | "arts" | "community";
  categoryLabel: string;
  description: string;
  organizer?: string;
  flyerSrc?: string;
}

// Public summaries only. Sources and unresolved dates are documented in the refinement report.
export const HISTORICAL_EVENTS: HistoricalEvent[] = [
  {
    "id": "opening-night",
    "title": "Liminal's Opening Night",
    "dateStr": "Saturday, March 27, 2021",
    "timeStr": "7:00 PM – 10:00 PM",
    "category": "community",
    "categoryLabel": "Community Gathering",
    "description": "The original website announced an opening night with drinks, snacks, art, and conversation."
  },
  {
    "id": "monthly-narcan",
    "title": "Monthly Narcan Training",
    "dateStr": "Thursday, May 25, 2023",
    "timeStr": "6:00 PM – 7:30 PM",
    "category": "mutual-aid",
    "categoryLabel": "Harm Reduction",
    "description": "The archived event listing advertised training in recognizing and responding to opioid overdoses, with free Narcan kits."
  },
  {
    "id": "working-class-movie-night",
    "title": "Working Class Movie Night: '9 To 5'",
    "dateStr": "Wednesday, May 24, 2023",
    "category": "education",
    "categoryLabel": "Film & Discussion",
    "description": "The archived calendar listed a screening of “9 To 5” hosted by Flagstaff Industrial Workers of the World.",
    "organizer": "Flagstaff Industrial Workers of the World (IWW)"
  },
  {
    "id": "renegade-art-party",
    "title": "Renegade Art Party",
    "dateStr": "January 7 (year not recorded)",
    "timeStr": "7:00 PM – 11:00 PM",
    "category": "arts",
    "categoryLabel": "Community Arts",
    "description": "The flyer advertised exhibitions, free art supplies, and local DJs for a First Friday art party.",
    "flyerSrc": "/images/archival/flyer-renegade.png"
  },
  {
    "id": "open-jazz-jam",
    "title": "Open Jazz Jam + extended cafe hours",
    "dateStr": "Fourth Thursdays",
    "timeStr": "7:00 PM – 10:00 PM",
    "category": "music",
    "categoryLabel": "Live Music",
    "description": "The flyer invited jazz players to sit in for an open jam, with cafe drinks available."
  },
  {
    "id": "queer-game-night",
    "title": "Queer Game Night",
    "category": "community",
    "categoryLabel": "LGBTQ+ Community",
    "description": "A board game gathering advertised by the NAU LGBTQIA Commission.",
    "organizer": "NAU LGBTQIA Commission",
    "flyerSrc": "/images/archival/flyer-queer-game-night.jpg"
  },
  {
    "id": "wrecking-ball-party",
    "title": "Wrecking Ball",
    "category": "mutual-aid",
    "categoryLabel": "Benefit & Mutual Aid",
    "description": "The event description outlined a queer dance party with DJs and entry proceeds going to bail bond funds."
  },
  {
    "id": "clothing-swap-winter-drive",
    "title": "All Gender Clothing Swap + Winter Clothing Drive",
    "category": "mutual-aid",
    "categoryLabel": "Mutual Aid",
    "description": "The event description invited people to donate and exchange clothing and warm winter resources."
  },
  {
    "id": "art-therapy-workshops",
    "title": "Jardines Mentales (Mental Gardens): Art Therapy Workshops",
    "dateStr": "Select Thursdays",
    "timeStr": "4:00 PM – 6:00 PM",
    "category": "arts",
    "categoryLabel": "Art Workshops",
    "description": "The workshop flyer advertised a different mental wellness topic each month."
  },
  {
    "id": "capoeira-angola",
    "title": "Capoeira Angola",
    "dateStr": "Third Fridays",
    "timeStr": "6:00 PM – 8:00 PM",
    "category": "music",
    "categoryLabel": "Movement & Culture",
    "description": "The flyer advertised capoeira presented by Centro de Capoeira Angola Ouroverde.",
    "organizer": "Centro de Capoeira Angola Ouroverde"
  },
  {
    "id": "political-education-class",
    "title": "Political Education Class",
    "category": "education",
    "categoryLabel": "Political Education",
    "description": "The event description outlined a free discussion class about racism, colonial rule, and US power abroad. It described a semester-long syllabus, with drop-ins welcome."
  },
  {
    "id": "bake-sale-fundraiser",
    "title": "Bake Sale Competition Fundraiser",
    "category": "community",
    "categoryLabel": "Community Fundraiser",
    "description": "The event description outlined a volunteer bake-off, with pastries sold at Liminal and proceeds supporting the space."
  }
];
