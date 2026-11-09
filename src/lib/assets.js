/** Server-side check that an uploaded asset is ours: right host, right publisher folder, sane size. */
export function validateAsset(a, publisherId, { maxBytes = 5 * 1024 * 1024, maxW = 4000, maxH = 6000 } = {}) {
  const prefix = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`;
  return !!a && typeof a.url === "string" && a.url.startsWith(prefix) && typeof a.storageKey === "string" && a.storageKey.startsWith(`flstudio/${publisherId}/`)
    && a.bytes > 0 && a.bytes <= maxBytes && a.width > 0 && a.width <= maxW && a.height > 0 && a.height <= maxH;
}
