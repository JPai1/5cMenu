/** Quick live check that each dining source still returns dishes. */
const date = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Los_Angeles",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

function extractBalanced(source, marker) {
  const idx = source.indexOf(marker);
  if (idx < 0) return null;
  let start = source.indexOf("=", idx) + 1;
  while (/\s/.test(source[start])) start += 1;
  const open = source[start];
  if (open !== "{" && open !== "[") return null;
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let i = start; i < source.length; i += 1) {
    const ch = source[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (ch === open) depth += 1;
    else if (ch === close) {
      depth -= 1;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  return null;
}

async function bamco(name, url) {
  const html = await (await fetch(url, { headers: { "user-agent": UA } })).text();
  const items = JSON.parse(extractBalanced(html, "Bamco.menu_items =") || "null");
  console.log(name, items ? Object.keys(items).length + " items" : "NO ITEMS", url);
}

async function pomona(name, url) {
  const text = await (await fetch(url, { headers: { "user-agent": UA } })).text();
  const start = text.indexOf("(");
  const end = text.lastIndexOf(")");
  const data = JSON.parse(text.slice(start + 1, end));
  console.log(name, data.EatecExchange.menu.length + " menu rows", url);
}

async function sodexo() {
  const url = `https://api-prd.sodexomyway.net/v0.2/data/menu/13147001/15258?date=${date}`;
  const data = await (
    await fetch(url, {
      headers: {
        "user-agent": UA,
        "API-Key": "68717828-b754-420d-9488-4c37cb7d7ef7",
      },
    })
  ).json();
  const n = data.reduce((s, m) => s + m.groups.reduce((a, g) => a + g.items.length, 0), 0);
  console.log("Hoch-Shanahan", n + " items", url);
}

const today = date;
await Promise.all([
  bamco("McConnell", "https://pitzer.cafebonappetit.com/"),
  bamco("Malott", `https://scripps.cafebonappetit.com/cafe/malott-dining-commons/${today}/`),
  bamco("Collins", `https://collins-cmc.cafebonappetit.com/cafe/collins/${today}/`),
  pomona("Frary", "https://api.pomona.edu/eatec/Frary.json"),
  pomona("Frank", "https://api.pomona.edu/eatec/Frank.json"),
  sodexo(),
]);
