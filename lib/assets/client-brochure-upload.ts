"use client";

import { BRAND_ASSETS_BUCKET } from "@/lib/assets/constants";
import { createUploadClient } from "@/lib/supabase/upload-client";
import { assertSupabaseEnv } from "@/lib/supabase/env";

const UPLOAD_TIMEOUT_MS = 5 * 60 * 1000;

/**
 * Upload brochure PDF directly from browser → Supabase Storage.
 * Avoids sending large files through Next.js server actions (timeout / fetch failed).
 */
export async function uploadBrochureDirect(
  storagePath: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createUploadClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return { ok: false, error: "You must be signed in to upload files." };
  }

  const { url, publishableKey } = assertSupabaseEnv();
  const encodedPath = storagePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  const uploadUrl = `${url}/storage/v1/object/${BRAND_ASSETS_BUCKET}/${encodedPath}`;

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", uploadUrl);
    xhr.timeout = UPLOAD_TIMEOUT_MS;
    xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);
    xhr.setRequestHeader("apikey", publishableKey);
    xhr.setRequestHeader("Content-Type", "application/pdf");
    xhr.setRequestHeader("x-upsert", "true");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.min(99, Math.round((event.loaded / event.total) * 100)));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve({ ok: true });
        return;
      }

      let message = `Storage upload failed (${xhr.status})`;
      try {
        const body = JSON.parse(xhr.responseText) as {
          message?: string;
          error?: string;
        };
        message = body.message ?? body.error ?? message;
      } catch {
        /* use default */
      }
      resolve({ ok: false, error: message });
    };

    xhr.onerror = () =>
      resolve({
        ok: false,
        error: "Network error during upload. Check your connection and try again.",
      });

    xhr.ontimeout = () =>
      resolve({
        ok: false,
        error: "Upload timed out. Try again on a stable connection.",
      });

    xhr.send(file);
  });
}
