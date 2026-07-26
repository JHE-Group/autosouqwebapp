import { useTranslations } from "next-intl";
import React from "react";
import ListingsTable from "./ListingsTable";
import EmptyState from "./EmptyState";

/**
 * Seller dashboard.
 *
 * Every number on this page is counted from the listings rendered in the table
 * below it. The template shipped "32/50 remaining", "02 pending", "06
 * favorites" and "1.483 reviews" as literal text, plus a "Page Insights" chart
 * whose eleven data points were invented — none of it had a source. A seller
 * who trusts a fabricated view count is being lied to by the same site that
 * sells itself on honesty (NICHE.md), so the unsourced widgets are gone rather
 * than re-faked.
 *
 * There is deliberately no views / enquiries / earnings tile. Views would need
 * analytics nobody has wired up, and enquiries leave the site the moment the
 * buyer taps WhatsApp — we genuinely cannot count them, so we do not pretend
 * to. The three tiles below are the three states a listing can be in, and each
 * is `filter().length` over the rows on screen.
 *
 * Until auth and the seller listing API exist, this stays empty — demo catalogue
 * cars must never appear as "your listings".
 */
export default function DashBoard() {
  const tPage = useTranslations("dashboard.page");
  const tStat = useTranslations("dashboard.stat");
  const tList = useTranslations("dashboard.listings");
  const tRev = useTranslations("dashboard.reviews");
  const myListings = [];

  const soldCount = myListings.filter((car) => car.status === "Sold").length;
  const pendingCount = myListings.filter(
    (car) => car.status === "Pending",
  ).length;
  const liveCount = myListings.length - soldCount - pendingCount;
  const hasListings = myListings.length > 0;

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-12">
          <div className="content-area">
            <main id="main" className="main-content">
              <div className="tfcl-dashboard">
                <h1 className="admin-title">{tPage("dashboard")}</h1>

                {/* Three zeroes above an empty table is a scoreboard for a game
                    that has not started. With no listings the screen carries
                    one message and one action instead. */}
                {hasListings ? (
                  <div className="tfcl-dashboard-overview">
                    <div className="row">
                      <StatCard
                        tone="live"
                        label={tStat("live")}
                        value={liveCount}
                      />
                      <StatCard
                        tone="pending"
                        label={tStat("pending")}
                        value={pendingCount}
                      />
                      <StatCard
                        tone="sold"
                        label={tStat("sold")}
                        value={soldCount}
                      />
                    </div>
                  </div>
                ) : null}

                <div className="tfcl-dashboard-middle mt-2">
                  <div className="row">
                    <div className="tfcl-dashboard-middle-left col-md-12">
                      <ListingsTable
                        listings={myListings}
                        title={hasListings ? tList("yourListings") : undefined}
                      />
                    </div>
                  </div>
                </div>

                {/* Reviews follow sales, which follow listings. Showing a
                    seller with no cars an empty reviews panel gives them a
                    second thing they cannot act on. */}
                {hasListings ? (
                  <div className="tfcl-dashboard-middle-right">
                    <div className="tfcl-card tfcl-dashboard-reviews">
                      <h5>{tPage("reviews")}</h5>
                      {/* Was four named reviewers with stock avatars and lorem
                          ipsum bodies. There is no review data source, so this
                          is what a real seller sees on day one. */}
                      <EmptyState
                        icon="star"
                        title={tRev("emptyTitle")}
                        body={tRev("emptyBodyShort")}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ tone, label, value }) {
  return (
    <div className="col-sm-6 col-xl-4">
      <div className={`tfcl-card tfcl-stat tfcl-stat--${tone}`}>
        <div className="card-body">
          <div className="tfcl-icon-overview" aria-hidden="true">
            <StatIcon tone={tone} />
          </div>
          <div className="content-overview">
            <h5>{label}</h5>
            <div className="tfcl-dashboard-title">
              <span>
                <b>{value}</b>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Inline rather than three more /assets/images/dashboard/*.svg requests, and
 * `currentColor` so each icon takes the same colour as the status pill it
 * refers to — the tile and the row in the table below it read as one thing.
 */
const STAT_PATHS = {
  live: ["M4 12l5 5 11-11"],
  pending: ["M12 7v5l3 2", "M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z"],
  sold: [
    "M3 13h18M6 13V8a6 6 0 0 1 12 0v5",
    "M5 13h14l-1 7a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2l-1-7Z",
  ],
};

function StatIcon({ tone }) {
  const paths = STAT_PATHS[tone] ?? [];
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      {paths.map((d) => (
        <path
          key={d}
          d={d}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
