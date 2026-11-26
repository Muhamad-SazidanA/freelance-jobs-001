import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Edit3,
  ExternalLink,
  Eye,
  Newspaper,
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
  type SerializedPost,
} from './cmsClient';

interface BlogAdminViewProps {
  user: AdminUserInfo;
  initialPosts: SerializedPost[];
  dbConfigured: boolean;
  initialQuery?: string;
}

export default function BlogAdminView({
  user,
  initialPosts,
  dbConfigured,
  initialQuery = '',
}: BlogAdminViewProps) {
  const [posts, setPosts] = useState<SerializedPost[]>(initialPosts);
  const [search, setSearch] = useState(initialQuery);
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [modal, setModal] = useState<ModalConfig>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const categories = useMemo(
    () =>
      Array.from(
        new Set(posts.map((p) => (p.category || '').trim()).filter(Boolean))
      ).sort(),
    [posts]
  );

  const filteredPosts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter((post) => {
      if (statusFilter !== 'all' && post.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && (post.category || '').trim() !== categoryFilter) return false;
      if (!q) return true;
      return (
        post.title.toLowerCase().includes(q) ||
        post.slug.toLowerCase().includes(q) ||
        (post.category || '').toLowerCase().includes(q) ||
        (post.author || '').toLowerCase().includes(q)
      );
    });
  }, [posts, search, statusFilter, categoryFilter]);

  const counts = useMemo(
    () => ({
      all: posts.length,
      published: posts.filter((p) => p.status === 'published').length,
      draft: posts.filter((p) => p.status === 'draft').length,
    }),
    [posts]
  );

  const closeModal = () => setModal((prev) => ({ ...prev, isOpen: false }));

  const toggleStatus = (post: SerializedPost) => {
    const nextStatus = post.status === 'published' ? 'draft' : 'published';
    setModal({
      isOpen: true,
      type: 'confirm',
      title: nextStatus === 'published' ? 'Terbitkan Artikel?' : 'Kembalikan ke Draft?',
      message:
        nextStatus === 'published'
          ? `Artikel "${post.title}" akan langsung tampil secara publik di website.`
          : `Artikel "${post.title}" akan disembunyikan dari publik dan disimpan sebagai Draft.`,
      confirmLabel: nextStatus === 'published' ? 'Ya, Terbitkan' : 'Jadikan Draft',
      cancelLabel: 'Batal',
      onCancel: closeModal,
      onConfirm: async () => {
        closeModal();
        setBusyId(post.id);
        try {
          const data = await requestJson<{ post: SerializedPost }>(`/api/posts/${post.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status: nextStatus }),
          });
          setPosts((prev) => prev.map((item) => (item.id === post.id ? data.post : item)));
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

  const deletePost = (post: SerializedPost) => {
    setModal({
      isOpen: true,
      type: 'warning',
      title: 'Hapus Artikel Permanen?',
      message: `Artikel "${post.title}" akan dihapus secara permanen dan tidak bisa dikembalikan.`,
      confirmLabel: 'Hapus Permanen',
      cancelLabel: 'Batal',
      onCancel: closeModal,
      onConfirm: async () => {
        closeModal();
        setBusyId(post.id);
        try {
          await requestJson(`/api/posts/${post.id}`, { method: 'DELETE' });
          setPosts((prev) => prev.filter((item) => item.id !== post.id));
        } catch (err) {
          setModal({
            isOpen: true,
            type: 'error',
            title: 'Gagal Menghapus Artikel',
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
      activeNav="blog"
      pageTitle="Manajemen Artikel & Blog"
      pageSubtitle="Kelola publikasi editorial, draft, dan optimasi SEO artikel"
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

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#006cb7]"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari judul atau slug..."
                className="w-full sm:w-56 pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:bg-white focus:border-[#006cb7]"
              />
            </div>
            <a
              href="/admin/blog/create"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#006cb7] hover:bg-[#005ba1] text-white text-xs font-bold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Artikel</span>
            </a>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          {filteredPosts.length === 0 ? (
            <div className="py-16 px-4 text-center space-y-3">
              <Newspaper className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">Tidak ada artikel yang ditemukan</p>
              <p className="text-xs text-slate-400">
                Coba ubah filter pencarian atau buat artikel baru sekarang.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Artikel</th>
                    <th className="py-3.5 px-4">Kategori</th>
                    <th className="py-3.5 px-4">Penulis</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Views</th>
                    <th className="py-3.5 px-4">Diperbarui</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredPosts.map((post) => {
                    const isPublished = post.status === 'published';
                    const previewHref = isPublished
                      ? `/articles/${post.slug}`
                      : `/articles/preview/${post.slug}`;

                    return (
                      <tr key={post.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 max-w-md">
                          <div className="flex items-center gap-3">
                            <div className="w-20 aspect-[21/9] rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                              <img
                                src={post.imageUrl || '/images/articles/article-thumb-1.jpg'}
                                alt={post.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <a
                                href={`/admin/blog/edit/${post.id}`}
                                className="font-bold text-slate-800 hover:text-[#006cb7] line-clamp-1"
                              >
                                {post.title}
                              </a>
                              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                /articles/{post.slug}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-[#006cb7] font-semibold text-[11px]">
                            {post.category || 'Umum'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-medium">
                          {post.author || 'Tim Redaksi SAI'}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <button
                            type="button"
                            disabled={!dbConfigured || busyId === post.id}
                            onClick={() => toggleStatus(post)}
                            title={
                              dbConfigured
                                ? 'Klik untuk mengubah status'
                                : 'Hubungkan MySQL untuk mengubah status'
                            }
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${
                              dbConfigured ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'
                            } ${
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
                            <span>{(post.views || 0).toLocaleString('id-ID')}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-500">
                          {formatAdminDate(post.updatedAt || post.createdAt)}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-right">
                          <div className="inline-flex items-center gap-1">
                            <a
                              href={previewHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={isPublished ? 'Buka Artikel' : 'Pratinjau Draft'}
                              className="p-2 rounded-lg text-slate-400 hover:text-[#006cb7] hover:bg-sky-50 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            <a
                              href={`/admin/blog/edit/${post.id}`}
                              title="Edit Artikel"
                              className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </a>
                            <button
                              type="button"
                              disabled={!dbConfigured || busyId === post.id}
                              onClick={() => deletePost(post)}
                              title="Hapus Artikel"
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
