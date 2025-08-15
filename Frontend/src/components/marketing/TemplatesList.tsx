import { useState, useEffect } from "react";
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
  Loader2
} from "lucide-react";
import { getTemplates, Template } from "@/services/marketingApi";

export function TemplatesList() {
  const [activeTab, setActiveTab] = useState("email");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Load templates on component mount
  useEffect(() => {
    const loadTemplates = async () => {
      setIsLoading(true);
      try {
        const data = await getTemplates();
        setTemplates(data);
      } catch (error) {
        console.error("Error loading templates:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, []);

  // Filter templates by type
  const filteredTemplates = templates.filter(template => template.type === activeTab);

  // Preview template
  const handlePreviewTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setShowPreview(true);
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

            <Button onClick={() => {
              // In a real implementation, this would open a template creation dialog
              // For now, we'll just add a mock template to the list
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
            }}>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading templates...</span>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                {activeTab === "email" ? (
                  <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                ) : (
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                )}
                <h3 className="text-lg font-medium mb-2">No {activeTab} templates yet</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  Create your first {activeTab} template to use in your marketing campaigns.
                </p>
                <Button onClick={() => {
                  // In a real implementation, this would open a template creation dialog
                  // For now, we'll just add a mock template to the list
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
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </CardContent>
            </Card>
          ) : (
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
          )}
        </>
      )}
    </div>
  );
}
