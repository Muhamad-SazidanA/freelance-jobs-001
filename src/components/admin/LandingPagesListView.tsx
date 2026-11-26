import { useMemo, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Edit3,
  ExternalLink,
  Eye,
  LayoutTemplate,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import AdminShell from './AdminShell';
import CustomModal, { type ModalConfig } from './CustomModal';
import {
  formatAdminDate,
  requestJson,
  type AdminUserInfo,
  type SerializedLandingPage,
} from './cmsClient';

interface LandingPagesListViewProps {
  user: AdminUserInfo;
  initialPages: SerializedLandingPage[];
  dbConfigured: boolean;
}

export default function LandingPagesListView({
  user,
  initialPages,
  dbConfigured,
}: LandingPagesListViewProps) {
  const [pages, setPages] = useState<SerializedLandingPage[]>(initialPages);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [modal, setModal] = useState<ModalConfig>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const closeModal = () => setModal((prev) => ({ ...prev, isOpen: false }));

  const filteredPages = useMemo(() => {
    const q = search.trim().toLowerCase();
    return pages.filter((page) => {
      if (statusFilter !== 'all' && page.status !== statusFilter) return false;
      if (!q) return true;
      return (
        page.title.toLowerCase().includes(q) ||
        page.slug.toLowerCase().includes(q) ||
        (page.heroTitle || '').toLowerCase().includes(q)
      );
    });
  }, [pages, search, statusFilter]);

  const counts = useMemo(
    () => ({
      all: pages.length,
      published: pages.filter((p) => p.status === 'published').length,
      draft: pages.filter((p) => p.status === 'draft').length,
    }),
    [pages]
  );

  const copyLink = async (page: SerializedLandingPage) => {
    const fullUrl = `${window.location.origin}/lp/${page.slug}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedId(page.id);
      setTimeout(() => setCopiedId((prev) => (prev === page.id ? null : prev)), 1800);
    } catch {
      window.prompt('Salin URL Landing Page:', fullUrl);
    }
  };

  const toggleStatus = (page: SerializedLandingPage) => {
    const nextStatus = page.status === 'published' ? 'draft' : 'published';
    setModal({
      isOpen: true,
      type: 'confirm',
      title: nextStatus === 'published' ? 'Aktifkan Landing Page?' : 'Nonaktifkan ke Draft?',
      message:
        nextStatus === 'published'
          ? `Landing page /lp/${page.slug} akan langsung dapat diakses publik.`
          : `Landing page /lp/${page.slug} akan disembunyikan ke Draft.`,
      confirmLabel: nextStatus === 'published' ? 'Ya, Aktifkan' : 'Jadikan Draft',
      cancelLabel: 'Batal',
      onCancel: closeModal,
      onConfirm: async () => {
        closeModal();
        setBusyId(page.id);
        try {
          const data = await requestJson<{ page: SerializedLandingPage }>(
            `/api/landing-pages/${page.id}`,
            {
              method: 'PATCH',
              body: JSON.stringify({ status: nextStatus }),
            }
          );
          setPages((prev) => prev.map((item) => (item.id === page.id ? data.page : item)));
        } catch (err) {
          setModal({
            isOpen: true,
            type: 'error',
            title: 'Gagal Mengubah Status',
            message: err instanceof Error ? err.message : 'Terjadi kesalahan server.',
            onConfirm: closeModal,
          });
        } finally {
          setBusyId(null);
        }
      },
    });
  };

  const deletePage = (page: SerializedLandingPage) => {
    setModal({
      isOpen: true,
      type: 'warning',
      title: 'Hapus Landing Page?',
      message: `Halaman "${page.title}" (/lp/${page.slug}) akan dihapus permanen.`,
      confirmLabel: 'Hapus Permanen',
      cancelLabel: 'Batal',
      onCancel: closeModal,
      onConfirm: async () => {
        closeModal();
        setBusyId(page.id);
        try {
          await requestJson(`/api/landing-pages/${page.id}`, { method: 'DELETE' });
          setPages((prev) => prev.filter((item) => item.id !== page.id));
        } catch (err) {
          setModal({
            isOpen: true,
            type: 'error',
            title: 'Gagal Menghapus Landing Page',
            message: err instanceof Error ? err.message : 'Terjadi kesalahan server.',
            onConfirm: closeModal,
          });
        } finally {
          setBusyId(null);
        }
      },
    });
  };

  return (
    <AdminShell
      activeNav="landing-pages"
      pageTitle="Stand-Alone Landing Pages"
      pageSubtitle="Bangun halaman kampanye produk, promo, atau lead-gen di /lp/[slug]"
      user={user}
      dbConfigured={dbConfigured}
      searchValue={search}
      onSearchChange={setSearch}
    >
      <div className="space-y-5">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { key: 'all', label: `Semua (${counts.all})` },
                { key: 'published', label: `Rilis (${counts.published})` },
                { key: 'draft', label: `Draft (${counts.draft})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === tab.key
                    ? 'bg-[#006cb7] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari landing page..."
                className="w-full sm:w-56 pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:bg-white focus:border-[#006cb7]"
              />
            </div>
            <a
              href="/admin/landing-pages/create"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#006cb7] hover:bg-[#005ba1] text-white text-xs font-bold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Landing Page</span>
            </a>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          {filteredPages.length === 0 ? (
            <div className="py-16 px-4 text-center space-y-3">
              <LayoutTemplate className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">
                Belum ada stand-alone landing page
              </p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Buat landing page terpisah untuk kampanye iklan, event, atau penawaran solusi tanpa
                mengganggu navigasi utama website.
              </p>
              <a
                href="/admin/landing-pages/create"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#006cb7] hover:bg-[#005ba1] text-white text-xs font-bold mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Landing Page Pertama</span>
              </a>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Landing Page</th>
                    <th className="py-3.5 px-4">Template</th>
                    <th className="py-3.5 px-4">Modul</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Views</th>
                    <th className="py-3.5 px-4">Diperbarui</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredPages.map((page) => {
                    const isPublished = page.status === 'published';
                    const previewHref = isPublished
                      ? `/lp/${page.slug}`
                      : `/lp/preview/${page.slug}`;

                    return (
                      <tr key={page.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 max-w-sm">
                          <a
                            href={`/admin/landing-pages/edit/${page.id}`}
                            className="font-bold text-slate-800 hover:text-[#006cb7] line-clamp-1"
                          >
                            {page.title}
                          </a>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[11px] font-mono text-slate-400">
                              /lp/{page.slug}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyLink(page)}
                              title="Salin URL publik"
                              className="p-1 text-slate-400 hover:text-[#006cb7] cursor-pointer"
                            >
                              {copiedId === page.id ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                              page.template === 'hero'
                                ? 'bg-slate-900 text-white'
                                : 'bg-sky-50 text-[#006cb7]'
                            }`}
                          >
                            {page.template === 'hero' ? 'Hero Gradient' : 'Minimal'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-[11px] text-slate-500">
                          {[
                            page.showTrustBar && 'TrustBar',
                            page.showLeadForm && 'LeadForm',
                            !page.showHeader && 'No-Header',
                          ]
                            .filter(Boolean)
                            .join(' • ') || 'Konten Standar'}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <button
                            type="button"
                            disabled={!dbConfigured || busyId === page.id}
                            onClick={() => toggleStatus(page)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
                              isPublished
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {isPublished ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                              <Clock className="w-3.5 h-3.5" />
                            )}
                            <span>{isPublished ? 'Rilis' : 'Draft'}</span>
                          </button>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-700">
                          <span className="inline-flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                            <span>{(page.views || 0).toLocaleString('id-ID')}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-500">
                          {formatAdminDate(page.updatedAt || page.createdAt)}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-right">
                          <div className="inline-flex items-center gap-1">
                            <a
                              href={previewHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={isPublished ? 'Buka Landing Page' : 'Pratinjau Draft'}
                              className="p-2 rounded-lg text-slate-400 hover:text-[#006cb7] hover:bg-sky-50 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            <a
                              href={`/admin/landing-pages/edit/${page.id}`}
                              title="Edit Landing Page"
                              className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </a>
                            <button
                              type="button"
                              disabled={!dbConfigured || busyId === page.id}
                              onClick={() => deletePage(page)}
                              title="Hapus Landing Page"
                              className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-40 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <CustomModal {...modal} />
    </AdminShell>
  );
}
