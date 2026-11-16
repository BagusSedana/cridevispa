import { describe, it, expect } from 'vitest'
import { buildWaMessage, buildWaUrl } from './whatsapp'

const booking = {
  name: 'Ayu Lestari', phone: '0812 3456 789', date: '2030-01-01', time: '10:00', message: 'Villa Seminyak no 5',
  items: [{ name: 'Balinese Massage', durationLabel: '60 menit', priceIdr: 250000 }, { name: 'Foot Massage', durationLabel: '60 menit', priceIdr: 200000 }],
  totalIdr: 450000,
}

describe('buildWaMessage', () => {
  it('matches the legacy Indonesian format', () => {
    expect(buildWaMessage('id', booking)).toBe(
      'Halo CrideviSPA, saya ingin melakukan reservasi:\n\n*Daftar Treatment*:\n1. Balinese Massage (60 menit) — Rp 250.000\n2. Foot Massage (60 menit) — Rp 200.000\n\n*Total Perkiraan*: Rp 450.000\n*Tanggal*: 2030-01-01\n*Waktu*: 10:00 WITA\n*Lokasi*: Denpasar (Home Service)\n\n*Nama*: Ayu Lestari\n*No. HP*: 0812 3456 789\n*Alamat / Pesan Tambahan*: Villa Seminyak no 5\n\nMohon konfirmasinya. Terima kasih!')
  })
  it('matches the legacy English format without a message', () => {
    expect(buildWaMessage('en', { ...booking, message: '' })).toBe(
      "Hello CrideviSPA, I'd like to book an appointment:\n\n*Treatments*:\n1. Balinese Massage (60 menit) — Rp 250.000\n2. Foot Massage (60 menit) — Rp 200.000\n\n*Estimated Total*: Rp 450.000\n*Date*: 2030-01-01\n*Time*: 10:00\n*Location*: Denpasar (Home Service)\n\n*Name*: Ayu Lestari\n*Phone*: 0812 3456 789\n\n\nPlease confirm. Thank you!")
  })
  it('buildWaUrl targets the CrideviSPA number', () => {
    expect(buildWaUrl('Hi')).toBe('https://wa.me/6285812429650?text=Hi')
  })
})
