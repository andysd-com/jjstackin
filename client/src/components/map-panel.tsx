import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layers, Navigation, MapPin } from "lucide-react";
import { Job } from "@shared/schema";

interface MapPanelProps {
  jobs: Job[];
  selectedJobs: Job[];
}

export default function MapPanel({ jobs, selectedJobs }: MapPanelProps) {
  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instacart': return '#43B02A';
      case 'doordash': return '#FF3008';
      case 'uber': return '#000000';
      case 'fieldagent': return '#1E3A8A';
      case 'gigspot': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Job Map</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Layers className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Navigation className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Mock map container */}
        <div className="relative h-80 bg-gradient-to-br from-blue-50 to-blue-100">
          {/* Mock map with job pins */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-80"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-opacity='0.03'%3E%3Cpath d='M11 18c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zm-4 0c0 .552.448 1 1 1s1-.448 1-1-.448-1-1-1-1 .448-1 1z'/%3E%3C/g%3E%3C/svg%3E")`
            }}
          />
          
          {/* Job pins overlay */}
          {jobs.slice(0, 8).map((job, index) => (
            <div
              key={job.id}
              className="absolute animate-pulse-pin"
              style={{
                top: `${20 + (index * 8)}%`,
                left: `${15 + (index * 10)}%`,
              }}
            >
              <div
                className="w-3 h-3 rounded-full shadow-lg border-2 border-white"
                style={{ backgroundColor: getPlatformColor(job.platform) }}
                title={`${job.platform} - $${job.payout}`}
              />
            </div>
          ))}
          
          {/* User location */}
          <div className="absolute bottom-1/3 left-1/3 w-4 h-4 bg-accent rounded-full shadow-lg border-2 border-white">
            <div className="absolute inset-0 bg-accent rounded-full animate-ping opacity-50"></div>
          </div>
          
          {/* Route preview for selected jobs */}
          {selectedJobs.length > 1 && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <path 
                d="M120 240 L60 60 L200 120 L280 200 L180 280" 
                stroke="var(--accent)" 
                strokeWidth="3" 
                fill="none" 
                strokeDasharray="8,4" 
                opacity="0.8"
              />
            </svg>
          )}

          {/* Map info overlay */}
          <div className="absolute bottom-4 left-4">
            <Badge variant="secondary" className="bg-white/90 text-ink">
              <MapPin className="w-3 h-3 mr-1" />
              {jobs.length} jobs within 3.2 miles
            </Badge>
          </div>

          {/* Legend for platforms */}
          <div className="absolute top-4 right-4 bg-white/90 rounded-lg p-3 text-xs">
            <div className="font-medium mb-2">Platforms</div>
            <div className="space-y-1">
              {['instacart', 'doordash', 'uber', 'fieldagent', 'gigspot'].map(platform => {
                const count = jobs.filter(job => job.platform === platform).length;
                if (count === 0) return null;
                
                return (
                  <div key={platform} className="flex items-center space-x-2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getPlatformColor(platform) }}
                    />
                    <span className="capitalize">{platform} ({count})</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
