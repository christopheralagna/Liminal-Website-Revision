export interface VolunteerTeam {
  id: string;
  name: string;
  description: string;
}

// Sources: archived volunteer-teams page and original event descriptions.
// Firsthand corrections take precedence over responsibilities listed in older records.
export const VOLUNTEER_TEAMS: VolunteerTeam[] = [
  {
    id: "cafe",
    name: "Cafe",
    description: "Cafe volunteers prepared and served drinks and helped care for the cafe.",
  },
  {
    id: "events-partnerships",
    name: "Events & Partnerships",
    description: "Volunteers helped with community events, including serving drinks during extended cafe hours.",
  },
  {
    id: "fundraising",
    name: "Fundraising",
    description: "Fundraising activities included bake sales and potluck dinners to help support Liminal.",
  },
];
