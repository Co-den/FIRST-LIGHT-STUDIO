// Single source of truth. Replace demo values with approved studio content.
export const site = {
  legalName: "FIRST LIGHT STUDIO LTD",
  brandName: "FIRST LIGHT STUDIO",
  url: process.env.NEXT_PUBLIC_SITE_URL || "",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "", // never invented
  socials: [], // add { label, href } only with real URLs
  description:
    "FIRST LIGHT STUDIO LTD is a Nigerian creative studio developing original comics, graphic novels, animation and intellectual properties.",
};

export const nav = [
  { label: "Home", href: "/" },
  { label: "Worlds", href: "/worlds" },
  { label: "Characters", href: "/characters" },
  { label: "Services", href: "/services" },
  { label: "Journal", href: "/journal" },
  { label: "About", href: "/about" },
];

export const capabilities = [
  "Comics and graphic novels",
  "Original character and world creation",
  "Illustration and visual development",
  "Animation and motion storytelling",
  "Digital publishing",
  "IP development and licensing",
  "Creative collaborations and merchandise",
];

// demo: true means placeholder content, not a published studio property.
export const projects = [
  { slug: "demo-world-one", title: "Demo World One", format: "Graphic novel", status: "Concept", demo: true,
    summary: "Placeholder project. Replace with a real studio property.", image: "/images/projects/demo-1.jpg" },
  { slug: "demo-world-two", title: "Demo World Two", format: "Comic series", status: "Concept", demo: true,
    summary: "Placeholder project. Replace with a real studio property.", image: "/images/projects/demo-2.jpg" },
];

export const assetPaths = {
  logo: "/images/brand/logo.svg",
  hero: "/images/hero/hero.jpg",
  characters: "/images/characters/",
  journal: "/images/journal/",
  textures: "/images/textures/",
};

// DEMO content below. Every item is a placeholder, not a real studio property, person or article.
export const characters = [
  { slug: "demo-wayfinder", name: "The Wayfinder", project: "demo-world-one", demo: true, role: "Protagonist",
    bio: "Placeholder profile. Replace with an original character.", origin: "Placeholder origin.", abilities: ["Placeholder ability"], affiliation: "Placeholder faction" },
  { slug: "demo-ember", name: "Ember", project: "demo-world-two", demo: true, role: "Antagonist",
    bio: "Placeholder profile. Replace with an original character.", origin: "Placeholder origin.", abilities: ["Placeholder ability"], affiliation: "Placeholder faction" },
];

export const services = [
  { title: "Comic book and graphic novel development", what: "Story development, scripting, layout and illustration for print and digital.", who: "Authors, brands and publishers." },
  { title: "Illustration and concept art", what: "Key art, environments and visual development.", who: "Publishers, game and film teams." },
  { title: "Character design", what: "Original characters with turnarounds and expression sheets.", who: "Creators and entertainment brands." },
  { title: "Worldbuilding and visual development", what: "Settings, rules, history and a consistent visual language.", who: "Teams building a new universe." },
  { title: "Animation and motion storytelling", what: "Motion concepts and short-form animated storytelling.", who: "Studios and brands." },
  { title: "Intellectual property development", what: "Turning an idea into a structured, protectable property.", who: "Original creators." },
  { title: "IP licensing and creative partnerships", what: "Collaborations built around original properties.", who: "Publishers and licensing partners." },
  { title: "Digital publishing and merchandise development", what: "Digital release planning and merchandise concepts.", who: "Studios and collaborators." },
];

export const journal = [
  { slug: "demo-first-sketches", title: "Demo article: first sketches", category: "Behind the scenes", demo: true,
    summary: "Placeholder article.", body: ["Placeholder body. Replace with a real studio article."] },
  { slug: "demo-building-a-world", title: "Demo article: building a world", category: "Worldbuilding", demo: true,
    summary: "Placeholder article.", body: ["Placeholder body. Replace with a real studio article."] },
];
