import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { DollarSign, Clock, CheckCircle, XCircle } from "lucide-react";

export function StatsOverview() {
  const stats = [
    {
      label: "Total Claims",
      value: "5",
      icon: DollarSign,
      color: "bg-[#25476a]",
    },
    {
      label: "Paid Claims",
      value: "2",
      icon: CheckCircle,
      color: "bg-green-500",
    },
    {
      label: "Pending Claims",
      value: "3",
      icon: Clock,
      color: "bg-[#feb139]",
    },
    {
      label: "Rejected Claims",
      value: "0",
      icon: XCircle,
      color: "bg-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-[#25476a] mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
