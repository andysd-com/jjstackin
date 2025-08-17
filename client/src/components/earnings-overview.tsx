import { Card } from "@/components/ui/card";
import { JobAnalytics } from "@/types";

interface EarningsOverviewProps {
  analytics?: JobAnalytics;
}

export default function EarningsOverview({ analytics }: EarningsOverviewProps) {
  const today = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <Card className="earnings-card text-white p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-lg font-semibold">Today's Earnings</h2>
          <p className="text-white/80 text-sm">{today}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">
            ${analytics?.todayEarnings || "0.00"}
          </div>
          <div className="text-sm text-white/80">
            +$32 vs yesterday
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-lg font-semibold">
            {analytics?.completedJobs || 0}
          </div>
          <div className="text-xs text-white/70">Completed</div>
        </div>
        <div>
          <div className="text-lg font-semibold">
            {analytics?.pendingJobs || 0}
          </div>
          <div className="text-xs text-white/70">Pending</div>
        </div>
        <div>
          <div className="text-lg font-semibold">
            {analytics?.hoursActive || "0.0"}h
          </div>
          <div className="text-xs text-white/70">Active</div>
        </div>
      </div>
    </Card>
  );
}
