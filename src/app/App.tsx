import { useMemo, useState } from "react";
import {
  courseProgressRecords,
  getCourseProgress,
  getTeachingMethodMeta,
  TeachingMethodCard,
} from "./components/TeachingMethodCard";
import { ClaimsSection } from "./components/ClaimsSection";
import { StatsOverview } from "./components/StatsOverview";
import { Toaster } from "./components/ui/sonner";
import { Badge } from "./components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";

const courseSummary = {
  activeCourses: 3,
  teachingMethods: 3,
  learnerGroup: "Junior Coding Track",
};

export default function App() {
  const progressTimeline = useMemo(
    () =>
      [...courseProgressRecords]
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
            isCurrent: index === 0,
          };
        }),
    [],
  );
  const [selectedCourseId, setSelectedCourseId] = useState(
    progressTimeline[0].id,
  );
  const selectedCourse =
    progressTimeline.find((item) => item.id === selectedCourseId) ?? progressTimeline[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h1 className="text-3xl font-bold text-[#25476a]">Mentor Payment Dashboard</h1>
          <p className="text-gray-600 mt-2">Track your teaching progress and manage payment claims</p>
        </div>

        {/* Stats Overview */}
        <StatsOverview />

        {/* Teaching Methods Section */}
        <div className="space-y-4">
          <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#38aae1]">
                Courses Progress
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-[#25476a]">
                Mentor Course Delivery
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Track progress for each course inside physical, home, and online teaching methods.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3 md:min-w-[480px]">
              <div>
                <p className="text-xs font-medium text-gray-500">Active Courses</p>
                <p className="font-semibold text-[#25476a]">
                  {courseSummary.activeCourses}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Teaching Methods</p>
                <p className="font-semibold text-[#25476a]">
                  {courseSummary.teachingMethods}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Learners</p>
                <p className="font-semibold text-[#25476a]">
                  {courseSummary.learnerGroup}
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-5 py-4">
                <h3 className="font-semibold text-[#25476a]">Course Activity Timeline</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Most recent progress is listed first. Select a row to view the full progress card.
                </p>
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
                  {progressTimeline.map((item) => {
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
                                {item.courseCode} - {item.status}
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

            <TeachingMethodCard course={selectedCourse} />
          </div>
        </div>

        {/* Claims Section */}
        <ClaimsSection />
      </div>
      <Toaster />
    </div>
  );
}
