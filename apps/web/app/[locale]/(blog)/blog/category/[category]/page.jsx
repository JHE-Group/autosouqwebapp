import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import React from "react";
import BlogCategoryNav from "@/components/blog/BlogCategoryNav";
import { blogItemListJsonLd } from "@/components/blog/blogJsonLd";
import SiteFooter from "@/components/footers/SiteFooter";
import Header2 from "@/components/headers/Header2";
import { P } from "@/components/guides/Prose";
import {
  blogPath,
  categoryHasPosts,
  formatBlogDate,
  postsForCategory,
  postText,
} from "@/data/blog";
import {
  blogCategoriesInOrder,
  blogCategoryPath,
  categoryLabel,
  getBlogCategory,
} from "@/data/blog/categories";
import { breadcrumbJsonLd, jsonLdScript, pageMetadata } from "@/lib/seo";
import { getTranslations } from "next-intl/server";

export const dynamicParams = false;

export function generateStaticParams() {
  return blogCategoriesInOrder.map((category) => ({
    category: category.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { category: categorySlug, locale } = await params;
  const category = getBlogCategory(categorySlug);
  if (!category) return {};
  const name = categoryLabel(category, locale);
  const description =
    locale === "ar" ? category.description.ar : category.description.en;

  return pageMetadata({
    title: `${name} — Autosouq blog`,
    description,
    path: blogCategoryPath(category.slug),
    locale,
    // A category with nothing in it is a heading over an empty page. Keep it
    // reachable and followed, but do not ask for it to be indexed — see
    // `categoryHasPosts()`, which the sitemap and the nav read too.
    ...(categoryHasPosts(category.slug)
      ? {}
      : { robots: { index: false, follow: true } }),
  });
}

export default async function BlogCategoryPage({ params }) {
  const { category: categorySlug, locale } = await params;
  const category = getBlogCategory(categorySlug);
  if (!category) notFound();

  const t = await getTranslations({ locale, namespace: "blog" });
  const crumb = await getTranslations({ locale, namespace: "breadcrumb" });
  const name = categoryLabel(category, locale);
  const description =
    locale === "ar" ? category.description.ar : category.description.en;
  const list = postsForCategory(category.slug);

  return (
    <>
      <script
        type="application/ld+json"
        {...jsonLdScript(
          blogItemListJsonLd(locale, list, {
            path: blogCategoryPath(category.slug),
            name: `${name} — Autosouq blog`,
          }),
        )}
      />
      <script
        type="application/ld+json"
        {...jsonLdScript(
          breadcrumbJsonLd([
            { name: crumb("home"), path: `/${locale}` },
            { name: t("breadcrumb"), path: `/${locale}/blog` },
            {
              name,
              path: `/${locale}${blogCategoryPath(category.slug)}`,
            },
          ]),
        )}
      />
      <div className="header-fixed">
        <Header2 />
      </div>
      <section className="flat-title mb-40">
        <div className="container2">
          <div className="row">
            <div className="col-lg-12">
              <div className="title-inner style">
                <div className="title-group fs-12">
                  <Link className="home fw-6 text-color-3" href="/">
                    {crumb("home")}
                  </Link>
                  <Link className="home fw-6 text-color-3" href="/blog">
                    {t("breadcrumb")}
                  </Link>
                  <span>{name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="hp-band hp-band--cream blog-intro">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <p className="blog-intro__brand">{t("brand")}</p>
              <h1 className="hp-section-title">{name}</h1>
              <p className="hp-section-lede mb-0">{description}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="tf-section3">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <BlogCategoryNav
                locale={locale}
                activeSlug={category.slug}
                allLabel={t("allCategories")}
              />

              {list.length === 0 ? (
                <P className="mb-0">{t("emptyCategory")}</P>
              ) : (
                <ul className="hp-guides__list">
                  {list.map((post) => (
                    <li key={post.slug} className="hp-guide">
                      <h2 className="hp-guide__title">
                        <Link href={blogPath(post.slug)}>
                          {postText(post, "h1", locale)}
                        </Link>
                      </h2>
                      <p className="hp-guide__summary">
                        {postText(post, "summary", locale)}
                      </p>
                      <p className="font-2 fs-14 lh-24 mb-0">
                        <time dateTime={post.datePublished}>
                          {formatBlogDate(post.datePublished, locale)}
                        </time>
                      </p>
                    </li>
                  ))}
                </ul>
              )}

              <P className="mt-40 mb-0">
                <Link className="fw-6" href="/blog">
                  {t("allPosts")}
                </Link>
              </P>
            </div>
          </div>
        </div>
      </section>
      <SiteFooter locale={locale} />
    </>
  );
}
