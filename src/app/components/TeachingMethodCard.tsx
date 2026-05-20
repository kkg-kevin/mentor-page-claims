import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { MapPin, Home, Monitor, AlertCircle } from "lucide-react";
import { useState } from "react";
import { RequestPaymentDialog } from "./RequestPaymentDialog";

interface TeachingMethodCardProps {
  type: "physical" | "home" | "online";
}

// Mock data for different teaching methods
const mockData = {
  physical: {
    title: "Physical Location",
    icon: MapPin,
    metrics: [
      { label: "Sessions", value: 8, total: 10 },
      { label: "Course Completion", value: 75, total: 100 },
      { label: "Location/School", value: 1, total: 1 },
      { label: "Assignments Graded", value: 18, total: 25 },
      { label: "Reports Submitted", value: 3, total: 4 },
      { label: "Attendance", value: 85, total: 100 },
    ],
  },
  home: {
    title: "Home Location",
    icon: Home,
    metrics: [
      { label: "Sessions", value: 10, total: 12 },
      { label: "Course Completion", value: 90, total: 100 },
      { label: "Reports Submitted", value: 2, total: 3 },
      { label: "Assignments Graded", value: 15, total: 20 },
    ],
  },
  online: {
    title: "Online",
    icon: Monitor,
    metrics: [
      { label: "Sessions", value: 5, total: 8 },
      { label: "Course Completion", value: 60, total: 100 },
      { label: "Attendance", value: 70, total: 100 },
    ],
  },
};

export function TeachingMethodCard({ type }: TeachingMethodCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const data = mockData[type];
  const Icon = data.icon;

  // Calculate overall progress (weighted equally)
  const overallProgress =
    data.metrics.reduce((sum, metric) => {
      return sum + (metric.value / metric.total) * 100;
    }, 0) / data.metrics.length;

  const isEligibleForAdvance = overallProgress >= 30;
  const isEligibleForFull = overallProgress >= 100;

  return (
    <>
      <Card className="border-2 border-gray-200 hover:border-[#38aae1] transition-colors">
        <CardHeader className="bg-[#25476a] text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5" />
              <CardTitle className="text-lg">{data.title}</CardTitle>
            </div>
            <Badge
              variant={isEligibleForFull ? "default" : "secondary"}
              className={
                isEligibleForFull
                  ? "bg-green-500"
                  : isEligibleForAdvance
                  ? "bg-[#feb139]"
                  : "bg-gray-400"
              }
            >
              {Math.round(overallProgress)}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">Overall Progress</span>
              <span className="text-[#25476a] font-semibold">{Math.round(overallProgress)}%</span>
            </div>
            <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#38aae1] transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>

          {/* Individual Metrics */}
          <div className="space-y-3 pt-2">
            {data.metrics.map((metric, index) => {
              const percentage = (metric.value / metric.total) * 100;
              return (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">{metric.label}</span>
                    <span className="text-gray-700 font-medium">
                      {metric.value}/{metric.total}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#38aae1] transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Payment Eligibility Notice */}
          {isEligibleForAdvance && (
            <div className="mt-4 p-3 bg-[#38aae1]/10 border border-[#38aae1]/30 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-[#38aae1] mt-0.5" />
                <div className="text-xs text-gray-700">
                  {isEligibleForFull ? (
                    <span className="font-medium">Eligible for full payment (100% complete)</span>
                  ) : (
                    <span className="font-medium">
                      Eligible for advance payment (≥30% complete)
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Request Payment Button */}
          <Button
            onClick={() => setIsDialogOpen(true)}
            disabled={!isEligibleForAdvance}
            className="w-full bg-[#25476a] hover:bg-[#25476a]/90 disabled:bg-gray-300"
          >
            Request Payment
          </Button>
        </CardContent>
      </Card>

      <RequestPaymentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        teachingMethod={data.title}
        progress={overallProgress}
      />
    </>
  );
}
