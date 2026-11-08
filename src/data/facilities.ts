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
    id: "cafe-bar",
    name: "The Pay-What-You-Can Cafe Bar",
    subtitle: "Third-wave espresso, artisan teas, and free barista job training",
    description:
      "Our volunteer-run cafe served as the welcoming entry point to Liminal. Equipped with commercial grinders, espresso machines, and pour-over stations, it provided Flagstaff with quality coffee regardless of a patron's ability to pay. It also served as an open job-training platform, providing volunteer baristas with comprehensive craft coffee experience.",
    features: [
      "Third-wave pour-overs, cold brew, and espresso drinks",
      "Pay-what-you-can & sliding-scale equity pricing",
      "Free 2-weekend barista job training for volunteers",
      "Partnership with local food cooperative Evolve Eats",
    ],
    imageSrc: "/images/archival/cafe-bar.jpg",
    imageAlt: "Barista pouring honey and tea behind the wooden cafe counter at Liminal",
  },
  {
    id: "art-supply-room",
    name: "The Free Art Supply Room",
    subtitle: "All mediums free and accessible to community creators",
    description:
      "Art supplies are often prohibitively expensive. Liminal opened an entirely free supply room stocked with artist-grade acrylic paints, spray paints, colored pencils, drawing papers, fabric dyes, and brushes. Anyone visiting the center was invited to borrow materials or work on projects in the room without charge.",
    features: [
      "Color-sorted acrylic paints, inks, and spray paint cans",
      "Free sketchbooks, canvases, and craft textiles",
      "Community donation station for surplus creative materials",
      "No reservation or checkout fees required",
    ],
    imageSrc: "/images/archival/art-room.jpg",
    imageAlt: "Shelves stocked with colored markers, tubes of acrylic paint, and paper supplies",
  },
  {
    id: "radical-library",
    name: "The Radical Library & Zine Archive",
    subtitle: "Anti-capitalist theory, labor history, and grassroots zines",
    description:
      "Liminal curated a physical collection of independent literature, grassroots pamphlets, and books exploring anti-capitalism, feminist philosophy, indigenous sovereignty, mutual aid, and civil rights. The space was furnished with comfortable reading armchairs and study desks.",
    features: [
      "Over 300 curated titles on labor history, mutual aid, and social ecology",
      "Grassroots local zines and self-published community poetry",
      "Free study and quiet reading spaces with high-speed Wi-Fi",
      "Honor-system reading and lending model",
    ],
    imageSrc: "/images/archival/radical-library.jpg",
    imageAlt: "Community members browsing books along the radical library shelves",
  },
  {
    id: "multimedia-room",
    name: "The Multimedia & Event Space",
    subtitle: "Coworking studio by day, vibrant community assembly by night",
    description:
      "A flexible mixed-use room featuring a high-definition digital projector, professional sound gear, folding tables, and modular seating. During daytime hours, it functioned as a free public workspace. In the evenings, it transformed into an assembly hall for film screenings, union meetings, and musical performances.",
    features: [
      "HD digital projector and sound system for screenings and talks",
      "Modular tables accommodating up to 40 participants",
      "Public venue hosting local nonprofits and solidarity groups",
      "Governed by Liminal's anti-oppressive Venue Right of Refusal",
    ],
    imageSrc: "/images/archival/multimedia-room.jpg",
    imageAlt: "Multimedia room with meeting tables, monitor, and art-making workstations",
  },
  {
    id: "harm-reduction-station",
    name: "The Mutual Aid & Harm Reduction Station",
    subtitle: "Low-barrier overdose reversal supplies and street medicine kits",
    description:
      "In solidarity with Sonoran Prevention Works (SPW), Liminal maintained a dedicated station offering free, anonymous harm reduction supplies. We believed deeply in harm reduction as healthcare and bodily autonomy, distributing hundreds of Naloxone kits and safe-use materials directly to our neighbors.",
    features: [
      "Free Naloxone (Narcan) nasal spray kits with overdose instructions",
      "Fentanyl test strips, wound care items, and hygiene kits",
      "Strictly anonymous distribution with zero identification barriers",
      "Monthly community overdose reversal trainings open to the public",
    ],
    imageSrc: "/images/archival/harm-reduction-spw.jpg",
    imageAlt: "Harm reduction kits, Narcan doses, and informational pamphlets on the resource table",
  },
];

