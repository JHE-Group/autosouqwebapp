import { notFound } from "next/navigation";
import React from "react";
import GuideShell from "@/components/guides/GuideShell";
import { guideArticleJsonLd } from "@/components/guides/guideJsonLd";
import { GuideBody, hasGuideBody } from "@/components/guides/posts";
import { getGuide, guidePath, guides } from "@/data/guides";
import { breadcrumbJsonLd, jsonLdScript, pageMetadata } from "@/lib/seo";

/**
 * A single guide at /guides/[slug].
 *
 * URL shape, and why it is not locale-prefixed yet
 * ------------------------------------------------
 * design/research/blog-keyword-briefs.md §2 recommends `/guides/[slug]` over
 * `/blog/[slug]` — these are evergreen reference pages, and "guide" is the
 * honest label for them — and further recommends symmetric locale prefixes
 * (`/en/guides/…` and `/ar/adilla/…`) so that neither language is encoded as
 * the default.
 *
 * The prefix half is not implemented here, deliberately. The rest of the app is
 * unprefixed (`/listing-grid`, `/faq`, `/how-it-works`), there is no `[locale]`
 * segment, and lib/seo.js documents at length why hreflang must not ship before
 * that routing lands: an `ar-OM` annotation pointing at a URL that serves
 * English is not a partial win, it is a wrong signal. Shipping guides alone at
 * `/en/guides/…` would create a second, contradictory URL convention inside one
 * site, still with no Arabic tree to point at, and would need migrating anyway
 * when the locale segment arrives. When it does, these move with everything
 * else — one redirect rule for the whole site rather than one for the guides.
 *
 * Static by construction: five known slugs, no data fetching, no client
 * JavaScript. `dynamicParams = false` means anything else is a 404 at the
 * routing layer rather than a rendered page.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};

  return pageMetadata({
    title: guide.title,
    description: guide.description,
    path: guidePath(guide.slug),
    type: "article",
  });
}

export default async function GuidePage({ params }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  // Both halves must exist: a registry entry without a body would render a
  // headline over an empty page, which is the one failure mode worth a 404.
  if (!guide || !hasGuideBody(slug)) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        {...jsonLdScript(guideArticleJsonLd(guide))}
      />
      <script
        type="application/ld+json"
        {...jsonLdScript(
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Guides", path: "/guides" },
            { name: guide.h1, path: guidePath(guide.slug) },
          ])
        )}
      />
      <GuideShell guide={guide}>
        <GuideBody slug={slug} />
      </GuideShell>
    </>
  );
}
