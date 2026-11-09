export interface ArchivalPhoto {
  id: string;
  title: string;
  category: "space" | "community" | "music" | "art" | "mutual-aid";
  categoryLabel: string;
  description: string;
  src: string;
  aspect: "landscape" | "portrait" | "square";
  room?: string;
}

export const ARCHIVAL_PHOTOS: ArchivalPhoto[] = [
  {
    "id": "front-exterior",
    "title": "Liminal Historic Sandstone Exterior",
    "category": "space",
    "categoryLabel": "The Space",
    "description": "The exterior of Liminal’s former building at 217 S San Francisco St.",
    "src": "/images/archival/front-of-building.jpg",
    "aspect": "landscape",
    "room": "Building Exterior"
  },
  {
    "id": "community-table",
    "title": "Communal Work & Gathering Table",
    "category": "community",
    "categoryLabel": "Community",
    "description": "People gathered around a table at Liminal.",
    "src": "/images/archival/community-table.png",
    "aspect": "landscape",
    "room": "Main Lounge"
  },
  {
    "id": "cafe-bar",
    "title": "Craft Coffee & Tea Bar",
    "category": "space",
    "categoryLabel": "The Space",
    "description": "Preparing a drink at the cafe counter.",
    "src": "/images/archival/cafe-bar.jpg",
    "aspect": "portrait",
    "room": "Cafe Bar"
  },
  {
    "id": "art-room-materials",
    "title": "Free Community Art Supply Racks",
    "category": "art",
    "categoryLabel": "Arts & Supplies",
    "description": "Shelves of art materials in the art supply room.",
    "src": "/images/archival/art-room.jpg",
    "aspect": "portrait",
    "room": "Art Supply Room"
  },
  {
    "id": "radical-library-shelf",
    "title": "The Radical Library & Reading Room",
    "category": "space",
    "categoryLabel": "The Space",
    "description": "People gathered beside the library shelves.",
    "src": "/images/archival/radical-library.jpg",
    "aspect": "landscape",
    "room": "Radical Library"
  },
  {
    "id": "multimedia-classroom",
    "title": "Multimedia Workspace & Assembly Room",
    "category": "space",
    "categoryLabel": "The Space",
    "description": "Tables and work areas in the multimedia room.",
    "src": "/images/archival/multimedia-room.jpg",
    "aspect": "landscape",
    "room": "Multimedia Room"
  },
  {
    "id": "jazz-night-performance",
    "title": "Jazz Performance",
    "category": "music",
    "categoryLabel": "Music & Culture",
    "description": "Musicians performing at Liminal.",
    "src": "/images/archival/jazz-night.jpeg",
    "aspect": "landscape",
    "room": "Main Lounge"
  },
  {
    "id": "goth-night-gathering",
    "title": "Community Evening Event",
    "category": "community",
    "categoryLabel": "Community",
    "description": "An evening gathering at Liminal.",
    "src": "/images/archival/goth-night.jpg",
    "aspect": "landscape",
    "room": "Main Lounge"
  },
  {
    "id": "harm-reduction-station",
    "title": "Sonoran Prevention Works Harm Reduction Table",
    "category": "mutual-aid",
    "categoryLabel": "Mutual Aid",
    "description": "Harm reduction supplies and information at Liminal.",
    "src": "/images/archival/harm-reduction-spw.jpg",
    "aspect": "landscape",
    "room": "Entryway & Resource Station"
  },
  {
    "id": "bright-blue-corner",
    "title": "The Cobalt Lounge Corner",
    "category": "space",
    "categoryLabel": "The Space",
    "description": "Seating beside a blue wall at Liminal.",
    "src": "/images/archival/bright-blue-corner.jpg",
    "aspect": "portrait",
    "room": "Reading Nook"
  },
  {
    "id": "purple-wideshot",
    "title": "Main Room",
    "category": "space",
    "categoryLabel": "The Space",
    "description": "A view across Liminal’s main room.",
    "src": "/images/archival/purple-wideshot.jpg",
    "aspect": "landscape",
    "room": "Main Lounge"
  },
  {
    "id": "sold-artwork",
    "title": "Featured Local Artist Wall Exhibition",
    "category": "art",
    "categoryLabel": "Arts & Supplies",
    "description": "Artwork displayed at Liminal.",
    "src": "/images/archival/sold-artwork.jpg",
    "aspect": "portrait",
    "room": "Gallery Wall"
  },
  {
    "id": "suggestions-plants",
    "title": "Community Feedback & Idea Box",
    "category": "community",
    "categoryLabel": "Community",
    "description": "A board inviting suggestions for events, workshops, and classes.",
    "src": "/images/archival/community-suggestions.jpg",
    "aspect": "portrait",
    "room": "Front Counter"
  },
  {
    "id": "window-decorations",
    "title": "South Francisco St Window Display",
    "category": "space",
    "categoryLabel": "The Space",
    "description": "The front window at Liminal.",
    "src": "/images/archival/window-decoration.jpg",
    "aspect": "portrait",
    "room": "Front Window"
  },
  {
    "id": "art-room-wide",
    "title": "Art Supply Room",
    "category": "art",
    "categoryLabel": "Arts & Supplies",
    "description": "A view of the art supply room.",
    "src": "/images/archival/art-room-2.jpg",
    "aspect": "landscape",
    "room": "Art Supply Room"
  },
  {
    "id": "capoeira-workshop",
    "title": "Afro-Brazilian Capoeira Workshop",
    "category": "community",
    "categoryLabel": "Community",
    "description": "An archival image associated with capoeira at Liminal.",
    "src": "/images/archival/capoeira.jpg",
    "aspect": "landscape",
    "room": "Main Lounge"
  },
  {
    "id": "harm-reduction-kit-party",
    "title": "Harm Reduction Kit-Making Party Poster",
    "category": "mutual-aid",
    "categoryLabel": "Mutual Aid",
    "description": "A poster advertising a harm reduction kit-making gathering with Sonoran Prevention Works.",
    "src": "/images/archival/harm-reduction-kit-making-party.png",
    "aspect": "portrait",
    "room": "Event Poster"
  },
  {
    "id": "radical-library-reading",
    "title": "Liminal Sign & Library",
    "category": "space",
    "categoryLabel": "The Space",
    "description": "Liminal’s chalkboard sign, with bookshelves and seating behind it.",
    "src": "/images/archival/radical-library-2.jpg",
    "aspect": "portrait",
    "room": "Radical Library"
  },
  {
    "id": "wrecking-ball-flyer",
    "title": "Wrecking Ball Dance Benefit Poster",
    "category": "music",
    "categoryLabel": "Music & Culture",
    "description": "An archival poster advertising Wrecking Ball, a queer dance party.",
    "src": "/images/archival/wrecking-ball.png",
    "aspect": "portrait",
    "room": "Community Noticeboard"
  }
];
