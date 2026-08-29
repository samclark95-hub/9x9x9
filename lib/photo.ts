import imageCompression from "browser-image-compression";
import { supabase } from "./supabase";

/**
 * Compression is not optional (spec §5.2). Raw iPhone photos are 3-5MB and
 * will time out on stadium wifi. Target roughly 1600px and ~500KB.
 */
const OPTIONS = {
  maxWidthOrHeight: 1600,
  maxSizeMB: 0.5,
  useWebWorker: true,
  fileType: "image/jpeg" as const,
  initialQuality: 0.8,
};

export async function compressPhoto(file: File): Promise<File> {
  try {
    return await imageCompression(file, OPTIONS);
  } catch {
    // A compression failure should not lose the post; fall back to the
    // original and let the upload try its luck.
    return file;
  }
}

/** Uploads to the public `photos` bucket and returns its public URL. */
export async function uploadPhoto(file: File): Promise<string> {
  const compressed = await compressPhoto(file);
  const path = `${crypto.randomUUID()}.jpg`;

  const { error } = await supabase.storage
    .from("photos")
    .upload(path, compressed, {
      contentType: compressed.type || "image/jpeg",
      // Short TTL on purpose: these are served from a CDN, and a long cache
      // would keep a deleted photo reachable at the edge after removal.
      cacheControl: "300",
      upsert: false,
    });

  if (error) throw new Error(`photo upload failed: ${error.message}`);

  return supabase.storage.from("photos").getPublicUrl(path).data.publicUrl;
}
