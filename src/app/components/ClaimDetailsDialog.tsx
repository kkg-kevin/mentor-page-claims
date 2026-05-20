import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Calendar, DollarSign, FileText, TrendingUp } from "lucide-react";

interface Claim {
  id: string;
  teachingMethod: string;
  paymentType: "full" | "advance";
  amount: number;
  status: "paid" | "pending" | "rejected";
  submittedDate: string;
  processedDate?: string;
  etimsDocument: string;
  progress: number;
}

interface ClaimDetailsDialogProps {
  claim: Claim;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClaimDetailsDialog({ claim, open, onOpenChange }: ClaimDetailsDialogProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-[#feb139]/20 text-[#feb139] border-[#feb139]/30";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-[#25476a] text-2xl">Claim Details</DialogTitle>
            <Badge className={getStatusColor(claim.status)}>
              {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
            </Badge>
          </div>
          <DialogDescription>
            View detailed information about your payment claim including amount, status, and progress.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Claim ID and Method */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">{claim.id}</h3>
            <p className="text-gray-600">{claim.teachingMethod}</p>
          </div>

          <Separator />

          {/* Payment Information */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm font-medium">Payment Amount</span>
              </div>
              <p className="text-2xl font-bold text-[#25476a]">
                {formatCurrency(claim.amount)}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">Payment Type</span>
              </div>
              <p className="text-lg font-semibold text-gray-800">
                {claim.paymentType.charAt(0).toUpperCase() + claim.paymentType.slice(1)} Payment
              </p>
            </div>
          </div>

          <Separator />

          {/* Progress Information */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Completion Progress</span>
              <span className="text-lg font-bold text-[#25476a]">{claim.progress}%</span>
            </div>
            <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#38aae1] transition-all duration-300"
                style={{ width: `${claim.progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">
              {claim.progress >= 100
                ? "All requirements completed"
                : claim.progress >= 30
                ? "Eligible for advance payment"
                : "Not yet eligible for payment"}
            </p>
          </div>

          <Separator />

          {/* Dates */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-600">Submitted Date</p>
                <p className="text-gray-800">{formatDate(claim.submittedDate)}</p>
              </div>
            </div>

            {claim.processedDate && (
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Processed Date</p>
                  <p className="text-gray-800">{formatDate(claim.processedDate)}</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Document Information */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-600">
              <FileText className="h-4 w-4" />
              <span className="text-sm font-medium">eTIMS Document</span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="font-medium text-gray-800">{claim.etimsDocument}</p>
              <p className="text-xs text-gray-500 mt-1">
                Invoice document for payment verification
              </p>
            </div>
          </div>

          {/* Status Message */}
          {claim.status === "pending" && (
            <div className="bg-[#feb139]/10 border border-[#feb139]/30 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                Your claim is currently being reviewed. You will be notified once it has been
                processed.
              </p>
            </div>
          )}

          {claim.status === "paid" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                Payment has been successfully processed and transferred to your account.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
