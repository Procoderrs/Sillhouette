

export const CURRENCY = "Rs.";
export const formatPrice = (n) => `${CURRENCY}${n.toLocaleString("en-US")}`;