import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Thank You",
  description: "Your FABNEST order or quote request was submitted successfully.",
  robots: { index: false, follow: false },
}

export default function ThankYouLayout({ children }: { children: React.ReactNode }) {
  return children
}
