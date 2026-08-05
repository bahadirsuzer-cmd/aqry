export type PaymentUiStatus =
  | "paid"
  | "failed"
  | "cancelled"
  | "pending";

export type PaymentPurchaseKind =
  | "offer"
  | "gift"
  | "unknown";

export interface PaymentReturnState {
  status: PaymentUiStatus;
  orderId: string | null;
}

const SUPPORTED_STATUSES =
  new Set<PaymentUiStatus>([
    "paid",
    "failed",
    "cancelled",
    "pending",
  ]);

export function readPaymentReturnState(
  search: string = window.location.search,
): PaymentReturnState | null {
  const params =
    new URLSearchParams(search);

  const rawStatus =
    params.get("payment");

  if (
    !rawStatus ||
    !SUPPORTED_STATUSES.has(
      rawStatus as PaymentUiStatus,
    )
  ) {
    return null;
  }

  const orderId =
    params.get("orderId")?.trim() ||
    null;

  return {
    status:
      rawStatus as PaymentUiStatus,
    orderId,
  };
}

export function clearPaymentReturnParams() {
  const url =
    new URL(window.location.href);

  url.searchParams.delete("payment");
  url.searchParams.delete("orderId");

  window.history.replaceState(
    window.history.state,
    "",
    `${url.pathname}${url.search}${url.hash}`,
  );
}