import { useState, useEffect } from 'react';
import { getSignedUrlForStoredPhoto } from '../services/storage';

/**
 * Resolves a stored photo URL to a displayable URL (signed if needed for private bucket).
 * Returns the URL to use for <Image source={{ uri }} />, or null while loading / if none.
 */
export function usePhotoDisplayUrl(photoUrl: string | null | undefined): string | null {
  const [displayUrl, setDisplayUrl] = useState<string | null>(photoUrl ?? null);

  useEffect(() => {
    if (!photoUrl) {
      setDisplayUrl(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const result = await getSignedUrlForStoredPhoto(photoUrl);
      if (cancelled) return;
      if ('url' in result) {
        setDisplayUrl(result.url);
      } else {
        setDisplayUrl(photoUrl);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [photoUrl]);

  return displayUrl;
}
