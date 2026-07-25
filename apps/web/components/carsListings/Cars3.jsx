"use client";
import ListingSignals from "@/components/common/ListingSignals";
import WhatsAppButton from "@/components/common/WhatsAppButton";
import { formatPrice } from "@/lib/format";
import React, { useEffect, useMemo, useReducer, useState } from "react";
import Image from "next/image";
import Link from "next/link";
const categories = ["All car", "Used car"];
import { createInitialState, reducer } from "@/reducer/carFilterReducer";
import { buildFilterOptions } from "@/lib/carOptions";
import { allCars } from "@/data/cars";
import DropdownSelect from "../common/DropDownSelect";
import Pagination from "../common/Pagination";
import Pricing from "../common/Pricing";
import ListGridToggler from "./ListGridToggler";
import FilterSidebar from "./FilterSidebar";
export default function Cars3({ listings }) {
  // Strapi listings when the CMS has them, the theme demo data otherwise.
  const source = useMemo(
    () => (listings?.length ? listings : allCars),
    [listings]
  );
  const filterOptions = useMemo(() => buildFilterOptions(source), [source]);
  const [state, dispatch] = useReducer(reducer, source, createInitialState);

  const [activeIndex, setActiveIndex] = useState(0); // Default active is the first item

    const {
    price,
    km,
    year,
    body,
    make,
    model,
    fuel,
    transmission,
    location,
    door,
    cylinder,
    color,

    features,
    filtered,
    sortingOption,
    sorted,
    currentPage,
    itemPerPage,
  } = state;

  const allProps = {
    ...state,
    setPrice: (value) => dispatch({ type: "SET_PRICE", payload: value }),
    setYear: (value) => dispatch({ type: "SET_YEAR", payload: value }),
    setModel: (value) => dispatch({ type: "SET_MODEL", payload: value }),
    setKM: (value) => dispatch({ type: "SET_KM", payload: value }),
    setBody: (value) => dispatch({ type: "SET_BODY", payload: value }),
    setMake: (value) => dispatch({ type: "SET_MAKE", payload: value }),
    setFuel: (value) => dispatch({ type: "SET_FUEL", payload: value }),
    setTransmission: (value) =>
      dispatch({ type: "SET_TRANSMISSION", payload: value }),
    setLocation: (value) => dispatch({ type: "SET_LOCATION", payload: value }),
    setDoor: (value) => dispatch({ type: "SET_DOOR", payload: value }),
    setCylinder: (value) => dispatch({ type: "SET_CYLINDER", payload: value }),
    setColor: (value) => dispatch({ type: "SET_COLOR", payload: value }),

    setFeatures: (newFeature) => {
      const updated = [...features].includes(newFeature)
        ? [...features].filter((elm) => elm != newFeature)
        : [...features, newFeature];
      dispatch({ type: "SET_FEATURES", payload: updated });
    },
    setSortingOption: (value) =>
      dispatch({ type: "SET_SORTING_OPTION", payload: value }),
    setCurrentPage: (value) =>
      dispatch({ type: "SET_CURRENT_PAGE", payload: value }),
    setItemPerPage: (value) => {
      dispatch({ type: "SET_CURRENT_PAGE", payload: 1 }),
        dispatch({ type: "SET_ITEM_PER_PAGE", payload: value });
    },
  };

  const clearFilter = () => {
    dispatch({ type: "CLEAR_FILTER" });
  };

  useEffect(() => {
    allProps.setItemPerPage(12);
  }, []);
  useEffect(() => {
    let filteredArrays = [];

    if (features.length) {
      const filteredByFeatures = [...source].filter((elm) =>
        features.every((el) => elm.features.includes(el))
      );
      filteredArrays = [...filteredArrays, filteredByFeatures];
    }
    if (body !== "Any Body") {
      const filteredBybody = [...source].filter((elm) => body === elm.body);
      filteredArrays = [...filteredArrays, filteredBybody];
    }
    if (make !== "Any Make") {
      const filteredBymake = [...source].filter((elm) => make === elm.make);
      filteredArrays = [...filteredArrays, filteredBymake];
    }
    if (model !== "Any Model") {
      const filteredBymodel = [...source].filter((elm) => model === elm.model);
      filteredArrays = [...filteredArrays, filteredBymodel];
    }
    if (fuel !== "Any Fuel") {
      const filteredByfuel = [...source].filter(
        (elm) => fuel === elm.fuelType
      );
      filteredArrays = [...filteredArrays, filteredByfuel];
    }
    if (transmission !== "Any Transmission") {
      const filteredByTransmission = [...source].filter(
        (elm) => transmission === elm.transmission
      );
      filteredArrays = [...filteredArrays, filteredByTransmission];
    }
    if (location !== "Any Location") {
      const filteredBylocation = [...source].filter(
        (elm) => location === elm.location
      );
      filteredArrays = [...filteredArrays, filteredBylocation];
    }
    if (door !== "Any Door") {
      const filteredBydoor = [...source].filter(
        (elm) => parseInt(door.match(/\d+/)[0], 10) === elm.door
      );
      filteredArrays = [...filteredArrays, filteredBydoor];
    }
    if (cylinder !== "Any Cylinder") {
      const filteredBycylinder = [...source].filter(
        (elm) => parseInt(cylinder.match(/\d+/)[0], 10) === elm.cylinder
      );
      filteredArrays = [...filteredArrays, filteredBycylinder];
    }
    if (color !== "Any Color") {
      const filteredBycolor = [...source].filter((elm) => color === elm.color);
      filteredArrays = [...filteredArrays, filteredBycolor];
    }

    const filteredByPrice = [...source].filter(
      (elm) => elm.price >= price[0] && elm.price <= price[1]
    );
    filteredArrays = [...filteredArrays, filteredByPrice];
    const filteredBykm = [...source].filter(
      (elm) => elm.km >= km[0] && elm.km <= km[1]
    );
    filteredArrays = [...filteredArrays, filteredBykm];
    const filteredByyear = [...source].filter(
      (elm) => elm.year >= year[0] && elm.year <= year[1]
    );
    filteredArrays = [...filteredArrays, filteredByyear];

    const commonItems = [...source].filter((item) =>
      filteredArrays.every((array) => array.includes(item))
    );
    dispatch({ type: "SET_FILTERED", payload: commonItems });
  }, [
    price,
    km,
    year,
    body,
    make,
    model,
    fuel,
    transmission,
    location,
    door,
    cylinder,
    color,

    features,
    source,
  ]);

  useEffect(() => {
    if (sortingOption === "Price Ascending") {
      dispatch({
        type: "SET_SORTED",
        payload: [...filtered].sort((a, b) => a.price - b.price),
      });
    } else if (sortingOption === "Price Descending") {
      dispatch({
        type: "SET_SORTED",
        payload: [...filtered].sort((a, b) => b.price - a.price),
      });
    } else {
      dispatch({ type: "SET_SORTED", payload: filtered });
    }
    dispatch({ type: "SET_CURRENT_PAGE", payload: 1 });
  }, [filtered, sortingOption]);
  const [isGrid, setIsGrid] = useState(true);
  return (
    <>
      <section className="listing-grid tf-section3">
        <div className="container2">
          <div className="row">
            <div className="col-lg-12">
              <div className="heading-section">
                <h2>10,000+ Get The Best Deals On Used Cars</h2>
                <p className="mt-20">
                  Explore our selection of high-quality, pre-owned vehicles. Our
                  inventory includes top brands like Toyota, Mercedes, Honda,
                  and more. Find the perfect used car for your needs.
                </p>
              </div>
            </div>
            <div className="col-lg-12 flex gap-30 text-start">
              <div className="sidebar-right-listing style-2">
                <div className="sidebar-title flex-two flex-wrap">
                  <h4>Filters and Sort</h4>
                  <a
                    className="fw-5 font claer text-color-2"
                    onClick={clearFilter}
                  >
                    <i className="icon-autodeal-plus" />
                    Clear
                  </a>
                </div>
                <div className="form-filter-siderbar">
                  <form onSubmit={(e) => e.preventDefault()}>
                    <div className="wd-find-select">
                      <div className="form-group">
                        <div className="group-select">
                          <DropdownSelect
                            selectedValue={make}
                            onChange={allProps.setMake}
                            options={["Any Make", "Audi", "Dongfeng", "BMW"]}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <div className="group-select">
                          <DropdownSelect
                            selectedValue={model}
                            onChange={allProps.setModel}
                            options={["Any Model", "A4", "Almera", "Carnival"]}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <DropdownSelect
                          selectedValue={body}
                          onChange={allProps.setBody}
                          options={[
                            "Any Body",
                            "Convertible",
                            "Coupe",
                            "Crossover",
                          ]}
                        />
                      </div>
                      <div className="form-group wg-box3">
                        <div className="widget widget-price">
                          <div className="caption flex-two">
                            <div>
                              <span className="fw-6">
                                Price: {formatPrice(price[0])} - {formatPrice(price[1])}
                              </span>
                            </div>
                          </div>
                          <Pricing
                            MIN={allProps.bounds.price[0]}
                            MAX={allProps.bounds.price[1]}
                            priceRange={price}
                            setPriceRange={allProps.setPrice}
                          />
                        </div>
                        {/* /.widget_price */}
                      </div>
                      <div className="form-group">
                        <div className="group-select">
                          <DropdownSelect
                            selectedValue={fuel}
                            onChange={allProps.setFuel}
                            options={["Any Fuel", "Diesel", "Petrol"]}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <div className="group-select">
                          <DropdownSelect
                            selectedValue={transmission}
                            onChange={allProps.setTransmission}
                            options={[
                              "Any Transmission",
                              "Automatic",
                              "Manual",
                            ]}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <div className="group-select">
                          <DropdownSelect
                            selectedValue={location}
                            onChange={allProps.setLocation}
                            options={[
                              "Any Location",
                              "London",
                              "New York",
                              "Paris",
                            ]}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <div className="group-select">
                          <DropdownSelect
                            selectedValue={door}
                            onChange={allProps.setDoor}
                            options={["Any Door", "2 Door", "3 Door", "4 Door"]}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <div className="group-select">
                          <DropdownSelect
                            selectedValue={cylinder}
                            onChange={allProps.setCylinder}
                            options={[
                              "Any Cylinder",
                              "2 Cylinder",
                              "3 Cylinder",
                              "4 Cylinder",
                            ]}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <div className="group-select">
                          <DropdownSelect
                            selectedValue={color}
                            onChange={allProps.setColor}
                            options={[
                              "Any Color",
                              "Black",
                              "White",
                              "Blue",
                              "Red",
                            ]}
                          />
                        </div>
                      </div>
                      <div className="form-group wg-box3">
                        <div className="widget widget-price">
                          <div className="caption flex-two">
                            <div>
                              <span className="fw-6">
                                Year: {year[0]} - {year[1]}
                              </span>
                            </div>
                          </div>
                          <Pricing
                            MIN={allProps.bounds.year[0]}
                            MAX={allProps.bounds.year[1]}
                            priceRange={year}
                            setPriceRange={allProps.setYear}
                          />
                        </div>
                        {/* /.widget_price */}
                      </div>
                      <div className="form-group wg-box3">
                        <div className="widget widget-price">
                          <div className="caption flex-two">
                            <div>
                              <span className="fw-6">
                                KM: {km[0]} km - {km[1]} km
                              </span>
                            </div>
                          </div>
                          <Pricing
                            MIN={allProps.bounds.price[0]}
                            MAX={allProps.bounds.price[1]}
                            priceRange={km}
                            setPriceRange={allProps.setKM}
                          />
                        </div>
                        {/* /.widget_price */}
                      </div>

                      <div className="features-wrap">
                        <h4>Featured</h4>
                        <div className="form-group">
                          <div className="tf-amenities bg-white">
                            {filterOptions.features.map((feature, index) => (
                              <label className="flex-three" key={index}>
                                <input
                                  readOnly
                                  checked={features.includes(feature)}
                                  type="checkbox"
                                  onClick={() => allProps.setFeatures(feature)}
                                />
                                <span className="btn-checkbox" />
                                <span className="text-color-2 font-2">
                                  {feature}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
              <div className="sidebar-left-listing">
                <div className="row">
                  <div className="col-lg-12 listing-list-car-wrap listing-grid-car-wrap">
                    <div className="flat-tabs themesflat-tabs category-filter">
                      <div className="box-tab center flex-two mb-40 flex-wrap gap-20">
                        <ul className="menu-tab tab-title style1 flex">
                          {categories.map((category, index) => (
                            <li
                              key={index}
                              className={`item-title ${
                                activeIndex === index ? "active" : ""
                              }`}
                              onClick={() => setActiveIndex(index)} // Update active index on click
                            >
                              <h5 className="inner">{category}</h5>
                            </li>
                          ))}
                        </ul>
                        <div className="box-2 flex gap-8 flex-wrap">
                          <div className="filter-mobie">
                            <a
                              data-bs-toggle="offcanvas"
                              data-bs-target="#offcanvasRight"
                              aria-controls="offcanvasRight"
                              className="filter"
                            >
                              Filter
                              <i className="icon-autodeal-filter" />
                            </a>
                          </div>
                          <ListGridToggler
                            isGrid={isGrid}
                            setIsGrid={setIsGrid}
                          />
                          <div className="wd-find-select flex gap-8">
                            <div className="group-select">
                              <DropdownSelect
                                onChange={(value) => {
                                  const match = value.match(/\d+/); // Match the digits in the value
                                  if (match) {
                                    allProps.setItemPerPage(
                                      parseInt(match[0], 10)
                                    );
                                  }
                                }}
                                options={["Show: 12", "Show: 16", "Show: 20"]}
                              />
                            </div>
                            <div className="group-select">
                              <DropdownSelect
                                selectedValue={sortingOption}
                                onChange={allProps.setSortingOption}
                                options={[
                                  "Sort by (Default)",

                                  "Price Ascending",
                                  "Price Descending",
                                ]}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="content-tab">
                        <div className="content-inner tab-content">
                          <div
                            className={`list-car-list-1 ${
                              isGrid ? "list-car-grid-1" : ""
                            } `}
                          >
                            {sorted
                              .slice(
                                (currentPage - 1) * itemPerPage,
                                currentPage * itemPerPage
                              )
                              .map((car, i) => (
                                <div
                                  key={i}
                                  className="box-car-list style-2 hv-one"
                                >
                                  <div className="image-group relative">
                                    <div className="top flex-two">
                                      <ul className="d-flex gap-8">
                                        <li className="flag-tag success">
                                          Featured
                                        </li>
                                        <li className="flag-tag style-1">
                                          <div className="icon">
                                            <svg
                                              width={16}
                                              height={13}
                                              viewBox="0 0 16 13"
                                              fill="none"
                                              xmlns="http://www.w3.org/2000/svg"
                                            >
                                              <path
                                                d="M1.5 9L4.93933 5.56067C5.07862 5.42138 5.24398 5.31089 5.42597 5.2355C5.60796 5.16012 5.80302 5.12132 6 5.12132C6.19698 5.12132 6.39204 5.16012 6.57403 5.2355C6.75602 5.31089 6.92138 5.42138 7.06067 5.56067L10.5 9M9.5 8L10.4393 7.06067C10.5786 6.92138 10.744 6.81089 10.926 6.7355C11.108 6.66012 11.303 6.62132 11.5 6.62132C11.697 6.62132 11.892 6.66012 12.074 6.7355C12.256 6.81089 12.4214 6.92138 12.5607 7.06067L14.5 9M2.5 11.5H13.5C13.7652 11.5 14.0196 11.3946 14.2071 11.2071C14.3946 11.0196 14.5 10.7652 14.5 10.5V2.5C14.5 2.23478 14.3946 1.98043 14.2071 1.79289C14.0196 1.60536 13.7652 1.5 13.5 1.5H2.5C2.23478 1.5 1.98043 1.60536 1.79289 1.79289C1.60536 1.98043 1.5 2.23478 1.5 2.5V10.5C1.5 10.7652 1.60536 11.0196 1.79289 11.2071C1.98043 11.3946 2.23478 11.5 2.5 11.5ZM9.5 4H9.50533V4.00533H9.5V4ZM9.75 4C9.75 4.0663 9.72366 4.12989 9.67678 4.17678C9.62989 4.22366 9.5663 4.25 9.5 4.25C9.4337 4.25 9.37011 4.22366 9.32322 4.17678C9.27634 4.12989 9.25 4.0663 9.25 4C9.25 3.9337 9.27634 3.87011 9.32322 3.82322C9.37011 3.77634 9.4337 3.75 9.5 3.75C9.5663 3.75 9.62989 3.77634 9.67678 3.82322C9.72366 3.87011 9.75 3.9337 9.75 4Z"
                                                stroke="white"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                              />
                                            </svg>
                                          </div>
                                          {car?.images?.length || ""}
                                        </li>
                                      </ul>
                                      <div className="year flag-tag">
                                        {car.year}
                                      </div>
                                    </div>
                                    <ul className="change-heart flex">
                                      <li className="box-icon w-32">
                                        <a
                                          data-bs-toggle="offcanvas"
                                          data-bs-target="#offcanvasBottom"
                                          aria-controls="offcanvasBottom"
                                          className="icon"
                                        >
                                          <svg
                                            width={18}
                                            height={18}
                                            viewBox="0 0 18 18"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                          >
                                            <path
                                              d="M5.25 16.5L1.5 12.75M1.5 12.75L5.25 9M1.5 12.75H12.75M12.75 1.5L16.5 5.25M16.5 5.25L12.75 9M16.5 5.25H5.25"
                                              stroke="CurrentColor"
                                              strokeWidth="1.5"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                            />
                                          </svg>
                                        </a>
                                      </li>
                                      <li className="box-icon w-32">
                                        <Link
                                          href={`/my-favorite`}
                                          className="icon"
                                        >
                                          <svg
                                            width={18}
                                            height={16}
                                            viewBox="0 0 18 16"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                          >
                                            <path
                                              d="M16.5 4.875C16.5 2.80417 14.7508 1.125 12.5933 1.125C10.9808 1.125 9.59583 2.06333 9 3.4025C8.40417 2.06333 7.01917 1.125 5.40583 1.125C3.25 1.125 1.5 2.80417 1.5 4.875C1.5 10.8917 9 14.875 9 14.875C9 14.875 16.5 10.8917 16.5 4.875Z"
                                              stroke="CurrentColor"
                                              strokeWidth="1.5"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                            />
                                          </svg>
                                        </Link>
                                      </li>
                                    </ul>
                                    <div className="img-style">
                                      <Image
                                        className="lazyload"
                                        alt="image"
                                        src={car.imgSrc}
                                        width={450}
                                        height={338}
                                      />
                                    </div>
                                  </div>
                                  <div className="content">
                                    <div className="inner1">
                                      <div className="text-address">
                                        <p className="text-color-3 font">
                                          {car.type}
                                        </p>
                                      </div>
                                      <h5 className="link-style-1">
                                        <Link
                                          href={`/listing-detail-v1/${car.id}`}
                                        >
                                          {car.title}
                                        </Link>
                                      </h5>
                                      <div className="icon-box flex flex-wrap">
                                        <div className="icons flex-three">
                                          <i className="icon-autodeal-km1" />
                                          <span>
                                            {car.km.toLocaleString("en-US")} kms
                                          </span>
                                        </div>
                                        <div className="icons flex-three">
                                          <i className="icon-autodeal-diesel" />
                                          <span>{car.fuelType}</span>
                                        </div>
                                        <div className="icons flex-three">
                                          <i className="icon-autodeal-automatic" />
                                          <span>{car.transmission}</span>
                                        </div>
                                      </div>
                                      <div className="money fs-20 fw-5 lh-25 text-color-3">
                                        {formatPrice(car.price, car.currency)}
                                      </div>
                                      <ListingSignals car={car} className="mt-2" />
                                      <Link
                                        href={`/listing-detail-v1/${car.id}`}
                                        className="view-car"
                                      >
                                        View details
                                        <i className="icon-autodeal-btn-right" />
                                      </Link>
                                    </div>
                                    <div className="inner2">
                                      <div className="days-box">
                                        <div className="img-author">
                                          {car.authorImage && (
                                            <Image
                                              className="lazyload"
                                              alt="image"
                                              src={car.authorImage}
                                              width={120}
                                              height={120}
                                            />
                                          )}
                                          <span className="font text-color-2 fw-5">
                                            {car.authorName}
                                          </span>
                                        </div>
                                        <Link
                                          href={`/listing-detail-v1/${car.id}`}
                                          className="view-car"
                                        >
                                          View car
                                        </Link>
                                        <WhatsAppButton car={car} />
                                        <p className="fs-12 lh-16">
                                          View 20 variants matching your search
                                          criteria
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                      <div className="themesflat-pagination clearfix mt-40">
                        <ul>
                          <Pagination
                            currentPage={currentPage}
                            setPage={(value) => allProps.setCurrentPage(value)}
                            itemLength={sorted.length}
                            itemPerPage={itemPerPage}
                          />
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <FilterSidebar
        allProps={allProps}
        clearFilter={clearFilter}
        filterOptions={filterOptions}
      />
    </>
  );
}
