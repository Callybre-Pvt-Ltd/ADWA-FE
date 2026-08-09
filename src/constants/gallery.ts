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

export const GALLERY_IMAGES: GalleryImage[] = []
