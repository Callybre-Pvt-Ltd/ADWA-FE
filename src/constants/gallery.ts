/**
 * Gallery media (WebP images, H.264 mp4 videos with WebP posters).
 * Assets live under /public/gallery/.
 */
export type GalleryItem =
  | {
      kind: 'image'
      src: string
      altEn: string
      altHi?: string
      captionEn?: string
      captionHi?: string
      width: number
      height: number
    }
  | {
      kind: 'video'
      src: string
      poster: string
      altEn: string
      altHi?: string
      captionEn?: string
      captionHi?: string
      width: number
      height: number
      durationSec: number
    }

export const GALLERY_ITEMS: GalleryItem[] = [
  { kind: 'image', src: '/gallery/event-1.webp', altEn: 'Association members meeting', altHi: 'संघ सदस्य बैठक', width: 1591, height: 1098 },
  { kind: 'image', src: '/gallery/event-2.webp', altEn: 'Members felicitating with flowers', altHi: 'फूलों से अभिनंदन', width: 1600, height: 1212 },
  { kind: 'image', src: '/gallery/event-3.webp', altEn: 'Group photo of members', altHi: 'सदस्यों का सामूहिक चित्र', width: 1600, height: 1211 },
  { kind: 'image', src: '/gallery/event-4.webp', altEn: 'Members joining hands together', altHi: 'सदस्यों की एकजुटता', width: 1600, height: 1195 },
  { kind: 'image', src: '/gallery/event-5.webp', altEn: 'Association event photo', altHi: 'संघ कार्यक्रम की तस्वीर', width: 1200, height: 1600 },
  { kind: 'image', src: '/gallery/event-6.webp', altEn: 'Association event photo', altHi: 'संघ कार्यक्रम की तस्वीर', width: 1200, height: 1600 },
  { kind: 'image', src: '/gallery/event-7.webp', altEn: 'Association event photo', altHi: 'संघ कार्यक्रम की तस्वीर', width: 1200, height: 1600 },
  { kind: 'image', src: '/gallery/event-8.webp', altEn: 'Association event photo', altHi: 'संघ कार्यक्रम की तस्वीर', width: 1200, height: 1600 },
  { kind: 'image', src: '/gallery/event-9.webp', altEn: 'Association event photo', altHi: 'संघ कार्यक्रम की तस्वीर', width: 1200, height: 1600 },
  { kind: 'image', src: '/gallery/event-10.webp', altEn: 'Association event photo', altHi: 'संघ कार्यक्रम की तस्वीर', width: 1200, height: 1600 },
  { kind: 'image', src: '/gallery/event-11.webp', altEn: 'Association event photo', altHi: 'संघ कार्यक्रम की तस्वीर', width: 1200, height: 1600 },
  { kind: 'image', src: '/gallery/event-12.webp', altEn: 'Association event photo', altHi: 'संघ कार्यक्रम की तस्वीर', width: 1200, height: 1600 },
  { kind: 'image', src: '/gallery/event-13.webp', altEn: 'Association event photo', altHi: 'संघ कार्यक्रम की तस्वीर', width: 1200, height: 1600 },
  { kind: 'image', src: '/gallery/event-14.webp', altEn: 'Association event photo', altHi: 'संघ कार्यक्रम की तस्वीर', width: 1200, height: 1600 },
  { kind: 'image', src: '/gallery/event-15.webp', altEn: 'Association event photo', altHi: 'संघ कार्यक्रम की तस्वीर', width: 1200, height: 1600 },
  { kind: 'image', src: '/gallery/event-16.webp', altEn: 'Association event photo', altHi: 'संघ कार्यक्रम की तस्वीर', width: 1200, height: 1600 },
  { kind: 'image', src: '/gallery/event-17.webp', altEn: 'Association event photo', altHi: 'संघ कार्यक्रम की तस्वीर', width: 1200, height: 1600 },
  { kind: 'image', src: '/gallery/event-18.webp', altEn: 'Association event photo', altHi: 'संघ कार्यक्रम की तस्वीर', width: 1200, height: 1600 },
  { kind: 'image', src: '/gallery/event-19.webp', altEn: 'Association event photo', altHi: 'संघ कार्यक्रम की तस्वीर', width: 1080, height: 633 },
  { kind: 'image', src: '/gallery/event-20.webp', altEn: 'Association event photo', altHi: 'संघ कार्यक्रम की तस्वीर', width: 1200, height: 1600 },
  { kind: 'image', src: '/gallery/event-21.webp', altEn: 'Association event photo', altHi: 'संघ कार्यक्रम की तस्वीर', width: 1200, height: 1600 },
  { kind: 'image', src: '/gallery/event-22.webp', altEn: 'Association event photo', altHi: 'संघ कार्यक्रम की तस्वीर', width: 1200, height: 1600 },
  { kind: 'image', src: '/gallery/event-23.webp', altEn: 'Association event photo', altHi: 'संघ कार्यक्रम की तस्वीर', width: 720, height: 1600 },
  { kind: 'image', src: '/gallery/event-24.webp', altEn: 'Association event photo', altHi: 'संघ कार्यक्रम की तस्वीर', width: 1200, height: 1600 },
  { kind: 'image', src: '/gallery/event-25.webp', altEn: 'Association event photo', altHi: 'संघ कार्यक्रम की तस्वीर', width: 1277, height: 1232 },
  { kind: 'image', src: '/gallery/event-26.webp', altEn: 'Association event photo', altHi: 'संघ कार्यक्रम की तस्वीर', width: 1292, height: 1217 },
  { kind: 'image', src: '/gallery/event-27.webp', altEn: 'Association event photo', altHi: 'संघ कार्यक्रम की तस्वीर', width: 1600, height: 1192 },
  { kind: 'image', src: '/gallery/event-28.webp', altEn: 'Association event photo', altHi: 'संघ कार्यक्रम की तस्वीर', width: 648, height: 1152 },
  { kind: 'image', src: '/gallery/event-29.webp', altEn: 'Association event photo', altHi: 'संघ कार्यक्रम की तस्वीर', width: 900, height: 1600 },
  { kind: 'image', src: '/gallery/event-30.webp', altEn: 'Association event photo', altHi: 'संघ कार्यक्रम की तस्वीर', width: 1600, height: 1205 },
  { kind: 'image', src: '/gallery/event-31.webp', altEn: 'Association event photo', altHi: 'संघ कार्यक्रम की तस्वीर', width: 1600, height: 1200 },
  { kind: 'image', src: '/gallery/event-32.webp', altEn: 'Association event photo', altHi: 'संघ कार्यक्रम की तस्वीर', width: 1600, height: 1205 },
  { kind: 'image', src: '/gallery/event-33.webp', altEn: 'Association event photo', altHi: 'संघ कार्यक्रम की तस्वीर', width: 1600, height: 1205 },
  { kind: 'image', src: '/gallery/event-34.webp', altEn: 'Association event photo', altHi: 'संघ कार्यक्रम की तस्वीर', width: 1600, height: 1205 },
  { kind: 'image', src: '/gallery/event-35.webp', altEn: 'Association event photo', altHi: 'संघ कार्यक्रम की तस्वीर', width: 1600, height: 1205 },
  { kind: 'image', src: '/gallery/event-36.webp', altEn: 'Association event photo', altHi: 'संघ कार्यक्रम की तस्वीर', width: 1600, height: 1205 },
  { kind: 'image', src: '/gallery/event-37.webp', altEn: 'Association event photo', altHi: 'संघ कार्यक्रम की तस्वीर', width: 1600, height: 1200 },
  { kind: 'image', src: '/gallery/event-38.webp', altEn: 'Association event photo', altHi: 'संघ कार्यक्रम की तस्वीर', width: 1600, height: 1205 },
  { kind: 'image', src: '/gallery/event-39.webp', altEn: 'Association event photo', altHi: 'संघ कार्यक्रम की तस्वीर', width: 1440, height: 1084 },
  { kind: 'video', src: '/gallery/event-video-1.mp4', poster: '/gallery/event-video-1-poster.webp', altEn: 'Association event video', altHi: 'संघ कार्यक्रम वीडियो', width: 360, height: 640, durationSec: 97 },
  { kind: 'video', src: '/gallery/event-video-2.mp4', poster: '/gallery/event-video-2-poster.webp', altEn: 'Association event video', altHi: 'संघ कार्यक्रम वीडियो', width: 360, height: 640, durationSec: 262 },
  { kind: 'video', src: '/gallery/event-video-3.mp4', poster: '/gallery/event-video-3-poster.webp', altEn: 'Association event video', altHi: 'संघ कार्यक्रम वीडियो', width: 848, height: 478, durationSec: 17 },
  { kind: 'video', src: '/gallery/event-video-4.mp4', poster: '/gallery/event-video-4-poster.webp', altEn: 'Association event video', altHi: 'संघ कार्यक्रम वीडियो', width: 960, height: 960, durationSec: 31 },
]

/** @deprecated kept for any lingering imports — use GALLERY_ITEMS */
export const GALLERY_IMAGES = GALLERY_ITEMS.filter(
  (item): item is Extract<GalleryItem, { kind: 'image' }> => item.kind === 'image',
)
