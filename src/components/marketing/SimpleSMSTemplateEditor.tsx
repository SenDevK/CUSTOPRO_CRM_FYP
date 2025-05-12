import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  AlertCircle,
  Check,
  Plus,
  Calendar,
  MapPin,
  Phone,
  Tag,
  DollarSign,
  Percent,
  Clock,
  FileText,
  Eye
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";

interface SimpleSMSTemplateEditorProps {
  content?: string;
  onContentUpdate: (content: string) => void;
}

// Get default template
const getDefaultTemplate = () => {
  return "Hi {firstName}! Thank you for your recent purchase. We hope you're enjoying your new product. Let us know if you have any questions!";
};

export function SimpleSMSTemplateEditor({
  content = "",
  onContentUpdate
}: SimpleSMSTemplateEditorProps) {
  const [currentContent, setCurrentContent] = useState(content || getDefaultTemplate());
  const [characterCount, setCharacterCount] = useState(0);
  const [messageCount, setMessageCount] = useState(1);
  const [activeTab, setActiveTab] = useState<"compose" | "templates" | "preview">("compose");
  const [isSaving, setIsSaving] = useState(false);

  // Initialize with default template if empty
  useEffect(() => {
    if (!content && currentContent === "") {
      const defaultTemplate = getDefaultTemplate();
      setCurrentContent(defaultTemplate);
      onContentUpdate(defaultTemplate);
    }

    // Calculate initial character count
    const count = currentContent.length;
    setCharacterCount(count);

    if (count <= 160) {
      setMessageCount(1);
    } else {
      setMessageCount(Math.ceil((count - 160) / 153) + 1);
    }
  }, []);

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

  // Handle content change
  const handleContentChange = (newContent: string) => {
    setCurrentContent(newContent);
    onContentUpdate(newContent);
  };

  // Insert text at cursor position or at the end
  const insertText = (text: string) => {
    const textarea = document.getElementById('sms-content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent =
        currentContent.substring(0, start) +
        text +
        currentContent.substring(end);

      handleContentChange(newContent);

      // Set cursor position after the inserted text
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + text.length, start + text.length);
      }, 0);
    } else {
      // If textarea not found, append to the end
      handleContentChange(currentContent + text);
    }
  };

  // Insert personalization tag
  const insertPersonalizationTag = (tag: string) => {
    insertText(`{${tag}}`);
    toast({
      title: "Personalization tag added",
      description: `The {${tag}} tag has been added to your message.`,
      duration: 3000,
    });
  };

  // Apply template
  const applyTemplate = (template: string) => {
    handleContentChange(template);
    setActiveTab("compose");
    toast({
      title: "Template applied",
      description: "The template has been applied to your message.",
      duration: 3000,
    });
  };

  // Save as template
  const saveAsTemplate = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Template saved",
        description: "Your template has been saved successfully.",
        duration: 3000,
      });
    }, 1000);
  };

  // This function is now defined at the top of the file

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${characterCount > 160 ? 'text-amber-500' : ''}`}>
            {characterCount} characters
          </span>
          <span className="text-xs text-muted-foreground">
            ({messageCount} message{messageCount !== 1 ? 's' : ''})
          </span>
        </div>
        <Button
          onClick={saveAsTemplate}
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          {isSaving ? (
            <>Saving...</>
          ) : (
            <>
              <Check className="h-4 w-4" />
              Save as Template
            </>
          )}
        </Button>
      </div>

      <Progress
        value={Math.min((characterCount / 160) * 100, 100)}
        className={`h-1 ${characterCount > 160 ? 'bg-amber-100' : ''}`}
        indicatorClassName={characterCount > 160 ? 'bg-amber-500' : undefined}
      />

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "compose" | "templates" | "preview")}>
        <TabsList className="mb-4">
          <TabsTrigger value="compose">
            <MessageSquare className="h-4 w-4 mr-2" />
            Compose
          </TabsTrigger>
          <TabsTrigger value="templates">
            <FileText className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compose">
          <div className="space-y-4">
            <Textarea
              id="sms-content"
              className="min-h-[200px]"
              placeholder="Enter SMS content"
              value={currentContent}
              onChange={(e) => handleContentChange(e.target.value)}
            />

            {characterCount > 160 && (
              <Alert variant="warning">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Message will be split</AlertTitle>
                <AlertDescription>
                  Your message exceeds the standard SMS length (160 characters). It will be sent as {messageCount} separate messages, which may increase costs.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-3">Personalization Tags</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => insertPersonalizationTag("firstName")}
                  >
                    <Plus className="h-3 w-3 mr-2" />
                    First Name
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => insertPersonalizationTag("lastName")}
                  >
                    <Plus className="h-3 w-3 mr-2" />
                    Last Name
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => insertPersonalizationTag("email")}
                  >
                    <Plus className="h-3 w-3 mr-2" />
                    Email
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => insertPersonalizationTag("phone")}
                  >
                    <Plus className="h-3 w-3 mr-2" />
                    Phone
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-3">Common Variables</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => insertPersonalizationTag("promoCode")}
                  >
                    <Tag className="h-3 w-3 mr-2" />
                    Promo Code
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => insertPersonalizationTag("discountPercent")}
                  >
                    <Percent className="h-3 w-3 mr-2" />
                    Discount %
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => insertPersonalizationTag("appointmentDate")}
                  >
                    <Calendar className="h-3 w-3 mr-2" />
                    Appointment
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => insertPersonalizationTag("orderNumber")}
                  >
                    <DollarSign className="h-3 w-3 mr-2" />
                    Order #
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => {
              applyTemplate("Hi {firstName}! We're excited to offer you a special discount of {discountPercent}% on your next purchase. Use code: {promoCode}");
            }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Promotional Offer</CardTitle>
                <CardDescription className="text-xs">
                  Special discount promotion
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Hi {"{firstName}"}! We're excited to offer you a special discount of {"{discountPercent}"}% on your next purchase. Use code: {"{promoCode}"}
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => {
              applyTemplate("Hi {firstName}! Just a reminder that your appointment is scheduled for {appointmentDate}. Reply YES to confirm or call us at {phoneNumber} to reschedule.");
            }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Appointment Reminder</CardTitle>
                <CardDescription className="text-xs">
                  Reminder for upcoming appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Hi {"{firstName}"}! Just a reminder that your appointment is scheduled for {"{appointmentDate}"}. Reply YES to confirm or call us at {"{phoneNumber}"} to reschedule.
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => {
              applyTemplate("Thank you for your order, {firstName}! Your order #{orderNumber} has been confirmed and will be shipped soon. Track your order at: {trackingUrl}");
            }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Order Confirmation</CardTitle>
                <CardDescription className="text-xs">
                  Confirm customer orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Thank you for your order, {"{firstName}"}! Your order #{"{orderNumber}"} has been confirmed and will be shipped soon. Track your order at: {"{trackingUrl}"}
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => {
              applyTemplate("Hi {firstName}, your feedback matters! How would you rate your recent experience with us? Reply with a number from 1-5, with 5 being excellent.");
            }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Feedback Request</CardTitle>
                <CardDescription className="text-xs">
                  Request customer feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Hi {"{firstName}"}, your feedback matters! How would you rate your recent experience with us? Reply with a number from 1-5, with 5 being excellent.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preview">
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
                      <p className="text-sm font-medium">Your Company</p>
                      <p className="text-sm mt-1">
                        {currentContent ? (
                          currentContent
                            .replace(/{firstName}/g, "John")
                            .replace(/{lastName}/g, "Doe")
                            .replace(/{promoCode}/g, "SAVE20")
                            .replace(/{discountPercent}/g, "15")
                            .replace(/{appointmentDate}/g, "May 15 at 2:00 PM")
                            .replace(/{phoneNumber}/g, "(555) 123-4567")
                            .replace(/{orderNumber}/g, "ORD-12345")
                            .replace(/{trackingUrl}/g, "example.com/track")
                            .replace(/{email}/g, "john.doe@example.com")
                        ) : (
                          <span className="text-muted-foreground">No content to preview</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Character Usage</h3>
                <div className="flex items-center gap-2">
                  <Progress
                    value={Math.min((characterCount / 160) * 100, 100)}
                    className="h-2 flex-1"
                    indicatorClassName={characterCount > 160 ? 'bg-amber-500' : undefined}
                  />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {characterCount}/160
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {messageCount === 1 ? (
                    "Your message fits within a single SMS."
                  ) : (
                    `Your message will be split into ${messageCount} SMS messages (${characterCount} characters total).`
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
