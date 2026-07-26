import { useTranslations } from "next-intl";
import React from "react";
import EmptyState from "./EmptyState";

/**
 * Saved cars. Empty until auth + a saved-listings API exist — never present
 * the demo catalogue as the buyer's favourites.
 */
export default function MyFavourite() {
  const t = useTranslations("dashboard.saved");
  const tPage = useTranslations("dashboard.page");

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-12">
          <div className="content-area">
            <main id="main" className="main-content">
              <div className="tfcl-dashboard">
                <h1 className="admin-title mb-3">{tPage("savedCars")}</h1>
                <div className="tfcl-favorite-listing">
                  <EmptyState
                    icon="heart"
                    title={t("emptyTitle")}
                    body={t("emptyBody")}
                    actionHref="/listing-grid"
                    actionLabel={t("emptyAction")}
                  />
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
