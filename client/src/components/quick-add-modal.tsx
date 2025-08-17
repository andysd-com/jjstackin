import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PLATFORM_TEMPLATES } from "@/types";
import { JobParser } from "@/lib/job-parser";

interface QuickAddModalProps {
  open: boolean;
  onClose: () => void;
  onJobAdded: () => void;
}

export default function QuickAddModal({ open, onClose, onJobAdded }: QuickAddModalProps) {
  const [rawText, setRawText] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const parseJobMutation = useMutation({
    mutationFn: async ({ text, platform }: { text: string; platform?: string }) => {
      if (text.trim()) {
        // Use client-side parsing first, then server-side enhancement
        const parsed = JobParser.parseText(text, platform);
        const response = await apiRequest("POST", "/api/jobs/parse", { text, platform });
        const serverParsed = await response.json();
        
        // Merge client and server parsing results
        return { ...parsed, ...serverParsed };
      } else {
        // Use template defaults
        const template = PLATFORM_TEMPLATES.find(t => t.id === platform);
        return template?.defaultValues || {};
      }
    },
    onSuccess: async (parsedJob) => {
      // Create the job
      try {
        await apiRequest("POST", "/api/jobs", parsedJob);
        toast({
          title: "Job Added",
          description: `Successfully added ${parsedJob.title}`,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
        onJobAdded();
        setRawText("");
        setSelectedTemplate(null);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to add job",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to parse job text",
        variant: "destructive",
      });
    },
  });

  const handleParseAndAdd = () => {
    const platform = selectedTemplate || undefined;
    parseJobMutation.mutate({ text: rawText, platform });
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = PLATFORM_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setRawText(`Add a ${template.name} job:\n\nTitle: \nPayout: $\nLocation: \nNotes: `);
    }
  };

  const handleClose = () => {
    setRawText("");
    setSelectedTemplate(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Quick Add Job</DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Smart Parse Input */}
          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              Paste job details or share text
            </label>
            <Textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="h-24 resize-none"
              placeholder="Paste from app, email, or text message. StackRunner will automatically extract pay, location, and time details."
            />
            <div className="flex items-center mt-2 text-xs text-sub">
              <Sparkles className="w-3 h-3 mr-1 text-accent" />
              Smart parsing for Instacart, DoorDash, Uber, Field Agent, and more
            </div>
          </div>

          {/* Platform Templates */}
          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              Or use a template
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PLATFORM_TEMPLATES.map(template => (
                <Card
                  key={template.id}
                  className={`p-3 cursor-pointer transition-colors ${
                    selectedTemplate === template.id
                      ? 'border-accent bg-accent/5'
                      : 'hover:border-accent hover:bg-accent/5'
                  }`}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <div className="text-sm font-medium text-ink">
                    {template.name}
                  </div>
                  <div className="text-xs text-sub">
                    {template.description}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {selectedTemplate && (
            <Badge variant="secondary" className="w-fit">
              Using {PLATFORM_TEMPLATES.find(t => t.id === selectedTemplate)?.name} template
            </Badge>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-2">
            <Button
              onClick={handleParseAndAdd}
              disabled={parseJobMutation.isPending || (!rawText.trim() && !selectedTemplate)}
              className="flex-1"
            >
              {parseJobMutation.isPending ? "Adding..." : "Parse & Add Job"}
            </Button>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
