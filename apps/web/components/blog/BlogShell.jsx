import { Link } from "@/i18n/navigation";
import React from "react";
import SiteFooter from "@/components/footers/SiteFooter";
import Header2 from "@/components/headers/Header2";
import { P } from "@/components/guides/Prose";
import {
  blogCategoryPath,
  categoryLabel,
} from "@/data/blog/categories";
import { formatBlogDate, postCategory, postText } from "@/data/blog";
import { getTranslations } from "next-intl/server";

/**
 * Furniture for a single blog post — same column and chrome as GuideShell,
 * blog breadcrumbs and category meta instead of ROP verification stamps.
 */
export default async function BlogShell({ post, children, locale = "en" }) {
  const t = await getTranslations({ locale, namespace: "blogPost" });
  const crumb = await getTranslations({ locale, namespace: "breadcrumb" });
  const h1 = postText(post, "h1", locale);
  const published = formatBlogDate(post.datePublished, locale);
  const modified = formatBlogDate(post.dateModified, locale);
  const category = postCategory(post);
  const catName = categoryLabel(category, locale);

  return (
    <>
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
                    {crumb("blog")}
                  </Link>
                  <span>{h1}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="tf-section3">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <article>
                <h1 className="mb-20">{h1}</h1>
                <p className="blog-post-meta font-2 fs-14 lh-24 mb-40">
                  {t("published")}{" "}
                  <time dateTime={post.datePublished}>{published}</time>
                  {modified && modified !== published ? (
                    <>
                      {` · ${t("updated")} `}
                      <time dateTime={post.dateModified}>{modified}</time>
                    </>
                  ) : null}
                  {category ? (
                    <>
                      {" · "}
                      <Link
                        className="fw-6"
                        href={blogCategoryPath(category.slug)}
                      >
                        {catName}
                      </Link>
                    </>
                  ) : null}
                </p>

                {children}

                <div className="mt-40 pt-4 border-top">
                  <P className="mb-20">
                    {t("disclaimerLead")}{" "}
                    <Link className="fw-6" href="/guides">
                      {t("guidesWord")}
                    </Link>{" "}
                    {t("disclaimerAnd")}{" "}
                    <a
                      className="fw-6"
                      href="https://www.rop.gov.om/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t("rop")}
                    </a>
                    . {t("disclaimerBand")}
                  </P>
                  <P className="mb-0">
                    <Link className="fw-6" href="/blog">
                      {t("allPosts")}
                    </Link>{" "}
                    ·{" "}
                    <Link className="fw-6" href="/used-cars">
                      {t("browseCars")}
                    </Link>{" "}
                    ·{" "}
                    <Link className="fw-6" href="/guides">
                      {t("guides")}
                    </Link>
                  </P>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>
      <SiteFooter locale={locale} />
    </>
  );
}
