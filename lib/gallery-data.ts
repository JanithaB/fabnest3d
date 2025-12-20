import type { GalleryItem } from "./types"

/**
 * Mock gallery data for showcasing customer work
 */
export const galleryItems: GalleryItem[] = [
  {
    id: "1",
    title: "Custom Architectural Model",
    description: "Detailed architectural model printed in high-resolution resin for a client presentation.",
    image: "/geometric-vase.jpg",
    customerName: "Architecture Studio",
    tags: ["Architecture", "Professional", "Resin"],
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    title: "Functional Prototype",
    description: "Working prototype for product development, printed in durable ABS material.",
    image: "/desk-organizer.png",
    customerName: "Tech Startup",
    tags: ["Prototype", "Functional", "ABS"],
    createdAt: new Date("2024-01-20"),
  },
  {
    id: "3",
    title: "Artistic Sculpture",
    description: "Custom artistic sculpture created for an art exhibition, showcasing intricate details.",
    image: "/abstract-sculpture.jpg",
    customerName: "Local Artist",
    tags: ["Art", "Sculpture", "Custom"],
    createdAt: new Date("2024-02-01"),
  },
]

