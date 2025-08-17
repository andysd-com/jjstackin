export interface JobAnalytics {
  todayEarnings: string;
  completedJobs: number;
  pendingJobs: number;
  totalJobs: number;
  activeRoutes: number;
  hoursActive: string;
}

export interface RouteOptimization {
  jobIds: string[];
  totalDistance: number;
  totalDuration: number;
  totalEarnings: number;
  optimizedOrder: string[];
}

export interface ParsedJobData {
  title: string;
  description: string;
  platform: string;
  payout: string;
  address: string;
  estimatedDuration: number;
}

export interface PlatformTemplate {
  id: string;
  name: string;
  platform: string;
  description: string;
  defaultValues: Partial<ParsedJobData>;
}

export const PLATFORM_TEMPLATES: PlatformTemplate[] = [
  {
    id: 'instacart',
    name: 'Instacart',
    platform: 'instacart',
    description: 'Grocery delivery',
    defaultValues: {
      platform: 'instacart',
      estimatedDuration: 45,
      description: 'Grocery shopping and delivery'
    }
  },
  {
    id: 'doordash',
    name: 'DoorDash',
    platform: 'doordash',
    description: 'Food delivery',
    defaultValues: {
      platform: 'doordash',
      estimatedDuration: 25,
      description: 'Restaurant pickup and delivery'
    }
  },
  {
    id: 'uber',
    name: 'Uber Eats',
    platform: 'uber',
    description: 'Food delivery',
    defaultValues: {
      platform: 'uber',
      estimatedDuration: 20,
      description: 'Food delivery'
    }
  },
  {
    id: 'fieldagent',
    name: 'Field Agent',
    platform: 'fieldagent',
    description: 'Secret shop',
    defaultValues: {
      platform: 'fieldagent',
      estimatedDuration: 30,
      description: 'Mystery shopping and audit'
    }
  }
];
