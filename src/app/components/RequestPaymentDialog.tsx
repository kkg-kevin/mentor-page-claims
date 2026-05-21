import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Upload, FileText, X, Eye } from "lucide-react";
import { toast } from "sonner";

interface RequestPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseName: string;
  teachingMethod: string;
  progress: number;
  initialPaymentType?: "full" | "advance";
  onSubmitClaim: (claim: {
    paymentType: "full" | "advance";
    etimsDocument: string;
  }) => void;
}

export function RequestPaymentDialog({
  open,
  onOpenChange,
  courseName,
  teachingMethod,
  progress,
  initialPaymentType = "advance",
  onSubmitClaim,
}: RequestPaymentDialogProps) {
  const [paymentType, setPaymentType] = useState<"full" | "advance">(initialPaymentType);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setPaymentType(initialPaymentType);
    }
  }, [initialPaymentType, open]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload a PDF or image file.");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size too large. Maximum size is 5MB.");
      return;
    }

    setUploadedFile(file);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    toast.success("eTIMS document uploaded successfully!");
  };

  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setUploadedFile(null);
    setPreviewUrl(null);
  };

  const handlePreview = () => {
    if (previewUrl) {
      window.open(previewUrl, "_blank");
    }
  };

  const handleSubmit = () => {
    if (!uploadedFile) {
      toast.error("Please upload an eTIMS document before submitting.");
      return;
    }

    onSubmitClaim({
      paymentType,
      etimsDocument: uploadedFile.name,
    });

    toast.success("Payment claim submitted successfully!");
    onOpenChange(false);

    // Reset form
    handleRemoveFile();
    setPaymentType(initialPaymentType);
  };

  const paymentTypeLabel = paymentType === "full" ? "Full Payment" : "Advance Payment";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-[#25476a]">Request {paymentTypeLabel}</DialogTitle>
          <DialogDescription>
            Submit a payment claim for {courseName} via {teachingMethod} (Progress:{" "}
            {Math.round(progress)}%)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Payment Type
            </p>
            <p className="mt-1 text-lg font-semibold text-[#25476a]">
              {paymentTypeLabel}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              {paymentType === "full"
                ? "Full payment requires 100% completion."
                : "Advance payment requires at least 30% completion."}
            </p>
          </div>

          {/* eTIMS Document Upload */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">eTIMS Document</Label>
            <div className="space-y-2">
              {!uploadedFile ? (
                <label
                  htmlFor="etims-upload"
                  className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-[#38aae1] hover:bg-gray-50 transition-colors"
                >
                  <Upload className="h-10 w-10 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-700">
                    Upload eTIMS Document
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    PDF or Image (max 5MB)
                  </span>
                  <input
                    id="etims-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileUpload}
                  />
                </label>
              ) : (
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-[#38aae1]" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {uploadedFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(uploadedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handlePreview}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveFile}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-[#25476a] hover:bg-[#25476a]/90"
          >
            Submit {paymentTypeLabel} Claim
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
