import type { Product } from "./types"

/**
 * Mock product data for the gallery
 */
export const products: Product[] = [
  {
    id: "1",
    name: "Geometric Vase",
    description: "Modern geometric vase perfect for home decoration. Features intricate lattice patterns.",
    image: "/markertplace/geometric-vase.jpg",
    basePrice: 22.5,
    category: "Home Decor",
    tags: ["Popular", "Home", "Decorative"],
  },
  {
    id: "2",
    name: "Desk Organizer",
    description: "Functional desk organizer with multiple compartments for pens, clips, and accessories.",
    image: "/markertplace/desk-organizer.png",
    basePrice: 18.0,
    category: "Office",
    tags: ["Functional", "Office", "Organization"],
  },
  {
    id: "3",
    name: "Phone Stand",
    description: "Adjustable phone stand with cable management. Compatible with all phone sizes.",
    image: "/markertplace/phone-stand.jpg",
    basePrice: 12.0,
    category: "Tech Accessories",
    tags: ["Popular", "Tech", "Functional"],
  },
  {
    id: "4",
    name: "Plant Pot",
    description: "Elegant succulent pot with drainage system. Perfect for small plants and succulents.",
    image: "/markertplace/terracotta-pot-succulent.png",
    basePrice: 15.0,
    category: "Home Decor",
    tags: ["Home", "Garden", "Decorative"],
  },
  {
    id: "5",
    name: "Cable Holder",
    description: "Magnetic cable management system. Keeps your desk tidy and cables organized.",
    image: "/markertplace/cable-holder.jpg",
    basePrice: 8.0,
    category: "Tech Accessories",
    tags: ["Tech", "Organization", "Functional"],
  },
  {
    id: "6",
    name: "Miniature Figurine",
    description: "Detailed miniature character for tabletop gaming and collecting.",
    image: "/markertplace/miniature-figurine.jpg",
    basePrice: 25.0,
    category: "Gaming",
    tags: ["Gaming", "Collectible", "Detailed"],
  },
  {
    id: "7",
    name: "Key Holder",
    description: "Wall-mounted key organizer with magnetic backing. Stylish and functional.",
    image: "/markertplace/key-holder.jpg",
    basePrice: 16.0,
    category: "Home Decor",
    tags: ["Home", "Organization", "Functional"],
  },
  {
    id: "8",
    name: "Coaster Set",
    description: "Set of 4 hexagonal coasters with geometric pattern. Protects surfaces in style.",
    image: "/markertplace/coaster-set.jpg",
    basePrice: 20.0,
    category: "Home Decor",
    tags: ["Home", "Decorative", "Set"],
  },
]
