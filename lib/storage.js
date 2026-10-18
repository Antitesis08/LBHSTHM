import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION,
  forcePathStyle: true, // wajib untuk Supabase Storage
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

export function buildStorageUrl(bucketName, key) {
  const publicBase = process.env.S3_PUBLIC_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.S3_ENDPOINT;
  if (!publicBase) return key;
  if (publicBase.includes('/storage/v1/object/public')) {
    return `${publicBase.replace(/\/$/, '')}/${bucketName}/${encodeURIComponent(key)}`;
  }
  return `${publicBase.replace(/\/$/, '')}/${bucketName}/${encodeURIComponent(key)}`;
}

export async function uploadBufferToStorage({ bucketName, key, body, contentType, publicRead = false }) {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: body,
    ContentType: contentType,
    ...(publicRead ? { ACL: 'public-read' } : {}),
  });

  await s3.send(command);
  return buildStorageUrl(bucketName, key);
}
