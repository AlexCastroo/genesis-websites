import { describe, expect, it } from 'vitest';
import { AI_SEARCH_BOTS, AI_TRAINING_BOTS, buildRobots } from './robots';

describe('buildRobots', () => {
  it('allows everyone and points to the sitemap with an absolute URL', () => {
    const txt = buildRobots({ url: 'https://example.com/', aiTraining: true });
    expect(txt).toMatch(/^User-agent: \*\nAllow: \//);
    expect(txt).toContain('Sitemap: https://example.com/sitemap-index.xml');
  });

  it('always allows AI search bots', () => {
    const txt = buildRobots({ url: 'https://example.com', aiTraining: false });
    for (const bot of AI_SEARCH_BOTS) expect(txt).toContain(`User-agent: ${bot}`);
    const searchGroup = txt.split('\n\n').find((group) => group.includes(AI_SEARCH_BOTS[0]!));
    expect(searchGroup).toContain('Allow: /');
  });

  it('disallows training bots only when aiTraining is false', () => {
    const group = (training: boolean) =>
      buildRobots({ url: 'https://example.com', aiTraining: training })
        .split('\n\n')
        .find((g) => g.includes(AI_TRAINING_BOTS[0]!));
    expect(group(true)).toContain('Allow: /');
    expect(group(false)).toContain('Disallow: /');
  });
});
