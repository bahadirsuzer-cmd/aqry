import type {
  PaymentPurchaseKind,
  PaymentUiStatus,
} from "@/services/paymentStatus";
import { PaymentStatusCard } from "./PaymentStatusCard";

interface PaymentStatusOverlayProps {
  status: PaymentUiStatus;
  purchaseKind?: PaymentPurchaseKind;
  onContinue?: () => void;
  onRetry?: () => void;
}

export function PaymentStatusOverlay({
  status,
  purchaseKind = "unknown",
  onContinue,
  onRetry,
}: PaymentStatusOverlayProps) {
  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto bg-gradient-to-b from-violet-50/95 via-white to-white px-5 py-8">
      <div className="mx-auto flex min-h-full w-full max-w-[700px] flex-col items-center justify-center">
        <div className="mb-7 text-[27px] font-black tracking-[-0.065em] text-primary">
          AQRYO.
        </div>

        <PaymentStatusCard
          status={status}
          purchaseKind={purchaseKind}
          onContinue={onContinue}
          onRetry={onRetry}
        />
      </div>
    </div>
  );
}