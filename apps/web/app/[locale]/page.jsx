import SiteFooter from "@/components/footers/SiteFooter";
import Header1 from "@/components/headers/Header1";
import Banner from "@/components/common/Banner";
import Cars from "@/components/common/Cars";
import Guides from "@/components/homes/home-1/Guides";
import Hero from "@/components/homes/home-1/Hero";
import TrustPromises from "@/components/homes/home-1/TrustPromises";
import { getListings } from "@/lib/strapi";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return pageMetadata({
    title: "Autosouq.om — Affordable used cars in Oman",
    description:
      "Oman's marketplace for affordable used cars, OMR 1,500–6,000. Real prices, verified listings, GCC spec or import stated, one WhatsApp tap to the seller.",
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
  const listings = await getListings(locale);
  return (
    <>
      <div className="header-fixed">
        <Header1 />
      </div>
      <main>
        <Hero />
        <TrustPromises />
        <Cars listings={listings} locale={locale} />
        <Guides />
        <Banner />
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
