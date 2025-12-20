import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import type { GalleryItem } from "@/lib/types"
import { Calendar, User } from "lucide-react"

interface GalleryCardProps {
  item: GalleryItem
}

export function GalleryCard({ item }: GalleryCardProps) {
  return (
    <Card className="group overflow-hidden border-2 hover:border-primary transition-colors w-full p-0 flex flex-col">
      <CardContent className="p-0">
        <div className="relative w-full aspect-square overflow-hidden bg-muted">
          <Image
            src={item.image || "/placeholder.svg"}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-1 mb-1">{item.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
          </div>
          <div className="flex flex-col gap-2 text-xs text-muted-foreground">
            {item.customerName && (
              <div className="flex items-center gap-2">
                <User className="h-3 w-3" />
                <span>{item.customerName}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              <span>{item.createdAt.toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

