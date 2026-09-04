/** Extract a JS object/array literal that follows `marker`. */
export function extractBalanced(source: string, marker: string): string | null {
  const idx = source.indexOf(marker);
  if (idx < 0) return null;
  let start = source.indexOf("=", idx);
  if (start < 0) return null;
  start += 1;
  while (start < source.length && /\s/.test(source[start])) start += 1;
  const open = source[start];
  if (open !== "{" && open !== "[") return null;
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  let quote: '"' | "'" | null = null;
  let escaped = false;
  for (let i = start; i < source.length; i += 1) {
    const ch = source[i];
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === quote) {
        quote = null;
      }
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

export function extractAllAssignments(source: string, name: string): string[] {
  const out: string[] = [];
  const needle = `${name} =`;
  let from = 0;
  while (from < source.length) {
    const idx = source.indexOf(needle, from);
    if (idx < 0) break;
    const extracted = extractBalanced(source.slice(idx), needle);
    if (extracted) out.push(extracted);
    from = idx + needle.length;
  }
  return out;
}
