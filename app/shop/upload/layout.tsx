import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Upload Design",
  description:
    "Upload your 3D model and get a custom quote. We respond to quote requests within 1 business day.",
}

export default function UploadLayout({ children }: { children: React.ReactNode }) {
  return children
}
