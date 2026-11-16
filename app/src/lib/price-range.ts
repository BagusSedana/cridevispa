import { createPublicClient } from './supabase/server'

/** Cheapest and most expensive active price, or null if unavailable. Drives "Mulai Rp …" and JSON-LD priceRange. */
export async function getPriceRange(): Promise<{ min: number; max: number } | null> {
  try {
    const { data, error } = await createPublicClient()
      .from('treatment_prices').select('price_idr,treatments!inner(is_active)').eq('treatments.is_active', true)
    if (error || !data?.length) return null
    const prices = data.map(p => p.price_idr)
    return { min: Math.min(...prices), max: Math.max(...prices) }
  } catch { return null }
}
