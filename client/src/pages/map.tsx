import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, MapPin, Navigation, Route, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InteractiveMap from "@/components/interactive-map";
import { Job } from "@shared/schema";

export default function MapPage() {
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [mapCenter, setMapCenter] = useState({ lat: 47.6062, lng: -122.3321 }); // Seattle default

  // Fetch jobs
  const { data: jobs = [] } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log("Location access denied or unavailable");
        }
      );
    }
  }, []);

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

  const handleJobToggle = (jobId: string) => {
    setSelectedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
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
              <h1 className="text-xl font-semibold text-ink">Job Map</h1>
              <Badge variant="secondary">{jobs.length} locations</Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Layers className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Navigation className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Map Container */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
        {/* Map Area */}
        <div className="flex-1 relative">
          <InteractiveMap 
            jobs={jobs}
            selectedJobs={jobs.filter(job => selectedJobs.includes(job.id!))}
            onJobSelect={handleJobToggle}
          />
        </div>

        {/* Alternative static map for fallback */}
        <div className="flex-1 relative hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100">
            {/* Interactive Map Placeholder */}
            <div className="w-full h-full relative overflow-hidden">
              {/* Background Pattern */}
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-20"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg stroke='%23e5e7eb' stroke-width='1' fill='none'%3E%3Cpath d='M0 0h100v100H0z'/%3E%3Cpath d='M0 20h100M0 40h100M0 60h100M0 80h100M20 0v100M40 0v100M60 0v100M80 0v100'/%3E%3C/g%3E%3C/svg%3E")`
                }}
              />

              {/* Map Integration Note */}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 max-w-sm">
                <h3 className="font-medium text-sm mb-2">🗺️ Map Integration Ready</h3>
                <p className="text-xs text-sub">
                  This area will show an interactive map with job locations. 
                  Connect your preferred mapping service (Google Maps, Mapbox, etc.) to enable full functionality.
                </p>
              </div>

              {/* Mock Job Pins */}
              {jobs.slice(0, 12).map((job, index) => {
                const isSelected = selectedJobs.includes(job.id!);
                const position = {
                  top: `${20 + (index % 4) * 20}%`,
                  left: `${15 + Math.floor(index / 4) * 25}%`
                };

                return (
                  <div
                    key={job.id}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ${
                      isSelected ? 'scale-125 z-20' : 'hover:scale-110 z-10'
                    }`}
                    style={position}
                    onClick={() => handleJobToggle(job.id!)}
                  >
                    <div className="relative">
                      <MapPin 
                        className={`w-6 h-6 drop-shadow-lg ${
                          isSelected ? 'text-accent' : 'text-gray-600'
                        }`}
                        style={{ color: isSelected ? '#2563eb' : getPlatformColor(job.platform) }}
                      />
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-white rounded-full flex items-center justify-center text-xs font-bold border shadow-sm">
                        ${Math.floor(parseFloat(job.payout as string) || 0)}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Route Visualization */}
              {selectedJobs.length > 1 && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <defs>
                    <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#2563eb', stopOpacity: 0.8 }} />
                      <stop offset="100%" style={{ stopColor: '#7c3aed', stopOpacity: 0.8 }} />
                    </linearGradient>
                  </defs>
                  {/* Mock route path */}
                  <path
                    d="M 15% 25% Q 40% 15% 65% 45% T 90% 65%"
                    stroke="url(#routeGradient)"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="8,4"
                    className="animate-pulse"
                  />
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">Job Locations</h2>
              <Badge variant="outline">{selectedJobs.length} selected</Badge>
            </div>

            {/* Selected Jobs Summary */}
            {selectedJobs.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Selected Route</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-sub">Total Payout:</span>
                      <span className="font-medium">
                        ${jobs
                          .filter(job => selectedJobs.includes(job.id!))
                          .reduce((sum, job) => sum + parseFloat(job.payout as string || '0'), 0)
                          .toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sub">Estimated Time:</span>
                      <span className="font-medium">
                        {jobs
                          .filter(job => selectedJobs.includes(job.id!))
                          .reduce((sum, job) => sum + (job.estimatedDuration || 30), 0)} min
                      </span>
                    </div>
                    <Link href="/routes">
                      <Button className="w-full mt-3" size="sm">
                        <Route className="w-4 h-4 mr-2" />
                        Optimize Route
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Job List */}
            <div className="space-y-2">
              {jobs.map((job) => {
                const isSelected = selectedJobs.includes(job.id!);
                return (
                  <div
                    key={job.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-accent bg-accent/5' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleJobToggle(job.id!)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getPlatformColor(job.platform) }}
                          />
                          <span className="text-sm font-medium capitalize">{job.platform}</span>
                        </div>
                        <p className="text-sm text-sub truncate">{job.address}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">${job.payout}</div>
                        <div className="text-xs text-sub">{job.estimatedDuration}min</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}