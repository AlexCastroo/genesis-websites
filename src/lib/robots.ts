import type { SiteConfig } from '../config/site';
import { absoluteUrl } from './seo';

/** Crawlers that fetch pages to answer or cite in AI search. Always allowed. */
export const AI_SEARCH_BOTS = [
  'OAI-SearchBot',
  'ChatGPT-User',
  'PerplexityBot',
  'Perplexity-User',
  'Claude-SearchBot',
  'Claude-User',
  'Bingbot',
  'Applebot',
  'DuckAssistBot',
];

/** Crawlers that collect data to train models. Controlled by SITE.aiTraining. */
export const AI_TRAINING_BOTS = [
  'GPTBot',
  'ClaudeBot',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
  'Meta-ExternalAgent',
];

export function buildRobots(site: Pick<SiteConfig, 'url' | 'aiTraining'>): string {
  const groups = [
    ['User-agent: *', 'Allow: /'],
    ['# AI search and citation', ...AI_SEARCH_BOTS.map((bot) => `User-agent: ${bot}`), 'Allow: /'],
    [
      `# AI model training (SITE.aiTraining = ${site.aiTraining})`,
      ...AI_TRAINING_BOTS.map((bot) => `User-agent: ${bot}`),
      site.aiTraining ? 'Allow: /' : 'Disallow: /',
    ],
    [`Sitemap: ${absoluteUrl(site.url, '/sitemap-index.xml')}`],
  ];
  return `${groups.map((group) => group.join('\n')).join('\n\n')}\n`;
}
