"use client";

import { formatPrice } from "@/lib/format";
import Pricing from "../common/Pricing";
import DropdownSelect from "../common/DropDownSelect";

import { allCars } from "@/data/cars";
import { buildFilterOptions } from "@/lib/carOptions";

const DEMO_OPTIONS = buildFilterOptions(allCars);

export default function FilterSidebar({
  allProps,
  clearFilter,
  filterOptions = DEMO_OPTIONS,
}) {
  return (
    <div className="offcanvas offcanvas-end" tabIndex={-1} id="offcanvasRight">
      <div className="offcanvas-header">
        <h4 className="offcanvas-title" id="offcanvasRightLabel">
          Filters and Sort
        </h4>
        <button
          type="button"
          className="btn-close"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
        />
      </div>
      <div className="offcanvas-body">
        <a
          className="tf-btn-arrow wow fadeInUpSmall clear-filter mb-2"
          onClick={clearFilter}
        >
          <i
            className="icon-autodeal-plus "
            style={{ transform: "rotate(25deg)" }}
          />{" "}
          Clear Filter
        </a>
        <div className="form-filter-siderbar">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="wd-find-select">
              <div className="form-group">
                <div className="group-select">
                  <DropdownSelect
                    selectedValue={allProps.make}
                    onChange={allProps.setMake}
                    options={filterOptions.make}
                  />
                </div>
              </div>
              <div className="form-group">
                <div className="group-select">
                  <DropdownSelect
                    selectedValue={allProps.model}
                    onChange={allProps.setModel}
                    options={filterOptions.model}
                  />
                </div>
              </div>
              <div className="form-group">
                <div className="group-select">
                  <DropdownSelect
                    selectedValue={allProps.body}
                    onChange={allProps.setBody}
                    options={filterOptions.body}
                  />{" "}
                </div>
              </div>
              <div className="form-group wg-box3">
                <div className="widget widget-price">
                  <div className="caption flex-two">
                    <div>
                      <span className="fw-6">
                        Price: {formatPrice(allProps.price[0])} - {formatPrice(allProps.price[1])}
                      </span>
                    </div>
                  </div>
                  <Pricing
                    MIN={allProps.bounds.price[0]}
                    MAX={allProps.bounds.price[1]}
                    priceRange={allProps.price}
                    setPriceRange={allProps.setPrice}
                  />
                </div>
                {/* /.widget_price */}
              </div>
              <div className="form-group">
                <div className="group-select">
                  <DropdownSelect
                    selectedValue={allProps.fuel}
                    onChange={allProps.setFuel}
                    options={filterOptions.fuel}
                  />
                </div>
              </div>
              <div className="form-group">
                <div className="group-select">
                  <DropdownSelect
                    selectedValue={allProps.transmission}
                    onChange={allProps.setTransmission}
                    options={filterOptions.transmission}
                  />
                </div>
              </div>
              <div className="form-group">
                <div className="group-select">
                  <DropdownSelect
                    selectedValue={allProps.location}
                    onChange={allProps.setLocation}
                    options={filterOptions.location}
                  />
                </div>
              </div>
              <div className="form-group">
                <div className="group-select">
                  <DropdownSelect
                    selectedValue={allProps.door}
                    onChange={allProps.setDoor}
                    options={filterOptions.door}
                  />
                </div>
              </div>
              <div className="form-group">
                <div className="group-select">
                  <DropdownSelect
                    selectedValue={allProps.cylinder}
                    onChange={allProps.setCylinder}
                    options={filterOptions.cylinder}
                  />
                </div>
              </div>
              <div className="form-group">
                <div className="group-select">
                  <DropdownSelect
                    selectedValue={allProps.color}
                    onChange={allProps.setColor}
                    options={filterOptions.color}
                  />
                </div>
              </div>
              <div className="form-group wg-box3">
                <div className="widget widget-price">
                  <div className="caption flex-two">
                    <div>
                      <span className="fw-6">
                        Year: {allProps.year[0]} - {allProps.year[1]}
                      </span>
                    </div>
                  </div>
                  <Pricing
                    MIN={allProps.bounds.year[0]}
                    MAX={allProps.bounds.year[1]}
                    priceRange={allProps.year}
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
                        KM: {allProps.km[0]} km - {allProps.km[1]} km
                      </span>
                    </div>
                  </div>
                  <Pricing
                    MIN={allProps.bounds.price[0]}
                    MAX={allProps.bounds.price[1]}
                    priceRange={allProps.km}
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
                          checked={allProps.features.includes(feature)}
                          type="checkbox"
                          onClick={() => allProps.setFeatures(feature)}
                        />
                        <span className="btn-checkbox" />
                        <span className="text-color-2 font-2">{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
