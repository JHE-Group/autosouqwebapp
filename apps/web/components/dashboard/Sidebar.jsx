"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link, usePathname } from "@/i18n/navigation";

/**
 * Dashboard navigation.
 *
 * Two changes of substance from the theme's version:
 *
 * 1. "Add a listing" is no longer the last item under "Change password". It is
 *    the primary action of the whole area — NICHE.md's binding constraint at
 *    launch is listing supply, not demand — so it sits above the menu as a
 *    filled button, not a row in a list of eight.
 * 2. The drawer no longer opens by hand-editing classList from a useEffect.
 *    Open state is owned by DashboardShell and passed in, so the overlay, the
 *    Escape key, a route change and the close button all agree about it, and
 *    the toggle can carry aria-expanded truthfully.
 *
 * Icons are stroke="currentColor" so the active row's ink colour flows into the
 * glyph. The theme wrapped every icon in `opacity="0.2"`, which on the indigo
 * panel rendered them all but invisible until hover.
 */
export default function Sidebar({ open = false, onClose = () => {}, closeRef }) {
  const t = useTranslations("dashboard");
  const pathname = usePathname();

  const isActive = (href) => pathname === href;

  const item = (href, label) => (
    <li key={href}>
      <Link
        href={href}
        className={isActive(href) ? "active" : ""}
        aria-current={isActive(href) ? "page" : undefined}
      >
        <Icon name={href} />
        {label}
      </Link>
    </li>
  );

  return (
    <>
      {/* Not a bare <div> any more: it closes the drawer, so it is a control
          with a name. Hidden from the tree entirely when the drawer is shut. */}
      <button
        type="button"
        className={`dashboard-overlay ${open ? "active" : ""}`}
        aria-label="Close menu"
        tabIndex={open ? 0 : -1}
        aria-hidden={open ? undefined : "true"}
        onClick={onClose}
      />
      <aside
        id="dashboard-sidebar"
        className={`sidebar-dashboard ${open ? "active" : ""}`}
        aria-label="Dashboard"
      >
        <div className="db-content db-logo pad-30">
          <Link href={`/`} title="Autosouq.om">
            {/* Sidebar is $brand-indigo #262262, so the cream wordmark with the
                terracotta mark is the readable lockup: cream on indigo is
                11.19:1 and terracotta on indigo is 4.76:1, both pass. Width and
                height keep the 2.89:1 viewBox ratio of the `-om-` lockup —
                reusing the old PNG's 432×76 would squash the mark. */}
            <Image
              className="site-logo"
              alt="Autosouq.om"
              src="/assets/images/brand/logo-horizontal-om-cream-terracotta.svg"
              width={220}
              height={76}
            />
          </Link>
          {/* Only rendered on mobile, where the sidebar is a drawer. */}
          <button
            type="button"
            ref={closeRef}
            className="db-close"
            onClick={onClose}
            aria-label="Close menu"
          >
            <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
              <path
                d="M5 5l10 10M15 5L5 15"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* The supply-side action, given the weight the business gives it.
            Ink on terracotta is 5.50:1; white would be 2.97:1 and fail. */}
        <div className="db-content db-primary-action">
          <Link
            href="/add-listing"
            className={`db-cta ${isActive("/add-listing") ? "active" : ""}`}
            aria-current={isActive("/add-listing") ? "page" : undefined}
          >
            <Icon name="/add-listing" />
            <span>{t("page.addListing")}</span>
          </Link>
          <p className="db-cta-note">
            Free to list. Cars from OMR 1,000 to 6,000.
          </p>
        </div>

        <div className="db-content db-author pad-30">
          <h6 className="db-title">Profile</h6>
          <div className="author">
            <div className="content">
              {/* Was a stock portrait plus "themesflat@gmail..." presented as
                  the signed-in account. There is no auth yet, so there is no
                  account to name. */}
              <div className="name">Not signed in</div>
              <Link href={`/my-profile`} className="author-position">
                View profile
              </Link>
            </div>
          </div>
        </div>

        <div className="db-content db-list-menu">
          <h6 className="db-title">Selling</h6>
          <nav className="db-dashboard-menu" aria-label="Selling">
            <ul>
              {item("/dashboard", "Dashboard")}
              {item("/my-listing", "My listings")}
              {item("/message", "Messages")}
              {item("/my-review", "Reviews")}
            </ul>
          </nav>

          <h6 className="db-title db-title-sub">Buying</h6>
          <nav className="db-dashboard-menu" aria-label="Buying">
            <ul>{item("/my-favorite", "Saved cars")}</ul>
          </nav>

          <h6 className="db-title db-title-sub">Account</h6>
          <nav className="db-dashboard-menu" aria-label="Account">
            <ul>
              {item("/my-profile", "Profile")}
              {/* The theme's last item was a dead "Logout" link. There is no
                  auth, so there is nothing to log out of. */}
              {item("/change-password", "Change password")}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
}

/* ------------------------------------------------------------------ icons -- */

const PATHS = {
  "/dashboard": [
    "M6.92479 9.35156V15.64",
    "M11.2021 6.34375V15.6412",
    "M15.4092 12.6758V15.6412",
    "M15.4619 1.83398H6.87143C3.87698 1.83398 2 3.95339 2 6.95371V15.0476C2 18.0479 3.86825 20.1673 6.87143 20.1673H15.4619C18.4651 20.1673 20.3333 18.0479 20.3333 15.0476V6.95371C20.3333 3.95339 18.4651 1.83398 15.4619 1.83398Z",
  ],
  "/my-listing": [
    "M10.0135 2.55687H6.58608C3.76733 2.55687 2 4.55245 2 7.37762V14.9988C2 17.824 3.75908 19.8195 6.58608 19.8195H14.6747C17.5027 19.8195 19.2617 17.824 19.2617 14.9988V11.3065",
    "M7.57059 10.0111L14.4208 3.16086C15.2743 2.30836 16.6575 2.30836 17.5109 3.16086L18.6265 4.27644C19.4799 5.12986 19.4799 6.51403 18.6265 7.36653L11.7433 14.2498C11.3702 14.6229 10.8642 14.8328 10.3362 14.8328H6.90234L6.98851 11.3678C7.00134 10.8581 7.20943 10.3723 7.57059 10.0111Z",
    "M13.3789 4.21875L17.5644 8.40425",
  ],
  "/my-favorite": [
    "M2.34088 10.6318C1.35729 7.56096 2.50679 4.05104 5.73071 3.01246C7.42654 2.46521 9.29838 2.78788 10.7082 3.84846C12.042 2.81721 13.9825 2.46888 15.6765 3.01246C18.9005 4.05104 20.0573 7.56096 19.0746 10.6318C17.5438 15.4993 10.7082 19.2485 10.7082 19.2485C10.7082 19.2485 3.92304 15.5561 2.34088 10.6318Z",
    "M14.375 6.14258C15.3558 6.45974 16.0488 7.33516 16.1322 8.36274",
  ],
  "/message": [
    "M17.6487 17.4814C14.8473 20.2831 10.699 20.8885 7.30422 19.3185C6.80306 19.1167 6.39219 18.9537 6.00159 18.9537C4.91361 18.9601 3.5594 20.015 2.85558 19.3121C2.15176 18.6082 3.20749 17.2529 3.20749 16.1583C3.20749 15.7677 3.05088 15.3641 2.84913 14.862C1.27843 11.4678 1.8846 7.31811 4.68607 4.51726C8.2623 0.939714 14.0725 0.939714 17.6487 4.51634C21.2314 8.09941 21.225 13.9047 17.6487 17.4814Z",
    "M14.7784 11.3802H14.7867",
    "M11.1026 11.3802H11.1109",
    "M7.42686 11.3802H7.43511",
  ],
  "/my-review": [
    "M16.5756 8.11328L12.5026 11.4252C11.7331 12.0357 10.6504 12.0357 9.88082 11.4252L5.77344 8.11328",
    "M15.6665 19.25C18.4544 19.2577 20.3333 16.9671 20.3333 14.1518V7.85584C20.3333 5.04059 18.4544 2.75 15.6665 2.75H6.66687C3.87897 2.75 2 5.04059 2 7.85584V14.1518C2 16.9671 3.87897 19.2577 6.66687 19.25H15.6665Z",
  ],
  "/my-profile": [
    "M10.5729 14.0684C7.02762 14.0684 4 14.6044 4 16.7511C4 18.8979 7.00841 19.4531 10.5729 19.4531C14.1183 19.4531 17.145 18.9162 17.145 16.7703C17.145 14.6245 14.1375 14.0684 10.5729 14.0684Z",
    "M10.5726 11.0056C12.8992 11.0056 14.7849 9.11897 14.7849 6.79238C14.7849 4.46579 12.8992 2.58008 10.5726 2.58008C8.24599 2.58008 6.3594 4.46579 6.3594 6.79238C6.35154 9.11111 8.22503 10.9977 10.5429 11.0056H10.5726Z",
  ],
  "/change-password": [
    "M19.0674 6.98797L18.4969 5.99788C18.0142 5.16012 16.9445 4.87111 16.1056 5.35181C15.7062 5.58705 15.2297 5.65379 14.7811 5.53732C14.3325 5.42084 13.9487 5.13071 13.7143 4.73091C13.5634 4.47679 13.4824 4.18735 13.4793 3.89186C13.4929 3.41811 13.3142 2.95902 12.9838 2.61918C12.6535 2.27935 12.1996 2.0877 11.7257 2.08789H10.5762C10.1119 2.08789 9.66669 2.27291 9.33915 2.60202C9.01161 2.93113 8.82873 3.3772 8.83096 3.84151C8.8172 4.80017 8.03609 5.57006 7.07733 5.56997C6.78184 5.5669 6.4924 5.48585 6.23828 5.33503C5.39937 4.85433 4.32967 5.14334 3.84698 5.9811L3.23447 6.98797C2.75236 7.82468 3.03743 8.89371 3.87215 9.37927C4.41473 9.69252 4.74897 10.2714 4.74897 10.898C4.74897 11.5245 4.41473 12.1034 3.87215 12.4166C3.03849 12.8989 2.75311 13.9654 3.23447 14.7996L3.81341 15.798C4.03958 16.2061 4.41904 16.5073 4.86783 16.6348C5.31662 16.7624 5.79774 16.7058 6.20472 16.4777C6.60481 16.2442 7.08157 16.1803 7.52904 16.3C7.97652 16.4197 8.35761 16.7133 8.58763 17.1154C8.73845 17.3695 8.8195 17.6589 8.82257 17.9544C8.82257 18.9229 9.60769 19.708 10.5762 19.708H11.7257C12.6909 19.708 13.4747 18.928 13.4793 17.9628C13.4771 17.497 13.6611 17.0497 13.9905 16.7203C14.3198 16.391 14.7672 16.2069 15.2329 16.2092C15.5277 16.2171 15.816 16.2978 16.072 16.4441C16.9087 16.9262 17.9777 16.6411 18.4633 15.8064L19.0674 14.7996C19.3013 14.3982 19.3654 13.9202 19.2457 13.4713C19.1261 13.0225 18.8324 12.6399 18.4297 12.4083C18.0271 12.1766 17.7334 11.794 17.6137 11.3452C17.494 10.8964 17.5582 10.4183 17.7921 10.017C17.9441 9.75146 18.1642 9.53133 18.4297 9.37927C19.2594 8.89397 19.5439 7.83119 19.0674 6.99636V6.98797Z",
    "M13.5713 10.8989C13.5713 12.2335 12.4894 13.3154 11.1548 13.3154C9.82022 13.3154 8.73828 12.2335 8.73828 10.8989C8.73828 9.5643 9.82022 8.48242 11.1548 8.48242C12.4894 8.48242 13.5713 9.5643 13.5713 10.8989Z",
  ],
  "/add-listing": [
    "M11 5.5V16.5M5.5 11H16.5",
    "M11 20.1673C16.0626 20.1673 20.1667 16.0632 20.1667 11.0007C20.1667 5.93804 16.0626 1.83398 11 1.83398C5.9374 1.83398 1.83334 5.93804 1.83334 11.0007C1.83334 16.0632 5.9374 20.1673 11 20.1673Z",
  ],
};

function Icon({ name }) {
  const paths = PATHS[name];
  if (!paths) return null;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={22}
      height={22}
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {paths.map((d) => (
        <path
          key={d}
          d={d}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
