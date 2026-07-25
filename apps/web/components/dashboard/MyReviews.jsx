import { useTranslations } from "next-intl";
import React from "react";
import EmptyState from "./EmptyState";

/**
 * /my-review
 *
 * This file previously contained ten fabricated reviews — named people
 * ("Bessie Cooper", "Ralph Edwards"…), stock portrait photographs used as their
 * avatars, five-star ratings on every one, and lorem ipsum for the review text.
 * There is no review data source anywhere in the app, so all of it was
 * invention presented as other people's opinions.
 *
 * That is disqualifying on this particular marketplace. NICHE.md's whole
 * argument is that OpenSooq and Dubizzle are full of fake sellers and fake
 * prices and Autosouq is not; a seller's dashboard that hands them ten
 * five-star reviews they never earned is the same fraud, aimed inward. Writing
 * more convincing fakes would make it worse, not better. The truthful screen
 * for a marketplace with no reviews yet is an empty one.
 */
export default function MyReviews() {
  const t = useTranslations("dashboard.reviews");
  const tPage = useTranslations("dashboard.page");
  return (
    <div className="container">
      <div className="row">
        <div className="col-md-12">
          <div className="content-area">
            <main id="main" className="main-content">
              <div className="tfcl-dashboard">
                <h1 className="admin-title mb-3">{tPage("reviews")}</h1>
                <div className="tfcl-dashboard-middle-right">
                  <div className="tfcl-card tfcl-dashboard-reviews">
                    <EmptyState
                      icon="star"
                      title={t("emptyTitle")}
                      body={t("emptyBody")}
                      actionHref="/my-listing"
                      actionLabel={t("emptyAction")}
                    />
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
