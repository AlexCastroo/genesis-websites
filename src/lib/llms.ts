import type { FaqItem } from './schema';

export interface LlmsLink {
  title: string;
  url: string;
  note?: string;
}

export interface LlmsInput {
  name: string;
  description: string;
  tagline: string;
  facts: string[];
  services: LlmsLink[];
  faqs: FaqItem[];
  posts: LlmsLink[];
  contact: string[];
  languages: LlmsLink[];
}

const link = (item: LlmsLink) =>
  `- [${item.title}](${item.url})${item.note ? `: ${item.note}` : ''}`;

/** https://llmstxt.org layout: H1, blockquote summary, free text, then H2 sections. */
export function buildLlms(input: LlmsInput): string {
  const lines = [`# ${input.name}`, '', `> ${input.description}`, '', input.tagline, ''];
  const section = (title: string, body: string[]) => {
    if (body.length > 0) lines.push(`## ${title}`, '', ...body, '');
  };
  section(
    'About',
    input.facts.map((fact) => `- ${fact}`),
  );
  section('Services', input.services.map(link));
  section(
    'FAQ',
    input.faqs.flatMap((faq) => [`### ${faq.q}`, '', faq.a, '']),
  );
  section('Blog', input.posts.map(link));
  section(
    'Contact',
    input.contact.map((item) => `- ${item}`),
  );
  section('Other languages', input.languages.map(link));
  return `${lines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trimEnd()}\n`;
}
