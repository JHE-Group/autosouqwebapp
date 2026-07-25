import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Locale-aware replacements for next/link and the navigation hooks.
 *
 * Import these instead of `next/link` / `next/navigation` anywhere a href
 * points at an internal page: they prefix the active locale automatically, so
 * a component does not have to know which language it is rendering in.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
