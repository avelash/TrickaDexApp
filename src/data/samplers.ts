/**
 * Monthly sampler videos, curated by hand.
 *
 * Add one entry per month, keyed the way monthKey() formats a date:
 * `${fullYear}-${month + 1}` — so September 2026 is "2026-9", October "2026-10".
 *
 * A month with no entry simply shows no sampler challenge, which is the honest
 * failure mode when the list has not been topped up yet.
 *
 * Titles are video titles, so they stay as-is in both languages.
 */
export interface MonthlySampler {
  url: string;
  title: string;
}

export const MONTHLY_SAMPLERS: Record<string, MonthlySampler> = {
  "2026-8": {
    url: "https://www.youtube.com/watch?v=rK7ID2SO_Iw",
    title: "Mr Double ABCDEF - Arcade Lions (2013) | TRICKING",
  },
  "2026-9": {
    url: "https://www.youtube.com/watch?v=tZJvSEW5wO0",
    title: "Anis Cheurfa - BorN to TrickZ",
  },
  "2026-10": {
    url: "https://www.youtube.com/watch?v=11Z_0VKnHyw",
    title: 'MICHAEL GUTHRIE // "BODY OF WORK" // NEW HEIGHTS 2016',
  },
};
