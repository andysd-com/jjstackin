import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, Plus } from "lucide-react";

export default function SmartSuggestions() {
  const suggestions = [
    {
      id: 1,
      title: "Nearby Opportunity",
      description: "Add the Target audit for +$8.50 and only +15 minutes to your route.",
      action: "Add to route",
      value: "$8.50",
      timeImpact: "+15 min"
    },
    {
      id: 2,
      title: "Peak Pay Active",
      description: "DoorDash peak pay is active in your area. Consider adding more delivery jobs.",
      action: "Browse deliveries",
      value: "+$3.00",
      timeImpact: "bonus"
    }
  ];

  return (
    <div className="space-y-3">
      {suggestions.map(suggestion => (
        <Card 
          key={suggestion.id}
          className="bg-gradient-to-r from-accent/5 to-purple-50 border-accent/20 p-4"
        >
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-accent" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-ink mb-1">
                {suggestion.title}
              </h4>
              <p className="text-sm text-sub mb-2">
                {suggestion.description}
              </p>
              <div className="flex items-center justify-between">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-accent hover:text-accent/80 p-0 h-auto font-medium"
                >
                  {suggestion.action} →
                </Button>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-ok font-medium">{suggestion.value}</span>
                  <span className="text-sub">{suggestion.timeImpact}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
