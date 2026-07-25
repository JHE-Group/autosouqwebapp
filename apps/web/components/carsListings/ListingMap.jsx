"use client";
import { formatPrice } from "@/lib/format";
import {
  GoogleMap,
  OverlayView,
  useLoadScript,
  InfoWindow,
} from "@react-google-maps/api";
import { useMemo, useState } from "react";
import Link from "next/link";

import { cars } from "@/data/cars";

// Muscat — the map centres here until a listing carries coordinates.
const OMAN_CENTER = { lat: 23.588, lng: 58.3829 };
const option = {
  zoomControl: true,
  disableDefaultUI: true,
  scrollwheel: false,
  styles: [
    {
      featureType: "all",
      elementType: "geometry.fill",
      stylers: [
        {
          weight: "2.00",
        },
      ],
    },
    {
      featureType: "all",
      elementType: "geometry.stroke",
      stylers: [
        {
          color: "#9c9c9c",
        },
      ],
    },
    {
      featureType: "all",
      elementType: "labels.text",
      stylers: [
        {
          visibility: "on",
        },
      ],
    },
    {
      featureType: "landscape",
      elementType: "all",
      stylers: [
        {
          color: "#f2f2f2",
        },
      ],
    },
    {
      featureType: "landscape",
      elementType: "geometry.fill",
      stylers: [
        {
          color: "#ffffff",
        },
      ],
    },
    {
      featureType: "landscape.man_made",
      elementType: "geometry.fill",
      stylers: [
        {
          color: "#ffffff",
        },
      ],
    },
    {
      featureType: "poi",
      elementType: "all",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
    {
      featureType: "road",
      elementType: "all",
      stylers: [
        {
          saturation: -100,
        },
        {
          lightness: 45,
        },
      ],
    },
    {
      featureType: "road",
      elementType: "geometry.fill",
      stylers: [
        {
          color: "#eeeeee",
        },
      ],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#7b7b7b",
        },
      ],
    },
    {
      featureType: "road",
      elementType: "labels.text.stroke",
      stylers: [
        {
          color: "#ffffff",
        },
      ],
    },
    {
      featureType: "road.highway",
      elementType: "all",
      stylers: [
        {
          visibility: "simplified",
        },
      ],
    },
    {
      featureType: "road.arterial",
      elementType: "labels.icon",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
    {
      featureType: "transit",
      elementType: "all",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
    {
      featureType: "water",
      elementType: "all",
      stylers: [
        {
          color: "#46bcec",
        },
        {
          visibility: "on",
        },
      ],
    },
    {
      featureType: "water",
      elementType: "geometry.fill",
      stylers: [
        {
          color: "#c8d7d4",
        },
      ],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#070707",
        },
      ],
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [
        {
          color: "#ffffff",
        },
      ],
    },
  ],
};
const containerStyle = {
  width: "100%",
  height: "100%",
};
export default function ListingMap({ listings }) {
  const [getLocation, setLocation] = useState(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  });

  // CMS listings store coordinates as latitude/longitude; the demo data uses
  // lat/long. Normalise, and only map listings that actually have a position.
  const markers = useMemo(() => {
    const source = listings?.length ? listings : cars;
    return source
      .map((item) => ({
        ...item,
        lat: item.latitude ?? item.lat,
        lng: item.longitude ?? item.long,
      }))
      .filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng))
      .slice(0, 20);
  }, [listings]);

  const center = useMemo(
    () => (markers.length ? { lat: markers[0].lat, lng: markers[0].lng } : OMAN_CENTER),
    [markers]
  );
  const CustomMarker = ({ elm }) => {
    return (
      <div className="marker-container" onClick={() => setLocation(elm)}>
        <div className="marker-card">
          <div className="front face">
            <div />
          </div>
          <div className="back face">
            <div />
          </div>
          <div className="marker-arrow" />
        </div>
      </div>
    );
  };

  // close handler
  const closeCardHandler = () => {
    setLocation(null);
  };

  return (
    <>
      {!isLoaded ? (
        <p>Loading...</p>
      ) : (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={4}
          options={option}
        >
          {markers.map((marker, i) => (
            <OverlayView
              key={i}
              position={{
                lat: marker.lat,
                lng: marker.lng,
              }}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <CustomMarker elm={marker} />
            </OverlayView>
          ))}
          {getLocation !== null && (
            <InfoWindow
              position={{
                lat: getLocation.lat,
                lng: getLocation.lng,
              }}
              onCloseClick={closeCardHandler}
            >
              <div className="map-listing-item">
                <div className="inner-box">
                  <div className="image-box">
                    <figure className="image">
                      <img src={getLocation.imgSrc} alt="" />
                    </figure>
                  </div>
                  <div className="content">
                    <p className="text-color-3 font">{getLocation.type}</p>
                    <h5>
                      <Link href={`/listing-detail-v1/${getLocation.id}`}>
                        {getLocation.title}
                      </Link>
                    </h5>
                    <div className="flex flex-wrap gap-8">
                      <p className="location">
                        <i className="icon-autodeal-km1" />
                        {getLocation.km?.toLocaleString("en-US") ?? "—"} kms
                      </p>
                      <p className="location">
                        <i className="icon-autodeal-diesel" />
                        {getLocation.fuelType}
                      </p>
                      <p className="location">
                        <i className="icon-autodeal-automatic" />
                        {getLocation.transmission}
                      </p>
                    </div>
                    <h3>
                      <a>{formatPrice(getLocation.price, getLocation.currency)}</a>
                    </h3>
                  </div>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      )}
    </>
  );
}
