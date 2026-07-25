/**
 * FAQ content for /faq.
 *
 * The template shipped 30 questions about "AutoDecar.com", every one answered
 * with the *same* boilerplate paragraph, plus a billing FAQ about invoices and
 * refunds and a developer FAQ about API integration — none of which describes
 * this business. Rewritten against NICHE.md.
 *
 * Rule for anything added here: state only what is actually true of Autosouq.
 * Where a question needs a business decision nobody has made yet — listing
 * fees, sale commission, the formal reporting channel — the question is LEFT
 * OUT rather than answered with a guess. A missing answer is a gap; an
 * invented one is the exact thing this marketplace exists to sell against.
 *
 * `features`, `toggleItems2` and `toggleItems3` used to live here as three more
 * blocks of lorem. Nothing imported them once the car-detail spec accordions
 * were rebuilt from real listing data, so they are gone rather than translated.
 */

// General — "About Autosouq".
export const toggleItems = [
  {
    title: "What is Autosouq.om?",
    content:
      "Autosouq is a marketplace for affordable used cars in Oman. Every car listed is between OMR 1,500 and 6,000 — the range most people here actually buy in. You browse, you check the details, and you message the seller directly on WhatsApp.",
  },
  {
    title: "Why is every car between OMR 1,500 and 6,000?",
    content:
      "Because that is the part of the market we know, and we would rather do one band properly than cover everything badly. A site that lists a 2,000 rial Corolla next to a 40,000 rial Land Cruiser ends up serving neither buyer well. Keeping to one band means the search, the prices and the advice all stay relevant to you.",
  },
  {
    title: "Do you ever list cars above OMR 6,000?",
    content:
      "No. Not as a promotion, not as an exception. If a car is worth more than 6,000 rials it belongs somewhere else, and we will say so.",
  },
  {
    title: "What does “sold as-is” mean?",
    content:
      "We accept a small number of cars between OMR 1,000 and 1,499, and every one of them carries a “sold as-is” label. It means the car is being sold in its current condition, faults included, and the seller is not fixing anything before the sale. It is not a warning that the car is bad — plenty of honest, inexpensive cars just need work. It is there so nobody is surprised.",
  },
  {
    title: "What does “verified” mean on a listing?",
    content:
      "It means we checked the listing before publishing it: that the details are internally consistent, that the price is a real asking price rather than bait, and that the seller is reachable on the number given. It is not a mechanical inspection and it is not a guarantee about the car. See the car yourself, and have it checked by a workshop you chose, before you pay anything.",
  },
  {
    title: "What is the difference between GCC spec and an import?",
    content:
      "A GCC-spec car was built for this region, with the cooling and trim suited to the heat and the dust. An imported car — most often from the United States — was built for a different climate, and any accident or flood history behind it is harder to trace once it is here. Neither is automatically bad, but they are not worth the same money, and buyers are often told an import is GCC spec. Every Autosouq listing says which it is, or says plainly that the seller has not told us.",
  },
  {
    title: "Is the price shown the real price?",
    content:
      "Yes. The number on the listing is the seller's asking price in Omani rials. There is no separate “on the road” price, no compulsory extras, and no car priced low just to make you call. If you find one that is not right, tell us and we will take it down.",
  },
  {
    title: "How do I contact a seller?",
    content:
      "Tap the WhatsApp button on the listing. It opens a message to that seller with the car and its listed price already filled in, so you both start from the same number. There is no account to create and no bidding.",
  },
];

// Buying and selling. Replaces the template's invoice / refund / accounting FAQ.
export const feeItems = [
  {
    title: "Do I need an account to browse or message a seller?",
    content:
      "No. Browsing is open and the WhatsApp button works without signing in. You only need an account to list a car of your own.",
  },
  {
    title: "Does Autosouq handle the money?",
    content:
      "No. Autosouq is a place to find the car and reach the seller — nothing more. Payment is arranged directly between you and the seller. We never ask a buyer to send a deposit through us, so if anyone claiming to be from Autosouq asks you to, it is not us.",
  },
  {
    title: "Who transfers the mulkiya?",
    content:
      "The buyer and seller do, between themselves, through the Royal Oman Police. Autosouq is not part of that process. Agree who is settling any outstanding fines before money changes hands — that is where most disputes start.",
  },
  {
    title: "How do I sell my car on Autosouq?",
    content:
      "List it from your dashboard: the car's details, honest mileage in kilometres, whether it is GCC spec or an import, and your asking price. The price has to be between OMR 1,500 and 6,000. Between 1,000 and 1,499 we will still take it, but it publishes with a “sold as-is” label.",
  },
  {
    title: "Why would a listing be rejected?",
    content:
      "Most often the price: above OMR 6,000 we cannot list the car at all. The other common reason is missing information — we will not publish a car without its mileage, or without saying whether it is GCC spec or an import.",
  },
];

// Safety and support. Replaces the template's API-integration FAQ.
export const supportItems = [
  {
    title: "What languages does Autosouq support?",
    content:
      "Arabic and English, equally. Nothing that matters is available in one language only.",
  },
  {
    title: "What should I check before buying?",
    content:
      "See the car in daylight. Check the chassis number on the car matches the mulkiya. Look for mismatched paint and uneven panel gaps, which suggest accident repair. Take it to a workshop you chose — not one the seller recommends — before you pay. And confirm there are no outstanding fines against the car.",
  },
  {
    title: "How do I know a seller is genuine?",
    content:
      "We check the seller is reachable on the number given before the listing goes live, and the WhatsApp thread stays between the two of you. Beyond that, judge them as you would at the souq: a seller who will not let you inspect the car, who pushes for a deposit before you have seen it, or whose story keeps changing, is telling you something.",
  },
  {
    title: "A listing looks wrong. What should I do?",
    content:
      "Tell us, and stop dealing with that seller until you hear back. Fake listings and bait prices are the reason this site exists, so we would far rather hear about one too many than one too few.",
  },
];
