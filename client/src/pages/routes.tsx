import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, Route, Play, Pause, CheckCircle, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RouteOptimizer from "@/components/route-optimizer";
import { Job, Route as RouteType } from "@shared/schema";

export default function RoutesPage() {
  const [activeRoute, setActiveRoute] = useState<string | null>(null);

  // Fetch jobs and routes
  const { data: jobs = [] } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  const { data: routes = [] } = useQuery<RouteType[]>({
    queryKey: ["/api/routes"],
  });

  const activeRouteData = routes.find(r => r.id === activeRoute);
  const selectedJobs = activeRouteData 
    ? jobs.filter(job => activeRouteData.jobIds.includes(job.id!))
    : [];

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
              <h1 className="text-xl font-semibold text-ink">Routes</h1>
              <Badge variant="secondary">{routes.length} saved</Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Route Optimizer */}
          <div className="lg:col-span-2">
            <RouteOptimizer 
              selectedJobs={selectedJobs}
            />
          </div>

          {/* Saved Routes */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Saved Routes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {routes.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sub text-sm">No saved routes yet</p>
                    <p className="text-xs text-sub mt-1">
                      Select jobs and optimize to create your first route
                    </p>
                  </div>
                ) : (
                  routes.map((route) => (
                    <div
                      key={route.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        activeRoute === route.id
                          ? 'border-accent bg-accent/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setActiveRoute(route.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-sm">
                          {route.name || `Route ${route.id?.slice(0, 8)}`}
                        </h3>
                        <Badge 
                          variant={route.status === 'completed' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {route.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-sub flex items-center">
                            <Route className="w-3 h-3 mr-1" />
                            {route.jobIds.length} stops
                          </span>
                          <span className="font-medium">
                            ${route.totalEarnings || '0.00'}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sub flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {route.totalDuration || 0} min
                          </span>
                          <span className="text-sub">
                            {route.totalDistance || '0'} km
                          </span>
                        </div>
                      </div>

                      {route.status === 'active' && (
                        <div className="mt-3 flex space-x-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Pause className="w-3 h-3 mr-1" />
                            Pause
                          </Button>
                          <Button size="sm" className="flex-1">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Complete
                          </Button>
                        </div>
                      )}

                      {route.status === 'draft' && (
                        <Button size="sm" className="w-full mt-3">
                          <Play className="w-3 h-3 mr-1" />
                          Start Route
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Today's Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sub flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Completed Routes
                  </span>
                  <span className="font-medium">
                    {routes.filter(r => r.status === 'completed').length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sub flex items-center">
                    <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                    Total Earnings
                  </span>
                  <span className="font-medium">
                    ${routes
                      .filter(r => r.status === 'completed')
                      .reduce((sum, r) => sum + parseFloat(r.totalEarnings as string || '0'), 0)
                      .toFixed(2)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sub flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-blue-500" />
                    Active Time
                  </span>
                  <span className="font-medium">
                    {routes
                      .filter(r => r.status === 'completed')
                      .reduce((sum, r) => sum + (r.totalDuration || 0), 0)} min
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}