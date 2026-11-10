export const ORDER_STATUSES = [
	"pending_payment",
	"paid",
	"processing",
	"shipped",
	"delivered",
	"cancelled",
	"payment_failed",
];

export const ORDER_LABELS = {
	pending_payment: "Payment pending",
	paid: "Paid",
	processing: "Processing",
	shipped: "Shipped",
	delivered: "Delivered",
	cancelled: "Cancelled",
	payment_failed: "Payment failed",
};

export const ORDER_BADGE = {
	pending_payment: "border-amber-300 bg-amber-50 text-amber-800",
	paid: "border-emerald-300 bg-emerald-50 text-emerald-800",
	processing: "border-sky-300 bg-sky-50 text-sky-800",
	shipped: "border-sky-300 bg-sky-50 text-sky-800",
	delivered: "border-emerald-300 bg-emerald-50 text-emerald-800",
	cancelled: "border-neutral-300 bg-neutral-100 text-neutral-700",
	payment_failed: "border-red-300 bg-red-50 text-red-800",
};
