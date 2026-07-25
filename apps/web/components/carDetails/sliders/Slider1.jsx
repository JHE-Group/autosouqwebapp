"use client";
import React, { useEffect, useState } from "react";
import { EffectFade, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import Image from "next/image";
import {
  galleryImages,
  placeholderNotice,
  placeholderTag,
  PLACEHOLDER_NOTICE_BAR_STYLE,
  PLACEHOLDER_TAG_STYLE,
} from "./gallery";
import { DEFAULT_LOCALE } from "@/lib/locale";

function InfoGlyph() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0, marginTop: 1, color: "#B45309" }}
    >
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 7.4v3.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="8" cy="5.1" r="0.9" fill="currentColor" />
    </svg>
  );
}

export default function Slider1({ carItem, locale = DEFAULT_LOCALE }) {
  // At this price band photos are the only condition evidence, so a buyer will
  // look at all of them — and on a phone, arrows alone do not say how many are
  // left. The counter below gives "3 / 9".
  const [active, setActive] = useState(0);

  const swiperOptions = {
    slidesPerView: 1,
    speed: 500,
    effect: "fade",
    fadeEffect: { crossFade: true },
    navigation: { nextEl: ".snbn1", prevEl: ".snbp1" },
  };

  // The listing's own photos — never the theme's showroom stock.
  const images = galleryImages(carItem);
  const notice = placeholderNotice(carItem, locale);
  const tag = placeholderTag(carItem, locale);

  useEffect(() => {
    const lightbox = new PhotoSwipeLightbox({
      gallery: "#my-gallery",
      children: ".image",
      pswpModule: () => import("photoswipe"),
    });
    lightbox.init();
    return () => {
      lightbox.destroy();
    };
  }, []);

  if (!images.length) return null;

  return (
    <div className="mb-40">
      {/* `position: relative` so the counter and the placeholder tag pin to the
          frame rather than to a slide — a tag inside a slide fades in and out
          with the crossfade, which is exactly the wrong behaviour for a
          disclosure. */}
      <div style={{ position: "relative" }}>
        <Swiper
          {...swiperOptions}
          modules={[Navigation, EffectFade]}
          className="swiper mainslider slider home"
          id="my-gallery"
          onSlideChange={(swiper) => setActive(swiper.realIndex)}
        >
          {images.map((img, i) => (
            <SwiperSlide key={i} className="swiper-slide">
              <div className="image-list-details">
                <a
                  href={img.src}
                  data-pswp-width={img.width ?? 1245}
                  data-pswp-height={img.height ?? 701}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="image"
                >
                  <Image
                    className="lazyload"
                    alt={img.alt || carItem?.title || ""}
                    src={img.src}
                    width={img.width ?? 1245}
                    height={img.height ?? 701}
                    // The gallery is the widest image on the page: full
                    // viewport width on a phone, two thirds of the container on
                    // desktop. Without `sizes` the optimiser has to assume
                    // 100vw everywhere and a 360px phone pays for the
                    // desktop-sized file over metered data.
                    sizes="(max-width: 991px) 100vw, 730px"
                    priority={i === 0}
                  />
                </a>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {tag && <span style={PLACEHOLDER_TAG_STYLE}>{tag}</span>}

        {images.length > 1 && (
          <>
            <div className="swiper-button-next style-3 snbn1" />
            <div className="swiper-button-prev style-3 snbp1" />
            <div
              // Ink #231F20 on rgba(255,255,255,.92): 16.30:1 over a white
              // frame and still 13.67:1 where the panel sits over a black one,
              // so it never depends on the picture behind it. Logical insets
              // keep it in the trailing corner under dir="rtl".
              style={{
                position: "absolute",
                insetInlineEnd: 16,
                insetBlockEnd: 16,
                zIndex: 2,
                background: "rgba(255, 255, 255, 0.92)",
                color: "#231F20",
                borderRadius: 999,
                padding: "4px 10px",
                fontSize: 12,
                fontWeight: 600,
                lineHeight: 1.4,
                pointerEvents: "none",
              }}
            >
              {active + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {notice && (
        // No top margin: the bar is flush against the image so it reads as part
        // of it rather than as a caption chip floating underneath. Autoplay is
        // deliberately gone from this slider too — a disclosure attached to a
        // picture that moves on its own is one the buyer never finishes
        // reading, and auto-advancing costs bandwidth for images nobody asked
        // to see.
        <p className="mb-0" style={PLACEHOLDER_NOTICE_BAR_STYLE}>
          <InfoGlyph />
          <span>{notice}</span>
        </p>
      )}
    </div>
  );
}
