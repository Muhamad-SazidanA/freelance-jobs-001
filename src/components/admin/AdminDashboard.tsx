import { useState, useEffect } from 'react';
import type { Post } from '@/types/content';
import mockPostsData from '@/content/mock/posts.json';
import ArticleForm, { type ArticleFormData } from './ArticleForm';
import CustomModal from './CustomModal';
import {
  FileText,
  Users,
  Search,
  Filter,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Eye,
  RefreshCw,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'articles' | 'leads' | 'deploy'>('articles');
  const [posts, setPosts] = useState<Post[]>(mockPostsData as unknown as Post[]);
  const [leads] = useState<LeadItem[]>(INITIAL_LEADS);
  const [buildStatus, setBuildStatus] = useState<'idle' | 'building' | 'success'>('idle');

  // Article Management Sub-Views
  const [articleViewMode, setArticleViewMode] = useState<'list' | 'form'>('list');
  const [editingArticle, setEditingArticle] = useState<Post | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: 'info' | 'success' | 'error' | 'warning' | 'confirm';
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    // 1. Check Session
    const rawSession = localStorage.getItem('solusi_admin_session');
    if (!rawSession) {
      window.location.href = '/login';
      return;
    }
    try {
      setSession(JSON.parse(rawSession));
    } catch {
      window.location.href = '/login';
      return;
    }

    // 2. Load Persisted Articles from LocalStorage
    const storedArticles = localStorage.getItem('sai_admin_articles');
    if (storedArticles) {
      try {
        const parsed = JSON.parse(storedArticles);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPosts(parsed);
        }
      } catch (e) {
        console.error('Failed to parse stored articles:', e);
      }
    } else {
      localStorage.setItem('sai_admin_articles', JSON.stringify(mockPostsData));
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

  // Handle Save / Publish Article
  const handleSaveArticle = (formData: ArticleFormData) => {
    const isNew = !formData.id;
    const nowIso = new Date().toISOString();

    const postObj: Post = {
      id: formData.id || `article-${Date.now()}`,
      slug: formData.slug,
      title: formData.title,
      publishedAt: initialDataPublishedAt(formData.id) || nowIso,
      updatedAt: nowIso,
      excerpt: formData.metaDescription || formData.subheading || formData.title,
      quickAnswerSummary: formData.subheading || formData.metaDescription || formData.title,
      content: formData.content,
      featuredImage: {
        url: formData.imageFile || '/images/articles/article-thumb-1.jpg',
        alt: formData.title,
        width: 1200,
        height: 630,
      },
      categories: [
        {
          id: `cat-${formData.category.toLowerCase().replace(/\s+/g, '-')}`,
          name: formData.category,
          slug: formData.category.toLowerCase().replace(/\s+/g, '-'),
        },
      ],
      tags: formData.keywords.map((kw, i) => ({
        id: `tag-${i}`,
        name: kw,
        slug: kw.toLowerCase().replace(/\s+/g, '-'),
      })),
      author: {
        id: 'auth-current',
        name: formData.author || 'Tim SolusiAplikasi.id',
        slug: (formData.author || 'tim-sai').toLowerCase().replace(/\s+/g, '-'),
        role: formData.authorBadge || 'Penulis',
        bio: formData.authorBio || 'Tim SolusiAplikasi.id',
        avatarUrl:
          formData.authorImage ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      },
      readingTimeMinutes: Math.max(2, Math.ceil(formData.content.split(/\s+/).length / 200)),
      seo: {
        title: `${formData.title} | SolusiAplikasi.id`,
        description: formData.metaDescription || formData.subheading,
      },
    };

    // Store custom extended properties for admin viewing
    // @ts-expect-error extended property
    postObj.subheading = formData.subheading;
    // @ts-expect-error extended property
    postObj.status = formData.status;
    // @ts-expect-error extended property
    postObj.showAuthor = formData.showAuthor;
    // @ts-expect-error extended property
    postObj.reviewerName = formData.reviewerName;
    // @ts-expect-error extended property
    postObj.reviewerImage = formData.reviewerImage;
    // @ts-expect-error extended property
    postObj.reviewerBadge = formData.reviewerBadge;
    // @ts-expect-error extended property
    postObj.reviewerBio = formData.reviewerBio;
    // @ts-expect-error extended property
    postObj.showReviewer = formData.showReviewer;

    let updatedList: Post[];
    if (isNew) {
      updatedList = [postObj, ...posts];
    } else {
      updatedList = posts.map((p) => (p.id === formData.id ? postObj : p));
    }

    setPosts(updatedList);
    localStorage.setItem('sai_admin_articles', JSON.stringify(updatedList));

    setModalConfig({
      isOpen: true,
      type: 'success',
      title: isNew ? 'Artikel Berhasil Dibuat!' : 'Artikel Berhasil Diperbarui!',
      message: `Artikel "${formData.title}" telah tersimpan dengan status ${formData.status.toUpperCase()}.`,
      confirmLabel: 'Kembali ke Daftar',
      onConfirm: () => {
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
        setArticleViewMode('list');
        setEditingArticle(null);
      },
    });
  };

  const initialDataPublishedAt = (id?: string) => {
    if (!id) return null;
    const found = posts.find((p) => p.id === id);
    return found ? found.publishedAt : null;
  };

  const handleDeleteArticle = (articleId: string, articleTitle: string) => {
    setModalConfig({
      isOpen: true,
      type: 'confirm',
      title: 'Hapus Artikel',
      message: `Apakah Anda yakin ingin menghapus artikel "${articleTitle}"? Tindakan ini tidak dapat dibatalkan.`,
      confirmLabel: 'Ya, Hapus',
      cancelLabel: 'Batal',
      onConfirm: () => {
        const remaining = posts.filter((p) => p.id !== articleId);
        setPosts(remaining);
        localStorage.setItem('sai_admin_articles', JSON.stringify(remaining));
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
      },
      onCancel: () => {
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Filtered Articles
  const filteredArticles = posts.filter((p) => {
    const matchesQuery =
      searchQuery === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.author.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === 'ALL' ||
      p.categories.some((c) => c.name.toLowerCase() === categoryFilter.toLowerCase());

    return matchesQuery && matchesCategory;
  });

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
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-30 px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center font-bold text-white text-sm shadow-md shadow-sky-600/30">
            S
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <span>
                SolusiAplikasi<span className="text-sky-400">.id</span>
              </span>
              <span className="text-[10px] uppercase font-semibold bg-sky-950 text-sky-400 border border-sky-800/60 px-2 py-0.5 rounded">
                Admin Panel
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <a
            href="https://solusiaplikasi.id/solution/wp-login.php?access=solusi_admin_secure_access_2026"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/60 rounded-md text-xs font-medium transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>WP (/solution)</span>
          </a>

          <div className="text-right hidden md:block">
            <div className="text-xs font-semibold text-white">{session.user}</div>
            <div className="text-[10px] text-slate-400">{session.role}</div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-rose-950/40 hover:text-rose-400 text-slate-300 border border-slate-700/80 rounded-md text-xs transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6">
        {/* Sidebar Nav (Hidden when in article create/edit form to focus writer) */}
        {articleViewMode === 'list' && (
          <aside className="w-full md:w-60 shrink-0">
            <nav className="space-y-1.5 bg-slate-900/60 p-2 border border-slate-800 rounded-xl">
              <button
                onClick={() => {
                  setActiveTab('articles');
                  setArticleViewMode('list');
                }}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'articles'
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Articles & Wawasan</span>
              </button>

              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'overview'
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>Ringkasan (Overview)</span>
              </button>

              <button
                onClick={() => setActiveTab('leads')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'leads'
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Data Leads Konsultasi</span>
              </button>

              <button
                onClick={() => setActiveTab('deploy')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'deploy'
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <RefreshCw className="w-4 h-4" />
                <span>Deploy & Integrasi</span>
              </button>
            </nav>

            <div className="mt-6 p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                WordPress Builder
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                Landing page standalone di <code>/solution/[slug]</code> dikelola via WordPress.
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
        )}

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {/* TAB 1: ARTICLES (MAIN FEATURE) */}
          {activeTab === 'articles' && (
            <div>
              {articleViewMode === 'form' ? (
                <ArticleForm
                  initialData={editingArticle}
                  onSave={handleSaveArticle}
                  onCancel={() => {
                    setArticleViewMode('list');
                    setEditingArticle(null);
                  }}
                />
              ) : (
                <div className="space-y-6">
                  {/* Top Action Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-white tracking-tight">
                        Manajemen Articles
                      </h2>
                      <p className="text-xs text-slate-400">
                        Buat, edit, dan kelola seluruh artikel wawasan edukasi & SEO SolusiAplikasi.id
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setEditingArticle(null);
                        setArticleViewMode('form');
                      }}
                      className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-md shadow-sky-600/30 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tulis Artikel Baru</span>
                    </button>
                  </div>

                  {/* Search and Filters */}
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                      <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari berdasarkan judul artikel, slug, atau nama penulis..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Filter className="w-3.5 h-3.5 text-slate-400" />
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500 w-full sm:w-auto"
                      >
                        <option value="ALL">Semua Kategori</option>
                        <option value="Technology">Technology</option>
                        <option value="AI & Automation">AI & Automation</option>
                        <option value="Enterprise IT">Enterprise IT</option>
                        <option value="Fintech and Economy">Fintech and Economy</option>
                        <option value="Document Management">Document Management</option>
                        <option value="Case Study">Case Study</option>
                      </select>
                    </div>
                  </div>

                  {/* Articles Table */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold text-[11px]">
                          <tr>
                            <th className="py-3.5 px-4">Artikel</th>
                            <th className="py-3.5 px-4">Kategori</th>
                            <th className="py-3.5 px-4">Penulis</th>
                            <th className="py-3.5 px-4">Status</th>
                            <th className="py-3.5 px-4">Tanggal</th>
                            <th className="py-3.5 px-4 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {filteredArticles.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-12 text-center text-slate-500">
                                <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                <p className="text-xs font-semibold">Tidak ada artikel yang cocok.</p>
                              </td>
                            </tr>
                          ) : (
                            filteredArticles.map((article) => (
                              <tr key={article.id} className="hover:bg-slate-800/40 transition-colors">
                                {/* Article Title & Thumbnail */}
                                <td className="py-3.5 px-4 max-w-sm">
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={article.featuredImage?.url || '/images/articles/article-thumb-1.jpg'}
                                      alt={article.title}
                                      className="w-12 h-10 object-cover rounded-lg border border-slate-800 shrink-0 bg-slate-950"
                                    />
                                    <div className="min-w-0">
                                      <h4 className="font-bold text-white text-xs truncate hover:text-sky-400 transition-colors">
                                        <a href={`/articles/${article.slug}`} target="_blank" rel="noreferrer">
                                          {article.title}
                                        </a>
                                      </h4>
                                      <div className="text-[11px] text-slate-400 font-mono truncate">
                                        /articles/{article.slug}
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                {/* Category */}
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-sky-950/80 text-sky-400 border border-sky-800/60">
                                    {article.categories[0]?.name || 'Umum'}
                                  </span>
                                </td>

                                {/* Author */}
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <img
                                      src={article.author.avatarUrl}
                                      alt={article.author.name}
                                      className="w-6 h-6 rounded-full object-cover border border-slate-700"
                                    />
                                    <span className="text-slate-300 font-medium">
                                      {article.author.name}
                                    </span>
                                  </div>
                                </td>

                                {/* Status */}
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  {/* @ts-expect-error extended property */}
                                  {article.status === 'draft' ? (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/80 text-amber-400 border border-amber-800/60">
                                      Draft
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                                      Published
                                    </span>
                                  )}
                                </td>

                                {/* Date */}
                                <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                                  <div className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                    <span>
                                      {new Date(article.publishedAt).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                      })}
                                    </span>
                                  </div>
                                </td>

                                {/* Actions */}
                                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingArticle(article);
                                        setArticleViewMode('form');
                                      }}
                                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-sky-600 text-slate-300 hover:text-white transition-colors"
                                      title="Edit Artikel"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>

                                    <a
                                      href={`/articles/${article.slug}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                                      title="Buka Halaman Artikel"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                                    </a>

                                    <button
                                      type="button"
                                      onClick={() => handleDeleteArticle(article.id, article.title)}
                                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors"
                                      title="Hapus Artikel"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Total Articles
                  </div>
                  <div className="text-3xl font-black text-white mt-2">{posts.length}</div>
                  <div className="text-[11px] text-sky-400 mt-1">Tersedia di /articles</div>
                </div>

                <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Leads Masuk
                  </div>
                  <div className="text-3xl font-black text-white mt-2">{leads.length}</div>
                  <div className="text-[11px] text-emerald-400 mt-1">Formulir Konsultasi</div>
                </div>

                <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Status Sistem
                  </div>
                  <div className="text-3xl font-black text-emerald-400 mt-2 flex items-center gap-2">
                    <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                    <span>Aktif</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Astro + Vercel / cPanel</div>
                </div>
              </div>

              {/* Quick Action Card */}
              <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Publikasi & Deploy Ulang Otomatis</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Memicu rebuild Astro dan menyinkronkan seluruh halaman ke hosting melalui GitHub Actions / Vercel.
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

      <CustomModal
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmLabel={modalConfig.confirmLabel}
        cancelLabel={modalConfig.cancelLabel}
        onConfirm={modalConfig.onConfirm}
        onCancel={modalConfig.onCancel}
      />
    </div>
  );
}
