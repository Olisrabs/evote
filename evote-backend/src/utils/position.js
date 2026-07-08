/**
 * Normalizes a position string to title case, collapsing extra spaces and trimming.
 * E.g., "general secretary" -> "General Secretary"
 *       "General SEcertary" -> "General Secertary"
 *       "vice president" -> "Vice President"
 */
export function normalizePosition(pos) {
  if (!pos) return '';
  return pos
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .split(' ')
    .map(word => {
      if (word.length === 0) return '';
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}
