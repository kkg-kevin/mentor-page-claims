import { useMemo, useState } from "react";
import {
  type CourseProgressRecord,
  type TeachingMethodType,
  courseProgressRecords,
  getCourseProgress,
  getCourseStatus,
  getTeachingMethodMeta,
} from "./components/TeachingMethodCard";
import { ClaimsSection, initialClaims, type Claim } from "./components/ClaimsSection";
import { RequestPaymentDialog } from "./components/RequestPaymentDialog";
import { Toaster } from "./components/ui/sonner";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";
import { ArrowLeft, Check, ChevronDown, Download, X } from "lucide-react";

type AssignmentState = "issued" | "submitted" | "graded";

const studentCountsByCourseId: Record<string, number> = {
  "physical-game-design": 15,
  "online-3d-modeling": 12,
  "home-robotics": 8,
  "online-animation": 14,
  "physical-animation": 16,
  "home-game-design": 9,
  "online-robotics": 13,
  "center-creative-coding": 18,
  "google-meet-ai-basics": 20,
};

const assignmentSteps: Array<{ state: AssignmentState; label: string }> = [
  { state: "issued", label: "Issued" },
  { state: "submitted", label: "Submitted" },
  { state: "graded", label: "Graded" },
];

const sessionRate = 900;
const sessionDuration = "1 hour";

const teachingMethodFilterOptions: Array<{
  value: TeachingMethodType;
  label: string;
}> = [
  { value: "physical", label: "Physical Classes" },
  { value: "online", label: "Online Classes" },
  { value: "home", label: "Home Sessions" },
  { value: "center", label: "Center Sessions" },
  { value: "google-meet", label: "Google Meet Classes" },
];

const activityViewByMethod: Record<
  TeachingMethodType,
  {
    overviewDescription: string;
    sessionSummaryDescription: string;
    sessionHeading: string;
    attendanceHeading: string;
    attendanceLabel: string;
    participantLabel: string;
    assignmentHeading: string;
    reportHeading: string;
    paymentLabel: string;
  }
> = {
  physical: {
    overviewDescription:
      "Track physical class sessions, learner attendance, assignments, and reports.",
    sessionSummaryDescription:
      "Simple status for each completed physical location session.",
    sessionHeading: "Physical Sessions",
    attendanceHeading: "Attendance",
    attendanceLabel: "Learners present",
    participantLabel: "learners",
    assignmentHeading: "Assignment",
    reportHeading: "Session Report",
    paymentLabel: "Physical session payment total",
  },
  home: {
    overviewDescription:
      "Track home-based sessions, learner attendance, assignments, and visit reports.",
    sessionSummaryDescription:
      "Simple status for each completed home location session.",
    sessionHeading: "Home Sessions",
    attendanceHeading: "Home Attendance",
    attendanceLabel: "Learners present",
    participantLabel: "learners",
    assignmentHeading: "Home Assignment",
    reportHeading: "Visit Report",
    paymentLabel: "Home session payment total",
  },
  online: {
    overviewDescription:
      "Track online sessions, learner attendance, assignments, and class reports.",
    sessionSummaryDescription:
      "Simple status for each completed online class session.",
    sessionHeading: "Online Sessions",
    attendanceHeading: "Online Attendance",
    attendanceLabel: "Learners joined",
    participantLabel: "learners",
    assignmentHeading: "Online Assignment",
    reportHeading: "Class Report",
    paymentLabel: "Online session payment total",
  },
  center: {
    overviewDescription:
      "Track center sessions, learner attendance, assignments, and reports.",
    sessionSummaryDescription:
      "Simple status for each completed center session.",
    sessionHeading: "Center Sessions",
    attendanceHeading: "Attendance",
    attendanceLabel: "Learners present",
    participantLabel: "learners",
    assignmentHeading: "Assignment",
    reportHeading: "Report",
    paymentLabel: "Center session payment total",
  },
  "google-meet": {
    overviewDescription:
      "Track Google Meet sessions, learner joins, assignments, and session reports.",
    sessionSummaryDescription:
      "Simple status for each completed Google Meet session.",
    sessionHeading: "Google Meet Sessions",
    attendanceHeading: "Meet Attendance",
    attendanceLabel: "Learners joined",
    participantLabel: "learners",
    assignmentHeading: "Meet Assignment",
    reportHeading: "Meet Report",
    paymentLabel: "Google Meet payment total",
  },
};

type CourseTimelineItem = CourseProgressRecord & {
  method: ReturnType<typeof getTeachingMethodMeta>;
  progress: number;
  status: string;
  isCurrent: boolean;
};

function getMetric(course: CourseProgressRecord, label: CourseProgressRecord["metrics"][number]["label"]) {
  return course.metrics.find((metric) => metric.label === label);
}

function getSessionDetails(course: CourseProgressRecord) {
  const studentCount = studentCountsByCourseId[course.id] ?? 12;
  const sessionsMetric = getMetric(course, "Sessions");
  const attendanceMetric = getMetric(course, "Attendance");
  const reportMetric = getMetric(course, "Report");
  const completedSessions = sessionsMetric?.value ?? 0;
  const averageAttendance = attendanceMetric
    ? attendanceMetric.value / attendanceMetric.total
    : 0;
  const reportCoverage = reportMetric ? reportMetric.value / reportMetric.total : 0;
  const assignmentStates: AssignmentState[] = ["graded", "submitted", "issued"];

  return Array.from({ length: completedSessions }, (_, index) => {
    const attendanceOffset = ((index % 5) - 2) * 0.04;
    const attendanceRate = Math.max(0, Math.min(1, averageAttendance + attendanceOffset));
    const studentsPresent = Math.min(
      studentCount,
      Math.max(0, Math.round(studentCount * attendanceRate)),
    );

    return {
      session: index + 1,
      studentsPresent,
      attendancePercentage: Math.round((studentsPresent / studentCount) * 100),
      assignmentState: assignmentStates[index % assignmentStates.length],
      reportCreated: index / Math.max(completedSessions, 1) < reportCoverage,
    };
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatMetricValue(metric: CourseProgressRecord["metrics"][number]) {
  const percentage = Math.round((metric.value / metric.total) * 100);

  if (metric.format === "count") {
    return `${metric.value}/${metric.total} (${percentage}%)`;
  }

  return `${percentage}%`;
}

function isAssignmentStepDone(
  currentState: AssignmentState,
  stepState: AssignmentState,
) {
  const stateOrder: Record<AssignmentState, number> = {
    issued: 0,
    submitted: 1,
    graded: 2,
  };

  return stateOrder[currentState] >= stateOrder[stepState];
}

function getTimelineFilterLabel(selectedValues: TeachingMethodType[]) {
  if (selectedValues.length === 0) {
    return "Filter by type";
  }

  if (selectedValues.length === 1) {
    return (
      teachingMethodFilterOptions.find((option) => option.value === selectedValues[0])
        ?.label ?? "Filter by type"
    );
  }

  return `${selectedValues.length} types selected`;
}

function CourseDetailPage({
  course,
  studentCount,
  sessionDetails,
  onBack,
  onSubmitClaim,
}: {
  course: CourseTimelineItem;
  studentCount: number;
  sessionDetails: ReturnType<typeof getSessionDetails>;
  onBack: () => void;
  onSubmitClaim: (claim: {
    course: CourseProgressRecord;
    teachingMethod: string;
    paymentType: "full" | "advance";
    etimsDocument: string;
    progress: number;
  }) => void;
}) {
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState<"full" | "advance">(
    "advance",
  );
  const Icon = course.method.icon;
  const totalMentorPayment = sessionDetails.length * sessionRate;
  const activityView = activityViewByMethod[course.teachingMethod];
  const createdReports = sessionDetails.filter((session) => session.reportCreated).length;
  const gradedAssignments = sessionDetails.filter(
    (session) => session.assignmentState === "graded",
  ).length;
  const plannedSessions = getMetric(course, "Sessions")?.total ?? sessionDetails.length;
  const completedSessionProgress =
    plannedSessions > 0 ? (sessionDetails.length / plannedSessions) * 100 : 0;
  const summaryStats = [
    {
      label: "Completed",
      value: `${sessionDetails.length}/${plannedSessions}`,
      helper: activityView.sessionHeading.toLowerCase(),
    },
    {
      label: "Reports",
      value: String(createdReports),
      helper: "submitted",
    },
    {
      label: "Assignments",
      value: String(gradedAssignments),
      helper: "graded",
    },
    {
      label: "Estimated payment",
      value: formatCurrency(totalMentorPayment),
      helper: "mentor total",
    },
  ];
  const isEligibleForAdvance = course.progress >= 30;

  return (
    <>
      <div className="space-y-6">
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-5">
            <div className="flex items-start gap-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onBack}
                className="shrink-0"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#25476a] text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-xl font-semibold text-[#25476a]">
                      {course.courseName}
                    </h2>
                    <p className="text-sm text-gray-600">{course.method.label}</p>
                  </div>
                </div>
                <div className="mt-4 grid max-w-4xl grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {summaryStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2"
                    >
                      <p className="text-xs font-medium text-gray-500">{stat.label}</p>
                      <p className="mt-1 text-lg font-semibold text-[#25476a]">
                        {stat.value}
                      </p>
                      <p className="text-xs text-gray-500">{stat.helper}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold text-[#25476a]">General Overview</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {activityView.overviewDescription}
                  </p>
                </div>
                <Badge className="bg-[#38aae1] text-white hover:bg-[#38aae1]">
                  {Math.round(course.progress)}% overall
                </Badge>
              </div>

              <div className="mt-5 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">
                      Overall Course Progress
                    </span>
                    <span className="font-semibold text-[#25476a]">
                      {Math.round(course.progress)}%
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full bg-[#38aae1]"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>

                {course.metrics.map((metric) => {
                  const percentage = (metric.value / metric.total) * 100;

                  return (
                    <div key={metric.label} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{metric.label}</span>
                        <span className="font-semibold text-gray-800">
                          {formatMetricValue(metric)}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full bg-[#38aae1]"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-semibold text-[#25476a]">Payment Action</p>
              <p className="mt-2 text-sm text-gray-600">
                Request payment from this course page after reviewing the progress and session summary.
              </p>
              <div className="mt-4 grid grid-cols-1 gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    setSelectedPaymentType("advance");
                    setIsPaymentDialogOpen(true);
                  }}
                  disabled={!isEligibleForAdvance}
                  className="w-full bg-[#25476a] hover:bg-[#25476a]/90 disabled:bg-gray-300"
                >
                  Advance Payment
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setSelectedPaymentType("full");
                    setIsPaymentDialogOpen(true);
                  }}
                  disabled={course.progress < 100}
                  variant="outline"
                  className="w-full border-[#25476a] text-[#25476a] hover:bg-[#25476a]/10 disabled:border-gray-200 disabled:text-gray-400"
                >
                  Full Payment
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold text-[#25476a]">Session Summary</h3>
              <p className="mt-1 text-sm text-gray-600">
                {activityView.sessionSummaryDescription}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-[#25476a] text-white hover:bg-[#25476a]">
                {sessionDetails.length}/{plannedSessions} sessions
              </Badge>
              <Badge className="bg-[#38aae1] text-white hover:bg-[#38aae1]">
                {Math.round(completedSessionProgress)}% complete
              </Badge>
            </div>
          </div>

          <div className="hidden grid-cols-[150px_minmax(0,1fr)_180px_150px] gap-4 border-b border-gray-200 bg-gray-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 lg:grid">
            <span>{activityView.sessionHeading}</span>
            <span>{activityView.attendanceHeading}</span>
            <span className="text-center">{activityView.assignmentHeading}</span>
            <span className="text-center">{activityView.reportHeading}</span>
          </div>

          <div className="divide-y divide-gray-100">
            {sessionDetails.map((session) => (
              <div
                key={session.session}
                className="grid grid-cols-1 gap-4 px-5 py-4 lg:grid-cols-[150px_minmax(0,1fr)_180px_150px]"
              >
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 lg:hidden">
                    {activityView.sessionHeading}
                  </p>
                  <p className="font-semibold text-[#25476a]">Session {session.session}</p>
                  <p className="mt-1 text-xs text-gray-500">{sessionDuration}</p>
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 lg:hidden">
                    {activityView.attendanceHeading}
                  </p>
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="text-gray-600">{activityView.attendanceLabel}</span>
                    <span className="font-semibold text-gray-800">
                      {session.studentsPresent} of {studentCount} {activityView.participantLabel}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full bg-[#38aae1]"
                      style={{ width: `${session.attendancePercentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {session.attendancePercentage}% attendance
                  </p>
                </div>

                <div className="flex items-start lg:justify-center">
                  <span className="mr-3 text-xs font-semibold uppercase tracking-wide text-gray-500 lg:hidden">
                    {activityView.assignmentHeading}
                  </span>
                  <div className="grid w-full max-w-[250px] grid-cols-3 overflow-hidden rounded-md border border-gray-200 bg-white lg:mx-auto">
                    {assignmentSteps.map((step) => {
                      const isDone = isAssignmentStepDone(
                        session.assignmentState,
                        step.state,
                      );
                      const Icon = isDone ? Check : X;

                      return (
                        <div
                          key={step.state}
                          className={`flex min-w-0 flex-col items-center justify-center gap-1 border-r border-gray-200 px-2 py-2 text-[11px] font-medium last:border-r-0 ${
                            isDone
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-50 text-gray-400"
                          }`}
                        >
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                              isDone ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
                            }`}
                          >
                            <Icon className="h-3 w-3" />
                          </span>
                          <span className="truncate text-center leading-none">{step.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-start lg:justify-center">
                  <span className="mr-3 text-xs font-semibold uppercase tracking-wide text-gray-500 lg:hidden">
                    {activityView.reportHeading}
                  </span>
                  {session.reportCreated ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 border-green-200 bg-green-50 px-2 text-green-700 hover:bg-green-100 hover:text-green-800"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </Button>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-[#feb139]/30 bg-[#feb139]/10 text-[#25476a]"
                    >
                      Pending
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 bg-gray-50 px-5 py-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Payment
                </p>
                <p className="mt-1 font-semibold text-[#25476a]">
                  {activityView.paymentLabel}
                </p>
              </div>
              <div className="text-sm">
                <p className="text-gray-500">Price per session</p>
                <p className="font-semibold text-gray-800">
                  {formatCurrency(sessionRate)}
                </p>
              </div>
              <div className="text-sm">
                <p className="text-gray-500">Completed sessions</p>
                <p className="font-semibold text-gray-800">
                  {sessionDetails.length} x {sessionDuration}
                </p>
              </div>
              <div className="rounded-lg bg-[#25476a] p-4 text-white md:text-right">
                <p className="text-xs font-medium text-white/75">Total amount</p>
                <p className="mt-1 text-2xl font-bold">
                  {formatCurrency(totalMentorPayment)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <RequestPaymentDialog
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        courseName={course.courseName}
        teachingMethod={course.method.label}
        progress={course.progress}
        initialPaymentType={selectedPaymentType}
        onSubmitClaim={({ paymentType, etimsDocument }) =>
          onSubmitClaim({
            course,
            teachingMethod: course.method.label,
            paymentType,
            etimsDocument,
            progress: course.progress,
          })
        }
      />
    </>
  );
}

export default function App() {
  const [claims, setClaims] = useState<Claim[]>(initialClaims);
  const [completedClaimCourseIds, setCompletedClaimCourseIds] = useState<string[]>([]);
  const progressTimeline = useMemo(
    () =>
      [...courseProgressRecords]
        .filter((course) => !completedClaimCourseIds.includes(course.id))
        .sort(
          (a, b) =>
            new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime(),
        )
        .map((course, index) => {
          const method = getTeachingMethodMeta(course.teachingMethod);
          return {
            ...course,
            method,
            progress: getCourseProgress(course),
            status: getCourseStatus(course),
            isCurrent: index === 0,
          };
        }),
    [completedClaimCourseIds],
  );
  const [selectedCourseId, setSelectedCourseId] = useState(
    progressTimeline[0]?.id ?? "",
  );
  const [showAllCourses, setShowAllCourses] = useState(false);
  const [timelineMethodFilters, setTimelineMethodFilters] = useState<
    TeachingMethodType[]
  >([]);
  const [detailCourseId, setDetailCourseId] = useState<string | null>(null);
  const detailCourse = detailCourseId
    ? progressTimeline.find((item) => item.id === detailCourseId)
    : null;
  const detailStudentCount = detailCourse
    ? studentCountsByCourseId[detailCourse.id] ?? 12
    : 0;
  const detailSessionDetails = detailCourse ? getSessionDetails(detailCourse) : [];
  const filteredTimeline =
    timelineMethodFilters.length === 0
      ? progressTimeline
      : progressTimeline.filter((item) =>
          timelineMethodFilters.includes(item.teachingMethod),
        );
  const visibleTimeline = showAllCourses ? filteredTimeline : filteredTimeline.slice(0, 3);

  const handleSubmitClaim = ({
    course,
    teachingMethod,
    paymentType,
    etimsDocument,
    progress,
  }: {
    course: CourseProgressRecord;
    teachingMethod: string;
    paymentType: "full" | "advance";
    etimsDocument: string;
    progress: number;
  }) => {
    const nextClaimNumber = claims.length + 1;
    const submittedDate = new Date().toISOString().slice(0, 10);
    const amount = paymentType === "full" ? 50000 : 15000;

    const newClaim: Claim = {
      id: `CLM-${String(nextClaimNumber).padStart(3, "0")}`,
      courseId: course.id,
      courseName: course.courseName,
      teachingMethod,
      paymentType,
      amount,
      status: "pending",
      submittedDate,
      etimsDocument,
      progress: Math.round(progress),
    };

    setClaims((currentClaims) => [newClaim, ...currentClaims]);

    if (paymentType === "full") {
      setCompletedClaimCourseIds((currentIds) => [...currentIds, course.id]);
      setSelectedCourseId((currentId) => {
        if (currentId !== course.id) {
          return currentId;
        }

        const nextCourse = courseProgressRecords.find(
          (record) =>
            record.id !== course.id && !completedClaimCourseIds.includes(record.id),
        );

        return nextCourse?.id ?? "";
      });
    }
  };

  const handleOpenCourseDetail = (courseId: string) => {
    setSelectedCourseId(courseId);
    setDetailCourseId(courseId);
  };

  const toggleTimelineMethodFilter = (method: TeachingMethodType) => {
    setTimelineMethodFilters((currentFilters) =>
      currentFilters.includes(method)
        ? currentFilters.filter((item) => item !== method)
        : [...currentFilters, method],
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {detailCourse ? (
          <CourseDetailPage
            course={detailCourse}
            studentCount={detailStudentCount}
            sessionDetails={detailSessionDetails}
            onBack={() => setDetailCourseId(null)}
            onSubmitClaim={handleSubmitClaim}
          />
        ) : (
          <>
            {/* Teaching Methods Section */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-6">
                <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                  <div className="flex flex-col gap-3 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-semibold text-[#25476a]">
                        Mentor Claims by Course
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">
                        Review claim-ready course progress by delivery type and open a course to request payment.
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="flex h-9 w-[210px] items-center justify-between gap-2 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 shadow-xs hover:bg-gray-50"
                          >
                            <span className="truncate">
                              {getTimelineFilterLabel(timelineMethodFilters)}
                            </span>
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[230px]">
                          <DropdownMenuItem onClick={() => setTimelineMethodFilters([])}>
                            Clear type filter
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {teachingMethodFilterOptions.map((option) => (
                            <DropdownMenuCheckboxItem
                              key={option.value}
                              checked={timelineMethodFilters.includes(option.value)}
                              onCheckedChange={() =>
                                toggleTimelineMethodFilter(option.value)
                              }
                              onSelect={(event) => event.preventDefault()}
                            >
                              {option.label}
                            </DropdownMenuCheckboxItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      {!showAllCourses && filteredTimeline.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowAllCourses(true)}
                          className="self-start text-sm font-semibold text-[#25476a] underline-offset-4 hover:text-[#38aae1] hover:underline sm:self-auto"
                        >
                          View all
                        </button>
                      )}
                      <span className="text-xs text-gray-500">
                        Showing {visibleTimeline.length} of {filteredTimeline.length}
                      </span>
                    </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="w-[34%] px-5">Course</TableHead>
                        <TableHead>Teaching Method</TableHead>
                        <TableHead>Last Update</TableHead>
                        <TableHead className="text-right pr-5">Progress</TableHead>
                        <TableHead className="w-[120px] pr-5 text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visibleTimeline.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="px-5 py-10 text-center text-gray-500">
                            No courses found matching this type.
                          </TableCell>
                        </TableRow>
                      ) : (
                        visibleTimeline.map((item) => {
                        const Icon = item.method.icon;
                        const isSelected = selectedCourseId === item.id;

                        return (
                          <TableRow
                            key={item.id}
                            onClick={() => handleOpenCourseDetail(item.id)}
                            className={`cursor-pointer ${
                              isSelected ? "bg-[#38aae1]/10 hover:bg-[#38aae1]/10" : ""
                            }`}
                          >
                            <TableCell className="px-5">
                              <div className="flex items-center gap-3">
                                <div className="flex h-full min-h-12 flex-col items-center">
                                  <span
                                    className={`flex h-7 w-7 items-center justify-center rounded-full border ${
                                      isSelected
                                        ? "border-[#38aae1] bg-[#38aae1] text-white"
                                        : "border-gray-300 bg-white text-gray-500"
                                    }`}
                                  >
                                    <Icon className="h-4 w-4" />
                                  </span>
                                </div>
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-semibold text-[#25476a]">
                                      {item.courseName}
                                    </span>
                                    {item.isCurrent && (
                                      <Badge className="bg-[#feb139] text-[#25476a] hover:bg-[#feb139]">
                                        Current
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="mt-1 max-w-md text-xs text-gray-500">
                                    {item.status}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-gray-800">
                                  {item.method.label}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {item.method.description}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-700">
                              {item.lastUpdated}
                            </TableCell>
                            <TableCell className="pr-5 text-right">
                              <div className="flex items-center justify-end gap-3">
                                <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200">
                                  <div
                                    className="h-full bg-[#38aae1]"
                                    style={{ width: `${item.progress}%` }}
                                  />
                                </div>
                                <span className="w-10 font-semibold text-[#25476a]">
                                  {Math.round(item.progress)}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="pr-5 text-right">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleOpenCourseDetail(item.id);
                                }}
                                className="text-sm font-semibold text-[#25476a] underline-offset-4 hover:text-[#38aae1] hover:underline"
                              >
                                View more
                              </button>
                            </TableCell>
                          </TableRow>
                        );
                      }))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            {/* Claims Section */}
            <ClaimsSection claims={claims} />
          </>
        )}
      </div>
      <Toaster />
    </div>
  );
}
