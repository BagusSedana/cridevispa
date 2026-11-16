type Category = { id: string; name_id: string }
type Values = Partial<{ name: string; category_id: string; desc_id: string; desc_en: string; icon: string | null; badge_id: string | null; badge_en: string | null }>

export function TreatmentFields({ categories, values = {} }: { categories: Category[]; values?: Values }) {
  return (
    <div className="grid2">
      <div>
        <label htmlFor="name">Nama treatment</label>
        <input id="name" name="name" defaultValue={values.name ?? ''} required maxLength={120} />
      </div>
      <div>
        <label htmlFor="category_id">Kategori</label>
        <select id="category_id" name="category_id" defaultValue={values.category_id ?? categories[0]?.id}>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name_id}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="desc_id">Deskripsi (Indonesia)</label>
        <textarea id="desc_id" name="desc_id" defaultValue={values.desc_id ?? ''} />
      </div>
      <div>
        <label htmlFor="desc_en">Deskripsi (English)</label>
        <textarea id="desc_en" name="desc_en" defaultValue={values.desc_en ?? ''} />
      </div>
      <div>
        <label htmlFor="badge_id">Label promo (Indonesia, opsional)</label>
        <input id="badge_id" name="badge_id" defaultValue={values.badge_id ?? ''} placeholder="mis. Terlaris" />
      </div>
      <div>
        <label htmlFor="badge_en">Label promo (English, opsional)</label>
        <input id="badge_en" name="badge_en" defaultValue={values.badge_en ?? ''} placeholder="e.g. Best seller" />
      </div>
      <input type="hidden" name="icon" defaultValue={values.icon ?? ''} />
    </div>
  )
}
