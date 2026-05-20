import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { MapPin, Home, Monitor } from "lucide-react";
import { useState } from "react";
import { RequestPaymentDialog } from "./RequestPaymentDialog";

interface TeachingMethodCardProps {
  course: CourseProgressRecord;
  onSubmitClaim: (claim: {
    course: CourseProgressRecord;
    teachingMethod: string;
    paymentType: "full" | "advance";
    etimsDocument: string;
    progress: number;
  }) => void;
}

export type TeachingMethodType = "physical" | "home" | "online";

const teachingMethodMeta = {
  physical: {
    label: "Physical Location",
    icon: MapPin,
    description: "In-person delivery",
  },
  home: {
    label: "Home Location",
    icon: Home,
    description: "Home-based delivery",
  },
  online: {
    label: "Online",
    icon: Monitor,
    description: "Virtual delivery",
  },
};

export interface CourseProgressRecord {
  id: string;
  teachingMethod: TeachingMethodType;
  courseName: string;
  lastUpdated: string;
  metrics: Array<{
    label: "Course Sessions" | "Lesson Content Covered" | "Learner Attendance" | "Report";
    value: number;
    total: number;
    format: "count" | "percent";
  }>;
}

export const courseProgressRecords: CourseProgressRecord[] = [
  {
    id: "physical-game-design",
    teachingMethod: "physical",
    courseName: "Game Design",
    lastUpdated: "May 20, 2026",
    metrics: [
      { label: "Course Sessions", value: 8, total: 10, format: "count" },
      { label: "Lesson Content Covered", value: 2, total: 12, format: "count" },
      { label: "Learner Attendance", value: 85, total: 100, format: "percent" },
      { label: "Report", value: 80, total: 100, format: "percent" },
    ],
  },
  {
    id: "online-3d-modeling",
    teachingMethod: "online",
    courseName: "3D Modeling",
    lastUpdated: "May 20, 2026",
    metrics: [
      { label: "Course Sessions", value: 1, total: 8, format: "count" },
      { label: "Lesson Content Covered", value: 1, total: 12, format: "count" },
      { label: "Learner Attendance", value: 24, total: 100, format: "percent" },
      { label: "Report", value: 20, total: 100, format: "percent" },
    ],
  },
  {
    id: "home-robotics",
    teachingMethod: "home",
    courseName: "Robotics",
    lastUpdated: "May 19, 2026",
    metrics: [
      { label: "Course Sessions", value: 12, total: 12, format: "count" },
      { label: "Lesson Content Covered", value: 12, total: 12, format: "count" },
      { label: "Learner Attendance", value: 100, total: 100, format: "percent" },
      { label: "Report", value: 100, total: 100, format: "percent" },
    ],
  },
  {
    id: "online-animation",
    teachingMethod: "online",
    courseName: "Animation",
    lastUpdated: "May 18, 2026",
    metrics: [
      { label: "Course Sessions", value: 6, total: 8, format: "count" },
      { label: "Lesson Content Covered", value: 2, total: 12, format: "count" },
      { label: "Learner Attendance", value: 76, total: 100, format: "percent" },
      { label: "Report", value: 70, total: 100, format: "percent" },
    ],
  },
  {
    id: "physical-animation",
    teachingMethod: "physical",
    courseName: "Animation",
    lastUpdated: "May 17, 2026",
    metrics: [
      { label: "Course Sessions", value: 7, total: 10, format: "count" },
      { label: "Lesson Content Covered", value: 2, total: 12, format: "count" },
      { label: "Learner Attendance", value: 81, total: 100, format: "percent" },
      { label: "Report", value: 74, total: 100, format: "percent" },
    ],
  },
  {
    id: "home-game-design",
    teachingMethod: "home",
    courseName: "Game Design",
    lastUpdated: "May 16, 2026",
    metrics: [
      { label: "Course Sessions", value: 5, total: 8, format: "count" },
      { label: "Lesson Content Covered", value: 2, total: 12, format: "count" },
      { label: "Learner Attendance", value: 74, total: 100, format: "percent" },
      { label: "Report", value: 66, total: 100, format: "percent" },
    ],
  },
  {
    id: "online-robotics",
    teachingMethod: "online",
    courseName: "Robotics",
    lastUpdated: "May 15, 2026",
    metrics: [
      { label: "Course Sessions", value: 4, total: 8, format: "count" },
      { label: "Lesson Content Covered", value: 2, total: 12, format: "count" },
      { label: "Learner Attendance", value: 69, total: 100, format: "percent" },
      { label: "Report", value: 58, total: 100, format: "percent" },
    ],
  },
];

export function getCourseProgress(course: CourseProgressRecord) {
  return (
    course.metrics.reduce((sum, metric) => {
      return sum + (metric.value / metric.total) * 100;
    }, 0) / course.metrics.length
  );
}

export function getCourseStatus(course: CourseProgressRecord) {
  return getCourseProgress(course) >= 100 ? "Completed" : "In progress";
}

export function getTeachingMethodMeta(type: TeachingMethodType) {
  return teachingMethodMeta[type];
}

function formatMetricValue(metric: CourseProgressRecord["metrics"][number]) {
  if (metric.format === "percent") {
    return `${metric.value}%`;
  }

  return `${metric.value}/${metric.total}`;
}

export function TeachingMethodCard({ course, onSubmitClaim }: TeachingMethodCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const method = teachingMethodMeta[course.teachingMethod];
  const Icon = method.icon;

  const overallProgress = getCourseProgress(course);
  const isEligibleForAdvance = overallProgress >= 30;
  const isEligibleForFull = overallProgress >= 100;

  return (
    <>
      <Card className="border-2 border-gray-200 hover:border-[#38aae1] transition-colors">
        <CardHeader className="bg-[#25476a] text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5" />
              <CardTitle className="text-lg">{course.courseName}</CardTitle>
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
          <div>
            <p className="text-sm font-semibold text-[#25476a]">{method.label}</p>
            <p className="mt-1 text-xs text-gray-500">
              {method.description}. Last updated {course.lastUpdated}.
            </p>
          </div>

          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">Course Progress</span>
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
            {course.metrics.map((metric, index) => {
              const percentage = (metric.value / metric.total) * 100;
              return (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">{metric.label}</span>
                    <span className="text-gray-700 font-medium">
                      {formatMetricValue(metric)}
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

          {/* Request Payment Button */}
          <Button
            onClick={() => setIsDialogOpen(true)}
            disabled={!isEligibleForAdvance}
            className="w-full bg-[#25476a] hover:bg-[#25476a]/90 disabled:bg-gray-300"
          >
            {isEligibleForAdvance ? "Request Payment" : "Progress below 30% threshold"}
          </Button>
        </CardContent>
      </Card>

      <RequestPaymentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        courseName={course.courseName}
        teachingMethod={method.label}
        progress={overallProgress}
        onSubmitClaim={({ paymentType, etimsDocument }) =>
          onSubmitClaim({
            course,
            teachingMethod: method.label,
            paymentType,
            etimsDocument,
            progress: overallProgress,
          })
        }
      />
    </>
  );
}
