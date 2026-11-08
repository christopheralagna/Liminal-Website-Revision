export interface MenuItem {
  id: string;
  name: string;
  category: "beverages" | "small-plates";
  price: string;
  description: string;
  dietary?: string[];
  partner?: string;
}

export const MENU_ITEMS: MenuItem[] = [
  // Beverages
  {
    id: "drip-coffee",
    name: "Drip Coffee",
    category: "beverages",
    price: "$2.00",
    description: "Locally roasted beans brewed fresh throughout the day.",
  },
  {
    id: "cold-brew",
    name: "Cold Brew",
    category: "beverages",
    price: "$3.00",
    description: "Slow-steeped for 18 hours for a smooth, low-acidity craft coffee.",
  },
  {
    id: "pour-over",
    name: "Pour Over",
    category: "beverages",
    price: "$4.00",
    description: "Single-origin beans hand-poured to order using third-wave coffee techniques.",
  },
  {
    id: "house-tea",
    name: "House Blended Tea",
    category: "beverages",
    price: "$2.00",
    description: "Herbal and loose-leaf artisan tea blends curated by co-founder Ryan McElligott.",
  },
  {
    id: "house-drink",
    name: "The House Drink",
    category: "beverages",
    price: "$3.00",
    description: "Iced black tea infused with vanilla bergamot, black currant, and creamy oat milk.",
    dietary: ["Vegan"],
  },
  {
    id: "sparkling-water",
    name: "Sparkling Water",
    category: "beverages",
    price: "$2.00",
    description: "Chilled mineral sparkling water.",
  },
  {
    id: "house-wine",
    name: "House Red // White Wine",
    category: "beverages",
    price: "$4.00",
    description: "Poured during evening events, open mic nights, and gallery exhibitions.",
  },

  // Small Plates
  {
    id: "two-toast",
    name: "Two Toast",
    category: "small-plates",
    price: "$8.00",
    partner: "Evolve Eats",
    description:
      "Trio pairing: 1) Toasted ciabatta, avocado, pickled onion, pomegranate seeds, cilantro aioli. 2) Toasted ciabatta, ricotta, balsamic fig spread, bee pollen, green onion.",
    dietary: ["Vegetarian"],
  },
  {
    id: "egg-sandwich",
    name: "Egg Sandwich",
    category: "small-plates",
    price: "$8.00",
    partner: "Evolve Eats",
    description:
      "Toasted ciabatta, fried egg, house cilantro aioli, smoked gouda cheese, caramelized sweet onions, fresh avocado.",
    dietary: ["Vegetarian"],
  },
  {
    id: "vegan-burrito",
    name: "Vegan Burrito",
    category: "small-plates",
    price: "$8.00",
    partner: "Evolve Eats",
    description:
      "Roasted sweet potato, roasted sweet corn, black beans, seitan carnitas, caramelized onion, vegan cheddar, cilantro rice, served with fresh mango salsa.",
    dietary: ["Vegan"],
  },
  {
    id: "vegan-banh-mi",
    name: "Vegan Banh Mi",
    category: "small-plates",
    price: "$8.00",
    partner: "Evolve Eats",
    description:
      "Crispy toasted ciabatta, ginger-seared organic tofu, wasabi vegan mayo, house-pickled seasonal vegetables, sriracha drizzle, mixed local greens, cilantro aioli.",
    dietary: ["Vegan"],
  },
  {
    id: "vegan-sushi-roll",
    name: "Vegan Sushi Roll",
    category: "small-plates",
    price: "$6.00",
    partner: "Evolve Eats",
    description:
      "Fresh mango, avocado, cucumber, roasted sweet potato, shredded carrot, toasted black sesame seeds, served with tangy citrus ponzu.",
    dietary: ["Vegan", "Gluten-Free"],
  },
  {
    id: "chips-dips",
    name: "Chips & Dips",
    category: "small-plates",
    price: "$6.00",
    partner: "Evolve Eats",
    description:
      "Freshly fried corn tortilla chips served with three house dips: mango guacamole, cilantro hummus, and spicy vegan cashew queso.",
    dietary: ["Vegan", "Gluten-Free"],
  },
  {
    id: "sun-salad",
    name: "Sun Salad",
    category: "small-plates",
    price: "$8.00",
    partner: "Evolve Eats",
    description:
      "Mixed crisp greens, shaved fresh citrus segments, ripe mango, cilantro, golden beet ribbons, roasted pepitas, sliced avocado.",
    dietary: ["Vegan", "Gluten-Free"],
  },
  {
    id: "chopped-salad",
    name: "Chopped Salad",
    category: "small-plates",
    price: "$8.00",
    partner: "Evolve Eats",
    description:
      "Baby kale, charred corn, shaved carrot, roasted sweet potato, feta crumbles, toasted pepitas, sliced avocado, seared tofu, black beans.",
    dietary: ["Vegetarian", "Gluten-Free"],
  },
];

export const EQUITY_MODEL_EXPLANATION = {
  title: "The Pay High // Pay Low Community Equity Model",
  tagline: "People over profit, mutual aid over commercial extraction.",
  text: "Having expendable funds was recognized as an economic barrier for many working-class, student, and marginalized community members. To eliminate cost as a barrier, Liminal operated on a community equity sliding-scale. If you had the financial means to 'pay high' for a pour-over or meal, your overage directly funded someone who could only 'pay low' or nothing at all.",
};

