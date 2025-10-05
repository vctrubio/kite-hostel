"use client";
import { PaymentIcon } from "@/svgs";
import { DateSince } from "@/components/formatters/DateSince";
import { ENTITY_DATA } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Trash2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { deletePayment } from "@/actions/payment-actions";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TeacherPaymentsProps {
  payments: any[];
  compact?: boolean;
  onPaymentDeleted?: () => void;
}

export function TeacherPayments({ payments, compact = false, onPaymentDeleted }: TeacherPaymentsProps) {
  const paymentEntity = ENTITY_DATA.find(entity => entity.name === "Payment");
  const dropdownButtonClasses = "border-2 border-gray-300 dark:border-gray-600 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900/20 px-2";
  
  const handleDeletePayment = async (paymentId: string) => {
    const result = await deletePayment(paymentId);
    if (result.success) {
      toast.success("Payment deleted successfully!");
      onPaymentDeleted?.();
    } else {
      toast.error(result.error || "Failed to delete payment");
    }
  };

  if (!payments || payments.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 border-2 border-dashed border-gray-300 dark:border-gray-600">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">Payment History</h2>
        <p className="text-gray-600 dark:text-gray-400">No payments found for this teacher.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {payments.map((payment: any) => (
        <div key={payment.id} className={`bg-white dark:bg-gray-800 rounded-lg border ${compact ? 'p-3' : 'p-4'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PaymentIcon className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} ${paymentEntity?.color || "text-amber-500"}`} />
              <div>
                <div className={`font-semibold ${compact ? 'text-base' : 'text-lg'}`}>
                  €{payment.amount % 1 === 0 ? payment.amount.toString() : payment.amount.toFixed(2)}
                </div>
                {!compact && (
                  <div className="text-sm text-gray-500">
                    <DateSince dateString={payment.created_at} />
                  </div>
                )}
              </div>
              {compact && (
                <div className="text-xs text-gray-500">
                  <DateSince dateString={payment.created_at} />
                </div>
              )}
            </div>
            
            {/* Delete Payment Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={dropdownButtonClasses}
                >
                  <Trash2 className={`${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuItem
                  onClick={() => handleDeletePayment(payment.id)}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20 p-3"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      <span className="font-medium">Delete Payment</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Are you sure you want to delete this <strong>€{payment.amount}</strong> payment? This action cannot be undone.
                    </div>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );
}