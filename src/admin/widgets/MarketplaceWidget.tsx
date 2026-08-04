import * as React from "react";
import { Widget, useFetchClient } from "@strapi/admin/strapi-admin";
import { Box, Flex, Typography } from "@strapi/design-system";
import { Link } from "react-router-dom";

/**
 * What is happening in the marketplace right now.
 *
 * ## Why this is not the built-in "Key statistics" widget
 *
 * That widget calls `/content-manager/homepage/count-documents`, which sums
 * every content type the admin can read. On the development database it reports
 * about 159 published documents — of which 145 are reference taxonomy (69 car
 * models, 24 cities, 23 makes, 12 features…) and 14 are actual cars. An owner
 * would read "159 published" on a marketplace with 14 live listings. On
 * production, where inventory is zero, it would still report over a hundred.
 * That is worse than showing nothing, so this replaces it rather than sitting
 * beside it.
 *
 * ## Every number here is a decision, not a statistic
 *
 * There is no demand-side data in this system at all — no analytics, no event
 * table, no lead record — so views, clicks and conversion are not merely hard,
 * they are uncomputable. Every metric is therefore supply-side, and each row
 * below answers "what should I do today", in the order that matters:
 *
 *   1. cars waiting for a decision — inaction here withholds supply, and
 *      supply is the binding constraint at launch
 *   2. edits to already-live cars — invisible in the default list view; the
 *      seller thinks they changed the price and the buyer still sees the old one
 *   3. showroom applications — one dealer is worth many private sellers
 *   4. live cars with no photograph — the biggest conversion problem there is
 *
 * Counts link into the content manager rather than listing the cars here. That
 * is deliberate and it is a privacy decision, not a layout one: the queue is by
 * definition DRAFTS, whose phone number, address, coordinates and VIN are not
 * public, and this endpoint has no sanitization layer. The content manager
 * already knows how to redact and already enforces per-role visibility. See the
 * docblock in src/metrics/controller.ts.
 */

type Metrics = {
  queue: {
    awaitingFirstReview: number;
    editsAwaitingReview: number;
    showroomsPending: number;
  };
  inventory: {
    liveTotal: number;
    liveAvailable: number;
    liveNotAvailable: number;
    liveAvailableWithPhotos: number;
    liveAvailableNoPhotos: number;
  };
  quality: {
    unverified: number;
    specUnstated: number;
    stale: number;
    staleAfterDays: number;
    outOfBand: number;
  };
  supply: {
    newSubmissions7d: number;
    sellersTotal: number;
    sellersNew7d: number;
    showroomsApproved: number;
  };
};

/**
 * Deep links into the content manager, so a number is somewhere to go.
 *
 * `status=draft` is the content manager's own filter for the draft view; the
 * combination below is what its URL looks like after you click through by hand.
 */
const LISTINGS = "/content-manager/collection-types/api::listing.listing";
const QUEUE_LINK = `${LISTINGS}?page=1&pageSize=50&sort=createdAt:ASC&status=draft`;
const SHOWROOM_LINK = "/content-manager/collection-types/api::showroom.showroom";

function Row({
  label,
  value,
  href,
  tone = "neutral",
  hint,
}: {
  label: string;
  value: number | string;
  href?: string;
  tone?: "neutral" | "attention" | "good";
  hint?: string;
}) {
  /*
   * Colour is never the only carrier: the label says what the number is and the
   * hint says what to do about it. The tone only adds emphasis for someone who
   * can see it.
   */
  const colour =
    tone === "attention"
      ? "warning600"
      : tone === "good"
        ? "success600"
        : "neutral800";

  const number = (
    <Typography variant="beta" textColor={colour} fontWeight="bold">
      {value}
    </Typography>
  );

  return (
    <Flex justifyContent="space-between" alignItems="start" gap={4} width="100%">
      <Flex direction="column" alignItems="start" gap={0}>
        <Typography variant="omega" textColor="neutral800">
          {label}
        </Typography>
        {hint ? (
          <Typography variant="pi" textColor="neutral600">
            {hint}
          </Typography>
        ) : null}
      </Flex>
      {href ? (
        <Link to={href} style={{ textDecoration: "none" }}>
          {number}
        </Link>
      ) : (
        number
      )}
    </Flex>
  );
}

export function MarketplaceWidget() {
  const { get } = useFetchClient();
  const [state, setState] = React.useState<
    { status: "loading" } | { status: "error" } | { status: "ok"; data: Metrics }
  >({ status: "loading" });

  React.useEffect(() => {
    let alive = true;
    // Typed through the generic rather than asserted on the callback: the
    // fetch client returns FetchResponse<unknown>, so a cast on the handler
    // compiles while telling TypeScript nothing useful.
    get<{ data: Metrics }>("/autosouq/metrics")
      .then((res) => {
        if (alive) setState({ status: "ok", data: res.data.data });
      })
      .catch(() => {
        if (alive) setState({ status: "error" });
      });
    return () => {
      alive = false;
    };
  }, [get]);

  if (state.status === "loading") return <Widget.Loading />;
  if (state.status === "error") return <Widget.Error />;

  const { queue, inventory, quality } = state.data;

  /*
   * The empty state is a real state here, not a placeholder.
   *
   * Production currently has zero listings, so "nothing waiting" will be true
   * for a while — and a widget that renders a column of zeros reads as broken.
   * Widget.NoData says it plainly instead.
   */
  const nothingAtAll =
    inventory.liveTotal === 0 &&
    queue.awaitingFirstReview === 0 &&
    queue.showroomsPending === 0;

  if (nothingAtAll) {
    return <Widget.NoData>No listings yet</Widget.NoData>;
  }

  return (
    <Flex direction="column" alignItems="stretch" gap={3} width="100%">
      <Row
        label="Waiting for review"
        hint={queue.awaitingFirstReview ? "Nobody sees these until you publish" : undefined}
        value={queue.awaitingFirstReview}
        href={QUEUE_LINK}
        tone={queue.awaitingFirstReview > 0 ? "attention" : "neutral"}
      />
      <Row
        label="Edited since going live"
        hint={
          queue.editsAwaitingReview
            ? "Buyers still see the old version"
            : undefined
        }
        value={queue.editsAwaitingReview}
        href={LISTINGS}
        tone={queue.editsAwaitingReview > 0 ? "attention" : "neutral"}
      />
      <Row
        label="Showroom applications"
        value={queue.showroomsPending}
        href={SHOWROOM_LINK}
        tone={queue.showroomsPending > 0 ? "attention" : "neutral"}
      />

      <Box paddingTop={2} paddingBottom={2}>
        <Box height="1px" background="neutral150" />
      </Box>

      <Row
        label="Live and buyable"
        hint={`of ${inventory.liveAvailable} available — the rest have no photo`}
        value={inventory.liveAvailableWithPhotos}
        href={LISTINGS}
        tone={inventory.liveAvailableWithPhotos > 0 ? "good" : "attention"}
      />
      <Row
        label="Live with no photo"
        hint={
          inventory.liveAvailableNoPhotos
            ? "Cars with photos sell — chase these first"
            : undefined
        }
        value={inventory.liveAvailableNoPhotos}
        href={LISTINGS}
        tone={inventory.liveAvailableNoPhotos > 0 ? "attention" : "neutral"}
      />
      <Row
        label="Unverified on the card"
        hint={quality.unverified ? 'Buyers are shown "not checked yet"' : undefined}
        value={quality.unverified}
        href={LISTINGS}
        tone={quality.unverified > 0 ? "attention" : "neutral"}
      />
      <Row
        label={`Not confirmed in ${quality.staleAfterDays} days`}
        value={quality.stale}
        href={LISTINGS}
        tone={quality.stale > 0 ? "attention" : "neutral"}
      />

      {/* Should be zero forever: a lifecycle hook derives the as-is flag from
          the price on every write, so anything here means someone edited the
          database directly. Shown only when it fires, so it stays alarming. */}
      {quality.outOfBand > 0 ? (
        <Row
          label="Priced outside the band"
          hint="This should be impossible — check the database"
          value={quality.outOfBand}
          href={LISTINGS}
          tone="attention"
        />
      ) : null}
    </Flex>
  );
}
