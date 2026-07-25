import { Link } from "@/i18n/navigation";
import React from "react";
import BulletList from "../_components/BulletList";
import DraftNotice from "../_components/DraftNotice";
import InfoShell from "../_components/InfoShell";

export const metadata = {
  title: "Privacy Policy",
  description:
    "What Autosouq.om does with your information when you browse used cars, list a car, or contact a seller in Oman. Plain-language draft pending legal review before launch.",
  // noindex until counsel signs this off. DraftNotice already tells a reader
  // this is not in force, but an indexed legal page carrying
  // "[COMPANY LEGAL NAME — TO CONFIRM]" is a trust problem the banner cannot
  // fix: it surfaces in search results stripped of its own disclaimer. Remove
  // this line in the same change that fills in the bracketed details.
  robots: { index: false, follow: true },
};

export default function page() {
  return (
    <InfoShell breadcrumb="Privacy Policy">
      <h1 className="mb-20">Privacy Policy</h1>
      <DraftNotice />

      <p className="font-2 fs-16 lh-26 mb-40">
        <strong>Effective date:</strong>{" "}
        <em>[EFFECTIVE DATE — TO CONFIRM AT LAUNCH]</em>
        <br />
        <strong>Last updated:</strong>{" "}
        <em>[LAST UPDATED DATE — TO CONFIRM AT LAUNCH]</em>
      </p>

      <h2 className="mb-20">1. Who is responsible for your information</h2>
      <p className="font-2 fs-16 lh-26 mb-30">
        Autosouq.om is operated by{" "}
        <em>[COMPANY LEGAL NAME — TO CONFIRM]</em>, registered at{" "}
        <em>[REGISTERED ADDRESS — TO CONFIRM]</em>. For anything about your
        information, write to <em>[PRIVACY CONTACT EMAIL — TO CONFIRM]</em> or
        use{" "}
        <Link className="fw-6" href="/contact">
          our contact page
        </Link>
        .
      </p>

      <h2 className="mb-20">2. The short version</h2>
      <p className="font-2 fs-16 lh-26 mb-30">
        You can browse cars without giving us anything. We ask for information
        when you list a car, send us a message, or subscribe to our emails. A
        seller&apos;s contact number is published on their listing, because
        that is how buyers reach them. We do not sell your information.
      </p>

      <h2 className="mb-20">3. What we collect</h2>

      <h3 className="fs-18 mb-2">Information you give us</h3>
      <BulletList
        items={[
          "If you list a car: your name, your Omani mobile number, the wilayat the car is in, and the car's details and photographs. Your number is published on the listing so buyers can WhatsApp you.",
          "If you contact us: your name, your email address and whatever you write in the message.",
          "If you subscribe to the newsletter: your email address.",
          "If you create an account: your sign-in details and anything you add to your profile.",
        ]}
      />

      <h3 className="fs-18 mb-2">Information collected automatically</h3>
      <BulletList
        items={[
          "Basic technical information your browser sends — IP address, device and browser type, and the pages you viewed.",
          "Approximate location, only if you allow it, so the map view can show cars near you.",
        ]}
      />
      <p className="font-2 fs-16 lh-26 mb-30">
        <em>
          [ANALYTICS AND ADVERTISING TOOLS — TO CONFIRM. List here every
          analytics, advertising or session-recording tool actually running on
          the site before launch, and what each one collects. Do not publish
          this section with the list empty.]
        </em>
      </p>

      <h2 className="mb-20">4. Why we use it</h2>
      <BulletList
        items={[
          "To publish listings and let buyers contact sellers.",
          "To check listings before they go live — that the price is in the band and that the listing is not misleading.",
          "To reply to your messages.",
          "To send you the newsletter, if you asked for it.",
          "To keep the site working, to fix problems, and to understand which pages people use.",
          "To detect and stop fraud, scams and abuse of the site.",
        ]}
      />

      <h2 className="mb-20">5. What is public</h2>
      <p className="font-2 fs-16 lh-26 mb-30">
        Anything on a listing is public: the car&apos;s details, your
        photographs, the price, the wilayat, and the contact number you gave us.
        Search engines can index it. Do not put anything in a listing that you
        would not want publicly visible. If you would rather your number was not
        published, please do not list a car — WhatsApp contact is how the site
        works.
      </p>

      <h2 className="mb-20">6. WhatsApp</h2>
      <p className="font-2 fs-16 lh-26 mb-30">
        Tapping the WhatsApp button opens WhatsApp with a message already
        written for you naming the car, its listed price and the listing link.
        The conversation happens inside WhatsApp, between you and the other
        person. It does not pass through Autosouq and we do not store or read
        it. What WhatsApp does with it is covered by WhatsApp&apos;s own privacy
        policy.
      </p>

      <h2 className="mb-20">7. Who else sees your information</h2>
      <p className="font-2 fs-16 lh-26 mb-20">
        We do not sell your information and we do not share it for other
        companies&apos; marketing. We do use service providers to run the site,
        and they handle information on our behalf:
      </p>
      <BulletList
        items={[
          "Our hosting and content platform, which stores listings and site content.",
          "Our email delivery provider, which sends contact-form and newsletter messages.",
          "Our mapping provider, which renders the map views.",
          "Any analytics provider we use — see the note in section 3.",
        ]}
      />
      <p className="font-2 fs-16 lh-26 mb-30">
        <em>
          [NAMED PROCESSORS AND WHERE THEY STORE DATA — TO CONFIRM. Replace the
          generic descriptions above with the actual providers, and say whether
          information is stored outside Oman, before launch.]
        </em>{" "}
        We may also disclose information where we are legally required to, or
        where it is necessary to investigate fraud or protect someone&apos;s
        safety.
      </p>

      <h2 className="mb-20">8. How long we keep it</h2>
      <p className="font-2 fs-16 lh-26 mb-30">
        We keep listing information while the listing is live and for a period
        afterwards, so that we can deal with disputes and repeat offenders.
        Messages you send us are kept while we deal with them. Newsletter
        subscriptions are kept until you unsubscribe.{" "}
        <em>
          [SPECIFIC RETENTION PERIODS — TO CONFIRM WITH LEGAL COUNSEL AND STATE
          HERE.]
        </em>
      </p>

      <h2 className="mb-20">9. Cookies and similar technology</h2>
      <p className="font-2 fs-16 lh-26 mb-30">
        Autosouq.om may use cookies and similar browser storage to keep the site
        working and to remember your preferences. Services embedded in the site,
        such as the maps, may set their own. Any analytics or advertising
        cookies belong in the list in section 3. You can block or delete cookies
        in your browser settings, though parts of the site may then not work.{" "}
        <em>
          [COOKIE LIST AND ANY CONSENT BANNER REQUIRED — TO CONFIRM BEFORE
          LAUNCH.]
        </em>
      </p>

      <h2 className="mb-20">10. Keeping information safe</h2>
      <p className="font-2 fs-16 lh-26 mb-30">
        We take reasonable steps to protect the information we hold. No website
        can promise perfect security, and we will not pretend otherwise. If you
        think your account has been misused, tell us straight away.
      </p>

      <h2 className="mb-20">11. Your choices</h2>
      <BulletList
        items={[
          "Ask us for a copy of the information we hold about you.",
          "Ask us to correct anything that is wrong.",
          "Ask us to delete your listing, your account, or your information — subject to anything we have to keep.",
          "Unsubscribe from the newsletter using the link in any email, or by asking us.",
          "Turn off location sharing in your browser at any time.",
        ]}
      />
      <p className="font-2 fs-16 lh-26 mb-30">
        Write to <em>[PRIVACY CONTACT EMAIL — TO CONFIRM]</em> and we will
        respond.{" "}
        <em>
          [RESPONSE TIMEFRAME AND ANY COMPLAINT OR REGULATOR ROUTE — TO CONFIRM
          WITH LEGAL COUNSEL.]
        </em>
      </p>

      <h2 className="mb-20">12. Children</h2>
      <p className="font-2 fs-16 lh-26 mb-30">
        Autosouq.om is meant for adults buying and selling cars. It is not
        directed at children, and we do not knowingly collect information from
        them.
      </p>

      <h2 className="mb-20">13. Changes to this policy</h2>
      <p className="font-2 fs-16 lh-26 mb-30">
        We may update this policy. The current version is always the one on this
        page, with the date at the top. If a change is significant we will make
        that clear on the site.
      </p>

      <h2 className="mb-20">14. Contact us</h2>
      <p className="font-2 fs-16 lh-26 mb-0">
        Questions about this policy: <em>[PRIVACY CONTACT EMAIL — TO CONFIRM]</em>
        , or use{" "}
        <Link className="fw-6" href="/contact">
          our contact page
        </Link>
        . See also our{" "}
        <Link className="fw-6" href="/terms">
          Terms &amp; Conditions
        </Link>
        .
      </p>
    </InfoShell>
  );
}
