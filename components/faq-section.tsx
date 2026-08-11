import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const FAQS = [
  {
    question: "What materials do you offer?",
    answer:
      "We print in PLA, ABS, PETG, TPU, and resin. Choose based on strength, flexibility, and detail — our team can recommend the best option for your part.",
  },
  {
    question: "How fast is turnaround?",
    answer:
      "Most print orders are completed within 24–48 hours after approval. Delivery typically takes 3–5 business days depending on your location.",
  },
  {
    question: "Which file formats do you accept?",
    answer:
      "Upload STL, OBJ, or 3MF models. Compressed RAR or ZIP archives are also supported for multi-file projects.",
  },
  {
    question: "How does custom quote pricing work?",
    answer:
      "Upload your design and request a quote. We review the file and send a Proforma Invoice by email. We respond to quote requests within 1 business day.",
  },
  {
    question: "Do you ship orders?",
    answer:
      "Yes. After your print is complete we ship to your address. Shipping cost is calculated at checkout for marketplace orders, or included in your custom quote.",
  },
]

export function FaqSection() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }

  return (
    <section id="faq" className="py-16 sm:py-20 px-4 sm:px-6 scroll-mt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance">
            Frequently asked questions
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            Quick answers about materials, timing, files, and shipping. We respond to quote requests within 1 business day.
          </p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((faq, index) => (
            <AccordionItem key={faq.question} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-base sm:text-lg">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
