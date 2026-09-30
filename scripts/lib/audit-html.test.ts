import { describe, expect, it } from 'vitest';
import { auditHtml } from './audit-html';

const page = (body: string, head = '') => `<!doctype html><html lang="es"><head><title>T</title>
<meta name="description" content="D"><link rel="canonical" href="https://example.com/">${head}</head><body>${body}</body></html>`;

describe('auditHtml', () => {
  it('accepts a correct page', () => {
    expect(
      auditHtml(
        page(
          '<h1>Hi</h1><img src="a.jpg" alt="" width="10" height="10">',
          '<script type="application/ld+json">{"a":1}</script>',
        ),
      ),
    ).toEqual([]);
  });

  it('reports h1 count, invalid JSON-LD and incomplete images', () => {
    const issues = auditHtml(
      page(
        '<h1>A</h1><h1>B</h1><img src="a.jpg">',
        '<script type="application/ld+json">{bad</script>',
      ),
    );
    expect(issues).toContain('expected 1 <h1>, found 2');
    expect(issues).toContain('invalid JSON-LD');
    expect(issues.some((issue) => issue.startsWith('<img> without alt'))).toBe(true);
    expect(issues.some((issue) => issue.startsWith('<img> without width/height'))).toBe(true);
  });

  it('reports missing head essentials and empty links', () => {
    const issues = auditHtml('<html><head></head><body><h1>x</h1><a href="">x</a></body></html>');
    expect(issues).toEqual(
      expect.arrayContaining([
        'missing <html lang>',
        'missing <title>',
        'missing meta description',
        'missing absolute canonical',
        'empty href',
      ]),
    );
  });
});
