import { Link } from "@/i18n/navigation";
import { liveBlogCategories } from "@/data/blog";
import { blogCategoryPath, categoryLabel } from "@/data/blog/categories";

/**
 * Text-link category row — not pills. Active category uses accent text.
 *
 * Only categories that have posts are listed: linking an empty one from every
 * blog page is what turns a placeholder taxonomy entry into a crawled page.
 */
export default function BlogCategoryNav({
  activeSlug = null,
  locale = "en",
  allLabel = "All",
}) {
  return (
    <nav className="blog-cats" aria-label="Blog categories">
      <Link
        href="/blog"
        className={`blog-cats__link${activeSlug == null ? " is-active" : ""}`}
      >
        {allLabel}
      </Link>
      {liveBlogCategories.map((category) => (
        <Link
          key={category.slug}
          href={blogCategoryPath(category.slug)}
          className={`blog-cats__link${
            activeSlug === category.slug ? " is-active" : ""
          }`}
        >
          {categoryLabel(category, locale)}
        </Link>
      ))}
    </nav>
  );
}
