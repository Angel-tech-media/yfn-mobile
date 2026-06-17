import { uploadsApi } from '@/src/api/uploads';
import { HttpError } from '@/src/lib/http';

export type UploadKind = 'product' | 'post' | 'story' | 'reel' | 'kyc' | 'chat';

export type UploadAssetInput = {
  kind: UploadKind;
  uri: string;
  fileName?: string;
  contentType: string;
  sizeBytes?: number;
};

export type UploadedAsset = {
  mediaId: string;
  publicUrl: string;
  contentType: string;
  fileName?: string;
};

export type LocalAsset = {
  uri: string;
  fileName?: string;
  contentType?: string;
  sizeBytes?: number;
  mediaType?: 'image' | 'video' | 'livePhoto' | 'pairedVideo' | null;
};

type UploadPhase = 'metadata' | 'sign' | 'upload';

export class AssetUploadError extends Error {
  constructor(
    message: string,
    readonly phase: UploadPhase,
    readonly status?: number,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'AssetUploadError';
  }
}

export async function uploadAsset(input: UploadAssetInput): Promise<UploadedAsset> {
  const fileName = input.fileName ?? fileNameFor(input.uri, input.contentType);
  const blob = await readLocalBlob(input.uri);
  const sizeBytes = positiveInteger(input.sizeBytes) ?? positiveInteger(blob.size);

  const signed = await uploadsApi.sign({
    kind: input.kind,
    contentType: input.contentType,
    fileName,
    sizeBytes,
  });

  const uploadHeaders = signed.headers ?? { 'Content-Type': input.contentType };

  const upload = await fetch(signed.uploadUrl, {
    method: 'PUT',
    headers: uploadHeaders,
    body: blob,
  });

  if (!upload.ok) {
    throw new AssetUploadError('Cloudflare R2 rejected the upload.', 'upload', upload.status);
  }

  return {
    mediaId: signed.mediaId,
    publicUrl: signed.publicUrl,
    contentType: headerValue(uploadHeaders, 'Content-Type') ?? input.contentType,
    fileName,
  };
}

export function uploadLocalAsset(asset: LocalAsset, kind: UploadKind): Promise<UploadedAsset> {
  const contentType = asset.contentType ?? inferContentType(asset.uri, asset.mediaType);

  return uploadAsset({
    kind,
    uri: asset.uri,
    contentType,
    fileName: asset.fileName,
    sizeBytes: asset.sizeBytes,
  });
}

export async function uploadLocalAssets(assets: LocalAsset[], kind: UploadKind): Promise<UploadedAsset[]> {
  return Promise.all(assets.map((asset) => uploadLocalAsset(asset, kind)));
}

export function createMultipartFile(asset: LocalAsset): Blob {
  const contentType = asset.contentType ?? inferContentType(asset.uri, asset.mediaType);

  return {
    uri: asset.uri,
    name: asset.fileName ?? fileNameFor(asset.uri, contentType),
    type: contentType,
  } as unknown as Blob;
}

export function createSelfieFormData(asset: LocalAsset, idDocumentId?: string): FormData {
  const form = new FormData();
  form.append('selfie', createMultipartFile(asset));
  if (idDocumentId) form.append('idDocumentId', idDocumentId);
  return form;
}

export function assetUploadErrorMessage(error: unknown): string {
  if (error instanceof AssetUploadError) {
    if (error.phase === 'metadata') return 'Could not read the selected media. Please choose another file.';
    if (error.status === 403) return 'The upload link expired. Please try again.';
    if (error.status === 400) return 'The selected media could not be uploaded. Please try again.';
    if (error.status && error.status >= 500) return 'Storage is temporarily unavailable. Please try again.';
    return 'Could not upload media. Please try again.';
  }

  if (error instanceof HttpError) {
    if (error.status === 401) return 'Your session expired. Please sign in again.';
    if (error.status === 400) return 'The selected media is not valid for upload.';
    if (error.status === 429) return 'Too many upload attempts. Please wait a moment and try again.';
    if (error.status >= 500) return 'Upload service is temporarily unavailable. Please try again.';
    return error.message || 'Could not prepare the upload.';
  }

  return 'Network error while uploading media. Please check your connection and try again.';
}

export function inferContentType(uri: string, mediaType?: LocalAsset['mediaType']): string {
  const lower = uri.toLowerCase().split('?')[0] ?? '';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.heic')) return 'image/heic';
  if (lower.endsWith('.heif')) return 'image/heif';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.mov')) return 'video/quicktime';
  if (lower.endsWith('.m4v')) return 'video/x-m4v';
  if (lower.endsWith('.mp4')) return 'video/mp4';
  return mediaType === 'video' || mediaType === 'pairedVideo' ? 'video/mp4' : 'image/jpeg';
}

function fileNameFor(uri: string, contentType: string): string {
  const fromUri = uri.split('?')[0]?.split('/').pop();
  if (fromUri?.includes('.')) return fromUri;
  const ext = extensionFor(contentType);
  return `upload-${Date.now()}.${ext}`;
}

function extensionFor(contentType: string): string {
  if (contentType === 'image/jpeg') return 'jpg';
  if (contentType === 'video/quicktime') return 'mov';
  return contentType.split('/')[1] || 'bin';
}

async function readLocalBlob(uri: string): Promise<Blob> {
  try {
    const response = await fetch(uri);
    if (!response.ok) throw new AssetUploadError('Could not read selected media.', 'metadata', response.status);
    return response.blob();
  } catch (error) {
    if (error instanceof AssetUploadError) throw error;
    throw new AssetUploadError('Could not read selected media.', 'metadata', undefined, error);
  }
}

function positiveInteger(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : undefined;
}

function headerValue(headers: Record<string, string>, name: string): string | undefined {
  const found = Object.entries(headers).find(([key]) => key.toLowerCase() === name.toLowerCase());
  return found?.[1];
}
