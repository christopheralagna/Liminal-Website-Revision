export interface HistoricalEvent {
  id: string;
  title: string;
  dateStr: string;
  category: "mutual-aid" | "music" | "education" | "arts" | "community";
  categoryLabel: string;
  timeStr: string;
  description: string;
  organizer?: string;
  flyerSrc?: string;
  featured?: boolean;
}

export const HISTORICAL_EVENTS: HistoricalEvent[] = [
  {
    id: "opening-night",
    title: "Liminal Opening Night Celebration",
    dateStr: "Saturday, March 27, 2021",
    timeStr: "7:00 PM – 10:00 PM",
    category: "community",
    categoryLabel: "Community Celebration",
    description:
      "The inaugural launch celebration introducing Liminal to Flagstaff. Community members came together to celebrate a new people's space with live music, coffee, tea, and communal dialogue.",
    organizer: "Liminal Co-Founders",
    featured: true,
  },
  {
    id: "monthly-narcan",
    title: "Monthly Community Narcan Training",
    dateStr: "Thursday, May 25, 2023",
    timeStr: "6:00 PM – 7:30 PM",
    category: "mutual-aid",
    categoryLabel: "Harm Reduction & Health",
    description:
      "Rapidly reverse an opioid overdose using Narcan (Naloxone). Hands-on overdose response training provided with each free kit. Learn about signs and symptoms of an overdose, how to administer lifesaving care, and Arizona Good Samaritan laws.",
    organizer: "Sonoran Prevention Works & Liminal",
    flyerSrc: "/images/archival/flyer-narcan.png",
    featured: true,
  },
  {
    id: "working-class-movie-night",
    title: "Working Class Movie Night: '9 To 5'",
    dateStr: "Wednesday, May 24, 2023",
    timeStr: "6:00 PM – 8:30 PM",
    category: "education",
    categoryLabel: "Political Education & Film",
    description:
      "Film showing and post-film discussion of the workplace comedy and labor organizing classic '9 to 5'. Free admission, free popcorn, with open discussion on clerical worker solidarity and workplace empowerment.",
    organizer: "Flagstaff Industrial Workers of the World (IWW)",
    featured: true,
  },
  {
    id: "renegade-art-party",
    title: "Renegade First Friday Art Party",
    dateStr: "Friday, December 2, 2022",
    timeStr: "5:00 PM – 9:00 PM",
    category: "arts",
    categoryLabel: "Community Arts & Gallery",
    description:
      "First Friday exhibition featuring collaborative collage-making with Northern Arizona University art students. Live visual art, experimental soundscapes, and free art supplies for attendees to craft community art pieces.",
    organizer: "Riley Shorthair & NAU Art Collective",
    flyerSrc: "/images/archival/flyer-renegade.png",
    featured: true,
  },
  {
    id: "open-jazz-jam",
    title: "Open Jazz Jam & Extended Cafe Night",
    dateStr: "Recurring Bi-Weekly Thursdays",
    timeStr: "7:00 PM – 10:00 PM",
    category: "music",
    categoryLabel: "Live Music & Culture",
    description:
      "An acoustic jam session co-facilitated with NAU jazz department musicians. Local instrumentalists sat in to play standards together for a listening community audience, accompanied by volunteer baristas serving espresso and wine.",
    organizer: "Josh Moore, Rob Wallace & Arie Werbrouke",
    flyerSrc: "/images/archival/flyer-jazz.png",
    featured: true,
  },
  {
    id: "queer-game-night",
    title: "Queer Board Game & Social Night",
    dateStr: "Recurring Monthly Tuesdays",
    timeStr: "6:30 PM – 9:30 PM",
    category: "community",
    categoryLabel: "LGBTQ+ Community",
    description:
      "A welcoming, sober-friendly social gathering for LGBTQ+ community members and allies. Tabletop board games, deck builders, tea, and warm snacks in a safe, affirming community space.",
    organizer: "Flagstaff Pride & Queer Youth Collective",
    flyerSrc: "/images/archival/flyer-queer-game-night.jpg",
  },
  {
    id: "wrecking-ball-party",
    title: "Wrecking Ball: Queer Dance Benefit for Bail Funds",
    dateStr: "Special Event",
    timeStr: "8:00 PM – Late",
    category: "mutual-aid",
    categoryLabel: "Benefit & Mutual Aid",
    description:
      "An energetic queer dance party where 100% of admission donations were directly channeled to local indigenous and immigrant bail relief funds. Featured guest DJs, screenprinting, and wheat-pasting workshops.",
    organizer: "Tam & Seeding Sovereignty",
  },
  {
    id: "clothing-swap-winter-drive",
    title: "All-Gender Clothing Swap & Winter Gear Drive",
    dateStr: "November 20 – December 1, 2022",
    timeStr: "During Cafe Hours",
    category: "mutual-aid",
    categoryLabel: "Direct Mutual Aid",
    description:
      "Community resource exchange collecting heavy winter coats, low-temp sleeping bags, wool socks, and hand warmers. Everything was distributed 100% free of charge to unhoused community members during cold Flagstaff winter freezes.",
    organizer: "Liminal Mutual Aid Team",
  },
  {
    id: "art-therapy-workshops",
    title: "Community Art Therapy & Healing Workshop",
    dateStr: "Recurring Monthly Saturdays",
    timeStr: "2:00 PM – 4:00 PM",
    category: "arts",
    categoryLabel: "Workshops & Healing",
    description:
      "Accessible expressive arts workshop taught by volunteer art therapists. Participants used mixed media, paint, and clay to explore personal healing, somatic grounding, and collective resilience.",
    organizer: "Estefania Villaquirán",
    flyerSrc: "/images/archival/flyer-art-therapy.jpg",
  },
  {
    id: "capoeira-angola",
    title: "Afro-Brazilian Capoeira Performance & Workshop",
    dateStr: "Special Community Workshop",
    timeStr: "6:00 PM – 8:00 PM",
    category: "music",
    categoryLabel: "Movement & Culture",
    description:
      "An introduction to Capoeira Angola movement, berimbau rhythms, and Afro-Brazilian resistance traditions. Led by local educational nonprofit Centro de Capoeira Angola Ouroverde Flagstaff.",
    organizer: "Centro de Capoeira Angola Ouroverde",
    flyerSrc: "/images/archival/flyer-capoeira.jpg",
  },
  {
    id: "political-education-class",
    title: "Political Education: Power, Resistance & Possibilities",
    dateStr: "Semester-Long Reading Series",
    timeStr: "Weekly Wednesdays 5:30 PM",
    category: "education",
    categoryLabel: "Political Education",
    description:
      "Free discussion-based seminar on ongoing settler colonialism, US labor history, and grassroots community organizing frameworks, taught by local radical educator Emily Davalos.",
    organizer: "Emily Davalos",
    flyerSrc: "/images/archival/flyer-revolution.jpg",
  },
  {
    id: "bake-sale-fundraiser",
    title: "Volunteer Bake-Off & Rent Fundraiser",
    dateStr: "Quarterly Community Event",
    timeStr: "10:00 AM – 6:00 PM",
    category: "community",
    categoryLabel: "Community Fundraiser",
    description:
      "Volunteer bakers competed in a friendly community pastry competition. All pastries were sold by donation at the cafe counter, with 100% of proceeds supporting Liminal's monthly rent overhead.",
    organizer: "Liminal Fundraising Team",
  },
];

