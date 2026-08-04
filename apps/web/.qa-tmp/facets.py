import json
import re
import subprocess
import sys
import urllib.request

BASE = "http://localhost:3050"
CMS = "http://localhost:1337"

SCRIPT_RE = re.compile(r"<script\b.*?</script>", re.S | re.I)
CARD_RE = re.compile(r'<article class="asq-card[^"]*".*?</article>', re.S)
HREF_RE = re.compile(r'class="asq-card__title"><a[^>]*href="([^"]+)"')
PRICE_RE = re.compile(r'class="asq-card__price">([^<]+)<')


def fetch(path):
    with urllib.request.urlopen(BASE + path) as r:
        return r.read().decode()


def visible(html):
    """HTML with every <script> block removed — the message catalogue lives in
    those, so grepping the raw page proves nothing about what rendered."""
    return SCRIPT_RE.sub("", html)


def cards(path):
    html = visible(fetch(path))
    out = []
    for block in CARD_RE.findall(html):
        h = HREF_RE.search(block)
        p = PRICE_RE.search(block)
        out.append(
            {
                "slug": h.group(1).split("/car/")[1] if h else None,
                "priceText": p.group(1) if p else None,
                "price": int(re.sub(r"\D", "", p.group(1))) if p else None,
                "html": block,
            }
        )
    return out


def cms_rows():
    url = (
        CMS
        + "/api/listings?populate[city]=true&populate[make]=true&populate[model]=true&pagination[pageSize]=100"
    )
    with urllib.request.urlopen(url) as r:
        return json.load(r)["data"]


MUSCAT = {
    "muscat", "seeb", "muttrah", "bawshar", "al-amarat", "quriyat",
    "al-khuwair", "al-ghubrah", "azaiba", "ruwi", "qurum", "al-mawaleh",
    "al-khoud", "al-maabilah", "al-hail", "al-wadi-al-kabir",
}

if __name__ == "__main__":
    rows = {r["slug"]: r for r in cms_rows()}
    fails = []

    def check(name, ok, detail=""):
        print(("PASS  " if ok else "FAIL  ") + name + ("  :: " + detail if detail else ""))
        if not ok:
            fails.append(name + " :: " + detail)

    def base_slug(rendered):
        # rendered slug is `{listing.slug}-{citySlug}` unless already suffixed
        for s in rows:
            if rendered == s or rendered.startswith(s + "-"):
                return s
        return None

    for locale in ("ar", "en"):
        for facet, promise in [
            ("under-2000-omr", lambda r: 0 < float(r["price"]) < 2000),
            ("under-3000-omr", lambda r: 0 < float(r["price"]) < 3000),
            ("gcc-spec", lambda r: r.get("importOrigin") == "gcc"),
            ("muscat", lambda r: (r.get("city") or {}).get("slug") in MUSCAT),
        ]:
            path = f"/{locale}/used-cars/{facet}"
            cs = cards(path)
            bad = []
            unknown = []
            for c in cs:
                b = base_slug(c["slug"])
                if b is None:
                    unknown.append(c["slug"])
                    continue
                if not promise(rows[b]):
                    bad.append(
                        (c["slug"], rows[b].get("price"), rows[b].get("importOrigin"),
                         (rows[b].get("city") or {}).get("slug"))
                    )
            check(
                f"{path}: every rendered car keeps the promise",
                not bad and not unknown,
                f"cards={len(cs)} violations={bad} unresolved={unknown}",
            )
            # price text on the card must equal the DB price
            wrong = [
                (c["slug"], c["price"], rows[base_slug(c["slug"])]["price"])
                for c in cs
                if base_slug(c["slug"])
                and c["price"] != int(float(rows[base_slug(c["slug"])]["price"]))
            ]
            check(f"{path}: card price == database price", not wrong, str(wrong))

    print()
    print(f"{len(fails)} failures")
