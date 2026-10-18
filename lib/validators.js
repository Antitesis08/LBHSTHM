import { z } from 'zod';

export async function readJsonBody(request, fallback = {}) {
  try {
    const text = await request.text();
    if (!text) return fallback;

    try {
      return JSON.parse(text);
    } catch {
      const params = new URLSearchParams(text);
      return Object.fromEntries(params.entries());
    }
  } catch {
    return fallback;
  }
}

export const registerSchema = z.object({
  name: z.union([z.string().trim().min(2), z.undefined(), z.null()]).transform((value) => (value ? value.toString().trim() : '')),
  email: z.string().trim().email(),
  phone: z.union([z.string().trim().min(8), z.undefined(), z.null(), z.literal('')]).transform((value) => (value ? value.toString().trim() : undefined)),
  password: z.string().min(8),
  confirmPassword: z.union([z.string().min(8), z.undefined(), z.null(), z.literal('')]).transform((value) => (value ? value.toString().trim() : undefined)),
}).superRefine((data, ctx) => {
  if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['confirmPassword'], message: 'Konfirmasi kata sandi tidak cocok.' });
  }
  if (!data.name) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['name'], message: 'Nama lengkap wajib diisi.' });
  }
});

export const loginSchema = z.object({ email: z.string().trim().email(), password: z.string().min(8) });

export const createCaseSchema = z.object({
  title: z.string().trim().min(5, 'Judul minimal 5 karakter.'),
  description: z.string().trim().min(20, 'Deskripsi permasalahan minimal 20 karakter.'),
  serviceType: z.enum(['KONSULTASI_HUKUM', 'PENDAMPINGAN_HUKUM', 'LEGAL_OPINION', 'MEDIASI', 'PENDAFTARAN_HKI', 'PRO_BONO']).optional().nullable(),
  proBonoProof: z.string().trim().optional().nullable(),
});

// Backward compatibility schema (optional scheduling fields)
export const wizardCaseSchema = z.object({
  title: z.string().trim().min(5, 'Judul minimal 5 karakter.'),
  description: z.string().trim().min(20, 'Deskripsi minimal 20 karakter.'),
  serviceType: z.enum(['KONSULTASI_HUKUM', 'PENDAMPINGAN_HUKUM', 'LEGAL_OPINION', 'MEDIASI', 'PENDAFTARAN_HKI', 'PRO_BONO']),
  consultantId: z.string().trim().optional().nullable(),
  scheduledAt: z.string().optional().nullable(),
  mode: z.enum(['online', 'offline']).optional().default('online'),
  location: z.string().trim().optional().default(''),
  proBonoProof: z.string().trim().optional().nullable(),
});

export const documentUploadSchema = z.object({
  source: z.enum(['CLIENT', 'CONSULTANT_GENERATED', 'EXTERNAL_OFFICIAL']).optional(),
});

export const generateDocSchema = z.object({
  templateType: z.enum(['RINGKASAN_KONSULTASI', 'LEGAL_OPINION', 'SURAT_KUASA', 'SOMASI']),
});
