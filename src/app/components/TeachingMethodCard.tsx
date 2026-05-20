import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { MapPin, Home, Monitor, AlertCircle } from "lucide-react";
import { useState } from "react";
import { RequestPaymentDialog } from "./RequestPaymentDialog";

interface TeachingMethodCardProps {
  course: CourseProgressRecord;
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
  courseCode: string;
  lastUpdated: string;
  status: string;
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
    courseCode: "GD-101",
    lastUpdated: "May 20, 2026",
    status: "Most current",
    metrics: [
      { label: "Course Sessions", value: 8, total: 10, format: "count" },
      { label: "Lesson Content Covered", value: 2, total: 12, format: "count" },
      { label: "Learner Attendance", value: 85, total: 100, format: "percent" },
      { label: "Report", value: 80, total: 100, format: "percent" },
    ],
  },
  {
    id: "home-robotics",
    teachingMethod: "home",
    courseName: "Robotics",
    courseCode: "ROB-204",
    lastUpdated: "May 19, 2026",
    status: "Reviewed",
    metrics: [
      { label: "Course Sessions", value: 12, total: 12, format: "count" },
      { label: "Lesson Content Covered", value: 2, total: 12, format: "count" },
      { label: "Learner Attendance", value: 88, total: 100, format: "percent" },
      { label: "Report", value: 92, total: 100, format: "percent" },
    ],
  },
  {
    id: "online-animation",
    teachingMethod: "online",
    courseName: "Animation",
    courseCode: "ANI-118",
    lastUpdated: "May 18, 2026",
    status: "Reviewed",
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
    courseCode: "ANI-118",
    lastUpdated: "May 17, 2026",
    status: "In progress",
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
    courseCode: "GD-101",
    lastUpdated: "May 16, 2026",
    status: "In progress",
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
    courseCode: "ROB-204",
    lastUpdated: "May 15, 2026",
    status: "Needs update",
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

export function getTeachingMethodMeta(type: TeachingMethodType) {
  return teachingMethodMeta[type];
}

function formatMetricValue(metric: CourseProgressRecord["metrics"][number]) {
  if (metric.format === "percent") {
    return `${metric.value}%`;
  }

  return `${metric.value}/${metric.total}`;
}

export function TeachingMethodCard({ course }: TeachingMethodCardProps) {
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
            <p className="text-sm font-semibold text-[#25476a]">
              {method.label} - {course.courseCode}
            </p>
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
                      Eligible for advance payment (&gt;=30% complete)
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
        courseName={course.courseName}
        teachingMethod={method.label}
        progress={overallProgress}
      />
    </>
  );
}
