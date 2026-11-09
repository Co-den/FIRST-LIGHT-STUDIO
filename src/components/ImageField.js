"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { uploadImage } from "@/lib/cloudinary-client";

export default function ImageField({ label, publisherId, current, action, w = 120, h = 180 }) {
  const router = useRouter();
  const [progress, setProgress] = useState(null);
  const [msg, setMsg] = useState(null);

  async function onChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setMsg(null); setProgress(0);
    try {
      const asset = await uploadImage(file, publisherId, setProgress);
      const r = await action(asset);
      setMsg(r.ok ? { ok: true, text: "Image saved." } : { ok: false, text: r.error });
      if (r.ok) router.refresh();
    } catch (err) { setMsg({ ok: false, text: err.message }); }
    setProgress(null);
  }
  return (
    <div className="mt-6">
      <p className="font-head font-bold">{label}</p>
      <div className="mt-2 flex items-center gap-4">
        {current ? <Image src={current} alt={`Current ${label.toLowerCase()}`} width={w} height={h} className="object-cover" style={{ width: w, height: h }} /> : <span className="grid place-items-center border border-white/20 text-xs text-mist" style={{ width: w, height: h }}>None</span>}
        <div>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onChange} disabled={progress !== null} aria-label={`Upload ${label}`} className="text-sm" />
          {progress !== null && <progress value={progress} max="1" className="mt-2 block" />}
          <p className="mt-1 text-xs text-mist">JPG, PNG or WebP, up to 5 MB.</p>
        </div>
      </div>
      {msg && <p role={msg.ok ? "status" : "alert"} className={`mt-2 text-sm ${msg.ok ? "text-sun" : "text-red-300"}`}>{msg.text}</p>}
    </div>
  );
}
