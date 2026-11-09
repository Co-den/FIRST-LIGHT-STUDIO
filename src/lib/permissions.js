// Pure authorization rules. Every server action and route handler must call these
// with data loaded from the database, never with values sent by the client.

export const isAdmin = (user) => user?.role === "admin" && user.status === "active";

/** Paid, in-period subscription. A cancelled plan stays valid until its paid period ends. */
export function subscriptionIsActive(sub, now = new Date()) {
  if (!sub || !sub.currentPeriodEnd) return false;
  return (sub.status === "active" || sub.status === "cancelled") && new Date(sub.currentPeriodEnd) > now;
}

const owns = (user, publisher) => !!user && !!publisher && publisher.ownerUserId === user.id && user.status === "active";

/** Edit metadata, artwork and drafts. Never needs a subscription, so lapsed creators keep access to their work. */
export function canManagePublisherContent(user, publisher) {
  if (!user || user.status !== "active" || !publisher) return false;
  if (publisher.kind === "official") return isAdmin(user);
  return owns(user, publisher) && user.role === "creator";
}

/** Publish, schedule, or upload pages intended for publication. ctx.termsAccepted comes from the database. */
export function canPublish(user, publisher, subscription, now = new Date(), ctx = {}) {
  const deny = (reason) => ({ allowed: false, reason });
  if (!user || user.status !== "active") return deny("account_inactive");
  if (!publisher) return deny("no_publisher");
  if (publisher.kind === "official") return publisher.feeExempt === true && isAdmin(user) ? { allowed: true } : deny("forbidden");
  if (!owns(user, publisher) || user.role !== "creator") return deny("forbidden");
  if (publisher.feeExempt !== true && !subscriptionIsActive(subscription, now)) return deny("subscription_required");
  if (!ctx.termsAccepted) return deny("terms_required");
  return { allowed: true };
}

/** Admins may take content down on any publisher. They do not publish for creators. */
export const canModerate = (user) => isAdmin(user);

/** Public readability depends on content state only. A lapsed subscription never hides published work. */
export function isPubliclyReadable(chapter, series, now = new Date()) {
  if (!chapter || !series) return false;
  if (series.status === "removed" || series.status === "draft") return false;
  return chapter.status === "published" && !!chapter.publishedAt && new Date(chapter.publishedAt) <= now;
}

export const PUBLISH_REASONS = {
  subscription_required: "An active creator subscription is required to publish. Your drafts and published work are safe.",
  account_inactive: "This account is not active.",
  forbidden: "You do not have permission to publish here.",
  terms_required: "Confirm that you own or are authorized to publish your content and accept the creator terms before publishing.",
  no_publisher: "No publisher profile found.",
};

/** Admins can suspend readers and creators, never other admins or themselves. */
export const canSuspend = (actor, target) => isAdmin(actor) && !!target && target.role !== "admin" && target.id !== actor.id;
