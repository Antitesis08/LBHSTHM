import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import fs from 'fs/promises';
import path from 'path';

export const isS3Configured = Boolean(
  process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY && process.env.S3_ENDPOINT
);

export const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT || 'https://placeholder.supabase.co',
  region: process.env.S3_REGION || 'us-east-1',
  forcePathStyle: true, // wajib untuk Supabase Storage
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || 'dummy',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || 'dummy',
  },
});

export function buildStorageUrl(bucketName, key) {
  if (key.startsWith('/uploads/')) return key;
  const publicBase = process.env.S3_PUBLIC_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.S3_ENDPOINT;
  if (!publicBase) return `/uploads/${key}`;
  return `${publicBase.replace(/\/$/, '')}/${bucketName}/${encodeURIComponent(key)}`;
}

export async function saveFileBuffer({ bucketName, key, body, contentType, publicRead = false }) {
  if (isS3Configured) {
    const command = new PutObjectCommand({
      Bucket: bucketName || process.env.S3_BUCKET_NAME || 'lbh-sthm-docs',
      Key: key,
      Body: body,
      ContentType: contentType,
      ...(publicRead ? { ACL: 'public-read' } : {}),
    });
    await s3.send(command);
    return key;
  }

  // Local filesystem fallback (stored in public/uploads/)
  const cleanKey = key.replace(/^[/\\]+/, '');
  const targetPath = path.join(process.cwd(), 'public', 'uploads', cleanKey);
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, Buffer.from(body));
  return `/uploads/${cleanKey.replace(/\\/g, '/')}`;
}

export async function uploadBufferToStorage({ bucketName, key, body, contentType, publicRead = false }) {
  const savedKey = await saveFileBuffer({ bucketName, key, body, contentType, publicRead });
  return buildStorageUrl(bucketName, savedKey);
}
