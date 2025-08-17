import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertJobSchema, insertRouteSchema, insertEarningsSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Mock user for development - in production this would come from auth
  const MOCK_USER_ID = "user-1";

  // Jobs endpoints
  app.get("/api/jobs", async (req, res) => {
    try {
      const platform = req.query.platform as string;
      const jobs = platform 
        ? await storage.getJobsByPlatform(MOCK_USER_ID, platform)
        : await storage.getJobsByUser(MOCK_USER_ID);
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch jobs" });
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const job = await storage.getJob(req.params.id);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch job" });
    }
  });

  app.post("/api/jobs", async (req, res) => {
    try {
      const jobData = insertJobSchema.parse(req.body);
      const job = await storage.createJob({ ...jobData, userId: MOCK_USER_ID });
      res.status(201).json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid job data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create job" });
    }
  });

  app.patch("/api/jobs/:id", async (req, res) => {
    try {
      const updates = req.body;
      const job = await storage.updateJob(req.params.id, updates);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      res.status(500).json({ error: "Failed to update job" });
    }
  });

  app.delete("/api/jobs/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteJob(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete job" });
    }
  });

  // Job parsing endpoint
  app.post("/api/jobs/parse", async (req, res) => {
    try {
      const { text, platform } = req.body;
      
      // Simple text parsing logic - in production this would be more sophisticated
      const lines = text.split('\n').filter(line => line.trim());
      
      let title = lines[0] || "Parsed Job";
      let payout = "0";
      let address = "";
      let description = "";

      // Extract payout (look for dollar amounts)
      const payoutMatch = text.match(/\$(\d+(?:\.\d{2})?)/);
      if (payoutMatch) {
        payout = payoutMatch[1];
      }

      // Extract address (look for address-like patterns)
      const addressMatch = text.match(/(\d+\s+[A-Za-z\s]+(?:St|Ave|Blvd|Rd|Dr|Way|Pl))/);
      if (addressMatch) {
        address = addressMatch[1];
      }

      // If no address found, use a generic one based on platform
      if (!address) {
        switch (platform) {
          case 'instacart':
            address = "Local grocery store";
            break;
          case 'doordash':
          case 'uber':
            address = "Restaurant pickup location";
            break;
          case 'fieldagent':
            address = "Retail location";
            break;
          default:
            address = "Job location";
        }
      }

      const parsedJob = {
        title,
        description: description || `Parsed from ${platform || 'unknown'} text`,
        platform: platform || 'manual',
        source: 'clipboard' as const,
        payout,
        reimbursement: "0",
        tipEstimate: "0",
        address,
        latitude: null,
        longitude: null,
        timeWindowStart: null,
        timeWindowEnd: null,
        estimatedDuration: 30,
        status: 'available' as const,
        priority: 0,
        tags: [],
        metadata: { originalText: text },
        roi: null,
      };

      res.json(parsedJob);
    } catch (error) {
      res.status(500).json({ error: "Failed to parse job text" });
    }
  });

  // Routes endpoints
  app.get("/api/routes", async (req, res) => {
    try {
      const routes = await storage.getRoutesByUser(MOCK_USER_ID);
      res.json(routes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch routes" });
    }
  });

  app.post("/api/routes", async (req, res) => {
    try {
      const routeData = insertRouteSchema.parse(req.body);
      const route = await storage.createRoute({ ...routeData, userId: MOCK_USER_ID });
      res.status(201).json(route);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid route data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create route" });
    }
  });

  app.post("/api/routes/optimize", async (req, res) => {
    try {
      const { jobIds } = req.body;
      
      // Simple route optimization - in production this would use real routing APIs
      const jobs = await Promise.all(
        jobIds.map((id: string) => storage.getJob(id))
      );
      
      const validJobs = jobs.filter(Boolean);
      const totalEarnings = validJobs.reduce((sum, job) => {
        return sum + parseFloat(job!.payout as string);
      }, 0);

      const optimizedRoute = {
        name: `Route ${new Date().toLocaleDateString()}`,
        jobIds,
        totalDistance: "15.2", // Mock distance
        totalDuration: validJobs.length * 35, // Estimate 35min per job
        totalEarnings: totalEarnings.toString(),
        optimized: true,
        status: 'draft' as const,
      };

      const route = await storage.createRoute({ ...optimizedRoute, userId: MOCK_USER_ID });
      res.json(route);
    } catch (error) {
      res.status(500).json({ error: "Failed to optimize route" });
    }
  });

  // Earnings endpoints
  app.get("/api/earnings", async (req, res) => {
    try {
      const { start, end } = req.query;
      let earnings;
      
      if (start && end) {
        const startDate = new Date(start as string);
        const endDate = new Date(end as string);
        earnings = await storage.getEarningsByDateRange(MOCK_USER_ID, startDate, endDate);
      } else {
        earnings = await storage.getEarningsByUser(MOCK_USER_ID);
      }
      
      res.json(earnings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch earnings" });
    }
  });

  app.post("/api/earnings", async (req, res) => {
    try {
      const earningsData = insertEarningsSchema.parse(req.body);
      const earnings = await storage.createEarnings({ ...earningsData, userId: MOCK_USER_ID });
      res.status(201).json(earnings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid earnings data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create earnings record" });
    }
  });

  // Analytics endpoint for dashboard
  app.get("/api/analytics/dashboard", async (req, res) => {
    try {
      const jobs = await storage.getJobsByUser(MOCK_USER_ID);
      const routes = await storage.getRoutesByUser(MOCK_USER_ID);
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
      const earnings = await storage.getEarningsByDateRange(MOCK_USER_ID, todayStart, todayEnd);

      const completedJobs = jobs.filter(job => job.status === 'completed');
      const pendingJobs = jobs.filter(job => job.status === 'available' || job.status === 'selected');
      
      const todayEarnings = earnings.reduce((sum, earning) => {
        return sum + parseFloat(earning.amount as string);
      }, 0);

      const analytics = {
        todayEarnings: todayEarnings.toFixed(2),
        completedJobs: completedJobs.length,
        pendingJobs: pendingJobs.length,
        totalJobs: jobs.length,
        activeRoutes: routes.filter(r => r.status === 'active').length,
        hoursActive: "6.2", // Mock value
      };

      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
