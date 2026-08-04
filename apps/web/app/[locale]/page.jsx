import SiteFooter from "@/components/footers/SiteFooter";
import Header1 from "@/components/headers/Header1";
import Banner from "@/components/common/Banner";
import Cars from "@/components/common/Cars";
import Guides from "@/components/homes/home-1/Guides";
import Hero from "@/components/homes/home-1/Hero";
import ShopByBudget from "@/components/homes/home-1/ShopByBudget";
import TrustPromises from "@/components/homes/home-1/TrustPromises";
import { getBrowseData } from "@/lib/listingSource";
import { pageMetadata } from "@/lib/seo";
import { getTranslations } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { pickMessages } from "@/i18n/clientMessages";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.home" });
  return pageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/",
    locale,
    titleAbsolute: true,
  });
}

/**
 * The home page, in five sections, each answering the next question a
 * first-time visitor asks:
 *
 * 1. Hero — what is this, and what does it cost? (the band, up front)
 * 2. Trust promises — why should I believe you? (the four NICHE.md promises)
 * 3. Cars — what have you actually got?
 * 4. Guides — how do I avoid getting burned? (the brand voice, enacted)
 * 5. Banner — so which am I, a buyer or a seller?
 *
 * Four template sections were removed rather than restyled, because at ~10
 * listings each was either duplicating another or promising something that
 * does not exist:
 *
 * - `Filter` (the `FlatFilter` panel overlapping the hero) — a search form
 *   whose submit was `<a href="#">`, whose Make list was the theme's demo data
 *   (Audi, BMW, Dongfeng, Foton) rather than anything in the catalogue, and
 *   whose 25 feature checkboxes were bound to nothing. On a trust-led site the
 *   most prominent control on the front page cannot be one that does nothing.
 *   Real search belongs on /used-cars, and gets there once filter state
 *   lives in the URL.
 * - `Cars2` ("Recommended Used Cars For You") — rendered `source.slice(0, 4)`,
 *   i.e. the *same first four cars* the section above had already shown, and
 *   emitted them twice into the DOM (a static grid plus a Swiper copy, one of
 *   them hidden by a breakpoint). No price disclosure, no spec pill, no
 *   verification state, no WhatsApp tap — and a recommendation claim we have
 *   no way to earn.
 * - `Categories` — six brand logos from `data/categories.js`, every one
 *   labelled "271 Car" and linking to `#`. Invented inventory counts on the
 *   front page of a marketplace whose promise is that its numbers are real.
 * - `CarBrands` — a body-type carousel, every tile `href="#"`.
 *
 * What replaced them is one section that gets *stronger* when the catalogue is
 * small (the promises) and one that is indifferent to catalogue size (the
 * guides).
 */
export default async function Home({ params }) {
  const { locale } = await params;
  // Strapi first, demo fallback inside the components, same as the listing
  // pages. The home page used to render `data/cars.js` unconditionally, so the
  // real CMS listings — and the trust signals that only exist on them — never
  // appeared on it.
  /*
   * `getBrowseData`, not `getListings`, because the budget section needs both
   * halves separately: `listings` to render (demo fallback included, so the
   * grid is never bare) and `cms` to count from.
   *
   * Deliberately no `assertCmsAvailable` here. That guard is right on the facet
   * routes, where the alternative is caching a wrong 404 — but it throws, and
   * throwing on `/` would take the site's highest-authority page down for a
   * thirty-second CMS restart. The homepage degrades instead: with no real
   * inventory every band counts zero and renders as plain text, which is
   * honest, and the grid below still shows something.
   */
  const { listings, cms } = await getBrowseData(locale);
  return (
    <>
      <div className="header-fixed">
        <Header1 />
      </div>
      <main>
        <Hero listings={cms} locale={locale} />
        <TrustPromises />
        {/*
          The budget rungs moved INTO the hero and this section is gone.
          
          The note that stood here argued "is there anything at my number?" is
          only worth asking once we have said why to believe the prices. That
          holds for the trust promises — but the hero already makes the price
          claim itself («من 1,000 إلى 6,000 ر.ع»), so a priced way in belongs
          with the claim rather than two sections below it. As a standalone
          section it put the marketplace's main narrowing mechanism 2.25
          screens down a phone, behind 785px of promises.
          
          Not duplicated: ShopByBudget renders once, in `bare` mode, inside the
          hero panel.
        */}
        {/*
          `browse` reaches the browser only for this row.
          
          Cars now renders ListingCard, which is a Client Component reading
          `browse.card`. The root layout deliberately ships only `errorPage` —
          a namespace sent to a page that does not read it is bytes a buyer on
          metered data pays for — so without this the card would print raw key
          paths, which is exactly the defect the sell form shipped.
          
          Scoped to the section rather than added to the layout, so no other
          page on the site pays for it.
        */}
        <NextIntlClientProvider messages={await pickMessages("browse")}>
          <Cars listings={listings} locale={locale} />
        </NextIntlClientProvider>
        <Guides />
        <Banner />
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
