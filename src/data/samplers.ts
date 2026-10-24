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
  "2026-11": {
    url: "https://www.youtube.com/watch?v=-5P3N8-vqoQ",
    title: "Vellu - Freedom (2013)",
  },
  "2026-12": {
    url: "https://www.youtube.com/watch?v=Nxkpbv1G0Ro",
    title: "Rasmus Ott - Cut The Grass",
  },
  "2027-1": {
    url: "https://www.youtube.com/watch?v=HmtECzDvHNk",
    title: "Keep your own way",
  },
  "2027-2": {
    url: "https://www.youtube.com/watch?v=sk9d8ocURlc",
    title: "Daniel Graham - Grizzly Smash",
  },
  "2027-3": {
    url: "https://www.youtube.com/watch?v=e1FV3MOm6-I",
    title: "STRAT l Levi Borrego 2023 Sampler",
  },
  "2027-4": {
    url: "https://www.youtube.com/watch?v=7MVcHINmCJc",
    title: "Kojo - Home",
  },
  "2027-5": {
    url: "https://www.youtube.com/watch?v=7ODTE4YlCkw",
    title: "'TECOYAH' - Perfect Storm Sampler",
  },
  "2027-6": {
    url: "https://www.youtube.com/watch?v=PHugwqrit9k",
    title: "HI, HOW ARE YA JAM SAMPLER",
  },
  "2027-7": {
    url: "https://www.youtube.com/watch?v=NBa03on5wmg",
    title: "Matt Emig - Massacre",
  },
};
