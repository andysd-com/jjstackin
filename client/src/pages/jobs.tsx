import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import JobCard from "@/components/job-card";
import JobFilters from "@/components/job-filters";
import QuickAddModal from "@/components/quick-add-modal.tsx";
import { Job } from "@shared/schema";

export default function JobsPage() {
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("roi");
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  // Fetch jobs
  const { data: jobs = [], isLoading: jobsLoading, refetch: refetchJobs } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  // Filter and sort jobs
  const filteredJobs = jobs.filter(job => {
    if (platformFilter === "all") return true;
    return job.platform === platformFilter;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case "roi":
        const aROI = parseFloat(a.roi as string) || 0;
        const bROI = parseFloat(b.roi as string) || 0;
        return bROI - aROI;
      case "payout":
        return parseFloat(b.payout as string) - parseFloat(a.payout as string);
      case "time":
        return (a.timeWindowEnd || new Date()).getTime() - (b.timeWindowEnd || new Date()).getTime();
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
              <h1 className="text-xl font-semibold text-ink">All Jobs</h1>
              <Badge variant="secondary">{sortedJobs.length} available</Badge>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button size="sm" onClick={() => setQuickAddOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Job
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="mb-6">
          <JobFilters
            platformFilter={platformFilter}
            setPlatformFilter={setPlatformFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            selectedCount={selectedJobs.length}
            jobs={sortedJobs}
            onSelectAll={() => {
              if (selectedJobs.length === sortedJobs.length) {
                setSelectedJobs([]);
              } else {
                setSelectedJobs(sortedJobs.map(job => job.id!));
              }
            }}
          />
        </div>

        {/* Job Grid */}
        <div className="grid gap-4">
          {jobsLoading ? (
            <div className="text-center py-8">Loading jobs...</div>
          ) : sortedJobs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sub">No jobs match your filters</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setQuickAddOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Job
              </Button>
            </div>
          ) : (
            sortedJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                selected={selectedJobs.includes(job.id!)}
                onSelect={(selected) => handleJobSelect(job.id!, selected)}
              />
            ))
          )}
        </div>
      </div>

      {/* Quick Add Modal */}
      <QuickAddModal
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onJobAdded={refetchJobs}
      />
    </div>
  );
}