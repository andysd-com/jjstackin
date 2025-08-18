import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckSquare } from "lucide-react";
import { Job } from "@shared/schema";

interface JobFiltersProps {
  platformFilter: string;
  setPlatformFilter: (platform: string) => void;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  onSelectAll: () => void;
  jobs: Job[];
  selectedCount: number;
}

export default function JobFilters({
  platformFilter,
  setPlatformFilter,
  sortBy,
  setSortBy,
  onSelectAll,
  jobs,
  selectedCount
}: JobFiltersProps) {
  
  const getPlatformCount = (platform: string) => {
    if (platform === "all") return jobs.length;
    return jobs.filter(job => job.platform === platform).length;
  };

  const platforms = [
    { id: "all", name: "All", count: getPlatformCount("all") },
    { id: "instacart", name: "Instacart", count: getPlatformCount("instacart") },
    { id: "doordash", name: "DoorDash", count: getPlatformCount("doordash") },
    { id: "uber", name: "Uber", count: getPlatformCount("uber") },
    { id: "fieldagent", name: "Field Agent", count: getPlatformCount("fieldagent") },
    { id: "epms", name: "EPMS", count: getPlatformCount("epms") },
    { id: "ellis", name: "Ellis", count: getPlatformCount("ellis") },
    { id: "alt360", name: "Alt360", count: getPlatformCount("alt360") },
    { id: "prestoshopper", name: "PrestoShopper", count: getPlatformCount("prestoshopper") },
    { id: "gigspot", name: "Gig Spot", count: getPlatformCount("gigspot") },
  ].filter(platform => platform.count > 0 || platform.id === "all");

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-ink">Filter Jobs</h3>
          <div className="flex flex-wrap gap-2">
            {platforms.map(platform => (
              <Button
                key={platform.id}
                variant={platformFilter === platform.id ? "default" : "outline"}
                size="sm"
                onClick={() => setPlatformFilter(platform.id)}
                className="h-8"
              >
                {platform.name} ({platform.count})
              </Button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="roi">Best ROI</SelectItem>
              <SelectItem value="proximity">Nearest</SelectItem>
              <SelectItem value="time">Time Window</SelectItem>
              <SelectItem value="payout">Highest Pay</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onSelectAll}
            className="flex items-center"
          >
            <CheckSquare className="w-4 h-4 mr-2" />
            {selectedCount > 0 ? `Clear (${selectedCount})` : "Select All"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
