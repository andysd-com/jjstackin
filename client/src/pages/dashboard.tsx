import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Route, Plus, Share, User } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EarningsOverview from "@/components/earnings-overview";
import JobFilters from "@/components/job-filters";
import JobCard from "@/components/job-card";
import MapPanel from "@/components/map-panel";
import RouteOptimizer from "@/components/route-optimizer";
import QuickAddModal from "@/components/quick-add-modal.tsx";
import SmartSuggestions from "@/components/smart-suggestions";
import { Job } from "@shared/schema";
import { JobAnalytics } from "@/types";

export default function Dashboard() {
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("roi");
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  // Fetch jobs
  const { data: jobs = [], isLoading: jobsLoading, refetch: refetchJobs } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  // Fetch analytics
  const { data: analytics } = useQuery<JobAnalytics>({
    queryKey: ["/api/analytics/dashboard"],
  });

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    if (platformFilter === "all") return true;
    return job.platform === platformFilter;
  });

  // Sort jobs
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case "roi":
        const aROI = parseFloat(a.roi as string) || 0;
        const bROI = parseFloat(b.roi as string) || 0;
        return bROI - aROI;
      case "proximity":
        // In production, this would use real distance calculation
        return 0;
      case "time":
        return (a.timeWindowEnd || new Date()).getTime() - (b.timeWindowEnd || new Date()).getTime();
      case "payout":
        return parseFloat(b.payout as string) - parseFloat(a.payout as string);
      default:
        return 0;
    }
  });

  const handleJobSelect = (jobId: string, selected: boolean) => {
    if (selected) {
      setSelectedJobs([...selectedJobs, jobId]);
    } else {
      setSelectedJobs(selectedJobs.filter(id => id !== jobId));
    }
  };

  const handleSelectAll = () => {
    if (selectedJobs.length === sortedJobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(sortedJobs.map(job => job.id!));
    }
  };

  const selectedJobsData = jobs.filter(job => selectedJobs.includes(job.id!));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <Route className="text-white w-4 h-4" />
              </div>
              <h1 className="text-xl font-semibold text-ink">StackRunner</h1>
              <Badge variant="secondary" className="bg-ok/10 text-ok">Pro</Badge>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-3">
              <Link href="/integrations">
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex"
                >
                  <Share className="w-4 h-4 mr-2" />
                  Integrations
                </Button>
              </Link>
              
              <Button size="sm" onClick={() => setQuickAddOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Quick Add
              </Button>

              {/* User Menu */}
              <div className="relative">
                <Button variant="ghost" size="sm" className="p-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-accent to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">JD</span>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Panel: Job Wall & Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Earnings Overview */}
            <EarningsOverview analytics={analytics} />

            {/* Job Filters */}
            <JobFilters
              platformFilter={platformFilter}
              setPlatformFilter={setPlatformFilter}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onSelectAll={handleSelectAll}
              jobs={jobs}
              selectedCount={selectedJobs.length}
            />

            {/* Job Wall */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-ink">Available Jobs</h3>
                <span className="text-sm text-sub">
                  Sorted by {sortBy} • Updated 2 min ago
                </span>
              </div>

              {jobsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : sortedJobs.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center">
                  <p className="text-sub">No jobs available. Try adjusting your filters or add some jobs!</p>
                  <Button 
                    onClick={() => setQuickAddOpen(true)}
                    className="mt-4"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Job
                  </Button>
                </div>
              ) : (
                sortedJobs.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    selected={selectedJobs.includes(job.id!)}
                    onSelect={(selected) => handleJobSelect(job.id!, selected)}
                  />
                ))
              )}
            </div>

            {/* Quick Actions for Selected Jobs */}
            {selectedJobs.length > 0 && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-ink">Quick Actions:</span>
                    <Button size="sm">
                      <Route className="w-4 h-4 mr-2" />
                      Optimize Selected ({selectedJobs.length})
                    </Button>
                    <Button variant="outline" size="sm">
                      Export CSV
                    </Button>
                  </div>
                  
                  <div className="text-sm text-sub">
                    Estimated route value: <span className="font-semibold text-ok">
                      ${selectedJobsData.reduce((sum, job) => sum + parseFloat(job.payout as string), 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Map & Route Optimizer */}
          <div className="space-y-6">
            {/* Map Panel */}
            <MapPanel jobs={sortedJobs} selectedJobs={selectedJobsData} />

            {/* Route Optimizer */}
            <RouteOptimizer selectedJobs={selectedJobsData} />

            {/* Smart Suggestions */}
            <SmartSuggestions />
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
          <div className="flex justify-around">
            <Link href="/jobs" className="flex flex-col items-center py-2 text-sub hover:text-ink">
              <div className="w-6 h-6 mb-1">📋</div>
              <span className="text-xs">Jobs</span>
            </Link>
            <Link href="/map" className="flex flex-col items-center py-2 text-sub hover:text-ink">
              <div className="w-6 h-6 mb-1">🗺️</div>
              <span className="text-xs">Map</span>
            </Link>
            <Link href="/routes" className="flex flex-col items-center py-2 text-sub hover:text-ink">
              <Route className="w-6 h-6 mb-1" />
              <span className="text-xs">Routes</span>
            </Link>
            <Link href="/earnings" className="flex flex-col items-center py-2 text-sub hover:text-ink">
              <div className="w-6 h-6 mb-1">📊</div>
              <span className="text-xs">Earnings</span>
            </Link>
          </div>
        </nav>
      </div>

      {/* Quick Add Modal */}
      <QuickAddModal
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onJobAdded={() => {
          refetchJobs();
          setQuickAddOpen(false);
        }}
      />
    </div>
  );
}
