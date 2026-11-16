export type Lang = 'id' | 'en'

export function getLang(searchParams: Record<string, string | string[] | undefined>): Lang {
  const raw = searchParams.lang
  const value = Array.isArray(raw) ? raw[0] : raw
  return value === 'en' ? 'en' : 'id'
}

/** Reads `${field}_${lang}`, falling back to the other language when empty. */
export function pick(row: Record<string, unknown>, field: string, lang: Lang): string {
  const other: Lang = lang === 'id' ? 'en' : 'id'
  const own = row[`${field}_${lang}`]
  const alt = row[`${field}_${other}`]
  return (typeof own === 'string' && own.trim()) ? own : (typeof alt === 'string' ? alt : '')
}
