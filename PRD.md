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
| **CI/CD** | GitHub Actions; deploy FTPS (lftp) ke cPanel `public_html` |
| **Kualitas** | Lighthouse CI, Playwright smoke tests, Zod validation |
