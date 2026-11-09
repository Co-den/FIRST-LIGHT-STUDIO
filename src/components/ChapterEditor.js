"use client";
import Image from "next/image";
import { useState } from "react";
import { savePages, changeStatus } from "@/app/admin/actions";

const TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX = 10 * 1024 * 1024;

function uploadFile(file, s, onProgress) {
  return new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append("file", file); fd.append("api_key", s.apiKey); fd.append("timestamp", s.timestamp);
    fd.append("signature", s.signature); fd.append("folder", s.folder); fd.append("upload_preset", s.upload_preset);
    const x = new XMLHttpRequest();
    x.open("POST", `https://api.cloudinary.com/v1_1/${s.cloudName}/image/upload`);
    x.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    x.onload = () => (x.status === 200 ? resolve(JSON.parse(x.responseText)) : reject(new Error("Upload rejected by storage.")));
    x.onerror = () => reject(new Error("Network error during upload."));
    x.send(fd);
  });
}

export default function ChapterEditor({ chapterId, publisherId, initialPages, initialStatus }) {
  const [pages, setPages] = useState(initialPages);
  const [status, setStatus] = useState(initialStatus);
  const [jobs, setJobs] = useState([]);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const patchJob = (name, p) => setJobs((j) => j.map((x) => (x.name === name ? { ...x, ...p } : x)));

  async function onFiles(e) {
    const files = [...e.target.files];
    e.target.value = "";
    setJobs(files.map((f) => ({ name: f.name, progress: 0, error: null })));
    for (const f of files) {
      try {
        if (!TYPES.includes(f.type)) throw new Error("Use JPG, PNG or WebP.");
        if (f.size > MAX) throw new Error("Larger than 10 MB.");
        const bmp = await createImageBitmap(f);
        const { width, height } = bmp; bmp.close();
        const res = await fetch("/api/upload/sign", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ publisherId }) });
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Not allowed to upload.");
        const r = await uploadFile(f, await res.json(), (p) => patchJob(f.name, { progress: p }));
        setPages((p) => [...p, { url: r.secure_url, storageKey: r.public_id, width: r.width || width, height: r.height || height, bytes: r.bytes }]);
        patchJob(f.name, { progress: 1 });
      } catch (err) { patchJob(f.name, { error: err.message }); }
    }
  }

  const move = (i, d) => setPages((p) => { const n = [...p], j = i + d; if (j < 0 || j >= n.length) return n; [n[i], n[j]] = [n[j], n[i]]; return n; });
  const remove = (i) => setPages((p) => p.filter((_, k) => k !== i));

  async function act(kind) {
    setBusy(true); setMsg(null);
    let r = { ok: true };
    if (kind !== "unpublished") r = await savePages(chapterId, pages);
    if (r.ok && kind !== "save") { r = await changeStatus(chapterId, kind); if (r.ok) setStatus(kind); }
    setMsg(r.ok ? { ok: true, text: kind === "save" ? "Pages saved." : kind === "published" ? "Chapter published." : "Chapter unpublished." } : { ok: false, text: r.error });
    setBusy(false);
  }

  const btn = "rounded-sm px-5 py-2.5 font-head text-sm font-bold disabled:opacity-50";
  return (
    <div className="mt-8">
      <p className="text-sm text-mist">Status: <strong className="text-white">{status}</strong></p>
      <label className="mt-6 block font-head font-bold">Add pages (JPG, PNG, WebP, max 10 MB each)
        <input type="file" multiple accept={TYPES.join(",")} onChange={onFiles} className="mt-2 block w-full text-sm" />
      </label>
      {jobs.length > 0 && (
        <ul className="mt-4 grid gap-2 text-sm" aria-live="polite">
          {jobs.map((j) => (
            <li key={j.name}>{j.name}: {j.error ? <span className="text-red-300">{j.error}</span> : j.progress >= 1 ? "uploaded" : <progress value={j.progress} max="1" className="align-middle" />}</li>
          ))}
        </ul>
      )}
      {pages.length === 0 ? <p className="mt-8 text-mist">No pages yet.</p> : (
        <ol className="mt-8 grid gap-3">
          {pages.map((p, i) => (
            <li key={p.storageKey} className="flex items-center gap-4 border border-white/15 bg-midnight p-3">
              <span className="w-8 text-center font-display text-2xl">{i + 1}</span>
              <Image src={p.url} alt={`Page ${i + 1}`} width={60} height={90} className="h-[90px] w-[60px] object-cover" />
              <span className="ml-auto flex gap-2">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move page ${i + 1} up`} className="border border-white/30 px-3 py-1 disabled:opacity-30">Up</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === pages.length - 1} aria-label={`Move page ${i + 1} down`} className="border border-white/30 px-3 py-1 disabled:opacity-30">Down</button>
                <button type="button" onClick={() => remove(i)} aria-label={`Remove page ${i + 1}`} className="border border-red-300/60 px-3 py-1 text-red-300">Remove</button>
              </span>
            </li>
          ))}
        </ol>
      )}
      <div className="mt-8 flex flex-wrap gap-3">
        <button disabled={busy || !pages.length} onClick={() => act("save")} className={`${btn} border border-white/40`}>Save pages</button>
        <button disabled={busy || !pages.length} onClick={() => act("published")} className={`${btn} bg-sun text-night`}>Save and publish</button>
        <button disabled={busy || status !== "published"} onClick={() => act("unpublished")} className={`${btn} border border-white/40`}>Unpublish</button>
      </div>
      {msg && <p role={msg.ok ? "status" : "alert"} className={`mt-4 ${msg.ok ? "text-sun" : "text-red-300"}`}>{msg.text}</p>}
    </div>
  );
}
