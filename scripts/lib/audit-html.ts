/** Regex-based checks over Astro's generated HTML (attributes always double-quoted). */
export function auditHtml(html: string): string[] {
  const issues: string[] = [];
  const h1Count = (html.match(/<h1[\s>]/g) ?? []).length;
  if (h1Count !== 1) issues.push(`expected 1 <h1>, found ${h1Count}`);
  if (!/<html[^>]*\slang="[^"]+"/.test(html)) issues.push('missing <html lang>');
  if (!/<title>[^<]+<\/title>/.test(html)) issues.push('missing <title>');
  if (!/<meta name="description" content="[^"]+"/.test(html)) {
    issues.push('missing meta description');
  }
  if (!/<link rel="canonical" href="https?:\/\/[^"]+"/.test(html)) {
    issues.push('missing absolute canonical');
  }
  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(match[1]!);
    } catch {
      issues.push('invalid JSON-LD');
    }
  }
  for (const match of html.matchAll(/<img\b[^>]*>/g)) {
    const tag = match[0];
    if (!/\salt="/.test(tag)) issues.push(`<img> without alt: ${tag.slice(0, 80)}`);
    if (!/\swidth="/.test(tag) || !/\sheight="/.test(tag)) {
      issues.push(`<img> without width/height: ${tag.slice(0, 80)}`);
    }
  }
  if (/\shref=""/.test(html)) issues.push('empty href');
  return issues;
}
