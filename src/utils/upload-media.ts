import * as FileSystem from 'expo-file-system/legacy';

import { uploadsApi } from '@/src/api/uploads';
import { HttpError } from '@/src/lib/http';
import { logApiFailure } from '@/src/utils/api-logging';

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

type StorageErrorDetails = {
  code?: string;
  message?: string;
  body: string;
};

export class AssetUploadError extends Error {
  constructor(
    message: string,
    readonly phase: UploadPhase,
    readonly status?: number,
    readonly cause?: unknown,
    readonly storage?: StorageErrorDetails,
  ) {
    super(message);
    this.name = 'AssetUploadError';
  }
}

export async function uploadAsset(input: UploadAssetInput): Promise<UploadedAsset> {
  const fileName = input.fileName ?? fileNameFor(input.uri, input.contentType);
  const logContext = {
    kind: input.kind,
    fileName,
    contentType: input.contentType,
    providedSizeBytes: input.sizeBytes,
  };

  let info: FileSystem.FileInfo;
  try {
    info = await FileSystem.getInfoAsync(input.uri);
  } catch (err) {
    logApiFailure('media metadata read', err, logContext);
    throw new AssetUploadError('Could not read selected media.', 'metadata', undefined, err);
  }

  if (!info.exists) {
    console.error('[api] media metadata read failed', {
      ...logContext,
      reason: 'local file does not exist',
    });
    throw new AssetUploadError('Could not read selected media.', 'metadata');
  }
  const sizeBytes = positiveInteger(input.sizeBytes) ?? positiveInteger(info.size);

  const signed = await signUpload({
    kind: input.kind,
    contentType: input.contentType,
    fileName,
    sizeBytes,
  });

  const uploadHeaders = signed.headers ?? { 'Content-Type': input.contentType };

  let upload: FileSystem.FileSystemUploadResult;
  try {
    upload = await FileSystem.uploadAsync(signed.uploadUrl, input.uri, {
      httpMethod: 'PUT',
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      headers: uploadHeaders,
    });
  } catch (err) {
    logApiFailure('PUT <uploadUrl>', err, {
      ...logContext,
      endpoint: 'PUT <uploadUrl>',
      uploadHost: uploadHostFor(signed.uploadUrl),
      uploadBucket: uploadBucketFor(signed.uploadUrl),
      mediaId: signed.mediaId,
      sizeBytes,
    });
    throw new AssetUploadError('Cloudflare R2 upload failed.', 'upload', undefined, err);
  }

  if (upload.status < 200 || upload.status >= 300) {
    const storage = parseStorageError(upload.body);
    const message = storage?.code === 'NoSuchBucket'
      ? 'Cloudflare R2 bucket does not exist.'
      : 'Cloudflare R2 rejected the upload.';
    console.error('[api] PUT <uploadUrl> failed', {
      ...logContext,
      endpoint: 'PUT <uploadUrl>',
      uploadHost: uploadHostFor(signed.uploadUrl),
      uploadBucket: uploadBucketFor(signed.uploadUrl),
      mediaId: signed.mediaId,
      sizeBytes,
      status: upload.status,
      storageCode: storage?.code,
      storageMessage: storage?.message,
      body: upload.body,
    });
    throw new AssetUploadError(message, 'upload', upload.status, undefined, storage);
  }

  return {
    mediaId: signed.mediaId,
    publicUrl: signed.publicUrl,
    contentType: headerValue(uploadHeaders, 'Content-Type') ?? input.contentType,
    fileName,
  };
}

async function signUpload(input: {
  kind: UploadKind;
  contentType: string;
  fileName: string;
  sizeBytes?: number;
}) {
  try {
    return await uploadsApi.sign(input);
  } catch (err) {
    logApiFailure('POST /upload/sign', err, {
      endpoint: 'POST /upload/sign',
      kind: input.kind,
      fileName: input.fileName,
      contentType: input.contentType,
      sizeBytes: input.sizeBytes,
    });
    throw err;
  }
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
  const uploaded: UploadedAsset[] = [];
  for (const asset of assets) {
    uploaded.push(await uploadLocalAsset(asset, kind));
  }
  return uploaded;
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
    if (error.storage?.code === 'NoSuchBucket') return 'Upload storage is not configured correctly. Please try again later.';
    if (error.status === 403) return 'The upload link expired. Please try again.';
    if (error.status === 404) return 'Upload storage could not be found. Please try again later.';
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

function positiveInteger(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : undefined;
}

function headerValue(headers: Record<string, string>, name: string): string | undefined {
  const found = Object.entries(headers).find(([key]) => key.toLowerCase() === name.toLowerCase());
  return found?.[1];
}

function parseStorageError(body: string | undefined): StorageErrorDetails | undefined {
  if (!body) return undefined;

  return {
    code: xmlTagValue(body, 'Code'),
    message: xmlTagValue(body, 'Message'),
    body,
  };
}

function xmlTagValue(body: string, tag: string): string | undefined {
  const match = body.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
  return match?.[1];
}

function uploadHostFor(uploadUrl: string): string | undefined {
  try {
    return new URL(uploadUrl).host;
  } catch {
    return undefined;
  }
}

function uploadBucketFor(uploadUrl: string): string | undefined {
  try {
    const url = new URL(uploadUrl);
    return url.pathname.split('/').filter(Boolean)[0];
  } catch {
    return undefined;
  }
}
