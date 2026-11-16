import { describe, it, expect } from 'vitest'
import { businessJsonLd } from './business-jsonld'

describe('businessJsonLd', () => {
  it('describes the business with real contact data and DB price range', () => {
    const ld = businessJsonLd({ min: 100000, max: 900000 }, 'id')
    expect(ld).toMatchObject({ '@type': 'HealthAndBeautyBusiness', telephone: '+6285812429650', openingHours: 'Mo-Su 07:00-23:00', priceRange: 'IDR 100000 - IDR 900000', url: 'https://www.cridevispa.com/' })
  })
  it('never claims ratings or reviews', () => {
    const json = JSON.stringify(businessJsonLd({ min: 1, max: 2 }, 'en'))
    expect(json).not.toContain('aggregateRating')
    expect(json).not.toContain('"review"')
  })
  it('omits priceRange when unknown', () => expect(businessJsonLd(null, 'id')).not.toHaveProperty('priceRange'))
})
