import { useState, useEffect, type SyntheticEvent } from 'react';

// Cryptographic hashes & valid tokens
const ACCESS_TOKEN = 'solusi_admin_secure_access_2026';
const ACCESS_HASH = '7bb45d2ee439c5895c08364a83248ed5fe9b3bd0c1dd9348524da1ff0f358cc9';

const VALID_USERNAMES = ['admin', 'admin@solusiaplikasi.id'];
const VALID_PASSWORDS = ['admin', 'admin2026', 'admin@solusiaplikasi.id', 'solusi2026'];
const VALID_PASSWORD_HASHES = [
  '6051fc84a7a0d74c225fb18a496b09952da5642e60723ecae543298edd7d82d6', // admin2026
  '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', // admin
  '202636a09463519f377a6f48ceb4f993ce188edd0c7cf85e162d208ad2951544', // legacy fallback
];

async function computeSha256(input: string): Promise<string> {
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const data = new TextEncoder().encode(input);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
    }
  } catch (err) {
    console.warn('SubtleCrypto error, falling back:', err);
  }
  return '';
}

export default function AdminLogin() {
  const [hasSecretAccess, setHasSecretAccess] = useState<boolean | null>(null);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  useEffect(() => {
    async function checkAccess() {
      try {
        if (typeof window === 'undefined') return;

        // Mode Dev / Tanpa Token: Langsung izinkan akses login
        setHasSecretAccess(true);

        // Jika sudah login sebelumnya, langsung teruskan ke /admin
        if (localStorage.getItem('solusi_admin_session')) {
          window.location.href = '/admin';
        }
      } catch (err) {
        console.error('Error during access check:', err);
        setHasSecretAccess(true);
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

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    const inputHash = await computeSha256(cleanPass);
    const isUserValid = VALID_USERNAMES.includes(cleanUser);
    const isPassValid =
      VALID_PASSWORDS.includes(cleanPass) ||
      (inputHash && VALID_PASSWORD_HASHES.includes(inputHash));

    if (isUserValid && isPassValid) {
      setFailedAttempts(0);
      setLockedUntil(null);
      localStorage.setItem(
        'solusi_admin_session',
        JSON.stringify({
          user: username.trim(),
          role: 'Administrator',
          loginTime: new Date().toISOString(),
        })
      );
      window.location.href = '/admin';
    } else {
      setIsLoading(false);
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      if (newAttempts >= 8) {
        const lockDurationMs = 20000;
        setLockedUntil(now + lockDurationMs);
        setError('Terlalu banyak percobaan gagal. Akun dikunci sementara selama 20 detik.');
      } else {
        setError(
          `Username atau kata sandi tidak cocok. Gunakan Username: admin | Password: admin atau admin2026`
        );
      }
    }
  };

  if (hasSecretAccess === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white text-xs font-sans">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <span>Memverifikasi akses administrasi...</span>
        </div>
      </div>
    );
  }

  // Jika tidak memiliki secret key dan bukan di localhost, tampilkan 404 terselubung
  if (!hasSecretAccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 text-center font-sans">
        <h1 className="text-6xl font-black text-slate-800 mb-2">404</h1>
        <p className="text-lg font-bold text-slate-700 mb-1">Halaman Tidak Ditemukan</p>
        <p className="text-xs text-slate-500 mb-6">Halaman yang Anda tuju tidak tersedia atau telah dipindahkan.</p>
        <a href="/" className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold">
          Kembali ke Beranda
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 font-sans">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 mb-3 border border-sky-500/20 shadow-inner">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">SolusiAplikasi Admin Panel</h2>
          <p className="text-xs text-slate-400 mt-1">Masuk untuk mengelola artikel, leads, dan deployment</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl leading-relaxed">
            {error}
          </div>
        )}

        {/* Info Box Default Credentials */}
        <div className="mb-5 p-3 bg-sky-950/60 border border-sky-800/60 rounded-xl text-[11px] text-sky-300 flex items-start gap-2.5">
          <span className="text-sky-400 font-bold shrink-0">💡 Kredensial:</span>
          <div>
            <div>Username: <strong className="text-white font-mono">admin</strong></div>
            <div>Password: <strong className="text-white font-mono">admin2026</strong> <span className="text-slate-400">(atau <strong className="text-white font-mono">admin</strong>)</span></div>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Username atau Email
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Kata Sandi
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="admin2026"
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-sky-600/25 transition-all disabled:opacity-50 mt-2 cursor-pointer"
          >
            {isLoading ? 'Memverifikasi...' : 'Masuk ke Dashboard'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500">
            Akses Admin WordPress (/solution) terpisah:&nbsp;
            <a
              href="/solution/wp-login.php?access=solusi_admin_secure_access_2026"
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
