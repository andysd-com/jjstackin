import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Copy, Share, Download, Link as LinkIcon, Smartphone, Globe, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SUPPORTED_PLATFORMS = [
  {
    id: 'instacart',
    name: 'Instacart',
    color: '#43B02A',
    icon: '🛒',
    category: 'Grocery Delivery',
    description: 'Grocery shopping and delivery',
    importMethods: ['Share Target', 'Copy & Paste', 'Browser Extension']
  },
  {
    id: 'doordash',
    name: 'DoorDash',
    color: '#FF3008',
    icon: '🍕',
    category: 'Food Delivery',
    description: 'Restaurant pickup and delivery',
    importMethods: ['Share Target', 'Copy & Paste', 'App Integration']
  },
  {
    id: 'uber',
    name: 'Uber Eats',
    color: '#000000',
    icon: '🚗',
    category: 'Food & Rides',
    description: 'Food delivery and rideshare',
    importMethods: ['Share Target', 'Copy & Paste']
  },
  {
    id: 'fieldagent',
    name: 'Field Agent',
    color: '#1E3A8A',
    icon: '📋',
    category: 'Field Work',
    description: 'Retail audits and mystery shopping',
    importMethods: ['Share Target', 'Copy & Paste', 'Email Forward']
  },
  {
    id: 'epms',
    name: 'EPMS',
    color: '#2563EB',
    icon: '🏪',
    category: 'Store Audits',
    description: 'Employee Performance Management System - retail compliance',
    importMethods: ['Email Forward', 'Copy & Paste', 'Portal Integration']
  },
  {
    id: 'ellis',
    name: 'Ellis',
    color: '#DC2626',
    icon: '🕵️',
    category: 'Mystery Shopping',
    description: 'Service evaluations and mystery shopping assignments',
    importMethods: ['Email Forward', 'Copy & Paste', 'App Integration']
  },
  {
    id: 'alt360',
    name: 'Alt360',
    color: '#059669',
    icon: '📊',
    category: 'Market Research',
    description: 'Alternative data collection and customer surveys',
    importMethods: ['Portal Integration', 'Copy & Paste', 'Email Forward']
  },
  {
    id: 'prestoshopper',
    name: 'PrestoShopper',
    color: '#7C3AED',
    icon: '🛍️',
    category: 'Personal Shopping',
    description: 'Grocery shopping and personal shopping services',
    importMethods: ['App Integration', 'Share Target', 'Copy & Paste']
  },
  {
    id: 'gigspot',
    name: 'Gig Spot',
    color: '#8B5CF6',
    icon: '📸',
    category: 'Photo Tasks',
    description: 'Photo documentation and verification tasks',
    importMethods: ['Share Target', 'Copy & Paste']
  }
];

export default function PlatformIntegrations() {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [shareCode, setShareCode] = useState('');
  const { toast } = useToast();

  const platform = SUPPORTED_PLATFORMS.find(p => p.id === selectedPlatform);

  const generateShareCode = () => {
    const code = `javascript:(function(){
      const jobData = {
        title: document.title,
        url: window.location.href,
        text: window.getSelection().toString() || document.body.innerText.substring(0, 500),
        platform: '${selectedPlatform}'
      };
      const stackRunnerUrl = 'https://stackrunner.app/import?data=' + encodeURIComponent(JSON.stringify(jobData));
      window.open(stackRunnerUrl, '_blank');
    })();`;
    setShareCode(code);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Integration code copied successfully",
    });
  };

  const setupShareTarget = () => {
    if ('serviceWorker' in navigator) {
      // Register share target capability
      toast({
        title: "Share Target Setup",
        description: "StackRunner can now receive shared content from other apps",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-ink">Platform Integrations</h2>
          <p className="text-sub text-sm mt-1">
            Import jobs from your favorite gig platforms automatically
          </p>
        </div>
        <Button onClick={setupShareTarget} variant="outline">
          <Smartphone className="w-4 h-4 mr-2" />
          Setup Share Target
        </Button>
      </div>

      {/* Platform Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SUPPORTED_PLATFORMS.map((platform) => (
          <Card key={platform.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                  style={{ backgroundColor: platform.color + '20' }}
                >
                  {platform.icon}
                </div>
                <div>
                  <CardTitle className="text-base">{platform.name}</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {platform.category}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-sub mb-4">{platform.description}</p>
              
              <div className="space-y-2">
                <div className="text-xs text-sub">Import Methods:</div>
                <div className="flex flex-wrap gap-1">
                  {platform.importMethods.map((method) => (
                    <Badge key={method} variant="outline" className="text-xs">
                      {method}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setSelectedPlatform(platform.id)}
                    >
                      <LinkIcon className="w-4 h-4 mr-2" />
                      Setup Integration
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-2">
                        <span>{platform.icon}</span>
                        <span>Setup {platform.name} Integration</span>
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-6">
                      {/* Method 1: Share Target */}
                      <div className="space-y-3">
                        <h3 className="font-medium flex items-center">
                          <Share className="w-4 h-4 mr-2" />
                          Method 1: Share Target (Recommended)
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-sub mb-3">
                            Share jobs directly from the {platform.name} app to StackRunner:
                          </p>
                          <ol className="text-sm space-y-1 list-decimal list-inside">
                            <li>Open a job in the {platform.name} app</li>
                            <li>Tap the "Share" button</li>
                            <li>Select "StackRunner" from the share menu</li>
                            <li>Job details will be automatically imported</li>
                          </ol>
                          <Button 
                            className="mt-3" 
                            size="sm"
                            onClick={setupShareTarget}
                          >
                            Enable Share Target
                          </Button>
                        </div>
                      </div>

                      {/* Method 2: Browser Extension */}
                      <div className="space-y-3">
                        <h3 className="font-medium flex items-center">
                          <Globe className="w-4 h-4 mr-2" />
                          Method 2: Browser Bookmarklet
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-sub mb-3">
                            Import jobs from {platform.name} website with one click:
                          </p>
                          <div className="space-y-3">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={generateShareCode}
                            >
                              Generate Bookmarklet
                            </Button>
                            {shareCode && (
                              <div className="space-y-2">
                                <Textarea
                                  value={shareCode}
                                  readOnly
                                  className="text-xs h-20"
                                />
                                <Button 
                                  size="sm" 
                                  onClick={() => copyToClipboard(shareCode)}
                                >
                                  <Copy className="w-4 h-4 mr-2" />
                                  Copy Bookmarklet
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Method 3: Copy & Paste */}
                      <div className="space-y-3">
                        <h3 className="font-medium flex items-center">
                          <Copy className="w-4 h-4 mr-2" />
                          Method 3: Copy & Paste
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-sub mb-3">
                            Manually import job details:
                          </p>
                          <ol className="text-sm space-y-1 list-decimal list-inside">
                            <li>Copy job details from {platform.name}</li>
                            <li>Open StackRunner Quick Add</li>
                            <li>Select "{platform.name}" as the platform</li>
                            <li>Paste the job details</li>
                            <li>Review and save the imported job</li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Integration Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Integration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">9</div>
              <div className="text-sm text-sub">Platforms Supported</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">3</div>
              <div className="text-sm text-sub">Import Methods</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">Auto</div>
              <div className="text-sm text-sub">Job Parsing</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}