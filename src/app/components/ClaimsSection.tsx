import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ChevronDown, ChevronUp, FileText, Calendar, DollarSign } from "lucide-react";

export interface Claim {
  id: string;
  courseId?: string;
  courseName?: string;
  teachingMethod: string;
  paymentType: "full" | "advance";
  amount: number;
  status: "paid" | "pending" | "rejected";
  submittedDate: string;
  processedDate?: string;
  etimsDocument: string;
  progress: number;
}

export const initialClaims: Claim[] = [
  {
    id: "CLM-001",
    teachingMethod: "Physical Classes",
    paymentType: "full",
    amount: 50000,
    status: "paid",
    submittedDate: "2026-04-15",
    processedDate: "2026-04-20",
    etimsDocument: "etims-001.pdf",
    progress: 100,
  },
  {
    id: "CLM-002",
    teachingMethod: "Online Classes",
    paymentType: "advance",
    amount: 15000,
    status: "paid",
    submittedDate: "2026-05-01",
    processedDate: "2026-05-05",
    etimsDocument: "etims-002.pdf",
    progress: 35,
  },
  {
    id: "CLM-003",
    teachingMethod: "Home Sessions",
    paymentType: "advance",
    amount: 20000,
    status: "pending",
    submittedDate: "2026-05-10",
    etimsDocument: "etims-003.pdf",
    progress: 40,
  },
  {
    id: "CLM-004",
    teachingMethod: "Physical Classes",
    paymentType: "full",
    amount: 50000,
    status: "pending",
    submittedDate: "2026-05-15",
    etimsDocument: "etims-004.pdf",
    progress: 100,
  },
  {
    id: "CLM-005",
    teachingMethod: "Online Classes",
    paymentType: "advance",
    amount: 15000,
    status: "pending",
    submittedDate: "2026-05-18",
    etimsDocument: "etims-005.pdf",
    progress: 32,
  },
];

interface ClaimsSectionProps {
  claims: Claim[];
}

export function ClaimsSection({ claims }: ClaimsSectionProps) {
  const [expandedClaim, setExpandedClaim] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date-desc");

  // Filter claims
  let filteredClaims = claims;

  if (statusFilter !== "all") {
    filteredClaims = filteredClaims.filter((claim) => claim.status === statusFilter);
  }

  if (methodFilter !== "all") {
    filteredClaims = filteredClaims.filter((claim) => claim.teachingMethod === methodFilter);
  }

  // Sort claims
  filteredClaims = [...filteredClaims].sort((a, b) => {
    switch (sortBy) {
      case "date-desc":
        return new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime();
      case "date-asc":
        return new Date(a.submittedDate).getTime() - new Date(b.submittedDate).getTime();
      case "amount-desc":
        return b.amount - a.amount;
      case "amount-asc":
        return a.amount - b.amount;
      default:
        return 0;
    }
  });

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
      month: "short",
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-[#25476a]">Payment Claims</h2>
        <div className="flex gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Teaching Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="Physical Classes">Physical Classes</SelectItem>
              <SelectItem value="Home Sessions">Home Sessions</SelectItem>
              <SelectItem value="Online Classes">Online Classes</SelectItem>
              <SelectItem value="Google Meet Classes">Google Meet Classes</SelectItem>
              <SelectItem value="Center Sessions">Center Sessions</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Newest First</SelectItem>
              <SelectItem value="date-asc">Oldest First</SelectItem>
              <SelectItem value="amount-desc">Highest Amount</SelectItem>
              <SelectItem value="amount-asc">Lowest Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        {filteredClaims.length === 0 ? (
          <Card className="border-gray-200">
            <CardContent className="p-12 text-center">
              <p className="text-gray-500">No claims found matching your filters.</p>
            </CardContent>
          </Card>
        ) : (
          filteredClaims.map((claim) => (
            <Card
              key={claim.id}
              className="border-2 border-gray-200 hover:border-[#38aae1] transition-colors cursor-pointer"
              onClick={() => setExpandedClaim(expandedClaim === claim.id ? null : claim.id)}
            >
              <CardContent className="p-0">
                {/* Summary View */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="bg-[#25476a] p-3 rounded-lg">
                      <FileText className="h-5 w-5 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{claim.id}</h3>
                        <Badge className={getStatusColor(claim.status)}>
                          {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {claim.courseName
                          ? `${claim.courseName} - ${claim.teachingMethod}`
                          : claim.teachingMethod}
                      </p>
                    </div>

                    <div className="hidden md:flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Amount</p>
                        <p className="font-semibold text-[#25476a]">
                          {formatCurrency(claim.amount)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-gray-500">Payment Type</p>
                        <p className="font-medium text-gray-700">
                          {claim.paymentType.charAt(0).toUpperCase() +
                            claim.paymentType.slice(1)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-gray-500">Submitted</p>
                        <p className="font-medium text-gray-700">
                          {formatDate(claim.submittedDate)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {expandedClaim === claim.id ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </div>

                {/* Expanded View */}
                {expandedClaim === claim.id && (
                  <div className="border-t border-gray-200 p-6 bg-gray-50 space-y-6">
                    {/* Progress Bar */}
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

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600">
                          <DollarSign className="h-4 w-4" />
                          <span className="text-sm font-medium">Payment Information</span>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <p className="text-xs text-gray-500">Amount</p>
                          <p className="text-2xl font-bold text-[#25476a]">
                            {formatCurrency(claim.amount)}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {claim.paymentType.charAt(0).toUpperCase() + claim.paymentType.slice(1)} Payment
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm font-medium">Important Dates</span>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-2">
                          <div>
                            <p className="text-xs text-gray-500">Submitted Date</p>
                            <p className="text-sm font-medium text-gray-800">
                              {formatDate(claim.submittedDate)}
                            </p>
                          </div>
                          {claim.processedDate && (
                            <div>
                              <p className="text-xs text-gray-500">Processed Date</p>
                              <p className="text-sm font-medium text-gray-800">
                                {formatDate(claim.processedDate)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Document Information */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm font-medium">eTIMS Document</span>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
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
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
