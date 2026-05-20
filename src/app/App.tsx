import { TeachingMethodCard } from "./components/TeachingMethodCard";
import { ClaimsSection } from "./components/ClaimsSection";
import { StatsOverview } from "./components/StatsOverview";
import { Toaster } from "./components/ui/sonner";

export default function App() {
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
          <h2 className="text-2xl font-semibold text-[#25476a]">Teaching Methods Progress</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <TeachingMethodCard type="physical" />
            <TeachingMethodCard type="home" />
            <TeachingMethodCard type="online" />
          </div>
        </div>

        {/* Claims Section */}
        <ClaimsSection />
      </div>
      <Toaster />
    </div>
  );
}
