import React from "react";
import { Link } from "@/i18n/navigation";
import { cars } from "@/data/cars";
import ListingsTable from "./ListingsTable";

/**
 * /my-listing — the same table as the dashboard, so it now shares the same
 * component rather than keeping a second copy of it. The template's "16 results
 * found" was a literal string that never matched the five rows underneath;
 * ListingsTable counts the array it is given.
 */
export default function MyListings() {
  // Stands in for the signed-in seller's listings until auth and the CMS
  // listing API are wired up. Set to [] to see the empty state, which is what
  // a new seller actually gets.
  const myListings = cars.slice(0, 5);

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-12">
          <div className="content-area">
            <main id="main" className="main-content">
              <div className="tfcl-dashboard">
                <div className="tfcl-page-head">
                  <h1 className="admin-title">My listings</h1>
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
                      <ListingsTable listings={myListings} />
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
