const TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX = 5 * 1024 * 1024;

/** Browser-side: validate, get a server signature, upload straight to Cloudinary, return asset metadata. */
export async function uploadImage(file, publisherId, onProgress) {
  if (!TYPES.includes(file.type)) throw new Error("Use JPG, PNG or WebP.");
  if (file.size > MAX) throw new Error("Image must be 5 MB or smaller.");
  const bmp = await createImageBitmap(file);
  const { width, height } = bmp; bmp.close();
  const res = await fetch("/api/upload/sign", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ publisherId }) });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Not allowed to upload.");
  const s = await res.json();
  const r = await new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append("file", file); fd.append("api_key", s.apiKey); fd.append("timestamp", s.timestamp);
    fd.append("signature", s.signature); fd.append("folder", s.folder); fd.append("upload_preset", s.upload_preset);
    const x = new XMLHttpRequest();
    x.open("POST", `https://api.cloudinary.com/v1_1/${s.cloudName}/image/upload`);
    x.upload.onprogress = (e) => e.lengthComputable && onProgress?.(e.loaded / e.total);
    x.onload = () => (x.status === 200 ? resolve(JSON.parse(x.responseText)) : reject(new Error("Upload rejected by storage.")));
    x.onerror = () => reject(new Error("Network error during upload."));
    x.send(fd);
  });
  return { url: r.secure_url, storageKey: r.public_id, width: r.width || width, height: r.height || height, bytes: r.bytes };
}
