"""Crawl every internal link reachable from the buyer journey and report dead ends."""
import re
import sys
import urllib.error
import urllib.parse
import urllib.request

BASE = "http://localhost:3050"
SCRIPT_RE = re.compile(r"<script\b.*?</script>", re.S | re.I)

seen = {}
edges = {}


def fetch(path):
    req = urllib.request.Request(BASE + path, method="GET")
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, r.geturl(), r.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, BASE + path, e.read().decode()
    except Exception as e:  # noqa
        return 0, BASE + path, str(e)


def links(html):
    v = SCRIPT_RE.sub("", html)
    out = set()
    for href in re.findall(r'<a[^>]+href="([^"]+)"', v):
        if href.startswith(("http", "mailto:", "tel:", "#", "javascript:")):
            continue
        p = urllib.parse.urlsplit(href).path
        if p:
            out.add(p)
    return out


SEEDS = []
for loc in ("ar", "en"):
    SEEDS += [
        f"/{loc}",
        f"/{loc}/used-cars",
        f"/{loc}/used-cars/muscat",
        f"/{loc}/used-cars/gcc-spec",
        f"/{loc}/used-cars/under-2000-omr",
        f"/{loc}/used-cars/under-3000-omr",
    ]

queue = list(SEEDS)
depth = {p: 0 for p in SEEDS}
MAXD = 2
while queue:
    path = queue.pop(0)
    if path in seen:
        continue
    status, final, html = fetch(path)
    seen[path] = (status, final)
    if depth.get(path, 0) >= MAXD or status != 200:
        continue
    for l in links(html):
        edges.setdefault(l, set()).add(path)
        if l not in seen and l not in depth:
            depth[l] = depth[path] + 1
            queue.append(l)

bad = {p: v for p, v in seen.items() if v[0] != 200}
print(f"crawled {len(seen)} internal URLs from the buyer journey")
for p, (st, final) in sorted(bad.items()):
    print(f"  {st}  {p}   linked from: {sorted(edges.get(p, []))[:4]}")
print(f"\n{len(bad)} non-200 internal destinations")
