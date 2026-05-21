import { useMemo, useState } from "react";
import {
  type CourseProgressRecord,
  courseProgressRecords,
  getCourseProgress,
  getCourseStatus,
  getTeachingMethodMeta,
} from "./components/TeachingMethodCard";
import { ClaimsSection, initialClaims, type Claim } from "./components/ClaimsSection";
import { RequestPaymentDialog } from "./components/RequestPaymentDialog";
import { StatsOverview } from "./components/StatsOverview";
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
import { ArrowLeft } from "lucide-react";

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

const assignmentStateStyles: Record<AssignmentState, string> = {
  issued: "bg-gray-100 text-gray-700 hover:bg-gray-100",
  submitted: "bg-[#feb139] text-[#25476a] hover:bg-[#feb139]",
  graded: "bg-green-500 text-white hover:bg-green-500",
};

const assignmentStateLabels: Record<AssignmentState, string> = {
  issued: "Assignment issued",
  submitted: "Assignment submitted",
  graded: "Assignment graded",
};

const sessionRate = 900;
const sessionDuration = "1 hour";

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
  const Icon = course.method.icon;
  const totalMentorPayment = sessionDetails.length * sessionRate;
  const createdReports = sessionDetails.filter((session) => session.reportCreated).length;
  const gradedAssignments = sessionDetails.filter(
    (session) => session.assignmentState === "graded",
  ).length;
  const plannedSessions = getMetric(course, "Sessions")?.total ?? sessionDetails.length;
  const completedSessionProgress =
    plannedSessions > 0 ? (sessionDetails.length / plannedSessions) * 100 : 0;
  const summaryText = `${sessionDetails.length} sessions completed. ${createdReports} reports created. ${gradedAssignments} assignments graded. Estimated mentor payment is ${formatCurrency(totalMentorPayment)}.`;
  const isEligibleForAdvance = course.progress >= 30;

  return (
    <>
      <div className="space-y-6">
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-5 border-b border-gray-200 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
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
                <p className="mt-3 max-w-2xl text-sm text-gray-600">
                  {summaryText}
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-[#25476a] px-5 py-4 text-white">
              <p className="text-xs font-medium text-white/75">Total Payment</p>
              <p className="mt-1 text-2xl font-bold">{formatCurrency(totalMentorPayment)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold text-[#25476a]">General Overview</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Course progress, attendance, reports, and assignments in one place.
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
              <Button
                type="button"
                onClick={() => setIsPaymentDialogOpen(true)}
                disabled={!isEligibleForAdvance}
                className="mt-4 w-full bg-[#25476a] hover:bg-[#25476a]/90 disabled:bg-gray-300"
              >
                {isEligibleForAdvance ? "Request Payment" : "Progress below 30%"}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-[#25476a]">Session Summary</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Simple status for each completed session.
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

            <div className="divide-y divide-gray-100">
              {sessionDetails.map((session) => (
                <div
                  key={session.session}
                  className="grid grid-cols-1 gap-4 px-5 py-4 lg:grid-cols-[150px_minmax(0,1fr)_180px_150px_120px]"
                >
                  <div>
                    <p className="font-semibold text-[#25476a]">Session {session.session}</p>
                    <p className="mt-1 text-xs text-gray-500">{sessionDuration}</p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="text-gray-600">Attendance</span>
                      <span className="font-semibold text-gray-800">
                        {session.studentsPresent} of {studentCount} learners
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
                    <Badge className={assignmentStateStyles[session.assignmentState]}>
                      {assignmentStateLabels[session.assignmentState]}
                    </Badge>
                  </div>

                  <div className="flex items-start lg:justify-center">
                    <Badge
                      variant="outline"
                      className={
                        session.reportCreated
                          ? "border-green-200 bg-green-50 text-green-700"
                          : "border-gray-200 bg-gray-50 text-gray-600"
                      }
                    >
                      {session.reportCreated ? "Report created" : "Report not created"}
                    </Badge>
                  </div>

                  <div className="text-sm lg:text-right">
                    <p className="text-gray-500">Payment</p>
                    <p className="font-semibold text-[#25476a]">
                      {formatCurrency(sessionRate)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-5 py-4">
                <h3 className="font-semibold text-[#25476a]">Mentor Payment</h3>
                <p className="mt-1 text-sm text-gray-600">Calculated per completed session.</p>
              </div>
              <div className="space-y-4 p-5">
                {[
                  ["Price per session", formatCurrency(sessionRate)],
                  ["Time", sessionDuration],
                  ["Completed sessions", String(sessionDetails.length)],
                  ["Total amount", formatCurrency(totalMentorPayment)],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-4">
                    <span className="text-sm text-gray-600">{label}</span>
                    <span className="font-semibold text-[#25476a]">{value}</span>
                  </div>
                ))}
                <div className="rounded-lg bg-[#25476a] p-4 text-white">
                  <p className="text-xs font-medium text-white/75">
                    Total payment to mentor for this course
                  </p>
                  <p className="mt-1 text-2xl font-bold">
                    {formatCurrency(totalMentorPayment)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-[#25476a]">Course Details</h3>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Course name</span>
                  <span className="font-semibold text-gray-800">{course.courseName}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Activity type</span>
                  <span className="font-semibold text-gray-800">{course.method.label}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Last update</span>
                  <span className="font-semibold text-gray-800">{course.lastUpdated}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Overall progress</span>
                  <span className="font-semibold text-gray-800">
                    {Math.round(course.progress)}%
                  </span>
                </div>
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
  const [detailCourseId, setDetailCourseId] = useState<string | null>(null);
  const detailCourse = detailCourseId
    ? progressTimeline.find((item) => item.id === detailCourseId)
    : null;
  const detailStudentCount = detailCourse
    ? studentCountsByCourseId[detailCourse.id] ?? 12
    : 0;
  const detailSessionDetails = detailCourse ? getSessionDetails(detailCourse) : [];
  const visibleTimeline = showAllCourses ? progressTimeline : progressTimeline.slice(0, 3);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Stats Overview */}
        <StatsOverview />

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
                        Course Activity Timeline
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">
                        Most recent progress is listed first. Select a course to view the general overview.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAllCourses((current) => !current)}
                      className="self-start sm:self-auto"
                    >
                      {showAllCourses ? "Show latest" : "View all"}
                    </Button>
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
                      {visibleTimeline.map((item) => {
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
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleOpenCourseDetail(item.id);
                                }}
                              >
                                View more
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
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
