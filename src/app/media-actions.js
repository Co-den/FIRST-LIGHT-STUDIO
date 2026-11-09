"use server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";
import { PublishError } from "@/lib/publishing";
import { setSeriesCover, setPublisherImage } from "@/lib/images";

async function run(fn) {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: "Sign in required." };
    await fn(user);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    if (e instanceof PublishError) return { ok: false, error: e.message === e.code ? "Not allowed." : e.message };
    console.error(e);
    return { ok: false, error: "Something went wrong." };
  }
}
export async function saveCover(seriesId, asset) { return run((u) => setSeriesCover(u, seriesId, asset)); }
export async function saveProfileImage(kind, asset) { return run((u) => setPublisherImage(u, kind, asset)); }
