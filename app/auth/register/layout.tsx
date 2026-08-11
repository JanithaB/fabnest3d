import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Create account",
  description: "Register for a FABNEST account to order and request quotes.",
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children
}
