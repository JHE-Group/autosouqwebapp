import React from "react";
import { Link } from "@/i18n/navigation";
import ListingsTable from "./ListingsTable";
import { useTranslations } from "next-intl";

/**
 * /my-listing — the same table as the dashboard, so it now shares the same
 * component rather than keeping a second copy of it. The template's "16 results
 * found" was a literal string that never matched the five rows underneath;
 * ListingsTable counts the array it is given.
 *
 * Rows come from the page, which reads them server-side via
 * `/api/seller/listings` — scoped by the session token, so a seller sees their
 * own cars and only those. Drafts are included and marked pending: a listing
 * awaiting review is the state a seller most wants to see, and hiding it would
 * read as the submission having been lost.
 *
 * Still never demo inventory. The default is `[]`, not a sample.
 */
export default function MyListings({ listings = [], loaded = true, now }) {
  const t = useTranslations("dashboard");
  const myListings = listings;

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-12">
          <div className="content-area">
            <main id="main" className="main-content">
              <div className="tfcl-dashboard">
                <div className="tfcl-page-head">
                  <h1 className="admin-title">{t("page.myListings")}</h1>
                  {/* The action that matters on this page, reachable without
                      opening the drawer on a phone. Hidden when the list is
                      empty, because the empty state already leads with it. */}
                  {myListings.length > 0 ? (
                    <Link href="/add-listing" className="pre-btn">
                      Add a listing
                    </Link>
                  ) : null}
                </div>
                <div className="tfcl-dashboard-middle mt-2">
                  <div className="row">
                    <div className="tfcl-dashboard-middle-left col-md-12">
                      <ListingsTable loaded={loaded} now={now} listings={myListings} />
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
