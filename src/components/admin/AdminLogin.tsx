import { useState, type MouseEvent, type SyntheticEvent } from 'react';
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import { requestJson } from './cmsClient';

interface AdminLoginProps {
  fromPath?: string;
}

export default function AdminLogin({ fromPath = '/admin' }: AdminLoginProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const safeRedirect = fromPath.startsWith('/admin') ? fromPath : '/admin';

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim() || !password) {
      setError('Silakan isi semua bidang input.');
      return;
    }

    setIsLoading(true);
    try {
      await requestJson('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });
      window.location.href = safeRedirect;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal masuk. Silakan periksa kembali kredensial Anda.'
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-slate-50 flex flex-col md:flex-row font-sans select-none relative">
      <div
        className="hidden md:flex md:w-1/2 bg-white flex-col justify-center items-center p-12 border-r border-slate-100 relative overflow-hidden min-h-screen"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="absolute pointer-events-none rounded-full blur-[100px] transition-opacity duration-700 bg-gradient-to-r from-[#006cb7]/10 to-[#00a3e0]/10"
          style={{
            width: '450px',
            height: '450px',
            left: `${coords.x - 225}px`,
            top: `${coords.y - 225}px`,
            opacity: isHovered ? 1 : 0,
          }}
        />
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#006cb7]/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#00a3e0]/5 blur-3xl pointer-events-none" />

        <div className="z-10 text-center space-y-8 max-w-md">
          <div className="inline-block px-8 py-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_15px_45px_rgba(0,0,0,0.03)] hover:shadow-[0_25px_60px_rgba(0,108,183,0.08)] hover:-translate-y-1 transition-all duration-500 group">
            <img
              src="/images/LogoHeader.png"
              alt="SolusiAplikasi.id Logo"
              className="h-14 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
              PT Solusi Aplikasi Integrasi
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
              Enterprise Automation &amp; Intelligent Infrastructure Ecosystem. Solusi AI OCR, RPA,
              DMS, Expense Management, dan ERP Integration.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-screen flex flex-col justify-center items-center p-4 sm:p-12 relative overflow-hidden">
        <div className="w-full max-w-md z-10">
          <div className="flex flex-col items-center mb-6 md:hidden">
            <div className="inline-block px-5 py-3.5 bg-white rounded-2xl border border-slate-100 shadow-sm mb-2.5">
              <img
                src="/images/LogoHeader.png"
                alt="SolusiAplikasi.id Logo"
                className="h-9 w-auto object-contain"
              />
            </div>
            <h2 className="text-base font-bold text-slate-800">PT Solusi Aplikasi Integrasi</h2>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-8 sm:py-11 sm:px-10 shadow-[0_15px_45px_rgba(0,0,0,0.03)]">
            <div className="mb-8">
              <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                Selamat Datang Kembali
              </h1>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Masuk ke dasbor administrator untuk mengelola artikel blog &amp; landing page.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-xs font-semibold leading-relaxed">
                  {error}
                </div>
              )}

              <div className="space-y-2.5">
                <label
                  htmlFor="admin-identifier"
                  className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1"
                >
                  Email / Username Administrator
                </label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#006cb7] transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-identifier"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Masukkan email atau username"
                    disabled={isLoading}
                    autoComplete="username"
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#006cb7] focus:ring-4 focus:ring-[#006cb7]/10 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <label
                  htmlFor="admin-password"
                  className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1"
                >
                  Kata Sandi
                </label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#006cb7] transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    disabled={isLoading}
                    autoComplete="current-password"
                    required
                    className="w-full pl-11 pr-11 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#006cb7] focus:ring-4 focus:ring-[#006cb7]/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={isLoading}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors rounded-lg cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-[#006cb7] to-[#0089e0] hover:from-[#005ba1] hover:to-[#007cc7] active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#006cb7]/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Dasbor</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="flex justify-center mt-5">
            <a
              href="/"
              className="text-xs text-slate-500 hover:text-[#006cb7] font-semibold transition-colors"
            >
              &larr; Kembali ke Website Utama
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
