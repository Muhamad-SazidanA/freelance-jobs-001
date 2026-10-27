import { useState, useEffect, type SyntheticEvent } from 'react';

// Cryptographic hashes (SHA-256) — eliminates plaintext credentials from client JS bundle
const ACCESS_HASH = '7bb45d2ee439c5895c08364a83248ed5fe9b3bd0c1dd9348524da1ff0f358cc9';
const PASSWORD_HASH = '202636a09463519f377a6f48ceb4f993ce188edd0c7cf85e162d208ad2951544';

async function computeSha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export default function AdminLogin() {
  const [hasSecretAccess, setHasSecretAccess] = useState<boolean | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  useEffect(() => {
    async function checkAccess() {
      const urlParams = new URLSearchParams(window.location.search);
      const accessParam = urlParams.get('access');
      const cookieAuthorized = document.cookie.includes('solusi_admin_access=authorized');

      let isTokenValid = false;
      if (accessParam) {
        const hashedParam = await computeSha256(accessParam);
        isTokenValid = hashedParam === ACCESS_HASH;
      }

      if (isTokenValid || cookieAuthorized) {
        // Set authorized cookie for 7 days with Secure & SameSite flags
        const isSecure = window.location.protocol === 'https:';
        document.cookie = `solusi_admin_access=authorized; path=/; max-age=604800; SameSite=Lax${isSecure ? '; Secure' : ''}`;
        setHasSecretAccess(true);

        if (localStorage.getItem('solusi_admin_session')) {
          window.location.href = '/admin';
        }
      } else {
        setHasSecretAccess(false);
      }
    }

    checkAccess();
  }, []);

  const handleLogin = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    const now = Date.now();
    if (lockedUntil && now < lockedUntil) {
      const remainingSec = Math.ceil((lockedUntil - now) / 1000);
      setError(`Terlalu banyak percobaan gagal. Silakan tunggu ${remainingSec} detik.`);
      return;
    }

    setIsLoading(true);
    setError('');

    const inputHash = await computeSha256(password);
    const isUserValid = username === 'admin' || username === 'admin@solusiaplikasi.id';

    if (isUserValid && inputHash === PASSWORD_HASH) {
      setFailedAttempts(0);
      setLockedUntil(null);
      localStorage.setItem(
        'solusi_admin_session',
        JSON.stringify({
          user: username,
          role: 'Administrator',
          loginTime: new Date().toISOString(),
        })
      );
      window.location.href = '/admin';
    } else {
      setIsLoading(false);
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      if (newAttempts >= 5) {
        const lockDurationMs = 30000;
        setLockedUntil(now + lockDurationMs);
        setError('Terlalu banyak percobaan gagal. Akun dikunci sementara selama 30 detik.');
      } else {
        setError(`Username atau kata sandi tidak cocok. (Sisa percobaan: ${5 - newAttempts})`);
      }
    }
  };

  if (hasSecretAccess === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white text-xs">
        Memverifikasi kredensial akses...
      </div>
    );
  }

  // Jika tidak memiliki secret key, tampilkan 404 terselubung
  if (!hasSecretAccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 text-center">
        <h1 className="text-6xl font-black text-slate-800 mb-2">404</h1>
        <p className="text-lg font-bold text-slate-700 mb-1">Halaman Tidak Ditemukan</p>
        <p className="text-xs text-slate-500 mb-6">Halaman yang Anda tuju tidak tersedia atau telah dipindahkan.</p>
        <a href="/" className="px-4 py-2 bg-slate-900 text-white rounded text-xs font-semibold">
          Kembali ke Beranda
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 mb-4 border border-sky-500/20">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">SolusiAplikasi Admin Panel</h2>
          <p className="text-xs text-slate-400 mt-1">Masuk untuk mengelola artikel, leads, dan deployment</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Username atau Email
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin@solusiaplikasi.id"
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Kata Sandi
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white font-medium text-sm rounded-lg shadow-lg shadow-sky-600/20 transition-all disabled:opacity-50 mt-2"
          >
            {isLoading ? 'Memverifikasi...' : 'Masuk ke Dashboard'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-500">
            Akses Admin WordPress (/solution) terpisah:&nbsp;
            <a
              href="/solution/wp-login.php"
              target="_blank"
              rel="noreferrer"
              className="text-sky-400 hover:underline"
            >
              WP Login &rarr;
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
