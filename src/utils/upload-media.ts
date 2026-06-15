import { uploadsApi } from '@/src/api/uploads';

type UploadKind = 'product' | 'post' | 'story' | 'reel' | 'kyc' | 'chat';

type LocalAsset = {
  uri: string;
  width?: number;
  height?: number;
};

export async function uploadLocalAsset(asset: LocalAsset, kind: UploadKind) {
  const contentType = inferContentType(asset.uri, kind);
  const signed = await uploadsApi.sign({
    kind,
    contentType,
    fileName: fileNameFor(asset.uri, contentType),
  });
  const response = await fetch(asset.uri);
  const blob = await response.blob();

  const upload = await fetch(signed.uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
      ...(signed.headers ?? {}),
    },
    body: blob,
  });

  if (!upload.ok) {
    throw new Error('Upload failed');
  }

  return signed.mediaId;
}

function inferContentType(uri: string, kind: UploadKind) {
  const lower = uri.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.heic')) return 'image/heic';
  if (lower.endsWith('.mov')) return 'video/quicktime';
  if (lower.endsWith('.mp4') || kind === 'reel') return 'video/mp4';
  return 'image/jpeg';
}

function fileNameFor(uri: string, contentType: string) {
  const fromUri = uri.split('/').pop();
  if (fromUri?.includes('.')) return fromUri;
  const ext = contentType.split('/')[1] || 'bin';
  return `upload-${Date.now()}.${ext}`;
}
