/** Reads top-level `key: value` scalar lines. Nested/indented lines and comments are ignored. */
export function parseScalars(block: string): Record<string, string> {
  const data: Record<string, string> = {};
  for (const line of block.split(/\r?\n/)) {
    const match = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
    if (!match) continue;
    let value = match[2]!.trim();
    const quoted =
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"));
    if (quoted && value.length >= 2) value = value.slice(1, -1);
    data[match[1]!] = value;
  }
  return data;
}

/** Minimal frontmatter reader for Node-side tooling (config, scripts). Astro parses content itself. */
export function readFrontmatter(source: string): Record<string, string> {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);
  return match ? parseScalars(match[1]!) : {};
}
