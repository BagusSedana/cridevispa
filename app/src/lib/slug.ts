/** "5 Manfaat Pijat Bali!" → "5-manfaat-pijat-bali" (max 80 chars, matches the DB slug check). */
export function slugify(title: string): string {
  return title
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '')
}
