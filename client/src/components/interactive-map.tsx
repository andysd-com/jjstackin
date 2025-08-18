import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layers, Navigation, MapPin, Locate, Route } from "lucide-react";
import { Job } from "@shared/schema";

interface InteractiveMapProps {
  jobs: Job[];
  selectedJobs: Job[];
  onJobSelect: (jobId: string) => void;
}

export default function InteractiveMap({ jobs, selectedJobs, onJobSelect }: InteractiveMapProps) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 47.6062, lng: -122.3321 }); // Seattle default
  const [showRoute, setShowRoute] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setMapCenter(location);
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
      case 'epms': return '#2563EB';
      case 'ellis': return '#DC2626';
      case 'alt360': return '#059669';
      case 'prestoshopper': return '#7C3AED';
      case 'gigspot': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const handleJobClick = (jobId: string) => {
    onJobSelect(jobId);
  };

  const centerOnUser = () => {
    if (userLocation) {
      setMapCenter(userLocation);
    }
  };

  const generateRoute = () => {
    setShowRoute(true);
    // In a real implementation, this would call a routing service
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Interactive Job Map</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={centerOnUser}>
              <Locate className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Layers className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={generateRoute}>
              <Navigation className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Map Container */}
        <div 
          ref={mapRef}
          className="relative h-96 bg-gradient-to-br from-blue-50 to-green-50 overflow-hidden"
        >
          {/* Background Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0,0,0,.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,.1) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}
          />

          {/* Map Integration Placeholder */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg max-w-xs">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Map Ready for Integration</span>
            </div>
            <p className="text-xs text-gray-600">
              Connect with Google Maps, MapBox, or OpenStreetMap for full functionality
            </p>
          </div>

          {/* User Location */}
          {userLocation && (
            <div 
              className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
              style={{
                top: '50%',
                left: '50%'
              }}
            >
              <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75"></div>
            </div>
          )}

          {/* Job Pins */}
          {jobs.slice(0, 15).map((job, index) => {
            const isSelected = selectedJobs.some(sj => sj.id === job.id);
            const position = {
              top: `${15 + (index % 5) * 15}%`,
              left: `${10 + Math.floor(index / 5) * 20}%`
            };

            return (
              <div
                key={job.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 group ${
                  isSelected ? 'scale-125 z-20' : 'hover:scale-110 z-10'
                }`}
                style={position}
                onClick={() => handleJobClick(job.id!)}
              >
                {/* Pin */}
                <div className="relative">
                  <MapPin 
                    className={`w-6 h-6 drop-shadow-lg transition-colors ${
                      isSelected ? 'text-blue-600' : 'text-gray-600'
                    }`}
                    style={{ 
                      color: isSelected ? '#2563eb' : getPlatformColor(job.platform),
                      filter: isSelected ? 'drop-shadow(0 0 8px rgba(37, 99, 235, 0.6))' : 'none'
                    }}
                  />
                  
                  {/* Payout Badge */}
                  <div className="absolute -top-2 -right-2 bg-white rounded-full border shadow-sm px-1 py-0.5 min-w-[20px] flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-700">
                      ${Math.floor(parseFloat(job.payout as string) || 0)}
                    </span>
                  </div>

                  {/* Platform Badge */}
                  <div 
                    className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-lg border"
                    style={{ color: getPlatformColor(job.platform) }}
                  >
                    {job.platform}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Route Visualization */}
          {showRoute && selectedJobs.length > 1 && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#2563eb', stopOpacity: 0.8 }} />
                  <stop offset="100%" style={{ stopColor: '#7c3aed', stopOpacity: 0.8 }} />
                </linearGradient>
              </defs>
              {/* Animated route path */}
              <path
                d="M 20% 30% Q 50% 20% 70% 50% T 90% 70%"
                stroke="url(#routeGradient)"
                strokeWidth="3"
                fill="none"
                strokeDasharray="8,4"
                className="animate-pulse"
              />
              {/* Route waypoints */}
              {selectedJobs.slice(0, 3).map((_, index) => (
                <circle
                  key={index}
                  cx={`${20 + index * 35}%`}
                  cy={`${30 + index * 10}%`}
                  r="4"
                  fill="#2563eb"
                  className="animate-pulse"
                />
              ))}
            </svg>
          )}

          {/* Map Controls */}
          <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
            <Button size="sm" variant="outline" className="bg-white/90 backdrop-blur-sm">
              <Plus className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" className="bg-white/90 backdrop-blur-sm">
              <Minus className="w-4 h-4" />
            </Button>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <div className="text-xs font-medium mb-2">Legend</div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Your Location</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-3 h-3 text-gray-600" />
                <span>Available Jobs</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-3 h-3 text-blue-600" />
                <span>Selected Jobs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Map Statistics */}
        <div className="p-4 bg-gray-50 border-t">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-gray-900">{jobs.length}</div>
              <div className="text-sm text-gray-600">Total Jobs</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-600">{selectedJobs.length}</div>
              <div className="text-sm text-gray-600">Selected</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-600">
                ${selectedJobs.reduce((sum, job) => sum + parseFloat(job.payout as string || '0'), 0).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Total Value</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Missing imports
function Plus({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function Minus({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
    </svg>
  );
}