import MessageImage from "./MessageImage";
import { extractDomain, isSafeUrl } from "../../../utils/linkPreview";

/**
 * Messenger-style link preview card.
 *
 * - Renders a rich preview when `message.linkPreview` metadata is present.
 * - Otherwise attaches a safe, clickable link to the URL in the text.
 * - Never performs client-side metadata fetching (no backend / CORS).
 */
export default function MessageLinkPreview({ url, metadata }) {
  if (!url || !isSafeUrl(url)) return null;

  const rich = metadata?.title || metadata?.image || metadata?.description;

  if (rich) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="group flex flex-col overflow-hidden rounded-xl border border-[var(--agri-border)] bg-[var(--agri-card)] text-left shadow-xs transition hover:border-[#2D6A4F]/60 no-underline cursor-pointer max-w-sm"
      >
        {metadata.image && (
          <MessageImage
            src={metadata.image}
            alt={metadata.title || url}
            width={1200}
            height={630}
            className="w-full"
            imageClassName="group-hover:opacity-95"
          />
        )}

        <div className="flex min-w-0 flex-col gap-0.5 p-3">
          {metadata.title && (
            <span className="line-clamp-1 text-sm font-semibold text-[var(--agri-text)]">
              {metadata.title}
            </span>
          )}

          {metadata.description && (
            <span className="line-clamp-2 text-xs text-[var(--agri-text-muted)]">
              {metadata.description}
            </span>
          )}

          <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-[var(--agri-text-secondary)]">
            <i className="ri-link" />
            {metadata.domain || extractDomain(url) || "AgriNet"}
          </span>
        </div>
      </a>
    );
  }

  // Fallback: simple safe clickable link
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="text-[#2D6A4F] dark:text-[var(--agri-brand)] underline underline-offset-2 break-all cursor-pointer"
    >
      {url}
    </a>
  );
}