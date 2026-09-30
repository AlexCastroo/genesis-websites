import { describe, expect, it } from 'vitest';
import { whatsappLink } from './whatsapp';

describe('whatsappLink', () => {
  it('keeps only digits of the phone number', () => {
    expect(whatsappLink('+34 600 000 000')).toBe('https://wa.me/34600000000');
  });

  it('url-encodes the prefilled message, including accents and symbols', () => {
    expect(
      whatsappLink('34600000000', 'Hola, quiero reservar Mat & Core el miércoles a las 09:00 +info'),
    ).toBe(
      'https://wa.me/34600000000?text=Hola%2C%20quiero%20reservar%20Mat%20%26%20Core%20el%20mi%C3%A9rcoles%20a%20las%2009%3A00%20%2Binfo',
    );
  });

  it('omits the text parameter for an empty message', () => {
    expect(whatsappLink('34600000000', '')).toBe('https://wa.me/34600000000');
  });
});
