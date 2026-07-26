import { Link } from "@/i18n/navigation";
import React from "react";
import BlogCategoryNav from "@/components/blog/BlogCategoryNav";
import { blogItemListJsonLd } from "@/components/blog/blogJsonLd";
import SiteFooter from "@/components/footers/SiteFooter";
import Header2 from "@/components/headers/Header2";
import { P } from "@/components/guides/Prose";
import {
  blogPath,
  formatBlogDate,
  postCategory,
  postsInOrder,
  postText,
} from "@/data/blog";
import { categoryLabel } from "@/data/blog/categories";
import { breadcrumbJsonLd, jsonLdScript, pageMetadata } from "@/lib/seo";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  return pageMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/blog",
    locale,
  });
}

/**
 * Blog hub at /blog — editorial notes for the OMR 1,500–6,000 band.
 * Guides stay at /guides for evergreen YMYL procedure.
 */
export default async function BlogIndexPage({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  const crumb = await getTranslations({ locale, namespace: "breadcrumb" });

  return (
    <>
      <script
        type="application/ld+json"
        {...jsonLdScript(blogItemListJsonLd(locale))}
      />
      <script
        type="application/ld+json"
        {...jsonLdScript(
          breadcrumbJsonLd([
            { name: crumb("home"), path: `/${locale}` },
            { name: t("breadcrumb"), path: `/${locale}/blog` },
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
                  <span>{t("breadcrumb")}</span>
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
              <h1 className="hp-section-title">{t("h1")}</h1>
              <p className="hp-section-lede mb-0">{t("lede")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="tf-section3">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <BlogCategoryNav locale={locale} allLabel={t("allCategories")} />

              <ul className="hp-guides__list">
                {postsInOrder.map((post) => {
                  const category = postCategory(post);
                  return (
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
                        {category ? (
                          <>
                            {" · "}
                            {categoryLabel(category, locale)}
                          </>
                        ) : null}
                      </p>
                    </li>
                  );
                })}
              </ul>

              <P className="mt-40 mb-0">
                {t("guidesCrossLink")}{" "}
                <Link className="fw-6" href="/guides">
                  {t("guidesLink")}
                </Link>
                .
              </P>
            </div>
          </div>
        </div>
      </section>
      <SiteFooter locale={locale} />
    </>
  );
}
