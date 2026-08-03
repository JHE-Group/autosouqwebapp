// Single slide, deliberately. The template shipped a two-slide carousel of blank
// grey placeholders; one honest image costs a metered-data user ~240 KB instead
// of ~480 KB for a rotation nobody asked for. See design/brand/generate-hero.mjs.
export const slides = [{ imgSrc: "/assets/images/slider/hero-muscat-street.jpg" }];

// Hero copy rule for every export below: no invented inventory counts, no
// "world's largest database", no lorem. Say only what is true of Autosouq —
// the band, the disclosures, and the WhatsApp tap.
export const slides2 = [
  {
    imgSrc: "/assets/images/slider/slide3.jpg",
    heading: "Affordable used cars in Oman",
    subHeading: "Every car OMR 1,500 – 6,000. Nothing above.",
  },
  {
    imgSrc: "/assets/images/slider/slide4.jpg",
    heading: "The price you see is the real price",
    subHeading: "GCC spec or import, stated on every listing.",
  },
];

export const sliderData = [
  {
    imgSrc: "/assets/images/slider/slide4.jpg",
    imgAlt: "",
    heading: "Find your first car in Oman",
    description:
      "Affordable used cars from OMR 1,000 to 6,000 — in Muscat, Salalah,\n Sohar, Nizwa, Sur, Ibri and Barka.",
  },
  {
    imgSrc: "/assets/images/slider/slide5.jpg",
    imgAlt: "",
    heading: "One tap to the seller",
    description:
      "No sign-up, no bidding, no games. Message the seller on WhatsApp\n and arrange to see the car.",
  },
];

// No seller identity here: the theme's markup expects an author block, but we
// have no verified seller record for demo data, so the fields stay null the way
// `lib/strapi.js#toCar()` leaves them. `activeTime` is null for the same reason —
// a fabricated "3 hours ago" is a fake freshness signal.
export const slider3 = [
  {
    imgSrc: "/assets/images/slider/slide6.jpg",
    title: "2015 Toyota Corolla XLI",
    type: "Used car",
    speed: "216,000 km",
    authorImg: null,
    author: null,
    activeTime: null,
  },
  {
    imgSrc: "/assets/images/slider/slide2.jpg",
    title: "2018 Hyundai Tucson",
    type: "Used car",
    speed: "222,000 km",
    authorImg: null,
    author: null,
    activeTime: null,
  },
];

// The template filled this block with lorem ipsum and EV showroom stats
// (0–100 km/h, torque, star rating). None of that is knowable about a used car
// on a classifieds site, so the four tiles now carry the four things a buyer in
// this band actually asks first: price, mileage, spec origin, engine.
export const slides4 = [
  {
    imgSrc: "/assets/images/slider/slide7.jpg",
    title: "2015 Toyota Corolla XLI",
    description: `The most common first car in Oman, and the easiest to keep on the
      road — parts are everywhere and every workshop knows it.`,
    reserveLink: "#",
    specifications: [
      {
        title: "Price",
        value: "2,700 OMR",
        description: "No hidden fees",
        delay: "0ms",
      },
      {
        title: "Mileage",
        value: "216,000 km",
        description: "As shown on the odometer",
        delay: "100ms",
      },
      {
        title: "Spec",
        value: "GCC",
        description: "Not a US import",
        delay: "200ms",
      },
      {
        title: "Engine",
        value: "1.6L",
        description: "Petrol, automatic",
        delay: "300ms",
      },
    ],
    controllers: [
      {
        label1: "Message",
        label2: "on WhatsApp",
        iconClass: "icon-autodeal-plus1",
        delay: "0ms",
      },
      {
        label1: "See full",
        label2: "listing",
        iconClass: "icon-autodeal-view2",
        delay: "200ms",
      },
      {
        label1: "White",
        label2: "Four doors",
        iconClass: "icon-autodeal-red",
        delay: "400ms",
      },
    ],
  },
  {
    imgSrc: "/assets/images/slider/slide7.jpg",
    title: "2014 Mitsubishi Pajero 3.5",
    description: `A seven-seat 4WD inside the band — the usual choice when a family
      needs room and wants to get off the tarmac at the weekend.`,
    reserveLink: "#",
    specifications: [
      {
        title: "Price",
        value: "3,650 OMR",
        description: "No hidden fees",
        delay: "0ms",
      },
      {
        title: "Mileage",
        value: "230,000 km",
        description: "As shown on the odometer",
        delay: "100ms",
      },
      {
        title: "Spec",
        value: "GCC",
        description: "Not a US import",
        delay: "200ms",
      },
      {
        title: "Engine",
        value: "3.5L",
        description: "Petrol, automatic, 4WD",
        delay: "300ms",
      },
    ],
    controllers: [
      {
        label1: "Message",
        label2: "on WhatsApp",
        iconClass: "icon-autodeal-plus1",
        delay: "0ms",
      },
      {
        label1: "See full",
        label2: "listing",
        iconClass: "icon-autodeal-view2",
        delay: "200ms",
      },
      {
        label1: "Beige",
        label2: "Seven seats",
        iconClass: "icon-autodeal-red",
        delay: "400ms",
      },
    ],
  },
];

export const sliderSlides = [
  {
    subTitle: "Toyota",
    title: "Corolla 2015 XLI",
    imgSrc: "/assets/images/slider/slide8.png",
    width: 1204,
    height: 355,
  },
  {
    subTitle: "Nissan",
    title: "Sunny 2019",
    imgSrc: "/assets/images/slider/slide8.png",
    width: 1204,
    height: 355,
  },
];

export const slidesData = [
  {
    imgSrc: "/assets/images/slider/slide10.jpg",
    heading: "Affordable used cars in Oman",
    paragraph:
      "Every car between OMR 1,000 and 6,000 — the range most people in\n Oman actually buy in.",
    linkText: "View Detail",
    linkHref: "#",
  },
  {
    imgSrc: "/assets/images/slider/slide10.jpg",
    heading: "Verified listings, stated spec",
    paragraph:
      "We check listings, and every car says whether it is GCC spec or\n an import. No guessing.",
    linkText: "View Detail",
    linkHref: "#",
  },
];
