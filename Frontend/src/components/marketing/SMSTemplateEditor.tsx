import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Template } from "@/services/marketingApi";
import { MessageSquare, AlertCircle, Plus, Edit, Copy } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SMSTemplateEditorProps {
  templates: Template[];
  selectedTemplateId?: string;
  content?: string;
  onTemplateSelected: (templateId: string) => void;
  onContentUpdate: (content: string) => void;
}

export function SMSTemplateEditor({
  templates,
  selectedTemplateId,
  content = "",
  onTemplateSelected,
  onContentUpdate
}: SMSTemplateEditorProps) {
  const [currentContent, setCurrentContent] = useState(content);
  const [characterCount, setCharacterCount] = useState(0);
  const [messageCount, setMessageCount] = useState(1);

  // Filter templates to only show SMS templates
  const smsTemplates = templates.filter(t => t.type === "sms");

  // Update character count and message count
  useEffect(() => {
    const count = currentContent.length;
    setCharacterCount(count);

    // Calculate message count (160 chars for first message, 153 for subsequent)
    if (count <= 160) {
      setMessageCount(1);
    } else {
      setMessageCount(Math.ceil((count - 160) / 153) + 1);
    }
  }, [currentContent]);

  // Handle template selection
  const handleTemplateChange = (templateId: string) => {
    onTemplateSelected(templateId);
  };

  // Handle content change
  const handleContentChange = (newContent: string) => {
    setCurrentContent(newContent);
    onContentUpdate(newContent);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="template">SMS Template</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Select
              value={selectedTemplateId || ""}
              onValueChange={handleTemplateChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a template or create a new one" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Create a new template</SelectItem>
                {smsTemplates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            {selectedTemplateId ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    // In a real implementation, this would open a template edit dialog
                    // For now, we'll just log a message
                    console.log("Edit template:", selectedTemplateId);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Template
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // In a real implementation, this would duplicate the template
                    // For now, we'll just clear the selection
                    handleTemplateChange("");
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  // In a real implementation, this would open a template creation dialog
                  // For now, we'll just log a message
                  console.log("Create new template");
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Button>
            )}
          </div>
        </div>
        {selectedTemplateId && (
          <div className="text-xs text-muted-foreground">
            Using template: <span className="font-medium">{smsTemplates.find(t => t.id === selectedTemplateId)?.name}</span>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 ml-2"
              onClick={() => handleTemplateChange("")}
            >
              Clear
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label htmlFor="sms-content">SMS Content</Label>
          <span className={`text-xs ${characterCount > 160 ? 'text-amber-500 font-medium' : 'text-muted-foreground'}`}>
            {characterCount} characters ({messageCount} message{messageCount !== 1 ? 's' : ''})
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Textarea
              id="sms-content"
              className="min-h-[200px]"
              placeholder="Enter SMS content"
              value={currentContent}
              onChange={(e) => handleContentChange(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use {{firstName}}, {{lastName}}, etc. as placeholders for personalization.
            </p>

            {characterCount > 160 && (
              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md text-amber-700 text-xs">
                <AlertCircle className="h-3 w-3 inline-block mr-1" />
                Your message exceeds the standard SMS length (160 characters). It will be sent as {messageCount} separate messages, which may increase costs.
              </div>
            )}
          </div>

          <div>
            <div className="bg-primary/5 p-4 rounded-md h-full">
              <h3 className="text-sm font-medium mb-3">Quick Templates</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left"
                  onClick={() => {
                    const template = "Hi {{firstName}}! We're excited to offer you a special discount of {{discountPercent}}% on your next purchase. Use code: {{promoCode}}";
                    setCurrentContent(template);
                    handleContentChange(template);
                  }}
                >
                  Promotional Offer
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left"
                  onClick={() => {
                    const template = "Hi {{firstName}}! Just a reminder that your appointment is scheduled for {{appointmentDate}}. Reply YES to confirm or call us at {{phoneNumber}} to reschedule.";
                    setCurrentContent(template);
                    handleContentChange(template);
                  }}
                >
                  Appointment Reminder
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left"
                  onClick={() => {
                    const template = "Thank you for your purchase, {{firstName}}! Your order #{{orderNumber}} has been confirmed and will be shipped within 2 business days.";
                    setCurrentContent(template);
                    handleContentChange(template);
                  }}
                >
                  Order Confirmation
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {messageCount > 1 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Multiple SMS messages</AlertTitle>
          <AlertDescription>
            Your message will be split into {messageCount} SMS messages. This may increase costs and delivery time.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">SMS Preview</CardTitle>
          <CardDescription>
            Preview how your SMS will look on a mobile device
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md p-4 bg-gray-100 dark:bg-gray-800 max-w-xs mx-auto">
            <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
              <div className="flex items-start gap-2">
                <div className="bg-primary/10 rounded-full p-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Eegent Fashion</p>
                  <p className="text-sm mt-1">
                    {currentContent ? (
                      currentContent
                        .replace(/{{firstName}}/g, "John")
                        .replace(/{{lastName}}/g, "Doe")
                        .replace(/{{promoCode}}/g, "SAVE20")
                        .replace(/{{expiryDate}}/g, "30/04/2023")
                    ) : (
                      <span className="text-muted-foreground">No content to preview</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Available Personalization Tags</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newContent = currentContent + "{{firstName}}";
              handleContentChange(newContent);
            }}
          >
            First Name
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newContent = currentContent + "{{lastName}}";
              handleContentChange(newContent);
            }}
          >
            Last Name
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newContent = currentContent + "{{promoCode}}";
              handleContentChange(newContent);
            }}
          >
            Promo Code
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newContent = currentContent + "{{expiryDate}}";
              handleContentChange(newContent);
            }}
          >
            Expiry Date
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newContent = currentContent + "{{shopUrl}}";
              handleContentChange(newContent);
            }}
          >
            Shop URL
          </Button>
        </div>
      </div>
    </div>
  );
}
