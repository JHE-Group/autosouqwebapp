"""Every claim on a listing detail page, cross-checked against the CMS row."""
import html as htmllib
import json
import re
import sys
import urllib.parse
import urllib.request

BASE = "http://localhost:3050"
CMS = "http://localhost:1337"
SCRIPT_RE = re.compile(r"<script\b.*?</script>", re.S | re.I)
TAG_RE = re.compile(r"<[^>]+>")

POP = "&".join(
    f"populate[{k}]=true"
    for k in ("gallery make model bodyType condition transmission fuelType color city features").split()
)


def cms_rows():
    with urllib.request.urlopen(f"{CMS}/api/listings?{POP}&pagination[pageSize]=100") as r:
        return json.load(r)["data"]


def get(path):
    req = urllib.request.Request(BASE + path)
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, r.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()


def visible(html):
    return SCRIPT_RE.sub("", html)


def text(html):
    return re.sub(r"\s+", " ", htmllib.unescape(TAG_RE.sub(" ", html)))


def slug_of(row):
    base = re.sub(r"[^a-z0-9]+", "-", (row["slug"] or "").lower()).strip("-")
    city = (row.get("city") or {}).get("slug")
    city = re.sub(r"[^a-z0-9]+", "-", (city or "").lower()).strip("-")
    if city and base != city and not base.endswith("-" + city):
        return f"{base}-{city}"
    return base


ORIGIN = {
    "gcc": {"ar": "خليجي", "en": "GCC spec"},
    "us-import": {"ar": "وارد أمريكي", "en": "US import"},
    "japan-import": {"ar": "وارد اليابان", "en": "Japan import"},
    "other": {"ar": "مواصفات أخرى", "en": "Other spec"},
}
NOT_STATED = {"ar": "لم يحدّد البائع المواصفات", "en": "Spec not stated by seller"}
VERIFIED = {"ar": "تحقّقنا من هذا الإعلان", "en": "Autosouq checked this listing"}
UNVERIFIED = {"ar": "لم نتحقق من هذا الإعلان بعد", "en": "We haven't checked this listing yet"}
ASIS_MARK = {"ar": "لا يقدّم البائع أي ضمان", "en": "The seller offers no warranty"}
SOLD_MARK = {"ar": "تم بيع هذه السيارة", "en": "This car has been sold"}

fails = []
notes = []


def check(name, ok, detail=""):
    line = ("PASS  " if ok else "FAIL  ") + name + ("  :: " + detail if detail else "")
    print(line)
    if not ok:
        fails.append(name + " :: " + detail)


rows = cms_rows()
print(f"# {len(rows)} published listings\n")

for row in rows:
    s = slug_of(row)
    price = int(float(row["price"]))
    for loc in ("ar", "en"):
        path = f"/{loc}/car/{s}"
        status, html = get(path)
        if status != 200:
            check(f"{path} responds 200", False, f"status={status}")
            continue
        v = visible(html)
        t = text(v)
        # The trust block only. The recommended-cars rail and the sticky bar
        # carry their own signals for OTHER cars, so a page-wide search finds
        # "US import" on a GCC car and proves nothing.
        tbm = re.search(r'<h1 class="title">.*?(?=<div class="col-lg-8">)', v, re.S)
        tbraw = tbm.group(0) if tbm else v
        tb = text(tbraw)
        # The two TrustRow sentences, exactly as rendered: [verification, origin]
        trust_rows = [
            htmllib.unescape(re.sub(r"<[^>]+>", "", m)).strip()
            for li in re.findall(r'<li class="d-flex"[^>]*>.*?</li>', tbraw, re.S)
            for m in re.findall(r'<span class="d-block"[^>]*>(.*?)</span>', li, re.S)[:1]
        ]
        tag = f"{row['slug']} [{loc}]"

        # --- price ------------------------------------------------------
        m = re.search(r'class="money font"[^>]*>([^<]*)<', v)
        shown = int(re.sub(r"\D", "", m.group(1))) if m else None
        check(f"{tag} price on page == CMS", shown == price, f"page={shown} cms={price}")

        # --- verification ------------------------------------------------
        row0 = trust_rows[0] if trust_rows else ""
        has_v = row0 == VERIFIED[loc]
        has_u = row0 == UNVERIFIED[loc]
        check(
            f"{tag} verification claim matches CMS (verified={row.get('verified')})",
            (has_v and not has_u) if row.get("verified") else (has_u and not has_v),
            f"trustRow0={row0!r}",
        )

        # --- sold as-is ---------------------------------------------------
        asis = ASIS_MARK[loc] in tb
        expect_asis = bool(row.get("soldAsIs"))
        check(
            f"{tag} sold-as-is block present iff CMS says so (price={price})",
            asis == expect_asis,
            f"onPage={asis} cms={expect_asis}",
        )
        check(
            f"{tag} sold-as-is agrees with the 1,000-1,499 rule",
            expect_asis == (1000 <= price <= 1499),
            f"cmsSoldAsIs={expect_asis} price={price}",
        )

        # --- import origin -------------------------------------------------
        o = row.get("importOrigin") or None
        expected = ORIGIN[o][loc] if o in ORIGIN else NOT_STATED[loc]
        row1 = trust_rows[1] if len(trust_rows) > 1 else ""
        check(
            f"{tag} spec-origin label == CMS ({o})",
            row1 == expected,
            f"expected={expected!r} rendered={row1!r}",
        )

        # --- availability ---------------------------------------------------
        sold = row.get("listingStatus") == "sold"
        check(
            f"{tag} sold banner present iff status==sold",
            (SOLD_MARK[loc] in tb) == sold,
            f"onPage={SOLD_MARK[loc] in tb} cms={row.get('listingStatus')}",
        )

        # --- WhatsApp handoff ----------------------------------------------
        sticky = re.search(r'<div class="autosouq-sticky-contact.*', v, re.S)
        was = re.findall(r'href="(https://wa\.me/[^"]+)"', tbraw + (sticky.group(0) if sticky else ''))
        if sold:
            check(f"{tag} no WhatsApp CTA on a sold car", not was, f"found={len(was)}")
        else:
            raw = row.get("whatsapp") or ""
            digits = re.sub(r"\D", "", raw)
            if digits.startswith("00"):
                digits = digits[2:]
            if len(digits) == 9 and digits.startswith("0"):
                digits = digits[1:]
            if len(digits) == 8:
                digits = "968" + digits
            usable = bool(re.fullmatch(r"968[79]\d{7}", digits))
            if not usable:
                check(f"{tag} unusable number -> no dead link", not was, f"raw={raw} found={len(was)}")
                continue
            check(f"{tag} WhatsApp CTA present", bool(was), f"count={len(was)}")
            for href in set(was):
                num = href.split("wa.me/")[1].split("?")[0]
                msg = urllib.parse.unquote(href.split("?text=")[1]) if "?text=" in href else ""
                check(f"{tag} wa.me number == seller's number", num == digits, f"{num} vs {digits}")
                check(
                    f"{tag} prefilled message quotes the listed price",
                    f"{price:,}" in msg,
                    f"price={price:,} msg={msg[:120]!r}",
                )
                check(
                    f"{tag} prefilled message links this listing in this locale",
                    f"/{loc}/car/{s}" in msg,
                    f"msg={msg[:200]!r}",
                )
                check(
                    f"{tag} prefilled message is in the reader's language",
                    ("السلام عليكم" in msg) if loc == "ar" else ("Hello," in msg),
                    f"msg={msg[:60]!r}",
                )
                h1 = re.search(r'<h1 class="title">([^<]*)</h1>', v)
                if h1:
                    check(
                        f"{tag} prefilled message names the car on the page",
                        h1.group(1).strip() in msg,
                        f"h1={h1.group(1)!r}",
                    )

print(f"\n{len(fails)} failures")
for f in fails:
    print("  " + f)
