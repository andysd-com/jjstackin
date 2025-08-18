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
        case 'epms':
          address = "Store location";
          break;
        case 'ellis':
          address = "Client location";
          break;
        case 'alt360':
          address = "Survey location";
          break;
        case 'prestoshopper':
          address = "Shopping location";
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

      case 'epms':
        result.title = this.extractEPMSTitle(text);
        result.description = this.extractEPMSDescription(text);
        result.estimatedDuration = 45;
        break;

      case 'ellis':
        result.title = this.extractEllisTitle(text);
        result.description = this.extractEllisDescription(text);
        result.estimatedDuration = 60;
        break;

      case 'alt360':
        result.title = this.extractAlt360Title(text);
        result.description = this.extractAlt360Description(text);
        result.estimatedDuration = 35;
        break;

      case 'prestoshopper':
        result.title = this.extractPrestoShopperTitle(text);
        result.description = this.extractPrestoShopperDescription(text);
        result.estimatedDuration = 40;
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

  // EPMS (Employee Performance Management System) - retail audits
  private static extractEPMSTitle(text: string): string {
    if (text.match(/walmart/i)) return "Walmart Store Audit";
    if (text.match(/target/i)) return "Target Display Check";
    if (text.match(/kroger/i)) return "Kroger Compliance Audit";
    if (text.match(/home depot/i)) return "Home Depot Product Audit";
    if (text.match(/audit|compliance/i)) return "Store Compliance Audit";
    return "EPMS Store Audit";
  }

  private static extractEPMSDescription(text: string): string {
    const features = [];
    if (text.match(/planogram/i)) features.push("Planogram check");
    if (text.match(/price/i)) features.push("Price verification");
    if (text.match(/inventory/i)) features.push("Inventory count");
    if (text.match(/display/i)) features.push("Display compliance");
    if (text.match(/photo/i)) features.push("Photo documentation");
    return features.length > 0 ? features.join(" • ") : "Store audit and compliance check";
  }

  // Ellis - mystery shopping and evaluations
  private static extractEllisTitle(text: string): string {
    if (text.match(/restaurant/i)) return "Restaurant Mystery Shop";
    if (text.match(/hotel/i)) return "Hotel Service Evaluation";
    if (text.match(/bank/i)) return "Bank Service Assessment";
    if (text.match(/retail/i)) return "Retail Mystery Shop";
    if (text.match(/mystery shop/i)) return "Mystery Shopping Assignment";
    return "Ellis Service Evaluation";
  }

  private static extractEllisDescription(text: string): string {
    const features = [];
    if (text.match(/purchase/i)) features.push("Purchase required");
    if (text.match(/interaction/i)) features.push("Staff interaction");
    if (text.match(/timing/i)) features.push("Service timing");
    if (text.match(/cleanliness/i)) features.push("Cleanliness check");
    if (text.match(/receipt/i)) features.push("Receipt required");
    return features.length > 0 ? features.join(" • ") : "Service quality evaluation";
  }

  // Alt360 - alternative data collection and surveys
  private static extractAlt360Title(text: string): string {
    if (text.match(/survey/i)) return "Customer Survey Collection";
    if (text.match(/data collection/i)) return "Data Collection Assignment";
    if (text.match(/market research/i)) return "Market Research Task";
    if (text.match(/interview/i)) return "Customer Interview";
    return "Alt360 Survey Task";
  }

  private static extractAlt360Description(text: string): string {
    const features = [];
    if (text.match(/tablet/i)) features.push("Tablet provided");
    if (text.match(/demographic/i)) features.push("Demographic targeting");
    if (text.match(/incentive/i)) features.push("Customer incentive");
    if (text.match(/location/i)) features.push("Location specific");
    return features.length > 0 ? features.join(" • ") : "Survey and data collection";
  }

  // PrestoShopper - grocery and retail shopping
  private static extractPrestoShopperTitle(text: string): string {
    if (text.match(/grocery/i)) return "Grocery Shopping Assignment";
    if (text.match(/pharmacy/i)) return "Pharmacy Shopping Task";
    if (text.match(/delivery/i)) return "Shopping & Delivery";
    if (text.match(/pickup/i)) return "Shopping & Pickup";
    return "PrestoShopper Assignment";
  }

  private static extractPrestoShopperDescription(text: string): string {
    const features = [];
    if (text.match(/organic/i)) features.push("Organic products");
    if (text.match(/prescription/i)) features.push("Prescription pickup");
    if (text.match(/substitution/i)) features.push("Substitutions allowed");
    if (text.match(/special request/i)) features.push("Special requests");
    if (text.match(/reimbursement/i)) features.push("Full reimbursement");
    return features.length > 0 ? features.join(" • ") : "Shopping and fulfillment service";
  }
}
