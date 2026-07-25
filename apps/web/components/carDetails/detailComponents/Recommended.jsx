import { formatPrice } from "@/lib/format";
import { carListings2 } from "@/data/cars";
import Image from "next/image";
import React from "react";

export default function Recommended() {
  return (
    <div className="listing-recommended mb-30">
      {carListings2.slice(0, 4).map((elm, i) => (
        <div key={i} className="item flex">
          <div className="image">
            <Image
              className="lazyload"
              alt="image"
              src={elm.imgSrc}
              width={450}
              height={338}
            />
          </div>
          <div className="content">
            <h6>
              <a href="#">{elm.title}</a>
            </h6>
            <p className="fs-14 fw-7 text-color-2 font-1">
              {formatPrice(elm.price, elm.currency)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
