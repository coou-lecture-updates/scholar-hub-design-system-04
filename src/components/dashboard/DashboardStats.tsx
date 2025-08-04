import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface StatItem {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

interface Props {
  stats: StatItem[];
  loading: boolean;
}

const DashboardStats: React.FC<Props> = ({ stats, loading }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
    {stats.map((stat, idx) => (
      <Card key={idx} className={`border-l-4 ${stat.color}`}>
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{stat.title}</p>
            <p className="text-3xl font-bold text-gray-900">
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                // Always show numerical values, including 0 (not "No data")
                stat.value
              )}
            </p>
          </div>
          <div className="rounded-full p-3 bg-white shadow-sm">
            {stat.icon}
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export default DashboardStats;
