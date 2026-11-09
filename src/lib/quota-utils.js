/** quotaMb null means unlimited. */
export function checkQuota({ usedBytes, newBytes, quotaMb }) {
  if (quotaMb == null) return { ok: true };
  const limit = quotaMb * 1024 * 1024;
  if (usedBytes + newBytes <= limit) return { ok: true };
  const mb = (b) => (b / 1024 / 1024).toFixed(1);
  return { ok: false, message: `Storage limit reached: ${mb(usedBytes)} MB used, this upload adds ${mb(newBytes)} MB, limit ${quotaMb} MB. Remove unused pages or move to a plan with more storage. Nothing has been deleted.` };
}
