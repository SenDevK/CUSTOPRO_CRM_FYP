import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Mail,
  MessageSquare,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Eye,
} from "lucide-react";
import { Template } from "@/services/marketingApi";

// Mock templates data
const mockEmailTemplates: Template[] = [
  {
    id: "email-template-1",
    name: "Welcome Email",
    type: "email",
    content: "<h1>Welcome to Our Service!</h1><p>Dear {{firstName}},</p><p>Thank you for joining our platform. We're excited to have you on board!</p>",
    subject: "Welcome to Our Platform",
    tags: ["welcome", "onboarding"],
    createdAt: "2023-01-15T10:30:00Z",
    updatedAt: "2023-01-15T10:30:00Z"
  },
  {
    id: "email-template-2",
    name: "Monthly Newsletter",
    type: "email",
    content: "<h1>Monthly Newsletter</h1><p>Hello {{firstName}},</p><p>Here are the latest updates from our company...</p>",
    subject: "Your Monthly Newsletter - Latest Updates",
    tags: ["newsletter", "monthly"],
    createdAt: "2023-02-01T14:20:00Z",
    updatedAt: "2023-02-01T14:20:00Z"
  },
  {
    id: "email-template-3",
    name: "Special Offer",
    type: "email",
    content: "<h1>Special Offer Just for You!</h1><p>Hi {{firstName}},</p><p>We're excited to offer you a special discount on our premium services.</p>",
    subject: "Special Offer - Limited Time Only!",
    tags: ["promotion", "offer"],
    createdAt: "2023-03-10T09:15:00Z",
    updatedAt: "2023-03-10T09:15:00Z"
  }
];

const mockSMSTemplates: Template[] = [
  {
    id: "sms-template-1",
    name: "Appointment Reminder",
    type: "sms",
    content: "Hi {{firstName}}! Just a reminder that your appointment is scheduled for tomorrow at 2 PM. Reply YES to confirm.",
    tags: ["reminder", "appointment"],
    createdAt: "2023-01-20T11:45:00Z",
    updatedAt: "2023-01-20T11:45:00Z"
  },
  {
    id: "sms-template-2",
    name: "Order Confirmation",
    type: "sms",
    content: "Thank you for your order, {{firstName}}! Your order #{{orderNumber}} has been confirmed and will be shipped soon.",
    tags: ["order", "confirmation"],
    createdAt: "2023-02-15T16:30:00Z",
    updatedAt: "2023-02-15T16:30:00Z"
  }
];

export function SimpleTemplatesList() {
  const [activeTab, setActiveTab] = useState("email");
  const [templates, setTemplates] = useState<Template[]>([
    ...mockEmailTemplates,
    ...mockSMSTemplates
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Filter templates by type
  const filteredTemplates = templates.filter(template => template.type === activeTab);

  // Preview template
  const handlePreviewTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  // Add new template
  const handleAddTemplate = () => {
    const newTemplate: Template = {
      id: `template-${Date.now()}`,
      name: activeTab === "email" ? "New Email Template" : "New SMS Template",
      type: activeTab as "email" | "sms",
      content: activeTab === "email"
        ? "<h1>Hello {{firstName}},</h1><p>This is a new email template.</p>"
        : "Hello {{firstName}}, this is a new SMS template.",
      subject: activeTab === "email" ? "New Template Subject" : undefined,
      tags: ["new"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTemplates([...templates, newTemplate]);
  };

  return (
    <div>
      {showPreview && selectedTemplate ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{selectedTemplate.name}</CardTitle>
                <CardDescription>
                  {selectedTemplate.type === "email" ? "Email Template" : "SMS Template"}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>
                Close Preview
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {selectedTemplate.type === "email" ? (
              <div className="border rounded-md p-6">
                <div className="mb-4 pb-4 border-b">
                  <h3 className="text-sm font-medium text-muted-foreground">Subject</h3>
                  <p className="mt-1">{selectedTemplate.subject}</p>
                </div>
                <div dangerouslySetInnerHTML={{ __html: selectedTemplate.content }} />
              </div>
            ) : (
              <div className="border rounded-md p-6">
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                  <p className="text-sm">{selectedTemplate.content}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="email">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Templates
                </TabsTrigger>
                <TabsTrigger value="sms">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  SMS Templates
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Button onClick={handleAddTemplate}>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <Card key={template.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handlePreviewTemplate(template)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 dark:text-red-400">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription className="text-xs">
                    {template.type === "email" ? (
                      <>
                        <span className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          Email Template
                        </span>
                        {template.subject && (
                          <span className="block mt-1 truncate">
                            Subject: {template.subject}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="flex items-center">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        SMS Template
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground mb-3">
                    {template.type === "email" ? (
                      <div className="line-clamp-3 h-[60px] overflow-hidden">
                        {template.content.replace(/<[^>]*>?/gm, ' ')}
                      </div>
                    ) : (
                      <div className="line-clamp-3 h-[60px] overflow-hidden">
                        {template.content}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {template.tags?.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
