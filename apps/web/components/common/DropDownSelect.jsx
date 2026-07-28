"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { filterLabel } from "@/lib/filterLabels";

const optionsDefault = ["Newest", "Oldest", "3 days"];

/**
 * A keyboard-operable select, following the ARIA combobox-with-listbox pattern.
 *
 * The previous version was openable by keyboard and **not selectable**: the
 * trigger handled Enter/Space, but the options were `<li>` elements with a
 * mouse-only `onClick`, no `tabIndex` and no key handler, inside a
 * `role="listbox"` that managed no `aria-activedescendant` and had no
 * accessible name. Since this component renders every filter and every sort
 * control on the site — make, model, body, city, fuel, colour, cylinders,
 * doors, sort order, page size — the entire filtering and sorting capability
 * of the marketplace was unreachable without a pointing device. That is WCAG
 * 2.1.1 and 4.1.2, both Level A, on the core function of the product.
 *
 * Why `aria-activedescendant` rather than moving real focus into the list:
 * focus stays on the combobox, so the user keeps typing at one element and the
 * open/closed state cannot desync from where focus actually is. The active
 * option is identified by id instead.
 *
 * `label` supplies the accessible name. Without it a screen-reader user hears
 * ten identical "combobox" controls and has to open each to find out which is
 * which — the same reason `Facet` already appends the facet name to its
 * otherwise-identical "Reset" buttons.
 */
export default function DropdownSelect({
  onChange = () => {},
  options = optionsDefault,
  defaultOption,
  selectedValue,
  label: accessibleName,
  addtionalParentClass = "",
}) {
  const selectRef = useRef(null);
  const listRef = useRef(null);
  const typeahead = useRef({ buffer: "", at: 0 });
  const [selected, setSelected] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  // Only paint the active-row indicator while navigating by keyboard; a mouse
  // user already has :hover and does not need a second highlight following it.
  const [keyboardNav, setKeyboardNav] = useState(false);
  const locale = useLocale();
  const listId = useId();
  // Display only. `onChange` below still reports the untranslated value, which
  // is what the filter reducer compares against — see lib/filterLabels.js.
  const label = (value) => filterLabel(value, locale);

  const current = selectedValue || selected || defaultOption || options[0];
  const currentIndex = Math.max(0, options.indexOf(current));

  useEffect(() => {
    if (!open) return undefined;

    const handlePointer = (event) => {
      if (!selectRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("click", handlePointer);
    return () => document.removeEventListener("click", handlePointer);
  }, [open]);

  // A long list (makes, models, cities) scrolls; keep the active row visible.
  useEffect(() => {
    if (!open) return;
    listRef.current?.children[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  /**
   * Open, starting from what is already chosen.
   *
   * Done here rather than in an effect keyed on `open`: setting state inside an
   * effect body triggers a second render pass for something we already know at
   * the moment of the interaction. It also reads better — every caller that
   * opens the list says where the cursor should land.
   *
   * Starting at `currentIndex` matters on the long lists: arrowing down from a
   * selected "Toyota" should continue from Toyota, not restart at "Any Make".
   */
  const openList = useCallback(() => {
    setActiveIndex(currentIndex);
    setOpen(true);
  }, [currentIndex]);

  const commit = useCallback(
    (index) => {
      const value = options[index];
      if (value === undefined) return;
      setSelected(value);
      onChange(value);
      setOpen(false);
    },
    [options, onChange],
  );

  /** Jump to the next option starting with what was just typed. */
  const handleTypeahead = useCallback(
    (key) => {
      const now = Date.now();
      const state = typeahead.current;
      state.buffer = now - state.at > 700 ? key : state.buffer + key;
      state.at = now;

      const needle = state.buffer.toLowerCase();
      const from = state.buffer.length === 1 ? activeIndex + 1 : activeIndex;
      const ordered = [
        ...options.slice(from),
        ...options.slice(0, from),
      ];
      const hit = ordered.find((option) =>
        String(label(option)).toLowerCase().startsWith(needle),
      );
      if (hit !== undefined) setActiveIndex(options.indexOf(hit));
    },
    // `label` is derived from `locale`; listing it directly would rebuild this
    // on every render because it is redefined each time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [options, activeIndex, locale],
  );

  const handleKeyDown = (event) => {
    const { key } = event;
    if (key !== "Tab" && key !== "Escape") setKeyboardNav(true);
    const last = options.length - 1;

    if (key === "Escape") {
      setOpen(false);
      return;
    }
    // Tab must not be swallowed: it moves to the next control and closes.
    if (key === "Tab") {
      setOpen(false);
      return;
    }
    if (key === "Enter" || key === " ") {
      event.preventDefault();
      if (open) commit(activeIndex);
      else openList();
      return;
    }
    if (key === "ArrowDown" || key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        openList();
        return;
      }
      const step = key === "ArrowDown" ? 1 : -1;
      setActiveIndex((index) => Math.min(Math.max(index + step, 0), last));
      return;
    }
    if (key === "Home" || key === "End") {
      event.preventDefault();
      if (!open) openList();
      setActiveIndex(key === "Home" ? 0 : last);
      return;
    }
    // Printable single characters drive typeahead.
    if (key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
      if (!open) openList();
      handleTypeahead(key);
    }
  };

  return (
    <div
      className={`nice-select ${open ? "open" : ""} ${addtionalParentClass}`.trim()}
      ref={selectRef}
      role="combobox"
      tabIndex={0}
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={listId}
      aria-label={accessibleName}
      aria-activedescendant={open ? `${listId}-${activeIndex}` : undefined}
      onClick={() => (open ? setOpen(false) : openList())}
      onKeyDown={handleKeyDown}
      onMouseDown={() => setKeyboardNav(false)}
    >
      <span className="current">{label(current)}</span>
      <ul
        id={listId}
        ref={listRef}
        className="list"
        role="listbox"
        aria-label={accessibleName}
        onClick={(event) => event.stopPropagation()}
      >
        {options.map((elm, i) => {
          const isSelected = current === elm;
          return (
            <li
              key={`${elm}-${i}`}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={isSelected}
              // Pointer users get the same active row the keyboard tracks, so
              // the two input modes cannot disagree about what Enter will pick.
              onMouseEnter={() => {
                setKeyboardNav(false);
                setActiveIndex(i);
              }}
              onClick={() => commit(i)}
              className={`option ${isSelected ? "selected" : ""} ${
                open && keyboardNav && i === activeIndex ? "is-kb-active" : ""
              } text text-1`.replace(/\s+/g, " ")}
            >
              {label(elm)}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
