import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from './supabaseClient';

const BUCKET = 'sneeze-photos';

/** Path segment that precedes the object path in public URLs. */
const PUBLIC_PREFIX = `/object/public/${BUCKET}/`;

export type UploadSneezePhotoResult = { photoUrl: string } | { error: Error };
export type SignedPhotoUrlResult = { url: string } | { error: Error };

/**
 * Get a signed URL for a stored photo URL. Use when the bucket is private or
 * the public URL fails to load (e.g. CORS or policy).
 */
export async function getSignedUrlForStoredPhoto(
  storedPhotoUrl: string,
  expiresInSeconds: number = 3600
): Promise<SignedPhotoUrlResult> {
  const idx = storedPhotoUrl.indexOf(PUBLIC_PREFIX);
  if (idx === -1) {
    return { url: storedPhotoUrl };
  }
  const path = storedPhotoUrl.slice(idx + PUBLIC_PREFIX.length);
  if (!path) return { error: new Error('Invalid photo URL') };
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresInSeconds);
  if (error) return { error: new Error(error.message) };
  if (!data?.signedUrl) return { error: new Error('No signed URL') };
  return { url: data.signedUrl };
}

/**
 * Upload a photo from local URI. Path: {userId}/{uniqueId}.jpg.
 * Returns the public photo URL for use in createSneeze({ photoUrl }).
 * On web, uses fetch(uri) for blob URLs; on native, uses expo-file-system.
 */
export async function uploadSneezePhoto(params: {
  userId: string;
  localUri: string;
}): Promise<UploadSneezePhotoResult> {
  const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const path = `${params.userId}/${uniqueId}.jpg`;

  let blob: Blob;
  if (Platform.OS === 'web') {
    try {
      const response = await fetch(params.localUri);
      if (!response.ok) {
        return { error: new Error('Could not read image file') };
      }
      blob = await response.blob();
    } catch (e) {
      return { error: e instanceof Error ? e : new Error('Could not read image file') };
    }
  } else {
    const base64 = await FileSystem.readAsStringAsync(params.localUri, {
      encoding: 'base64',
    });
    if (!base64) {
      return { error: new Error('Could not read image file') };
    }
    const response = await fetch(`data:image/jpeg;base64,${base64}`);
    blob = await response.blob();
  }

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, {
      contentType: 'image/jpeg',
      upsert: false,
    });

  if (error) {
    return { error: new Error(error.message) };
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
  return { photoUrl: urlData.publicUrl };
}
