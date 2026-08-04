"""Every Overview row on a detail page, checked against the CMS row."""
import html as H
import json
import re
import urllib.request

from detail import CMS, POP, get, slug_of, visible

LBL = {
    "ar": {
        "km": "الممشى", "year": "سنة الصنع", "origin": "المواصفات", "condition": "الحالة",
        "transmission": "ناقل الحركة", "fuel": "الوقود", "cylinders": "عدد السلندرات",
        "engine": "سعة المحرك", "drive": "نظام الدفع", "doors": "عدد الأبواب",
        "seats": "عدد المقاعد", "colour": "اللون", "body": "نوع الهيكل", "vin": "رقم الشاصي",
    },
    "en": {
        "km": "Kilometres", "year": "Year", "origin": "Spec", "condition": "Condition",
        "transmission": "Transmission", "fuel": "Fuel", "cylinders": "Cylinders",
        "engine": "Engine", "drive": "Drive", "doors": "Doors", "seats": "Seats",
        "colour": "Colour", "body": "Body", "vin": "Chassis number",
    },
}


def rows_of(v):
    """label -> value, from the Overview grid."""
    sec = re.search(r'id="scrollspyHeading1".*?(?=id="scrollspyHeading2")', v, re.S)
    if not sec:
        return {}
    out = {}
    for blk in re.findall(r'<div class="d-flex align-items-baseline justify-content-between gap-3"[^>]*>(.*?)</div>\s*</div>', sec.group(0), re.S):
        spans = re.findall(r"<span[^>]*>(.*?)</span>", blk, re.S)
        if len(spans) >= 2:
            label = H.unescape(re.sub(r"<[^>]+>", "", spans[0])).strip()
            value = H.unescape(re.sub(r"<[^>]+>", "", spans[-1])).strip()
            out[label] = value
    return out


def lab(rel, loc):
    if not rel:
        return None
    return rel.get("nameAr") if loc == "ar" else rel.get("name")


with urllib.request.urlopen(f"{CMS}/api/listings?{POP}&pagination[pageSize]=100") as r:
    rows = json.load(r)["data"]

fails = []
for row in rows:
    s = slug_of(row)
    for loc in ("ar", "en"):
        st, html_ = get(f"/{loc}/car/{s}")
        if st != 200:
            continue
        v = visible(html_)
        got = rows_of(v)
        L = LBL[loc]
        expect = {}
        if row.get("mileage"):
            expect[L["km"]] = f"{int(row['mileage']):,} " + ("كم" if loc == "ar" else "km")
        if row.get("year"):
            expect[L["year"]] = str(row["year"])
        for key, rel in (
            ("condition", "condition"), ("transmission", "transmission"),
            ("fuel", "fuelType"), ("body", "bodyType"), ("colour", "color"),
        ):
            val = lab(row.get(rel), loc)
            if val:
                expect[L[key]] = val
        if row.get("cylinders"):
            expect[L["cylinders"]] = str(row["cylinders"])
        if row.get("doors"):
            expect[L["doors"]] = str(row["doors"])
        if row.get("seats"):
            expect[L["seats"]] = str(row["seats"])
        if row.get("engineSize"):
            expect[L["engine"]] = f"{row['engineSize']} L"
        if row.get("vin"):
            expect[L["vin"]] = str(row["vin"])

        bad = {k: (got.get(k), vexp) for k, vexp in expect.items() if got.get(k) != vexp}
        # rows shown that the CMS has no value for
        extra = {
            k: got[k]
            for k in got
            if k not in expect and k not in (L["origin"],)
        }
        ok = not bad and not extra
        print(("PASS  " if ok else "FAIL  ") + f"{row['slug']} [{loc}] overview rows == CMS"
              + ("" if ok else f"  :: mismatched={bad} unexpectedRows={extra}"))
        if not ok:
            fails.append((row["slug"], loc, bad, extra))

print(f"\n{len(fails)} failures")
for f in fails:
    print("  ", f)
