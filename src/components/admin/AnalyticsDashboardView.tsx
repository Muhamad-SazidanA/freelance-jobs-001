import { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  BarChart3,
  Eye,
  FileCheck2,
  LayoutTemplate,
  Newspaper,
  Plus,
  TrendingUp,
} from 'lucide-react';
import AdminShell from './AdminShell';
import type { AdminUserInfo, SerializedLandingPage, SerializedPost } from './cmsClient';

interface AnalyticsDashboardViewProps {
  user: AdminUserInfo;
  posts: SerializedPost[];
  landingPages: SerializedLandingPage[];
  dbConfigured: boolean;
}

const MONTH_NAMES_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export default function AnalyticsDashboardView({
  user,
  posts,
  landingPages,
  dbConfigured,
}: AnalyticsDashboardViewProps) {
  const [hoveredPostId, setHoveredPostId] = useState<number | null>(null);
  const [hoveredSlice, setHoveredSlice] = useState<'published' | 'draft' | null>(null);
  const [hoveredMonthIdx, setHoveredMonthIdx] = useState<number | null>(null);

  const metrics = useMemo(() => {
    const publishedPosts = posts.filter((p) => p.status === 'published');
    const draftPosts = posts.filter((p) => p.status === 'draft');
    const totalArticleViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalLpViews = landingPages.reduce((sum, lp) => sum + (lp.views || 0), 0);
    const totalViews = totalArticleViews + totalLpViews;
    const avgViews = posts.length > 0 ? Math.round(totalArticleViews / posts.length) : 0;

    const topPosts = [...posts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
    const mostPopular = topPosts[0] ?? null;

    const now = new Date();
    const monthlyTrend = Array.from({ length: 6 }, (_, idx) => {
      const target = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
      const y = target.getFullYear();
      const m = target.getMonth();
      const matched = posts.filter((post) => {
        const d = new Date(post.createdAt);
        return !Number.isNaN(d.getTime()) && d.getFullYear() === y && d.getMonth() === m;
      });
      return {
        label: `${MONTH_NAMES_ID[m]} '${String(y).slice(-2)}`,
        count: matched.length,
        views: matched.reduce((acc, item) => acc + (item.views || 0), 0),
      };
    });

    return {
      totalViews,
      totalArticleViews,
      totalLpViews,
      publishedCount: publishedPosts.length,
      draftCount: draftPosts.length,
      avgViews,
      topPosts,
      mostPopular,
      monthlyTrend,
    };
  }, [posts, landingPages]);

  const maxTopViews = Math.max(1, ...metrics.topPosts.map((p) => p.views || 0));
  const totalStatus = Math.max(1, posts.length);
  const publishedPct = Math.round((metrics.publishedCount / totalStatus) * 100);
  const circumference = 2 * Math.PI * 52;
  const publishedDash = (metrics.publishedCount / totalStatus) * circumference;

  const maxMonthlyCount = Math.max(2, ...metrics.monthlyTrend.map((item) => item.count));
  const chartW = 540;
  const chartH = 180;
  const padX = 36;
  const padY = 24;
  const plotW = chartW - padX * 2;
  const plotH = chartH - padY * 2;

  const trendPoints = metrics.monthlyTrend.map((item, idx) => {
    const x = padX + (idx / Math.max(1, metrics.monthlyTrend.length - 1)) * plotW;
    const y = padY + plotH - (item.count / maxMonthlyCount) * plotH;
    return { ...item, x, y };
  });

  const polylinePoints = trendPoints.map((pt) => `${pt.x},${pt.y}`).join(' ');
  const areaPoints = `${padX},${padY + plotH} ${polylinePoints} ${
    trendPoints[trendPoints.length - 1]?.x ?? padX
  },${padY + plotH}`;

  return (
    <AdminShell
      activeNav="dashboard"
      pageTitle="Dashboard Analitik Konten"
      pageSubtitle="Ringkasan performa artikel, kunjungan pembaca, dan stand-alone landing page"
      user={user}
      dbConfigured={dbConfigured}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-2xl p-4 sm:px-6 shadow-xs">
          <div>
            <p className="text-xs text-slate-500">
              Selamat datang, <span className="font-bold text-slate-800">{user.name}</span>
            </p>
            <p className="text-sm font-bold text-slate-800 mt-0.5">
              Kelola publikasi editorial &amp; kampanye landing page dalam satu konsol
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="/admin/blog/create"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#006cb7] hover:bg-[#005ba1] text-white text-xs font-bold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tulis Artikel</span>
            </a>
            <a
              href="/admin/landing-pages/create"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-colors"
            >
              <LayoutTemplate className="w-4 h-4" />
              <span>Buat Landing Page</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Total Kunjungan</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1.5">
                {metrics.totalViews.toLocaleString('id-ID')}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {metrics.totalArticleViews.toLocaleString('id-ID')} blog &bull;{' '}
                {metrics.totalLpViews.toLocaleString('id-ID')} landing page
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-sky-50 text-[#006cb7]">
              <Eye className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Jumlah Artikel</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1.5">{posts.length}</p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                {metrics.publishedCount} Rilis &bull;{' '}
                <span className="text-slate-400">{metrics.draftCount} Draft</span>
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <Newspaper className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Rata-rata Views</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1.5">
                {metrics.avgViews.toLocaleString('id-ID')}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Per artikel terbit &amp; draft</p>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-500">Artikel Terpopuler</p>
              <p className="text-sm font-extrabold text-slate-900 mt-1.5 line-clamp-2">
                {metrics.mostPopular?.title || 'Belum ada data'}
              </p>
              <p className="text-[11px] text-[#006cb7] font-semibold mt-1">
                {metrics.mostPopular ? `${metrics.mostPopular.views} views` : '-'}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Top 5 Artikel Terpopuler</h2>
                <p className="text-xs text-slate-400">Berdasarkan total kunjungan pembaca</p>
              </div>
              <a
                href="/admin/blog"
                className="text-xs font-semibold text-[#006cb7] hover:underline inline-flex items-center gap-1"
              >
                <span>Semua Artikel</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {metrics.topPosts.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Belum ada artikel yang dapat dianalisis.
              </div>
            ) : (
              <div className="space-y-4">
                {metrics.topPosts.map((post, index) => {
                  const widthPct = Math.max(8, Math.round(((post.views || 0) / maxTopViews) * 100));
                  const isHovered = hoveredPostId === post.id;
                  return (
                    <div
                      key={post.id}
                      onMouseEnter={() => setHoveredPostId(post.id)}
                      onMouseLeave={() => setHoveredPostId(null)}
                      className="space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {index + 1}
                          </span>
                          <span className="font-semibold text-slate-700 truncate">
                            {post.title}
                          </span>
                        </div>
                        <span className="font-bold text-slate-800 shrink-0">
                          {(post.views || 0).toLocaleString('id-ID')} views
                        </span>
                      </div>
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${widthPct}%`,
                            background: isHovered
                              ? 'linear-gradient(90deg, #005ba1 0%, #0284c7 100%)'
                              : 'linear-gradient(90deg, #0070c0 0%, #38bdf8 100%)',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Status Artikel</h2>
              <p className="text-xs text-slate-400">Rasio publikasi artikel blog</p>
            </div>

            <div className="flex flex-col items-center my-6">
              <div className="relative w-40 h-40">
                <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
                  <circle
                    cx="70"
                    cy="70"
                    r="52"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth={hoveredSlice === 'draft' ? 18 : 15}
                    className="transition-all duration-200 cursor-pointer"
                    onMouseEnter={() => setHoveredSlice('draft')}
                    onMouseLeave={() => setHoveredSlice(null)}
                  />
                  <circle
                    cx="70"
                    cy="70"
                    r="52"
                    fill="none"
                    stroke="#0070c0"
                    strokeWidth={hoveredSlice === 'published' ? 18 : 15}
                    strokeLinecap="round"
                    strokeDasharray={`${publishedDash} ${circumference}`}
                    className="transition-all duration-300 cursor-pointer"
                    onMouseEnter={() => setHoveredSlice('published')}
                    onMouseLeave={() => setHoveredSlice(null)}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-extrabold text-slate-900">
                    {hoveredSlice === 'draft' ? 100 - publishedPct : publishedPct}%
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {hoveredSlice === 'draft' ? 'Draft' : 'Terbit'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-between">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0070c0]" />
                  <span>Rilis</span>
                </span>
                <span className="font-bold text-slate-900">{metrics.publishedCount}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span>Draft</span>
                </span>
                <span className="font-bold text-slate-900">{metrics.draftCount}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  Tren Publikasi Bulanan (6 Bulan Terakhir)
                </h2>
                <p className="text-xs text-slate-400">
                  Jumlah artikel dibuat per bulan &amp; akumulasi pembaca
                </p>
              </div>
              {hoveredMonthIdx !== null && metrics.monthlyTrend[hoveredMonthIdx] && (
                <div className="px-3 py-1 rounded-lg bg-[#006cb7]/10 text-[#006cb7] text-xs font-bold">
                  {metrics.monthlyTrend[hoveredMonthIdx].label}:{' '}
                  {metrics.monthlyTrend[hoveredMonthIdx].count} artikel &bull;{' '}
                  {metrics.monthlyTrend[hoveredMonthIdx].views} views
                </div>
              )}
            </div>

            <div className="w-full overflow-x-auto">
              <svg viewBox={`0 0 ${chartW} ${chartH + 24}`} className="w-full min-w-[440px] h-52">
                <defs>
                  <linearGradient id="saiTrendArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0070c0" stopOpacity="0.24" />
                    <stop offset="100%" stopColor="#0070c0" stopOpacity="0.01" />
                  </linearGradient>
                </defs>

                {[0, 0.5, 1].map((step) => {
                  const yLine = padY + plotH * step;
                  return (
                    <line
                      key={step}
                      x1={padX}
                      y1={yLine}
                      x2={chartW - padX}
                      y2={yLine}
                      stroke="#e2e8f0"
                      strokeDasharray="4 4"
                    />
                  );
                })}

                <polygon points={areaPoints} fill="url(#saiTrendArea)" />
                <polyline
                  points={polylinePoints}
                  fill="none"
                  stroke="#0070c0"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {trendPoints.map((pt, idx) => {
                  const active = hoveredMonthIdx === idx;
                  return (
                    <g
                      key={pt.label}
                      onMouseEnter={() => setHoveredMonthIdx(idx)}
                      onMouseLeave={() => setHoveredMonthIdx(null)}
                      className="cursor-pointer"
                    >
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={active ? 7 : 4.5}
                        fill="#ffffff"
                        stroke="#0070c0"
                        strokeWidth={active ? 3.5 : 2.5}
                      />
                      <text
                        x={pt.x}
                        y={chartH + 10}
                        textAnchor="middle"
                        fontSize="11"
                        fill="#64748b"
                        fontWeight="600"
                      >
                        {pt.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-800">Landing Pages</h2>
                  <p className="text-xs text-slate-400">Halaman kampanye stand-alone (/lp/...)</p>
                </div>
                <a
                  href="/admin/landing-pages"
                  className="text-xs font-semibold text-[#006cb7] hover:underline"
                >
                  Kelola
                </a>
              </div>

              {landingPages.length === 0 ? (
                <div className="p-5 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2.5">
                  <FileCheck2 className="w-7 h-7 text-slate-400 mx-auto" />
                  <p className="text-xs font-semibold text-slate-600">
                    Belum ada stand-alone landing page
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Buat halaman kampanye produk / promo khusus tanpa mengganggu halaman utama.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {landingPages.slice(0, 4).map((lp) => (
                    <a
                      key={lp.id}
                      href={`/admin/landing-pages/edit/${lp.id}`}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-sky-50/70 border border-slate-100 transition-colors"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold text-slate-800 truncate">{lp.title}</p>
                        <p className="text-[11px] text-slate-400 truncate">/lp/{lp.slug}</p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                          lp.status === 'published'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {lp.status === 'published' ? 'Rilis' : 'Draft'}
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>

            <a
              href="/admin/landing-pages/create"
              className="mt-4 w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:border-[#006cb7] text-xs font-bold text-slate-700 hover:text-[#006cb7] text-center transition-colors"
            >
              + Buat Stand-Alone Landing Page
            </a>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
