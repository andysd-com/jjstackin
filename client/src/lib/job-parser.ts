import { ParsedJobData } from "@/types";

export class JobParser {
  static parseText(text: string, platform?: string): Partial<ParsedJobData> {
    const lines = text.split('\n').filter(line => line.trim());
    
    let title = lines[0] || "Parsed Job";
    let payout = "0";
    let address = "";
    let description = "";
    let estimatedDuration = 30;

    // Extract payout (look for dollar amounts)
    const payoutMatches = text.match(/\$(\d+(?:\.\d{2})?)/g);
    if (payoutMatches && payoutMatches.length > 0) {
      // Take the largest dollar amount found
      const amounts = payoutMatches.map(match => parseFloat(match.replace('$', '')));
      payout = Math.max(...amounts).toString();
    }

    // Extract address patterns
    const addressPatterns = [
      /(\d+\s+[A-Za-z\s]+(?:St|Ave|Blvd|Rd|Dr|Way|Pl|Street|Avenue|Boulevard|Road|Drive))/i,
      /([A-Za-z\s]+(?:Mall|Plaza|Center|Square))/i,
      /([A-Za-z\s]+ (?:Store|Shop|Restaurant|Cafe))/i
    ];

    for (const pattern of addressPatterns) {
      const match = text.match(pattern);
      if (match) {
        address = match[1].trim();
        break;
      }
    }

    // Platform-specific parsing
    if (platform) {
      const platformData = this.parsePlatformSpecific(text, platform);
      title = platformData.title || title;
      description = platformData.description || description;
      estimatedDuration = platformData.estimatedDuration || estimatedDuration;
      
      if (!address && platformData.address) {
        address = platformData.address;
      }
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

    return {
      title: title.substring(0, 100), // Limit title length
      description: description || `Parsed from ${platform || 'clipboard'} text`,
      platform: platform || 'manual',
      payout,
      address,
      estimatedDuration,
    };
  }

  private static parsePlatformSpecific(text: string, platform: string): Partial<ParsedJobData> {
    const result: Partial<ParsedJobData> = {};

    switch (platform.toLowerCase()) {
      case 'instacart':
        result.title = this.extractInstacartTitle(text);
        result.description = this.extractInstacartDescription(text);
        result.estimatedDuration = this.extractInstacartDuration(text);
        break;

      case 'doordash':
        result.title = this.extractDoorDashTitle(text);
        result.description = this.extractDoorDashDescription(text);
        result.estimatedDuration = 25;
        break;

      case 'uber':
        result.title = this.extractUberTitle(text);
        result.description = this.extractUberDescription(text);
        result.estimatedDuration = 20;
        break;

      case 'fieldagent':
        result.title = this.extractFieldAgentTitle(text);
        result.description = this.extractFieldAgentDescription(text);
        result.estimatedDuration = 30;
        break;
    }

    return result;
  }

  private static extractInstacartTitle(text: string): string {
    // Look for store names or item counts
    const storeMatch = text.match(/(Whole Foods|Costco|Safeway|QFC|Fred Meyer|Target)/i);
    const itemMatch = text.match(/(\d+)\s*item/i);
    
    if (storeMatch && itemMatch) {
      return `Grocery Delivery - ${storeMatch[1]} (${itemMatch[1]} items)`;
    } else if (storeMatch) {
      return `Grocery Delivery - ${storeMatch[1]}`;
    } else if (itemMatch) {
      return `Grocery Delivery - ${itemMatch[1]} items`;
    }
    
    return "Grocery Delivery";
  }

  private static extractInstacartDescription(text: string): string {
    const features = [];
    
    if (text.match(/heavy/i)) features.push("Heavy items");
    if (text.match(/organic/i)) features.push("Organic products");
    if (text.match(/alcohol/i)) features.push("Alcohol delivery");
    if (text.match(/tip/i)) features.push("Good tipper");
    
    return features.length > 0 ? features.join(" • ") : "Grocery shopping and delivery";
  }

  private static extractInstacartDuration(text: string): number {
    const itemMatch = text.match(/(\d+)\s*item/i);
    if (itemMatch) {
      const itemCount = parseInt(itemMatch[1]);
      return Math.max(15, Math.min(60, itemCount * 2 + 15)); // 2 minutes per item + 15 base
    }
    return 45;
  }

  private static extractDoorDashTitle(text: string): string {
    // Look for restaurant names
    const restaurantPatterns = [
      /from\s+([A-Za-z\s]+)/i,
      /(McDonald's|Starbucks|Chipotle|Subway|Pizza Hut|Domino's)/i,
      /([A-Za-z\s]+(?:Restaurant|Cafe|Kitchen|Grill|Pizza))/i
    ];

    for (const pattern of restaurantPatterns) {
      const match = text.match(pattern);
      if (match) {
        return `Restaurant Pickup - ${match[1].trim()}`;
      }
    }

    return "Restaurant Pickup";
  }

  private static extractDoorDashDescription(text: string): string {
    const features = [];
    
    if (text.match(/ready/i)) features.push("Order ready");
    if (text.match(/peak/i)) features.push("Peak pay");
    if (text.match(/\+\$\d/)) features.push("Bonus pay");
    if (text.match(/close|near/i)) features.push("Close delivery");
    
    return features.length > 0 ? features.join(" • ") : "Food pickup and delivery";
  }

  private static extractUberTitle(text: string): string {
    if (text.match(/McDonald's|fast food/i)) {
      return "Fast Food - McDonald's";
    }
    
    const restaurantMatch = text.match(/([A-Za-z\s]+(?:Restaurant|Cafe|Kitchen))/i);
    if (restaurantMatch) {
      return `Restaurant - ${restaurantMatch[1].trim()}`;
    }
    
    return "Food Delivery";
  }

  private static extractUberDescription(text: string): string {
    const features = [];
    
    if (text.match(/quick|fast/i)) features.push("Quick pickup");
    if (text.match(/drive.?thru/i)) features.push("Drive-thru");
    if (text.match(/small|little/i)) features.push("Small order");
    
    return features.length > 0 ? features.join(" • ") : "Food delivery";
  }

  private static extractFieldAgentTitle(text: string): string {
    if (text.match(/starbucks/i)) {
      return "Starbucks Experience Audit";
    }
    
    if (text.match(/target|walmart|retail/i)) {
      return "Retail Display Audit";
    }
    
    if (text.match(/secret shop|mystery/i)) {
      return "Mystery Shopping Task";
    }
    
    return "Field Agent Task";
  }

  private static extractFieldAgentDescription(text: string): string {
    const features = [];
    
    if (text.match(/photo/i)) features.push("Photo required");
    if (text.match(/receipt/i)) features.push("Receipt photo");
    if (text.match(/price/i)) features.push("Price check");
    if (text.match(/audit|display/i)) features.push("Display audit");
    
    return features.length > 0 ? features.join(" • ") : "Field audit task";
  }
}
