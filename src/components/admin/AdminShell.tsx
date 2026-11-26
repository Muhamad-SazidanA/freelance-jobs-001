import { useState, type ReactNode, type SyntheticEvent } from 'react';
import {
  Bell,
  ChevronRight,
  ExternalLink,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  Menu,
  Newspaper,
  Search,
  X,
} from 'lucide-react';
import CustomModal from './CustomModal';
import type { AdminUserInfo } from './cmsClient';

interface AdminShellProps {
  activeNav: 'dashboard' | 'blog' | 'landing-pages';
  pageTitle: string;
  pageSubtitle?: string;
  user: AdminUserInfo;
  dbConfigured?: boolean;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  children: ReactNode;
}

const NAV_ITEMS: Array<{
  key: 'dashboard' | 'blog' | 'landing-pages';
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}> = [
  { key: 'dashboard', label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { key: 'blog', label: 'Blog & Artikel', href: '/admin/blog', icon: Newspaper },
  {
    key: 'landing-pages',
    label: 'Landing Pages',
    href: '/admin/landing-pages',
    icon: LayoutTemplate,
  },
];

export default function AdminShell({
  activeNav,
  pageTitle,
  pageSubtitle,
  user,
  dbConfigured = true,
  searchValue,
  onSearchChange,
  children,
}: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchValue || '');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleGlobalSearch = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onSearchChange) {
      onSearchChange(localSearch);
      return;
    }
    const query = localSearch.trim();
    window.location.href = query ? `/admin/blog?q=${encodeURIComponent(query)}` : '/admin/blog';
  };

  const confirmLogout = async () => {
    setShowLogoutConfirm(false);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      window.location.href = '/login';
    }
  };

  const initials = (user.name || user.username || 'AD').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-56 bg-[#111c24] text-slate-200 flex flex-col justify-between shrink-0 transition-transform duration-200 md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="min-h-16 px-4 py-3 flex items-center justify-between border-b border-white/10">
            <a href="/admin" className="flex flex-col items-start gap-1.5 min-w-0">
              <div className="bg-white rounded-lg px-2.5 py-1 flex items-center">
                <img
                  src="/images/LogoHeader.png"
                  alt="SolusiAplikasi.id"
                  className="h-5 w-auto object-contain"
                />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-sky-400 pl-0.5">
                CMS Studio
              </span>
            </a>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="p-1 text-slate-400 hover:text-white md:hidden cursor-pointer"
              aria-label="Tutup menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="p-3 space-y-1.5 mt-2">
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Menu Utama
            </div>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.key;
              return (
                <a
                  key={item.key}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#0070c0] text-white shadow-sm'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
                </a>
              );
            })}

            <div className="pt-4 mt-4 border-t border-white/10">
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Publik
              </div>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-all"
              >
                <span className="flex items-center gap-2.5">
                  <ExternalLink className="w-4 h-4 shrink-0" />
                  <span>Lihat Website</span>
                </span>
              </a>
            </div>
          </nav>
        </div>

        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-2.5 px-2.5 py-2 mb-2 rounded-xl bg-white/5">
            <div className="w-8 h-8 rounded-full bg-[#0070c0] text-white flex items-center justify-center text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.name || user.username}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Sesi</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Buka menu navigasi"
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 md:hidden cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-slate-800 truncate">{pageTitle}</h1>
              {pageSubtitle && (
                <p className="text-[11px] text-slate-500 truncate hidden sm:block">{pageSubtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <form onSubmit={handleGlobalSearch} className="hidden lg:block relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={onSearchChange ? (searchValue ?? localSearch) : localSearch}
                onChange={(e) => {
                  setLocalSearch(e.target.value);
                  onSearchChange?.(e.target.value);
                }}
                placeholder="Cari artikel..."
                className="pl-8 pr-3 py-1.5 w-56 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#006cb7]"
              />
            </form>

            <span
              className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                dbConfigured
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
              title={
                dbConfigured
                  ? 'MySQL aktif'
                  : 'Mode fallback lokal (DATABASE_URL belum dikonfigurasi)'
              }
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  dbConfigured ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <span>{dbConfigured ? 'Database Aktif' : 'Fallback Mode'}</span>
            </span>

            <button
              type="button"
              aria-label="Notifikasi"
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {!dbConfigured && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start justify-between gap-4">
              <div>
                <p className="font-bold">Database MySQL belum terhubung (DATABASE_URL kosong)</p>
                <p className="mt-1 text-amber-700">
                  Halaman publik menggunakan data artikel lokal dalam mode baca-saja. Hubungkan
                  MySQL/MariaDB cPanel &amp; jalankan{' '}
                  <code className="bg-amber-100 px-1.5 py-0.5 rounded">npx prisma db push</code>{' '}
                  untuk menyimpan artikel, gambar, dan landing page secara live.
                </p>
              </div>
            </div>
          )}
          {children}
        </main>

        <footer className="bg-white border-t border-slate-200 px-6 py-3.5 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400">
          <span>&copy; 2026 PT Solusi Aplikasi Integrasi &bull; Enterprise CMS Studio</span>
          <span>Powered by Astro SSR (Node.js) &amp; Prisma MySQL</span>
        </footer>
      </div>

      <CustomModal
        isOpen={showLogoutConfirm}
        type="confirm"
        title="Konfirmasi Keluar"
        message="Apakah Anda yakin ingin keluar dari sesi administrator?"
        confirmLabel="Ya, Keluar"
        cancelLabel="Batal"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
}
