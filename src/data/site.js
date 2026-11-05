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
