import { supabase } from "@/services/supabase";

export interface CreatorFinanceBalance {
  currency: string;
  pendingMinor: number;
  availableMinor: number;
  paidMinor: number;
}

export type CreatorFinanceEntryType =
  | "earning_pending"
  | "earning_available"
  | "earning_release"
  | "refund_debit"
  | "chargeback_debit"
  | "adjustment_credit"
  | "adjustment_debit"
  | "payout_debit"
  | "payout_reversal";

export type CreatorFinanceBalanceBucket =
  | "pending"
  | "available"
  | "paid";

export interface CreatorFinanceLedgerEntry {
  id: string;
  currency: string;
  amountMinor: number;
  entryType: CreatorFinanceEntryType;
  balanceBucket:
    CreatorFinanceBalanceBucket;
  orderId: string | null;
  payoutId: string | null;
  grossAmountMinor: number | null;
  creatorShareMinor: number | null;
  platformShareMinor: number | null;
  providerFeeMinor: number | null;
  taxAmountMinor: number | null;
  shareBasisPoints: number | null;
  availableAt: string | null;
  description: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export type CreatorPayoutStatus =
  | "requested"
  | "reviewing"
  | "processing"
  | "paid"
  | "failed"
  | "cancelled"
  | "reversed";

export interface CreatorPayout {
  id: string;
  amountMinor: number;
  currency: string;
  status: CreatorPayoutStatus;
  provider: string | null;
  providerPayoutRef: string | null;
  failureCode: string | null;
  failureMessage: string | null;
  requestedAt: string;
  processingAt: string | null;
  paidAt: string | null;
  failedAt: string | null;
  cancelledAt: string | null;
  reversedAt: string | null;
}

interface BalanceRow {
  currency: string;
  pending_minor: number | string;
  available_minor: number | string;
  paid_minor: number | string;
}

interface LedgerRow {
  id: string;
  currency: string;
  amount_minor: number | string;
  entry_type: CreatorFinanceEntryType;
  balance_bucket:
    CreatorFinanceBalanceBucket;
  order_id: string | null;
  payout_id: string | null;
  gross_amount_minor:
    | number
    | string
    | null;
  creator_share_minor:
    | number
    | string
    | null;
  platform_share_minor:
    | number
    | string
    | null;
  provider_fee_minor:
    | number
    | string
    | null;
  tax_amount_minor:
    | number
    | string
    | null;
  share_basis_points:
    | number
    | null;
  available_at: string | null;
  description: string | null;
  metadata:
    | Record<string, unknown>
    | null;
  created_at: string;
}

interface PayoutRow {
  id: string;
  amount_minor: number | string;
  currency: string;
  status: CreatorPayoutStatus;
  provider: string | null;
  provider_payout_ref: string | null;
  failure_code: string | null;
  failure_message: string | null;
  requested_at: string;
  processing_at: string | null;
  paid_at: string | null;
  failed_at: string | null;
  cancelled_at: string | null;
  reversed_at: string | null;
}

function toSafeMinor(
  value:
    | number
    | string
    | null
    | undefined,
): number {
  const numeric =
    Number(value ?? 0);

  if (!Number.isFinite(numeric)) {
    return 0;
  }

  return Math.trunc(numeric);
}

function toNullableMinor(
  value:
    | number
    | string
    | null
    | undefined,
): number | null {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const numeric =
    Number(value);

  if (!Number.isFinite(numeric)) {
    return null;
  }

  return Math.trunc(numeric);
}

export async function getCreatorFinanceBalances(): Promise<
  CreatorFinanceBalance[]
> {
  const { data, error } =
    await supabase.rpc(
      "get_my_creator_finance_balances",
    );

  if (error) {
    throw new Error(
      `Creator bakiyesi alınamadı: ${error.message}`,
    );
  }

  const rows =
    Array.isArray(data)
      ? (data as BalanceRow[])
      : [];

  return rows.map((row) => ({
    currency:
      row.currency.toUpperCase(),
    pendingMinor:
      toSafeMinor(
        row.pending_minor,
      ),
    availableMinor:
      toSafeMinor(
        row.available_minor,
      ),
    paidMinor:
      toSafeMinor(
        row.paid_minor,
      ),
  }));
}

export async function getCreatorFinanceLedger(
  limit = 50,
): Promise<CreatorFinanceLedgerEntry[]> {
  const safeLimit =
    Math.max(
      1,
      Math.min(
        Math.trunc(limit),
        200,
      ),
    );

  const { data, error } =
    await supabase.rpc(
      "get_my_creator_finance_ledger",
      {
        p_limit: safeLimit,
      },
    );

  if (error) {
    throw new Error(
      `Creator finans hareketleri alınamadı: ${error.message}`,
    );
  }

  const rows =
    Array.isArray(data)
      ? (data as LedgerRow[])
      : [];

  return rows.map((row) => ({
    id: row.id,
    currency:
      row.currency.toUpperCase(),
    amountMinor:
      toSafeMinor(
        row.amount_minor,
      ),
    entryType:
      row.entry_type,
    balanceBucket:
      row.balance_bucket,
    orderId:
      row.order_id,
    payoutId:
      row.payout_id,
    grossAmountMinor:
      toNullableMinor(
        row.gross_amount_minor,
      ),
    creatorShareMinor:
      toNullableMinor(
        row.creator_share_minor,
      ),
    platformShareMinor:
      toNullableMinor(
        row.platform_share_minor,
      ),
    providerFeeMinor:
      toNullableMinor(
        row.provider_fee_minor,
      ),
    taxAmountMinor:
      toNullableMinor(
        row.tax_amount_minor,
      ),
    shareBasisPoints:
      row.share_basis_points,
    availableAt:
      row.available_at,
    description:
      row.description,
    metadata:
      row.metadata ?? {},
    createdAt:
      row.created_at,
  }));
}

export async function getCreatorPayoutHistory(
  limit = 30,
): Promise<CreatorPayout[]> {
  const safeLimit =
    Math.max(
      1,
      Math.min(
        Math.trunc(limit),
        100,
      ),
    );

  const { data, error } =
    await supabase.rpc(
      "get_my_creator_payouts",
      {
        p_limit: safeLimit,
      },
    );

  if (error) {
    throw new Error(
      `Payout geçmişi alınamadı: ${error.message}`,
    );
  }

  const rows =
    Array.isArray(data)
      ? (data as PayoutRow[])
      : [];

  return rows.map((row) => ({
    id: row.id,
    amountMinor:
      toSafeMinor(
        row.amount_minor,
      ),
    currency:
      row.currency.toUpperCase(),
    status: row.status,
    provider:
      row.provider,
    providerPayoutRef:
      row.provider_payout_ref,
    failureCode:
      row.failure_code,
    failureMessage:
      row.failure_message,
    requestedAt:
      row.requested_at,
    processingAt:
      row.processing_at,
    paidAt:
      row.paid_at,
    failedAt:
      row.failed_at,
    cancelledAt:
      row.cancelled_at,
    reversedAt:
      row.reversed_at,
  }));
}

export async function getCreatorFinanceSnapshot() {
  const [
    balances,
    ledger,
    payouts,
  ] = await Promise.all([
    getCreatorFinanceBalances(),
    getCreatorFinanceLedger(50),
    getCreatorPayoutHistory(30),
  ]);

  return {
    balances,
    ledger,
    payouts,
  };
}
