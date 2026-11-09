"use server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";
import { setChapterPages, setChapterStatus, PublishError } from "@/lib/publishing";

async function run(fn) {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: "Sign in required." };
    await fn(user);
    revalidatePath("/comics", "layout");
    return { ok: true };
  } catch (e) {
    if (e instanceof PublishError) return { ok: false, error: e.message === e.code ? "Not allowed." : e.message };
    console.error(e);
    return { ok: false, error: "Something went wrong." };
  }
}
export async function savePages(chapterId, pages) {
  return run((u) => setChapterPages(u, chapterId, pages));
}
export async function changeStatus(chapterId, status) {
  return run((u) => setChapterStatus(u, chapterId, status));
}
