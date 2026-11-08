export interface HistoricalEssay {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  authorRole: string;
  date: string;
  summary: string;
  content: string[];
}

export const HISTORICAL_ESSAYS: HistoricalEssay[] = [
  {
    id: "why-cafe-in-arts-center",
    title: "Why should there be a cafe in a community arts center?",
    author: "Christopher Alagna",
    authorRole: "Co-Director & Volunteer Coordinator",
    date: "January 27, 2021",
    summary:
      "An exploration of why community art centers and coffeeshops are natural partners, and how removing profit incentives dismantles commercial exclusion.",
    content: [
      "First of all, when we call ourselves a 'cafe', we mean that we are a place that makes a variety of coffee drinks, as well as a place that offers meals. However, the inner workings of Liminal are more similar to that of a 'coffeeshop' than an American cafe. So for the purpose of explaining the relationship between a community arts center and a place that sells food and beverage, it makes more sense for us to use the word 'coffeeshop'.",
      "It's pretty uncommon for a community arts center to operate as a coffeeshop—but for Liminal, we believe these two kinds of spaces go hand in hand.",
      "Coffeeshops often facilitate community bonding. They are gathering centers that feel familiar: places where people are encouraged to freely pass through and where locals are welcome to comfortably spend their time with others. Many coffeeshops routinely hold events open to the public, and therefore also have established relationships with arts and culture, in addition to community.",
      "Of course, we plan to be more than just another local coffeeshop—from the coffeeshop model, we want to appropriate that which brings community together, and to change that which threatens to fracture community bonds. One major problem with coffeeshops is that, despite their artistic and integrationist reputations, they often perpetuate social divides.",
      "It is important to recognize that most coffeeshops are for-profit businesses, and as such, they prioritize profits over social inclusion. This means that poor and working class people are not only unwelcome—they are frequently either deterred by coercion or removed by force. This extends to instances of community-policing which are provoked by institutional racism, misogyny, homophobia, and other systems which oppress or inflict violence upon marginalized groups. In order to confront this pattern of injustice, we intend to be very explicit about our intolerance for discrimination, and furthermore, we will take action to make sure that those who are regularly pushed out of coffeeshops feel welcome.",
      "Another limitation that prevents coffeeshops from being great community centers is actually a symptom of a larger cultural issue—which is that many people are not used to getting actively involved in their communities. Arts and culture events have great community potential: they have distinctive abilities to politically educate us, to interpersonally connect us, and to creatively inspire us. But since most local events are put together without these goals in mind, their benefits are often relegated to simple entertainment or cultural tokenism. We have much greater ambitions for what we plan to offer our community through the arts—and we believe this starts with community cooperation.",
      "Unlike conventional coffeeshops, our allegiance is to our community (especially to those who are marginalized). In order to empower our community, we will continually curate art-related events and small-scale creative projects which are meant to engage us, and not simply to entertain us. We will be different than ordinary coffeeshops in so many ways, but maybe our core distinction (at least, as far as our restaurant operations go) is that we plan to prioritize people over profit.",
    ],
  },
  {
    id: "identity-politics-and-art",
    title: "Why am I Queer Before Anything Else?",
    subtitle: "Identity Politics Eclipsing the Intended Value of Art",
    author: "Ryan McElligott",
    authorRole: "Co-Director & Co-Founder",
    date: "February 18, 2021",
    summary:
      "A reflection on avoiding the flattening commodification of identity politics in creative expression, advocating for art centered on human depth and lived struggle.",
    content: [
      "Lately I've been sifting through the focality on identity politics within art-making and art-critiquing. Identity politics has proven to be a useful tool for discussing long-term issues revolving around solidarity and shared experience—however the process of reducing one's personhood to a few key identities is undoubtedly a homogenizing, flattening and arguably dehumanizing force.",
      "I see countless accounts of folks trying to validate that they've found 'art of importance' because it was made by a person of 'x' identities—this reads to me as a method of commodifying marginalized people and the marginalized vector of their work. It renders the actual nuance, craft, and emotional vulnerability of the artwork subordinate to marketing categories.",
      "At Liminal, we believe in uplifting marginalized voices not as cultural tokens or marketing checkboxes, but as full, complex human beings whose artistic interventions challenge and expand our collective understanding of liberation.",
      "When we center marginalized artists, we do so to build authentic solidarity, dismantle exclusionary gatekeeping, and provide the physical and material resources necessary for creative self-determination.",
    ],
  },
];

