"""Facet promise check that tolerates the 30s ISR window and a catalogue that
another agent is editing underneath us: a violation only counts if it survives
two passes 40s apart."""
import time

from facets import MUSCAT, cards, cms_rows

FACETS = [
    ("under-2000-omr", lambda r: 0 < float(r["price"]) < 2000, "price < 2000"),
    ("under-3000-omr", lambda r: 0 < float(r["price"]) < 3000, "price < 3000"),
    ("gcc-spec", lambda r: r.get("importOrigin") == "gcc", "importOrigin == gcc"),
    ("muscat", lambda r: (r.get("city") or {}).get("slug") in MUSCAT, "city in Muscat gov."),
]


def pass_once():
    rows = {r["slug"]: r for r in cms_rows()}

    def base(rendered):
        for s in rows:
            if rendered == s or rendered.startswith(s + "-"):
                return s
        return None

    out = {}
    for locale in ("ar", "en"):
        for facet, promise, _desc in FACETS:
            path = f"/{locale}/used-cars/{facet}"
            bad, price_bad, unresolved = [], [], []
            cs = cards(path)
            for c in cs:
                b = base(c["slug"])
                if b is None:
                    unresolved.append(c["slug"])
                    continue
                if not promise(rows[b]):
                    bad.append((c["slug"], rows[b]["price"], rows[b].get("importOrigin"),
                                (rows[b].get("city") or {}).get("slug")))
                if c["price"] != int(float(rows[b]["price"])):
                    price_bad.append((c["slug"], c["price"], rows[b]["price"]))
            out[path] = {"n": len(cs), "bad": bad, "price": price_bad, "unresolved": unresolved}
    return out


a = pass_once()
print("pass 1 done; waiting 40s for the ISR window")
time.sleep(40)
# a second request after the window is what actually triggers regeneration
pass_once()
time.sleep(3)
b = pass_once()

fails = 0
for path in a:
    persistent_bad = [x for x in b[path]["bad"] if x[0] in {y[0] for y in a[path]["bad"]}]
    persistent_price = [x for x in b[path]["price"] if x[0] in {y[0] for y in a[path]["price"]}]
    ok = not persistent_bad and not persistent_price and not b[path]["unresolved"]
    print(
        ("PASS  " if ok else "FAIL  ")
        + path
        + f"  cards={b[path]['n']}"
        + (f" persistentPromiseViolations={persistent_bad}" if persistent_bad else "")
        + (f" persistentPriceMismatch={persistent_price}" if persistent_price else "")
        + (f" unresolved={b[path]['unresolved']}" if b[path]["unresolved"] else "")
        + f"   [pass1: bad={len(a[path]['bad'])} price={len(a[path]['price'])}]"
    )
    if not ok:
        fails += 1
print(f"\n{fails} persistent failures")
