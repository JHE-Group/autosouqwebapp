import { absoluteUrl, localizedPath, SITE_NAME } from "@/lib/seo";
import { blogPath, postsInOrder, postText } from "@/data/blog";
import { DEFAULT_LOCALE } from "@/i18n/routing";

/** `Article` JSON-LD for a blog post — same honesty rules as guides. */
export function blogArticleJsonLd(post, locale = DEFAULT_LOCALE) {
  const url = absoluteUrl(localizedPath(blogPath(post.slug), locale));
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    // Page language only — §7 of the strategy doc: one graph per page, entirely
    // in that page's language.
    headline: postText(post, "h1", locale).slice(0, 110),
    description: postText(post, "description", locale),
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: post.datePublished,
    dateModified: post.dateModified,
    inLanguage: locale === "ar" ? "ar-OM" : "en-OM",
    isAccessibleForFree: true,
    author: {
      "@type": "Organization",
      "@id": absoluteUrl("/#organization"),
      name: SITE_NAME,
    },
    publisher: {
      "@type": "Organization",
      "@id": absoluteUrl("/#organization"),
      name: SITE_NAME,
    },
  };
}

/**
 * `ItemList` for the blog index — same order as on the page.
 *
 * `path`/`name` are passed by the category pages, which render their own
 * filtered list. Without them every category emitted the hub's `@id` and the
 * hub's name, so seven URLs each declared themselves to be the same node —
 * an `@id` is a global identifier, and a duplicated one invites a consumer to
 * merge or discard the lot.
 */
export function blogItemListJsonLd(
  locale = DEFAULT_LOCALE,
  list = postsInOrder,
  {
    path = "/blog",
    // Locale-aware, mirroring guidesItemListJsonLd. This defaulted to the
    // English `Blog — Autosouq.om` on every tree, so /ar/blog emitted an
    // English list name on a page whose visible H1 is Arabic — the only
    // English strings left in the Arabic graph.
    name = locale === "ar" ? `المدونة — ${SITE_NAME}` : `Blog — ${SITE_NAME}`,
  } = {},
) {
  const url = absoluteUrl(localizedPath(path, locale));
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${url}#itemlist`,
    name,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: list.length,
    itemListElement: list.map((post, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: postText(post, "h1", locale),
      url: absoluteUrl(localizedPath(blogPath(post.slug), locale)),
    })),
  };
}
