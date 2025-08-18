import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, DollarSign, TrendingUp, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EarningsOverview from "@/components/earnings-overview";
import { Earnings, Job } from "@shared/schema";
import { JobAnalytics } from "@/types";

export default function EarningsPage() {
  // Fetch earnings and analytics
  const { data: earnings = [] } = useQuery<Earnings[]>({
    queryKey: ["/api/earnings"],
  });

  const { data: analytics } = useQuery<JobAnalytics>({
    queryKey: ["/api/analytics/dashboard"],
  });

  const { data: jobs = [] } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  // Group earnings by platform
  const earningsByPlatform = earnings.reduce((acc, earning) => {
    if (!acc[earning.platform]) {
      acc[earning.platform] = {
        total: 0,
        count: 0,
        reimbursements: 0,
        tips: 0
      };
    }
    acc[earning.platform].total += parseFloat(earning.amount as string);
    acc[earning.platform].reimbursements += parseFloat(earning.reimbursement as string || '0');
    acc[earning.platform].tips += parseFloat(earning.tips as string || '0');
    acc[earning.platform].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number; reimbursements: number; tips: number; }>);

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instacart': return '#43B02A';
      case 'doordash': return '#FF3008';
      case 'uber': return '#000000';
      case 'fieldagent': return '#1E3A8A';
      case 'gigspot': return '#8B5CF6';
      case 'epms': return '#2563EB';
      case 'ellis': return '#DC2626';
      case 'alt360': return '#059669';
      case 'prestoshopper': return '#7C3AED';
      default: return '#6B7280';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <h1 className="text-xl font-semibold text-ink">Earnings</h1>
              <Badge variant="secondary">${analytics?.todayEarnings || '0.00'} today</Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          
          {/* Earnings Overview */}
          <EarningsOverview analytics={analytics} />

          {/* Platform Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Platform Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(earningsByPlatform).map(([platform, data]) => (
                  <div
                    key={platform}
                    className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getPlatformColor(platform) }}
                        />
                        <span className="font-medium capitalize">{platform}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {data.count} jobs
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-sub">Total Earned:</span>
                        <span className="font-medium">${data.total.toFixed(2)}</span>
                      </div>
                      
                      {data.reimbursements > 0 && (
                        <div className="flex justify-between">
                          <span className="text-sub">Reimbursements:</span>
                          <span className="font-medium">${data.reimbursements.toFixed(2)}</span>
                        </div>
                      )}
                      
                      {data.tips > 0 && (
                        <div className="flex justify-between">
                          <span className="text-sub">Tips:</span>
                          <span className="font-medium">${data.tips.toFixed(2)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-sub">Avg per job:</span>
                        <span className="font-medium">${(data.total / data.count).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {Object.keys(earningsByPlatform).length === 0 && (
                  <div className="col-span-full text-center py-8">
                    <p className="text-sub">No earnings data yet</p>
                    <p className="text-xs text-sub mt-1">
                      Complete some jobs to see your earnings breakdown
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Earnings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {earnings.slice(0, 10).map((earning) => {
                  const job = jobs.find(j => j.id === earning.jobId);
                  return (
                    <div
                      key={earning.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getPlatformColor(earning.platform) }}
                        />
                        <div>
                          <div className="font-medium text-sm capitalize">
                            {earning.platform}
                          </div>
                          {job && (
                            <div className="text-xs text-sub flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {job.address}
                            </div>
                          )}
                          <div className="text-xs text-sub">
                            {new Date(earning.date!).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-medium">${earning.amount}</div>
                        {parseFloat(earning.tips as string || '0') > 0 && (
                          <div className="text-xs text-sub">
                            +${earning.tips} tips
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {earnings.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-sub">No earnings recorded yet</p>
                    <p className="text-xs text-sub mt-1">
                      Complete jobs to start tracking your earnings
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}