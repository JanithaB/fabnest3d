import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cart",
  description: "Review items in your FABNEST cart.",
  robots: { index: false, follow: false },
}

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children
}
