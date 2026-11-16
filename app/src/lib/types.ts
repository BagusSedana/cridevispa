import type { Lang } from './i18n'

export type PriceOption = {
  id: string
  durationMinutes: number | null
  durationLabel: string
  priceIdr: number
}
export type Treatment = { id: string; name: string; description: string; icon: string | null; badge: string | null; prices: PriceOption[] }
export type CategoryWithTreatments = { key: string; name: string; treatments: Treatment[] }

export type ArticleSummary = {
  slug: string; title: string; excerpt: string; category: string | null
  coverImageUrl: string | null; author: string; publishedAt: string | null
}
export type Article = ArticleSummary & {
  body: string; metaDescription: string; updatedAt: string; lang: Lang
  hasTranslation: { id: boolean; en: boolean }
}

export type BookingStatus = 'new' | 'confirmed' | 'done' | 'cancelled'
export const BOOKING_STATUSES: BookingStatus[] = ['new', 'confirmed', 'done', 'cancelled']
