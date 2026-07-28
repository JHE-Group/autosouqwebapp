import { notFound } from "next/navigation";
import React from "react";
import BlogShell from "@/components/blog/BlogShell";
import { blogArticleJsonLd } from "@/components/blog/blogJsonLd";
import { BlogBody, hasBlogBody } from "@/components/blog/posts";
import { blogPath, getPost, postText, posts } from "@/data/blog";
import { getTranslations } from "next-intl/server";
import { breadcrumbJsonLd, jsonLdScript, pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const { slug, locale } = await params;
  const post = getPost(slug);
  if (!post) return {};

  return pageMetadata({
    title: postText(post, "title", locale),
    description: postText(post, "description", locale),
    path: blogPath(post.slug),
    locale,
    type: "article",
  });
}

export default async function BlogPostPage({ params }) {
  const { slug, locale } = await params;
  const post = getPost(slug);
  if (!post || !hasBlogBody(slug)) notFound();

  const crumb = await getTranslations({ locale, namespace: "breadcrumb" });

  return (
    <>
      <script
        type="application/ld+json"
        {...jsonLdScript(blogArticleJsonLd(post, locale))}
      />
      <script
        type="application/ld+json"
        {...jsonLdScript(
          breadcrumbJsonLd([
            { name: crumb("home"), path: `/${locale}` },
            { name: crumb("blog"), path: `/${locale}/blog` },
            {
              name: postText(post, "h1", locale),
              path: `/${locale}${blogPath(post.slug)}`,
            },
          ]),
        )}
      />
      <BlogShell post={post} locale={locale}>
        <BlogBody slug={slug} locale={locale} />
      </BlogShell>
    </>
  );
}
