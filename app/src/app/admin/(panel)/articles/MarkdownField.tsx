'use client'
import { useState } from 'react'
import { Markdown } from '@/components/Markdown'

export function MarkdownField({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  const [value, setValue] = useState(defaultValue)
  const [preview, setPreview] = useState(false)
  return (
    <div>
      <div className="row" style={{ justifyContent: 'space-between', margin: '12px 0 4px' }}>
        <label htmlFor={name} style={{ margin: 0 }}>{label}</label>
        <button type="button" className="btn-light" onClick={() => setPreview(p => !p)}>{preview ? 'Edit' : 'Pratinjau'}</button>
      </div>
      <textarea id={name} name={name} value={value} onChange={e => setValue(e.target.value)} style={{ minHeight: 320, display: preview ? 'none' : undefined }} />
      {preview && <div className="panel"><Markdown source={value || '_Kosong_'} /></div>}
      <p className="muted">Format: <code>## Subjudul</code>, <code>**tebal**</code>, <code>*miring*</code>, <code>- daftar</code>, <code>[teks](https://link)</code>, <code>![keterangan](https://gambar.jpg)</code></p>
    </div>
  )
}
