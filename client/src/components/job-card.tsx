import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, MapPin, Route, Star, Eye, Camera, Zap, Check } from "lucide-react";
import { Job } from "@shared/schema";

interface JobCardProps {
  job: Job;
  selected: boolean;
  onSelect: (selected: boolean) => void;
}

export default function JobCard({ job, selected, onSelect }: JobCardProps) {
  const [addedToRoute, setAddedToRoute] = useState(false);
  
  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instacart': return 'bg-green-100 text-green-700';
      case 'doordash': return 'bg-red-100 text-red-700';
      case 'uber': return 'bg-gray-100 text-gray-700';
      case 'fieldagent': return 'bg-blue-100 text-blue-700';
      case 'epms': return 'bg-blue-100 text-blue-700';
      case 'ellis': return 'bg-red-100 text-red-700';
      case 'alt360': return 'bg-green-100 text-green-700';
      case 'prestoshopper': return 'bg-purple-100 text-purple-700';
      case 'gigspot': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'fieldagent': return <Eye className="w-3 h-3 mr-1" />;
      case 'gigspot': return <Camera className="w-3 h-3 mr-1" />;
      case 'doordash': return <Star className="w-3 h-3 mr-1" />;
      case 'uber': return <Zap className="w-3 h-3 mr-1" />;
      default: return <Clock className="w-3 h-3 mr-1" />;
    }
  };

  const handleAddToRoute = () => {
    setAddedToRoute(true);
    setTimeout(() => setAddedToRoute(false), 2000);
  };

  const estimatedHourlyRate = () => {
    const duration = job.estimatedDuration || 30;
    const payout = parseFloat(job.payout as string);
    return ((payout / duration) * 60).toFixed(2);
  };

  const timeUntilExpiry = () => {
    if (!job.timeWindowEnd) return null;
    
    const now = new Date();
    const expiry = new Date(job.timeWindowEnd);
    const diffMinutes = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60));
    
    if (diffMinutes < 0) return "Expired";
    if (diffMinutes < 60) return `${diffMinutes}m`;
    
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const expiry = timeUntilExpiry();

  return (
    <Card className={`p-4 hover:shadow-md transition-shadow job-card-platform-${job.platform}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <Checkbox
            checked={selected}
            onCheckedChange={onSelect}
            className="mt-1"
          />
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2 flex-wrap">
              <Badge className={getPlatformColor(job.platform)}>
                {job.platform.charAt(0).toUpperCase() + job.platform.slice(1)}
              </Badge>
              
              {expiry && (
                <Badge variant="outline" className="bg-amber-100 text-amber-700">
                  {getPlatformIcon(job.platform)}
                  {expiry === "Expired" ? "Expired" : `Expires in ${expiry}`}
                </Badge>
              )}
              
              {job.roi && (
                <Badge variant="outline" className="bg-accent/10 text-accent">
                  ROI: {job.roi}%
                </Badge>
              )}
            </div>
            
            <h4 className="font-medium text-ink mb-1">{job.title}</h4>
            <p className="text-sm text-sub mb-2">{job.description}</p>
            
            <div className="flex items-center space-x-4 text-sm text-sub flex-wrap">
              <span className="flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                {job.address} 
              </span>
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {job.estimatedDuration || 30} min
              </span>
              {job.metadata && (
                <span className="flex items-center">
                  <Route className="w-3 h-3 mr-1" />
                  2.3 mi delivery
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-right ml-4">
          <div className="text-lg font-semibold text-ok">
            ${parseFloat(job.payout as string).toFixed(2)}
          </div>
          
          {job.tipEstimate && parseFloat(job.tipEstimate as string) > 0 && (
            <div className="text-xs text-sub">
              + ${parseFloat(job.tipEstimate as string).toFixed(2)} tip est.
            </div>
          )}
          
          <div className="text-xs text-accent font-medium mt-1">
            ${estimatedHourlyRate()}/hr
          </div>
          
          <Button
            size="sm"
            className={`mt-2 transition-colors ${
              addedToRoute 
                ? 'bg-ok hover:bg-ok/90' 
                : 'bg-accent hover:bg-accent/90'
            }`}
            onClick={handleAddToRoute}
          >
            {addedToRoute ? (
              <>
                <Check className="w-3 h-3 mr-2" />
                Added
              </>
            ) : (
              "Add to Route"
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
