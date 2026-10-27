# Product Requirements Document (PRD) v4.1 - Versi Hemat
**Proyek:** Website & Ekosistem Solusi Aplikasi Integrasi (solusiaplikasi.id)  
**Stack:** Astro (static) + Built-in Astro Admin Dashboard + WordPress (/solution) + Cloudflare  
**Hosting:** cPanel, Apache 2.4, deploy via FTPS / cPanel Git | **Sumber desain:** Figma  

---

## 1. Ringkasan & Ruang Lingkup
Website berisi halaman utama yang pasti dibuat (Astro, statis), dashboard admin berbasis kode untuk membuat artikel & leads, dan landing page standalone di domain `/solution/[slug]` yang dikelola lewat WordPress.

| Termasuk (dihargai) | Tidak termasuk |
| :--- | :--- |
| **Slicing Figma ke kode:** Home, About Us, 5 halaman Product, Articles (daftar + detail), Request Demo, 404 | Desain Figma (disediakan klien) |
| **Dashboard admin (Astro)** untuk Articles + Leads via `/login?access=solusi_admin_secure_access_2026` | Penulisan konten/artikel, foto & copywriting |
| **WordPress di /solution** (base theme dari Figma, 2 landing page contoh) via `/solution/wp-login.php?access=solusi_admin_secure_access_2026` | Biaya domain, hosting, lisensi plugin berbayar |
| **Dasar SEO bawaan build:** title/description, sitemap, robots, header keamanan | SEO/GEO/AEO lanjutan (schema, FAQ/AEO, llms.txt, pelatihan) = add-on setelah deployment (bagian 12) |
| **Deploy ke cPanel, Cloudflare, backup, serah terima** | Halaman/fitur di luar daftar (mis. legal, multi-bahasa) |

**Perubahan dari v3.2:** artikel kini dikelola dashboard admin kode sendiri (bukan WordPress); WordPress hanya untuk landing page `/solution` dan dipasang di subfolder `/solution/` sehingga tampil di domain utama secara native (tanpa GraphQL/proxy).  
Dashboard admin diakses secara aman melalui URL khusus dengan secret token:
- Admin Dashboard: `https://solusiaplikasi.id/login?access=solusi_admin_secure_access_2026`
- Admin WordPress: `https://solusiaplikasi.id/solution/wp-login.php?access=solusi_admin_secure_access_2026`

**Asumsi produksi (versi hemat):** dikerjakan 1 developer dengan bantuan AI (scaffolding kode, komponen, dan boilerplate), seluruh tampilan Astro selesai dalam 2 minggu, dan hasil AI tetap direview manusia. Deployment dikerjakan setelah tampilan; SEO/GEO/AEO adalah fase setelah deployment dan dihitung sebagai add-on terpisah (belum termasuk harga project).

---

## 2. Sitemap & Rute

| Halaman | URL | Teknologi | Sumber konten |
| :--- | :--- | :--- | :--- |
| **Home** | `/` | Astro (statis) | Kode / Figma |
| **About Us** | `/about-us` | Astro | Kode / Figma |
| **Product (x5)** | `/products/nanonets`<br>`/products/cyclone`<br>`/products/docuflo`<br>`/products/syclus`<br>`/products/spensify` | Astro, 1 template + 5 konten | Kode / Figma |
| **Articles** | `/articles`<br>`/articles/[slug]`<br>`/articles/category/[slug]` | Astro (statis, dibangun dari API/mock artikel) | Dashboard admin |
| **Request Demo** | `/request-demo` | Astro + endpoint form | Form &rarr; Leads |
| **Landing page standalone** | `/solution/[slug]` | WordPress (subfolder) | WordPress admin |
| **Admin Dashboard** | `/login?access=solusi_admin_secure_access_2026`<br>`/admin` | Astro | Dashboard admin terintegrasi |
| **Teknis** | `/sitemap-index.xml`<br>`/robots.txt`<br>`/llms.txt`<br>`/404`<br>`/rss.xml` | Astro | Otomatis |

> Catatan: `/solution/` (indeks) diarahkan 301 ke Home atau landing page pilihan admin.

---

## 3. Arsitektur

```
Pengunjung / Bot -> Cloudflare (DNS, SSL Strict, WAF, CDN, Cache Everything HTML)
   |- solusiaplikasi.id/*            -> Apache cPanel: file statis Astro
   |- solusiaplikasi.id/solution/*   -> Apache cPanel: WordPress (subfolder native)
   |- solusiaplikasi.id/admin        -> Astro Secure Admin (Akses via secret token)
```

**Prinsip Deployment:**
- Deploy Astro tidak menyentuh folder `/solution` dan `.well-known`.
- Build gagal tidak mengubah situs tayang; hasil build disimpan 3 rilis untuk rollback.
- URL `/login`, `/admin`, dan `/solution/wp-login.php` disembunyikan dan hanya dapat dibuka dengan `?access=solusi_admin_secure_access_2026`. Pengunjung tanpa token menerima status HTTP 404 Not Found.

---

## 4. Technology Stack (100% Free / Open Source)

| Lapisan | Pilihan |
| :--- | :--- |
| **Frontend** | Astro (stabil terbaru), TypeScript strict, Tailwind CSS v4, Island React seperlunya, Pagefind (pencarian artikel) |
| **Admin Dashboard** | Astro Island (React 19) terintegrasi dengan proteksi HTTP & Cookie, LocalStorage/API persistensi, CSV Export, dan trigger deploy |
| **Landing page** | WordPress 6.x di `/solution`, base theme kustom dari Figma, plugin minimal (cache, SEO dasar, sembunyikan login) |
| **Edge & Keamanan** | Cloudflare Free (WAF, Cache Rules, SSL Strict, HSTS, Apache .htaccess hardening) |
| **CI/CD** | GitHub Actions / Vercel Deploy Hook; deploy FTPS (lftp) ke cPanel `public_html` |
| **Kualitas** | Lighthouse CI, Playwright smoke tests, Zod validation |

---

## 5. Roadmap Fitur Pengembangan Lanjutan (100% Free Stack)

Dokumentasi inisiatif fitur tambahan yang telah disetujui untuk dikembangkan secara bertahap tanpa menambah biaya langganan:

### 5.1 Integrasi Database MySQL cPanel & Vercel Deploy Hook
- **Tujuan:** Sinkronisasi data artikel dan leads antar perangkat admin secara permanen.
- **Mekanisme:**
  - Menghubungkan dashboard admin ke database MySQL cPanel menggunakan connection pooling (`DATABASE_URL`).
  - Menggunakan skema tabel [database/sai-schema.sql](database/sai-schema.sql) (tabel `sai_articles` dan `sai_inquiries`).
  - Pemicu deploy otomatis via **Vercel Deploy Hook** saat tombol "Publish" ditekan, sehingga halaman HTML statis langsung dibuat tanpa intervensi manual.
- **Biaya:** **Rp 0 (Gratis)** — Menggunakan database MySQL cPanel yang sudah dimiliki & Vercel Hobby Free Tier.

### 5.2 Sistem Notifikasi Leads & Auto-Reply Email
- **Tujuan:** Fast-response follow-up calon klien enterprise yang mengisi formulir konsultasi/demo.
- **Mekanisme:**
  - Submisi form otomatis mengirim data ke `sales@solusiaplikasi.id`.
  - Data tersimpan otomatis di tabel `sai_inquiries` dan tampil langsung di tab *Data Leads* Admin Dashboard.
  - Calon klien otomatis menerima email konfirmasi tanda terima + tautan unduh Company Profile / Brosur PDF produk yang dipilih.
- **Pilihan Provider Email:**
  - **Resend:** Free tier 3.000 email/bulan (sangat cocok untuk API serverless Vercel).
  - **SMTP cPanel:** Menggunakan akun email domain resmi (`sales@solusiaplikasi.id`) tanpa batasan bulanan.
- **Biaya:** **Rp 0 (Gratis)**.

### 5.3 Fitur Pembaca Artikel Lanjutan (UX & SEO Booster)
- **Tujuan:** Meningkatkan *time-on-page* dan kenyamanan membaca materi edukasi B2B enterprise.
- **Fitur:**
  - **Sticky Table of Contents (TOC Otomatis):** Memindai tag `<h2>` dan `<h3>` di dalam konten artikel secara dinamis untuk dijadikan daftar isi navigasi melayang (*sticky sidebar*).
  - **Pencarian Cepat (*Instant Client Search*):** Pengunjung dapat memfilter artikel di `/articles` berdasarkan judul atau topik secara instan tanpa reload halaman.
  - **Reading Progress Bar:** Garis indikator progres membaca di bagian paling atas layar saat scrolling.
- **Biaya:** **Rp 0 (Gratis)** — Murni logika frontend TypeScript & Tailwind CSS.

### 5.4 Marketing Tracking & Conversion Suite
- **Tujuan:** Pelacakan konversi iklan dan performa traffic untuk tim Digital Marketing.
- **Fitur:**
  - Pemasangan terpusat untuk Google Analytics 4 (GA4), Google Tag Manager (GTM), dan Meta Pixel.
  - Pelacakan event konversi otomatis:
    - Klik tombol chat WhatsApp (`cta_whatsapp_click`).
    - Submisi sukses form konsultasi (`lead_form_submitted`).
    - Download materi / PDF profil produk (`asset_downloaded`).
- **Biaya:** **Rp 0 (Gratis)** — Layanan resmi Google & Meta Business gratis selamanya.

---

## 6. Matriks Biaya Infrastruktur & Layanan Tambahan

| Komponen Fitur | Penyedia Layanan | Kuota / Batas Pemakaian | Biaya Tambahan |
| :--- | :--- | :--- | :---: |
| **Database Relasional** | MySQL cPanel Hosting | Sesuai kuota hosting cPanel | **Rp 0** |
| **Deploy Webhook** | Vercel Webhooks | Unlimited build triggers | **Rp 0** |
| **Email Notifikasi Form** | Resend / SMTP cPanel | 3.000 email/bln (Resend) / Unlimited (cPanel) | **Rp 0** |
| **TOC & Instant Search** | Internal Astro Engine | Tidak terbatas | **Rp 0** |
| **Analitik Pengunjung** | Google Analytics 4 | Standar analitik resmi Google | **Rp 0** |
| **Pelacakan Iklan (Pixel)** | Meta Business Suite | Standar pelacak konversi Meta | **Rp 0** |

---

## 7. Status Milestone Implementasi

- [x] **Milestone 1:** Slicing UI/UX Home, About Us, 5 Halaman Produk (Figma match).
- [x] **Milestone 2:** Template Terstandarisasi Formulir Konsultasi (*Dual Action Buttons: WA & Request Demo*).
- [x] **Milestone 3:** Optimasi Kinerja Aset Gambar (*Compress 77.6% / 13.8MB saved, Eager Loading*).
- [x] **Milestone 4:** Admin Articles Studio (Model UTI-NextJs dengan Rich Text WYSIWYG, E-E-A-T Author & Reviewer, SEO Meter).
- [x] **Milestone 5:** Tema WordPress `sai-solution` & Skema Database `sai-schema.sql`.
- [ ] **Milestone 6 (Fase Berikutnya):** Aktivasi Notifikasi Email Form & Sinkronisasi DB `sai_inquiries`.
- [ ] **Milestone 7 (Fase Berikutnya):** Sticky TOC Otomatis & Instant Search di `/articles`.
- [ ] **Milestone 8 (Fase Berikutnya):** Pemasangan ID Tracking GA4 / GTM / Meta Pixel.

