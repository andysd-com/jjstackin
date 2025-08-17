import { Job } from "@shared/schema";

export interface OptimizedRoute {
  jobIds: string[];
  totalDistance: number;
  totalDuration: number;
  totalEarnings: number;
  estimatedCompletionTime: Date;
  steps: RouteStep[];
}

export interface RouteStep {
  jobId: string;
  job: Job;
  order: number;
  estimatedArrival: Date;
  distanceFromPrevious: number;
  durationFromPrevious: number;
}

export class RouteOptimizer {
  static optimizeRoute(jobs: Job[], startLocation?: { lat: number; lng: number }): OptimizedRoute {
    if (jobs.length === 0) {
      return {
        jobIds: [],
        totalDistance: 0,
        totalDuration: 0,
        totalEarnings: 0,
        estimatedCompletionTime: new Date(),
        steps: []
      };
    }

    // Simple greedy optimization - in production this would use real routing APIs
    const optimizedJobs = this.greedyOptimization(jobs, startLocation);
    
    const steps: RouteStep[] = [];
    let currentTime = new Date();
    let totalDistance = 0;
    let totalDuration = 0;
    let totalEarnings = 0;

    optimizedJobs.forEach((job, index) => {
      const distanceFromPrevious = index === 0 ? 0 : this.estimateDistance(
        optimizedJobs[index - 1], 
        job
      );
      const durationFromPrevious = index === 0 ? 0 : this.estimateTravelTime(distanceFromPrevious);
      
      // Add travel time
      currentTime = new Date(currentTime.getTime() + durationFromPrevious * 60000);
      
      const step: RouteStep = {
        jobId: job.id!,
        job,
        order: index + 1,
        estimatedArrival: new Date(currentTime),
        distanceFromPrevious,
        durationFromPrevious
      };

      steps.push(step);
      
      // Add job duration
      const jobDuration = job.estimatedDuration || 30;
      currentTime = new Date(currentTime.getTime() + jobDuration * 60000);
      
      totalDistance += distanceFromPrevious;
      totalDuration += durationFromPrevious + jobDuration;
      totalEarnings += parseFloat(job.payout as string);
    });

    return {
      jobIds: optimizedJobs.map(job => job.id!),
      totalDistance,
      totalDuration,
      totalEarnings,
      estimatedCompletionTime: currentTime,
      steps
    };
  }

  private static greedyOptimization(jobs: Job[], startLocation?: { lat: number; lng: number }): Job[] {
    if (jobs.length <= 1) return jobs;

    const unvisited = [...jobs];
    const route: Job[] = [];
    
    // Start with the highest ROI job or closest to start location
    let currentJob: Job;
    if (startLocation) {
      currentJob = this.findClosestJob(unvisited, startLocation);
    } else {
      currentJob = this.findHighestROIJob(unvisited);
    }
    
    route.push(currentJob);
    unvisited.splice(unvisited.indexOf(currentJob), 1);

    // Greedily add remaining jobs
    while (unvisited.length > 0) {
      const nextJob = this.findBestNextJob(currentJob, unvisited);
      route.push(nextJob);
      unvisited.splice(unvisited.indexOf(nextJob), 1);
      currentJob = nextJob;
    }

    return route;
  }

  private static findHighestROIJob(jobs: Job[]): Job {
    return jobs.reduce((best, current) => {
      const currentROI = this.calculateROI(current);
      const bestROI = this.calculateROI(best);
      return currentROI > bestROI ? current : best;
    });
  }

  private static findClosestJob(jobs: Job[], location: { lat: number; lng: number }): Job {
    return jobs.reduce((closest, current) => {
      const currentDistance = this.calculateDistance(
        location.lat, location.lng,
        parseFloat(current.latitude as string) || 0,
        parseFloat(current.longitude as string) || 0
      );
      
      const closestDistance = this.calculateDistance(
        location.lat, location.lng,
        parseFloat(closest.latitude as string) || 0,
        parseFloat(closest.longitude as string) || 0
      );
      
      return currentDistance < closestDistance ? current : closest;
    });
  }

  private static findBestNextJob(currentJob: Job, candidates: Job[]): Job {
    return candidates.reduce((best, candidate) => {
      const candidateScore = this.calculateJobScore(currentJob, candidate);
      const bestScore = this.calculateJobScore(currentJob, best);
      return candidateScore > bestScore ? candidate : best;
    });
  }

  private static calculateJobScore(currentJob: Job, candidate: Job): number {
    const roi = this.calculateROI(candidate);
    const distance = this.estimateDistance(currentJob, candidate);
    const travelTime = this.estimateTravelTime(distance);
    
    // Score based on ROI per minute including travel time
    const totalTime = (candidate.estimatedDuration || 30) + travelTime;
    const earnings = parseFloat(candidate.payout as string);
    
    return totalTime > 0 ? (earnings / totalTime) * (roi / 100) : 0;
  }

  private static calculateROI(job: Job): number {
    if (job.roi) {
      return parseFloat(job.roi as string);
    }
    
    // Simple ROI calculation: payout per estimated hour
    const earnings = parseFloat(job.payout as string);
    const hours = (job.estimatedDuration || 30) / 60;
    return hours > 0 ? (earnings / hours) : 0;
  }

  private static estimateDistance(job1: Job, job2: Job): number {
    // Use Haversine formula for distance estimation
    const lat1 = parseFloat(job1.latitude as string) || 47.6062; // Default to Seattle
    const lng1 = parseFloat(job1.longitude as string) || -122.3321;
    const lat2 = parseFloat(job2.latitude as string) || 47.6062;
    const lng2 = parseFloat(job2.longitude as string) || -122.3321;
    
    return this.calculateDistance(lat1, lng1, lat2, lng2);
  }

  private static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private static estimateTravelTime(distanceKm: number): number {
    // Estimate travel time assuming average city driving speed of 25 km/h
    const averageSpeedKmh = 25;
    return (distanceKm / averageSpeedKmh) * 60; // Return minutes
  }

  static calculateRouteMetrics(jobs: Job[]): {
    totalEarnings: number;
    totalDuration: number;
    averageROI: number;
    estimatedHourlyRate: number;
  } {
    const totalEarnings = jobs.reduce((sum, job) => sum + parseFloat(job.payout as string), 0);
    const totalDuration = jobs.reduce((sum, job) => sum + (job.estimatedDuration || 30), 0);
    const totalROI = jobs.reduce((sum, job) => sum + this.calculateROI(job), 0);
    
    return {
      totalEarnings,
      totalDuration,
      averageROI: jobs.length > 0 ? totalROI / jobs.length : 0,
      estimatedHourlyRate: totalDuration > 0 ? (totalEarnings / totalDuration) * 60 : 0
    };
  }
}
