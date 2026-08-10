/**
 * Gallery images (WebP preferred). Add entries when assets are ready under /public/gallery/.
 *
 * Example:
 * { src: '/gallery/event-1.webp', altEn: 'District meeting', altHi: 'जिला बैठक', width: 1200, height: 800 }
 */
export type GalleryImage = {
  src: string
  altEn: string
  altHi?: string
  captionEn?: string
  captionHi?: string
  width?: number
  height?: number
}

export const GALLERY_IMAGES: GalleryImage[] = [
  { src: '/gallery/event-1.webp', altEn: 'Association members meeting', altHi: 'संघ सदस्य बैठक', width: 1591, height: 1098 },
  { src: '/gallery/event-2.webp', altEn: 'Members felicitating with flowers', altHi: 'फूलों से अभिनंदन', width: 1600, height: 1212 },
  { src: '/gallery/event-3.webp', altEn: 'Group photo of members', altHi: 'सदस्यों का सामूहिक चित्र', width: 1600, height: 1211 },
  { src: '/gallery/event-4.webp', altEn: 'Members joining hands together', altHi: 'सदस्यों की एकजुटता', width: 1600, height: 1195 },
]
