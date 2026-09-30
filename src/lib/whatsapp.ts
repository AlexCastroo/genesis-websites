/** Click-to-chat link; `phone` in any format (only digits are kept). */
export function whatsappLink(phone: string, message?: string): string {
  const url = `https://wa.me/${phone.replace(/\D/g, '')}`;
  return message ? `${url}?text=${encodeURIComponent(message)}` : url;
}
