import type { LandingPageRecord, PostRecord } from '@/lib/cms';

export type SerializedPost = Omit<PostRecord, 'createdAt' | 'updatedAt'> & {
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type SerializedLandingPage = Omit<LandingPageRecord, 'createdAt' | 'updatedAt'> & {
  createdAt: string | Date;
  updatedAt: string | Date;
};

export interface AdminUserInfo {
  id: number | string;
  email: string;
  username: string;
  name: string;
}

const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

export function formatAdminDate(value: string | Date | null | undefined): string {
  if (!value) return '-';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function slugifyInput(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Gagal membaca file gambar.'));
      }
    };
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.readAsDataURL(file);
  });
}

export async function uploadMediaAsset(file: File): Promise<string> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error('Ukuran gambar maksimal 2MB.');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/media/upload', {
    method: 'POST',
    body: formData,
  });

  if (response.status === 503) {
    return readFileAsDataUrl(file);
  }

  const data = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!response.ok || !data.url) {
    throw new Error(data.error || 'Gagal mengunggah gambar.');
  }

  return data.url;
}

export async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options,
  });

  const data = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) {
    throw new Error(data.error || `Permintaan gagal (${response.status}).`);
  }
  return data;
}
