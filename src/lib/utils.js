export const CURRENCY = "Rs.";

export const formatPrice = (n) =>
	`${CURRENCY}${Number(n ?? 0).toLocaleString("en-US")}`;
