import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, RotateCcw, Clock, DollarSign } from "lucide-react";
import { Job, Route } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface RouteOptimizerProps {
  selectedJobs: Job[];
}

export default function RouteOptimizer({ selectedJobs }: RouteOptimizerProps) {
  const [optimizedRoute, setOptimizedRoute] = useState<Route | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const optimizeRouteMutation = useMutation({
    mutationFn: async (jobIds: string[]) => {
      const response = await apiRequest("POST", "/api/routes/optimize", { jobIds });
      return response.json();
    },
    onSuccess: (route) => {
      setOptimizedRoute(route);
      toast({
        title: "Route Optimized",
        description: `Created optimized route with ${selectedJobs.length} stops`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to optimize route",
        variant: "destructive",
      });
    },
  });

  const startRouteMutation = useMutation({
    mutationFn: async (routeId: string) => {
      const response = await apiRequest("PATCH", `/api/routes/${routeId}`, { 
        status: 'active',
        startedAt: new Date().toISOString()
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Route Started",
        description: "Navigation to your first stop has begun",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/routes"] });
    },
  });

  const handleOptimize = () => {
    if (selectedJobs.length === 0) return;
    optimizeRouteMutation.mutate(selectedJobs.map(job => job.id!));
  };

  const handleStartRoute = () => {
    if (!optimizedRoute) return;
    if (confirm('Start this optimized route? This will begin navigation to your first stop.')) {
      startRouteMutation.mutate(optimizedRoute.id!);
    }
  };

  const totalEarnings = selectedJobs.reduce((sum, job) => sum + parseFloat(job.payout as string), 0);
  const totalDuration = selectedJobs.reduce((sum, job) => sum + (job.estimatedDuration || 30), 0);

  if (selectedJobs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Route Optimizer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-sub">
            <div className="mb-4">
              🗺️
            </div>
            <p>Select jobs to create an optimized route</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Optimized Route</CardTitle>
          <Badge variant="secondary">
            {selectedJobs.length} stop{selectedJobs.length !== 1 ? 's' : ''} selected
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Route Summary */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-semibold text-ink flex items-center justify-center">
              <DollarSign className="w-4 h-4 mr-1" />
              {totalEarnings.toFixed(2)}
            </div>
            <div className="text-xs text-sub">Total Earnings</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-ink flex items-center justify-center">
              <Clock className="w-4 h-4 mr-1" />
              {(totalDuration / 60).toFixed(1)}h
            </div>
            <div className="text-xs text-sub">Est. Duration</div>
          </div>
        </div>

        {/* Route Steps */}
        <div className="space-y-3">
          {selectedJobs.map((job, index) => (
            <div key={job.id} className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center text-xs font-medium">
                {index + 1}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-ink">{job.title}</h4>
                <p className="text-xs text-sub">
                  {job.address} • ETA: {new Date(Date.now() + index * 45 * 60000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
                <p className="text-xs text-ok font-medium">
                  ${parseFloat(job.payout as string).toFixed(2)} • {job.estimatedDuration || 30} min
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          {!optimizedRoute ? (
            <Button
              onClick={handleOptimize}
              disabled={optimizeRouteMutation.isPending}
              className="flex-1"
            >
              {optimizeRouteMutation.isPending ? (
                <>
                  <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Optimize Route
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleStartRoute}
              disabled={startRouteMutation.isPending}
              className="flex-1"
            >
              {startRouteMutation.isPending ? (
                "Starting..."
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Route
                </>
              )}
            </Button>
          )}
          
          <Button variant="outline" onClick={handleOptimize}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
