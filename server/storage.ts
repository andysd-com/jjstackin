import { type User, type InsertUser, type Job, type InsertJob, type Route, type InsertRoute, type Earnings, type InsertEarnings } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Jobs
  getJob(id: string): Promise<Job | undefined>;
  getJobsByUser(userId: string): Promise<Job[]>;
  getJobsByPlatform(userId: string, platform: string): Promise<Job[]>;
  createJob(job: InsertJob & { userId: string }): Promise<Job>;
  updateJob(id: string, updates: Partial<Job>): Promise<Job | undefined>;
  deleteJob(id: string): Promise<boolean>;

  // Routes
  getRoute(id: string): Promise<Route | undefined>;
  getRoutesByUser(userId: string): Promise<Route[]>;
  createRoute(route: InsertRoute & { userId: string }): Promise<Route>;
  updateRoute(id: string, updates: Partial<Route>): Promise<Route | undefined>;
  deleteRoute(id: string): Promise<boolean>;

  // Earnings
  getEarnings(id: string): Promise<Earnings | undefined>;
  getEarningsByUser(userId: string): Promise<Earnings[]>;
  getEarningsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Earnings[]>;
  createEarnings(earnings: InsertEarnings & { userId: string }): Promise<Earnings>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private jobs: Map<string, Job>;
  private routes: Map<string, Route>;
  private earnings: Map<string, Earnings>;

  constructor() {
    this.users = new Map();
    this.jobs = new Map();
    this.routes = new Map();
    this.earnings = new Map();
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  // Jobs
  async getJob(id: string): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async getJobsByUser(userId: string): Promise<Job[]> {
    return Array.from(this.jobs.values()).filter(job => job.userId === userId);
  }

  async getJobsByPlatform(userId: string, platform: string): Promise<Job[]> {
    return Array.from(this.jobs.values()).filter(
      job => job.userId === userId && job.platform === platform
    );
  }

  async createJob(jobData: InsertJob & { userId: string }): Promise<Job> {
    const id = randomUUID();
    const job: Job = {
      ...jobData,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.jobs.set(id, job);
    return job;
  }

  async updateJob(id: string, updates: Partial<Job>): Promise<Job | undefined> {
    const job = this.jobs.get(id);
    if (!job) return undefined;

    const updatedJob = { 
      ...job, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.jobs.set(id, updatedJob);
    return updatedJob;
  }

  async deleteJob(id: string): Promise<boolean> {
    return this.jobs.delete(id);
  }

  // Routes
  async getRoute(id: string): Promise<Route | undefined> {
    return this.routes.get(id);
  }

  async getRoutesByUser(userId: string): Promise<Route[]> {
    return Array.from(this.routes.values()).filter(route => route.userId === userId);
  }

  async createRoute(routeData: InsertRoute & { userId: string }): Promise<Route> {
    const id = randomUUID();
    const route: Route = {
      ...routeData,
      id,
      createdAt: new Date(),
    };
    this.routes.set(id, route);
    return route;
  }

  async updateRoute(id: string, updates: Partial<Route>): Promise<Route | undefined> {
    const route = this.routes.get(id);
    if (!route) return undefined;

    const updatedRoute = { ...route, ...updates };
    this.routes.set(id, updatedRoute);
    return updatedRoute;
  }

  async deleteRoute(id: string): Promise<boolean> {
    return this.routes.delete(id);
  }

  // Earnings
  async getEarnings(id: string): Promise<Earnings | undefined> {
    return this.earnings.get(id);
  }

  async getEarningsByUser(userId: string): Promise<Earnings[]> {
    return Array.from(this.earnings.values()).filter(earning => earning.userId === userId);
  }

  async getEarningsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Earnings[]> {
    return Array.from(this.earnings.values()).filter(
      earning => earning.userId === userId && 
                 earning.date && 
                 earning.date >= startDate && 
                 earning.date <= endDate
    );
  }

  async createEarnings(earningsData: InsertEarnings & { userId: string }): Promise<Earnings> {
    const id = randomUUID();
    const earnings: Earnings = {
      ...earningsData,
      id,
      date: earningsData.date || new Date(),
    };
    this.earnings.set(id, earnings);
    return earnings;
  }
}

export const storage = new MemStorage();
