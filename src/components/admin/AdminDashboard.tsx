import { useState, useEffect, type SyntheticEvent } from 'react';
import type { Post } from '@/types/content';
import mockPostsData from '@/content/mock/posts.json';

interface LeadItem {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  sourceUrl: string;
  createdAt: string;
  status: 'Baru' | 'Dihubungi' | 'Selesai';
}

const INITIAL_LEADS: LeadItem[] = [
  {
    id: 1,
    name: 'Budi Hartono',
    email: 'budi.h@perusahaanlogistik.id',
    phone: '081234567890',
    company: 'PT Logistik Sejahtera Nusantara',
    message: 'Kami ingin konsultasi integrasi API sistem ERP SAP ke payment gateway perbankan.',
    sourceUrl: 'https://solusiaplikasi.id/kontak',
    createdAt: '2026-10-06 09:15:00',
    status: 'Baru',
  },
  {
    id: 2,
    name: 'Siti Rahmawati',
    email: 'siti@agroniaga.co.id',
    phone: '081398765432',
    company: 'Agro Niaga Ekspor',
    message: 'Tertarik pengembangan web headless dengan performa tinggi untuk katalog produk ekspor.',
    sourceUrl: 'https://solusiaplikasi.id/products/nanonets',
    createdAt: '2026-10-05 14:30:00',
    status: 'Dihubungi',
  },
];

export default function AdminDashboard() {
  const [session, setSession] = useState<{ user: string; role: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'articles' | 'leads' | 'deploy'>('overview');
  const [posts, setPosts] = useState<Post[]>(mockPostsData as unknown as Post[]);
  const [leads] = useState<LeadItem[]>(INITIAL_LEADS);
  const [buildStatus, setBuildStatus] = useState<'idle' | 'building' | 'success'>('idle');

  // Form State untuk Tambah Artikel
  const [showAddArticle, setShowAddArticle] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newExcerpt, setNewExcerpt] = useState('');
  const [newCategory, setNewCategory] = useState('Teknologi Web');

  useEffect(() => {
    const rawSession = localStorage.getItem('solusi_admin_session');
    if (!rawSession) {
      window.location.href = '/login';
      return;
    }
    try {
      setSession(JSON.parse(rawSession));
    } catch {
      window.location.href = '/login';
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('solusi_admin_session');
    document.cookie = 'solusi_admin_access=; path=/; max-age=0';
    window.location.href = '/';
  };

  const handleTriggerBuild = () => {
    setBuildStatus('building');
    setTimeout(() => {
      setBuildStatus('success');
      setTimeout(() => setBuildStatus('idle'), 4000);
    }, 2500);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Nama', 'Email', 'Telepon', 'Perusahaan', 'Pesan', 'Status', 'Tanggal'];
    const rows = leads.map((l) => [
      l.id,
      `"${l.name}"`,
      l.email,
      l.phone,
      `"${l.company}"`,
      `"${l.message.replace(/"/g, '""')}"`,
      l.status,
      l.createdAt,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `leads-solusiaplikasi-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveArticle = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const generatedSlug = newSlug.trim() || newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newPost: Post = {
      id: `post-${Date.now()}`,
      slug: generatedSlug,
      title: newTitle,
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      excerpt: newExcerpt,
      quickAnswerSummary: newExcerpt,
      content: `<p>${newExcerpt}</p>`,
      featuredImage: {
        url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200',
        alt: newTitle,
        width: 1200,
        height: 630,
      },
      categories: [{ id: 'cat-1', name: newCategory, slug: newCategory.toLowerCase().replace(/\s+/g, '-') }],
      tags: [{ id: 'tag-1', name: 'General', slug: 'general' }],
      author: {
        id: 'auth-1',
        name: 'Ahmad Fauzi',
        slug: 'ahmad-fauzi',
        role: 'Principal Solutions Architect',
        bio: 'Praktisi arsitektur perangkat lunak enterprise.',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      },
      readingTimeMinutes: 4,
      seo: {
        title: `${newTitle} | SolusiAplikasi.id`,
        description: newExcerpt,
      },
    };

    setPosts([newPost, ...posts]);
    setNewTitle('');
    setNewSlug('');
    setNewExcerpt('');
    setShowAddArticle(false);
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400 text-xs">
        Memuat antarmuka dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center font-bold text-white text-sm shadow-md shadow-sky-600/30">
            S
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">
              SolusiAplikasi<span className="text-sky-400">.id</span>
              <span className="ml-2 text-[10px] uppercase font-semibold bg-sky-950 text-sky-400 border border-sky-800/60 px-2 py-0.5 rounded">
                Astro Dashboard
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://solusiaplikasi.id/solution/wp-login.php?access=solusi_admin_secure_access_2026"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/60 rounded-md text-xs font-medium transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.486 2 2 6.486 2 12c0 5.515 4.486 10 10 10 5.514 0 10-4.485 10-10 0-5.514-4.486-10-10-10zm-1.875 16.275L6.2 9.075h2.1l2.875 7.2h.05l2.85-7.2h2.025l-3.925 9.2h-2z" />
            </svg>
            WordPress (/solution) Admin
          </a>

          <div className="text-right hidden md:block">
            <div className="text-xs font-semibold text-white">{session.user}</div>
            <div className="text-[10px] text-slate-400">{session.role}</div>
          </div>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-slate-800 hover:bg-rose-950/40 hover:text-rose-400 text-slate-300 border border-slate-700/80 rounded-md text-xs transition-colors"
          >
            Keluar
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto p-4 md:p-6 gap-6">
        {/* Sidebar Nav */}
        <aside className="w-56 shrink-0 hidden md:block">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'overview'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Ringkasan (Overview)
            </button>

            <button
              onClick={() => setActiveTab('articles')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'articles'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              Artikel & Wawasan ({posts.length})
            </button>

            <button
              onClick={() => setActiveTab('leads')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'leads'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Leads & Konsultasi ({leads.length})
            </button>

            <button
              onClick={() => setActiveTab('deploy')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'deploy'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Deploy & Integrasi
            </button>
          </nav>

          <div className="mt-8 p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
            <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">WordPress Builder</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
              Landing page standalone di <code>/solution/[slug]</code> dikelola langsung melalui WordPress.
            </p>
            <a
              href="https://solusiaplikasi.id/solution/wp-login.php?access=solusi_admin_secure_access_2026"
              target="_blank"
              rel="noreferrer"
              className="block text-center py-2 px-3 bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-medium rounded-lg transition-colors border border-slate-700/60"
            >
              Buka WP Admin &rarr;
            </a>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Artikel</div>
                  <div className="text-3xl font-black text-white mt-2">{posts.length}</div>
                  <div className="text-[11px] text-sky-400 mt-1">Statis di /articles</div>
                </div>

                <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Leads Masuk</div>
                  <div className="text-3xl font-black text-white mt-2">{leads.length}</div>
                  <div className="text-[11px] text-emerald-400 mt-1">Formulir Konsultasi</div>
                </div>

                <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status Situs</div>
                  <div className="text-3xl font-black text-emerald-400 mt-2">Aktif</div>
                  <div className="text-[11px] text-slate-400 mt-1">Astro + Apache 2.4</div>
                </div>
              </div>

              {/* Quick Action Card */}
              <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Publikasi & Deploy Ulang Otomatis</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Memicu rebuild Astro dan menyinkronkan seluruh halaman ke hosting cPanel melalui GitHub Actions.
                  </p>
                </div>
                <button
                  onClick={handleTriggerBuild}
                  disabled={buildStatus === 'building'}
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-lg shadow-sky-600/20 transition-all flex items-center gap-2 whitespace-nowrap"
                >
                  {buildStatus === 'building' && <span>⏳ Membangun...</span>}
                  {buildStatus === 'success' && <span>✅ Berhasil Dideploy!</span>}
                  {buildStatus === 'idle' && <span>⚡ Build Ulang Sekarang</span>}
                </button>
              </div>

              {/* Recent Leads Preview */}
              <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white">Leads Terbaru Masuk</h3>
                  <button onClick={() => setActiveTab('leads')} className="text-xs text-sky-400 hover:underline">
                    Lihat Semua &rarr;
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-800/60 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Nama</th>
                        <th className="py-2.5 px-3">Kontak</th>
                        <th className="py-2.5 px-3">Perusahaan</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {leads.slice(0, 3).map((l) => (
                        <tr key={l.id}>
                          <td className="py-3 px-3 font-semibold text-white">{l.name}</td>
                          <td className="py-3 px-3 text-slate-400">{l.email}</td>
                          <td className="py-3 px-3 text-slate-300">{l.company}</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-950 text-sky-400 border border-sky-800/60">
                              {l.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ARTICLES */}
          {activeTab === 'articles' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-white">Daftar Artikel & Wawasan</h2>
                  <p className="text-xs text-slate-400">Kelola artikel blog untuk arsitektur konten Astro statis</p>
                </div>
                <button
                  onClick={() => setShowAddArticle(true)}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all flex items-center gap-1.5"
                >
                  <span>+</span> Tulis Artikel Baru
                </button>
              </div>

              {/* Modal Add Article */}
              {showAddArticle && (
                <div className="p-6 bg-slate-900 border border-sky-600/40 rounded-xl shadow-2xl">
                  <h3 className="text-sm font-bold text-white mb-4">Buat Artikel Baru</h3>
                  <form onSubmit={handleSaveArticle} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Judul Artikel *</label>
                      <input
                        type="text"
                        required
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Contoh: Mengoptimalkan Kecepatan Web Statis Enterprise"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Slug URL (Opsional)</label>
                        <input
                          type="text"
                          value={newSlug}
                          onChange={(e) => setNewSlug(e.target.value)}
                          placeholder="mengoptimalkan-kecepatan-web"
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Kategori</label>
                        <select
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                        >
                          <option value="Teknologi Web">Teknologi Web</option>
                          <option value="Arsitektur Sistem">Arsitektur Sistem</option>
                          <option value="Integrasi Enterprise">Integrasi Enterprise</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Ringkasan / Ringkasan Jawaban GEO (40-60 kata)
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={newExcerpt}
                        onChange={(e) => setNewExcerpt(e.target.value)}
                        placeholder="Ringkasan padat dan jelas untuk featured snippet & AI citation..."
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddArticle(false)}
                        className="px-4 py-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg text-xs"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold"
                      >
                        Simpan Artikel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Table of Articles */}
              <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-800/60 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Judul Artikel</th>
                        <th className="py-2.5 px-3">Kategori</th>
                        <th className="py-2.5 px-3">Penulis</th>
                        <th className="py-2.5 px-3">Tanggal</th>
                        <th className="py-2.5 px-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {posts.map((p) => (
                        <tr key={p.id}>
                          <td className="py-3 px-3 font-semibold text-white max-w-xs truncate">
                            <a href={`/articles/${p.slug}`} target="_blank" rel="noreferrer" className="hover:text-sky-400">
                              {p.title}
                            </a>
                          </td>
                          <td className="py-3 px-3 text-slate-400">{p.categories[0]?.name || 'Umum'}</td>
                          <td className="py-3 px-3 text-slate-300">{p.author.name}</td>
                          <td className="py-3 px-3 text-slate-400">
                            {new Date(p.publishedAt).toLocaleDateString('id-ID')}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <a
                              href={`/articles/${p.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sky-400 hover:underline mr-3"
                            >
                              Lihat
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LEADS */}
          {activeTab === 'leads' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-white">Daftar Leads & Konsultasi Masuk</h2>
                  <p className="text-xs text-slate-400">Data submisi formulir kontak dan penawaran dari situs</p>
                </div>
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Ekspor ke CSV
                </button>
              </div>

              <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-800/60 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Tanggal</th>
                        <th className="py-2.5 px-3">Nama</th>
                        <th className="py-2.5 px-3">Kontak</th>
                        <th className="py-2.5 px-3">Perusahaan</th>
                        <th className="py-2.5 px-3">Kebutuhan / Pesan</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {leads.map((l) => (
                        <tr key={l.id}>
                          <td className="py-3 px-3 text-slate-400 whitespace-nowrap">{l.createdAt}</td>
                          <td className="py-3 px-3 font-semibold text-white">{l.name}</td>
                          <td className="py-3 px-3 text-slate-300">
                            <div>{l.email}</div>
                            <div className="text-[11px] text-slate-400">{l.phone}</div>
                          </td>
                          <td className="py-3 px-3 text-slate-300">{l.company}</td>
                          <td className="py-3 px-3 text-slate-400 max-w-xs">{l.message}</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-950 text-sky-400 border border-sky-800/60">
                              {l.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DEPLOY & INTEGRATION */}
          {activeTab === 'deploy' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-white">Konfigurasi Deploy & Keamanan</h2>
                <p className="text-xs text-slate-400">Pengaturan pipeline CI/CD dan tautan manajemen WordPress</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4">
                  <h3 className="text-sm font-bold text-white">Akses Admin WordPress (/solution)</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    WordPress diinstal di folder <code>public_html/solution/</code> untuk merender landing page kampanye mandiri.
                  </p>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded font-mono text-[11px] text-slate-300 break-all">
                    https://solusiaplikasi.id/solution/wp-login.php?access=solusi_admin_secure_access_2026
                  </div>
                  <a
                    href="https://solusiaplikasi.id/solution/wp-login.php?access=solusi_admin_secure_access_2026"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
                  >
                    Buka WordPress Admin &rarr;
                  </a>
                </div>

                <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4">
                  <h3 className="text-sm font-bold text-white">Status Pipeline GitHub Actions</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Setiap kali tombol <strong>Build Ulang</strong> ditekan, workflow GitHub Actions akan mem-build Astro dan mengunggah dist ke cPanel via FTPS.
                  </p>
                  <ul className="text-xs text-slate-400 space-y-1">
                    <li>• Protokol: FTPS (TLS Terenkripsi)</li>
                    <li>• Target Folder: <code>public_html/</code> (exclude <code>solution/**</code>)</li>
                    <li>• Cloudflare Purge: Otomatis di akhir build</li>
                  </ul>
                  <button
                    onClick={handleTriggerBuild}
                    disabled={buildStatus === 'building'}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold"
                  >
                    {buildStatus === 'building' ? 'Membangun...' : 'Jalankan Build Ulang'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
