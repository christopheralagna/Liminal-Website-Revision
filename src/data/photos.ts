export interface ArchivalPhoto {
  id: string;
  title: string;
  year: string;
  category: "space" | "community" | "music" | "art" | "mutual-aid";
  categoryLabel: string;
  description: string;
  src: string;
  aspect: "landscape" | "portrait" | "square";
  room?: string;
}

export const ARCHIVAL_PHOTOS: ArchivalPhoto[] = [
  {
    id: "front-exterior",
    title: "Liminal Historic Sandstone Exterior",
    year: "2021",
    category: "space",
    categoryLabel: "The Space",
    description:
      "Two-story historic stone building on 217 S San Francisco St in Flagstaff's historic Southside district, with painted brick Liminal signage above the entrance archway.",
    src: "/images/archival/front-of-building.jpg",
    aspect: "landscape",
    room: "Building Exterior",
  },
  {
    id: "community-table",
    title: "Communal Work & Gathering Table",
    year: "2021",
    category: "community",
    categoryLabel: "Community",
    description:
      "Community members, students, and children sharing the large handcrafted wooden communal table with microphones, zines, and notebooks.",
    src: "/images/archival/community-table.png",
    aspect: "landscape",
    room: "Main Lounge",
  },
  {
    id: "cafe-bar",
    title: "Craft Coffee & Tea Bar",
    year: "2021",
    category: "space",
    categoryLabel: "The Space",
    description:
      "Volunteer barista pouring house tea and honey behind the wood bar counter, offering sliding-scale pour-overs and cold brew.",
    src: "/images/archival/cafe-bar.jpg",
    aspect: "portrait",
    room: "Cafe Bar",
  },
  {
    id: "art-room-materials",
    title: "Free Community Art Supply Racks",
    year: "2021",
    category: "art",
    categoryLabel: "Arts & Supplies",
    description:
      "Shelving organized by medium: professional acrylic paints, markers, drawing supplies, and paper freely available to all visitors without charge.",
    src: "/images/archival/art-room.jpg",
    aspect: "portrait",
    room: "Art Supply Room",
  },
  {
    id: "radical-library-shelf",
    title: "The Radical Library & Reading Room",
    year: "2021",
    category: "space",
    categoryLabel: "The Space",
    description:
      "A curated collection of over 300 books and zines focusing on labor history, mutual aid, indigenous sovereignty, and popular education.",
    src: "/images/archival/radical-library.jpg",
    aspect: "landscape",
    room: "Radical Library",
  },
  {
    id: "multimedia-classroom",
    title: "Multimedia Workspace & Assembly Room",
    year: "2021",
    category: "space",
    categoryLabel: "The Space",
    description:
      "Daytime coworking study and art room, equipped with modular tables and digital projection equipment for evening community assemblies.",
    src: "/images/archival/multimedia-room.jpg",
    aspect: "landscape",
    room: "Multimedia Room",
  },
  {
    id: "jazz-night-performance",
    title: "Live Jazz Trio in the Lounge",
    year: "2022",
    category: "music",
    categoryLabel: "Music & Culture",
    description:
      "NAU jazz musicians performing standards in the intimate lounge setting for an attentive community audience during extended cafe hours.",
    src: "/images/archival/jazz-night.jpeg",
    aspect: "landscape",
    room: "Main Lounge",
  },
  {
    id: "goth-night-gathering",
    title: "Community Evening Event",
    year: "2021",
    category: "community",
    categoryLabel: "Community",
    description:
      "Evening attendees gathering under ambient lighting and hanging plants during a community celebration and arts night.",
    src: "/images/archival/goth-night.jpg",
    aspect: "landscape",
    room: "Main Lounge",
  },
  {
    id: "harm-reduction-station",
    title: "Sonoran Prevention Works Harm Reduction Table",
    year: "2021",
    category: "mutual-aid",
    categoryLabel: "Mutual Aid",
    description:
      "Free Naloxone (Narcan) overdose reversal kits, fentanyl test strips, and informational pamphlets provided anonymously in partnership with SPW.",
    src: "/images/archival/harm-reduction-spw.jpg",
    aspect: "landscape",
    room: "Entryway & Resource Station",
  },
  {
    id: "bright-blue-corner",
    title: "The Cobalt Lounge Corner",
    year: "2021",
    category: "space",
    categoryLabel: "The Space",
    description:
      "Vibrant blue wall accentuating vintage armchairs, warm lamps, and communal seating for reading and conversation.",
    src: "/images/archival/bright-blue-corner.jpg",
    aspect: "portrait",
    room: "Reading Nook",
  },
  {
    id: "purple-wideshot",
    title: "Main Room Wide Shot & Plant Canopy",
    year: "2021",
    category: "space",
    categoryLabel: "The Space",
    description:
      "Wide view of the high-ceilinged cafe hall showing hanging pothos vines, local artwork on brick walls, and the cafe counter.",
    src: "/images/archival/purple-wideshot.jpg",
    aspect: "landscape",
    room: "Main Lounge",
  },
  {
    id: "sold-artwork",
    title: "Featured Local Artist Wall Exhibition",
    year: "2021",
    category: "art",
    categoryLabel: "Arts & Supplies",
    description:
      "Original artwork by local Flagstaff artists displayed on the gallery walls during First Friday art openings with zero-commission sales.",
    src: "/images/archival/sold-artwork.jpg",
    aspect: "portrait",
    room: "Gallery Wall",
  },
  {
    id: "suggestions-plants",
    title: "Community Feedback & Idea Box",
    year: "2021",
    category: "community",
    categoryLabel: "Community",
    description:
      "Chalkboard suggestions board for classes, workshops, and communal initiatives, reflecting Liminal's participatory governance.",
    src: "/images/archival/community-suggestions.jpg",
    aspect: "portrait",
    room: "Front Counter",
  },
  {
    id: "window-decorations",
    title: "South Francisco St Window Display",
    year: "2021",
    category: "space",
    categoryLabel: "The Space",
    description:
      "Sunlight streaming through the front arched windows onto house plants and vintage thrift clothing racks.",
    src: "/images/archival/window-decoration.jpg",
    aspect: "portrait",
    room: "Front Window",
  },
];

