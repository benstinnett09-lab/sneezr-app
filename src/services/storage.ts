import { supabase } from './supabaseClient';

const BUCKET = 'sneeze-photos';

export type UploadSneezePhotoResult = { photoUrl: string } | { error: Error };

/**
 * Upload a photo from local URI. Path: {userId}/{uniqueId}.jpg.
 * Returns the public photo URL for use in createSneeze({ photoUrl }).
 */
export async function uploadSneezePhoto(params: {
  userId: string;
  localUri: string;
}): Promise<UploadSneezePhotoResult> {
  const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const path = `${params.userId}/${uniqueId}.jpg`;

  const response = await fetch(params.localUri);
  const blob = await response.blob();

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
