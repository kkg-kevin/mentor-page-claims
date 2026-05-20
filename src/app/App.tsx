import { useMemo, useState } from "react";
import {
  type CourseProgressRecord,
  courseProgressRecords,
  getCourseProgress,
  getCourseStatus,
  getTeachingMethodMeta,
  TeachingMethodCard,
} from "./components/TeachingMethodCard";
import { ClaimsSection, initialClaims, type Claim } from "./components/ClaimsSection";
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
  const selectedCourse =
    progressTimeline.find((item) => item.id === selectedCourseId) ?? progressTimeline[0];
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Stats Overview */}
        <StatsOverview />

        {/* Teaching Methods Section */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold text-[#25476a]">Course Activity Timeline</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Most recent progress is listed first. Select a row to view the full progress card.
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleTimeline.map((item) => {
                    const Icon = item.method.icon;
                    const isSelected = selectedCourseId === item.id;

                    return (
                      <TableRow
                        key={item.id}
                        onClick={() => setSelectedCourseId(item.id)}
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
                            <p className="font-medium text-gray-800">{item.method.label}</p>
                            <p className="text-xs text-gray-500">{item.method.description}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-700">{item.lastUpdated}</TableCell>
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
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {selectedCourse && (
              <TeachingMethodCard
                course={selectedCourse}
                onSubmitClaim={handleSubmitClaim}
              />
            )}
          </div>
        </div>

        {/* Claims Section */}
        <ClaimsSection claims={claims} />
      </div>
      <Toaster />
    </div>
  );
}
