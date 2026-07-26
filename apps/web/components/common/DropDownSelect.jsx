"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { filterLabel } from "@/lib/filterLabels";

const optionsDefault = ["Newest", "Oldest", "3 days"];

export default function DropdownSelect({
  onChange = () => {},
  options = optionsDefault,
  defaultOption,
  selectedValue,
  addtionalParentClass = "",
}) {
  const selectRef = useRef(null);
  const [selected, setSelected] = useState("");
  const [open, setOpen] = useState(false);
  const locale = useLocale();
  // Display only. `onChange` below still reports the untranslated value, which
  // is what the filter reducer compares against — see lib/filterLabels.js.
  const label = (value) => filterLabel(value, locale);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointer = (event) => {
      if (!selectRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("click", handlePointer);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("click", handlePointer);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const current = selectedValue || selected || defaultOption || options[0];

  return (
    <div
      className={`nice-select ${open ? "open" : ""} ${addtionalParentClass}`.trim()}
      ref={selectRef}
      role="button"
      tabIndex={0}
      aria-haspopup="listbox"
      aria-expanded={open}
      onClick={() => setOpen((value) => !value)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setOpen((value) => !value);
        }
      }}
    >
      <span className="current">{label(current)}</span>
      <ul className="list" role="listbox" onClick={(event) => event.stopPropagation()}>
        {options.map((elm, i) => {
          const isSelected = current === elm;
          return (
            <li
              key={`${elm}-${i}`}
              role="option"
              aria-selected={isSelected}
              onClick={() => {
                setSelected(elm);
                onChange(elm);
                setOpen(false);
              }}
              className={`option ${isSelected ? "selected" : ""} text text-1`}
            >
              {label(elm)}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
