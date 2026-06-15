export const koboToNaira = (kobo: number | null | undefined): number =>
  Math.round((kobo ?? 0) / 100);

export const nairaToKobo = (naira: number | null | undefined): number =>
  Math.round((naira ?? 0) * 100);

export const formatNaira = (amount: number | null | undefined): string =>
  '₦' + Math.round(amount ?? 0).toLocaleString('en-NG');

export const formatKobo = (kobo: number | null | undefined): string =>
  formatNaira(koboToNaira(kobo));
