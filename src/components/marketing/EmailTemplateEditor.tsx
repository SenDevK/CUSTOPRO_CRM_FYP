import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Template } from "@/services/marketingApi";
import { FileText, Eye, Code, Plus, Edit, Copy } from "lucide-react";

interface EmailTemplateEditorProps {
  templates: Template[];
  selectedTemplateId?: string;
  subject?: string;
  content?: string;
  onTemplateSelected: (templateId: string) => void;
  onContentUpdate: (content: string, subject: string) => void;
}

export function EmailTemplateEditor({
  templates,
  selectedTemplateId,
  subject = "",
  content = "",
  onTemplateSelected,
  onContentUpdate
}: EmailTemplateEditorProps) {
  const [activeTab, setActiveTab] = useState("design");
  const [currentSubject, setCurrentSubject] = useState(subject);
  const [currentContent, setCurrentContent] = useState(content);

  // Filter templates to only show email templates
  const emailTemplates = templates.filter(t => t.type === "email");

  // Handle template selection
  const handleTemplateChange = (templateId: string) => {
    onTemplateSelected(templateId);
  };

  // Handle subject change
  const handleSubjectChange = (newSubject: string) => {
    setCurrentSubject(newSubject);
    onContentUpdate(currentContent, newSubject);
  };

  // Handle content change
  const handleContentChange = (newContent: string) => {
    setCurrentContent(newContent);
    onContentUpdate(newContent, currentSubject);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="template">Email Template</Label>
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
                {emailTemplates.map(template => (
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
            Using template: <span className="font-medium">{emailTemplates.find(t => t.id === selectedTemplateId)?.name}</span>
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

      <div className="space-y-2">
        <Label htmlFor="subject">Email Subject</Label>
        <Input
          id="subject"
          placeholder="Enter email subject"
          value={currentSubject}
          onChange={(e) => handleSubjectChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Email Content</Label>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-2">
            <TabsTrigger value="design">
              <FileText className="h-4 w-4 mr-2" />
              Design
            </TabsTrigger>
            <TabsTrigger value="code">
              <Code className="h-4 w-4 mr-2" />
              HTML
            </TabsTrigger>
            <TabsTrigger value="preview">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="design">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Email Builder</CardTitle>
                <CardDescription>
                  Design your email using the visual editor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md p-4 min-h-[300px]">
                  <div className="space-y-4">
                    <div className="bg-primary/5 p-4 rounded-md">
                      <h2 className="text-lg font-semibold mb-2">Header Section</h2>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => {
                          const headerTemplate = `<h1 style="color: #333; font-size: 24px; margin-bottom: 20px;">Your Company Name</h1>`;
                          setCurrentContent(currentContent + headerTemplate);
                          handleContentChange(currentContent + headerTemplate);
                        }}>
                          Add Header
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => {
                          const logoTemplate = `<img src="https://via.placeholder.com/150x50" alt="Logo" style="margin-bottom: 20px;" />`;
                          setCurrentContent(currentContent + logoTemplate);
                          handleContentChange(currentContent + logoTemplate);
                        }}>
                          Add Logo
                        </Button>
                      </div>
                    </div>

                    <div className="bg-primary/5 p-4 rounded-md">
                      <h2 className="text-lg font-semibold mb-2">Content Blocks</h2>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => {
                          const textBlock = `<p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Hello {{firstName}},</p>
<p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your message here...</p>`;
                          setCurrentContent(currentContent + textBlock);
                          handleContentChange(currentContent + textBlock);
                        }}>
                          Text Block
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => {
                          const imageBlock = `<img src="https://via.placeholder.com/600x300" alt="Image" style="width: 100%; max-width: 600px; height: auto; margin-bottom: 20px;" />`;
                          setCurrentContent(currentContent + imageBlock);
                          handleContentChange(currentContent + imageBlock);
                        }}>
                          Image
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => {
                          const buttonBlock = `<a href="#" style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 4px; margin-bottom: 20px;">Click Here</a>`;
                          setCurrentContent(currentContent + buttonBlock);
                          handleContentChange(currentContent + buttonBlock);
                        }}>
                          Button
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => {
                          const dividerBlock = `<hr style="border: 0; height: 1px; background-color: #e5e7eb; margin: 20px 0;" />`;
                          setCurrentContent(currentContent + dividerBlock);
                          handleContentChange(currentContent + dividerBlock);
                        }}>
                          Divider
                        </Button>
                      </div>
                    </div>

                    <div className="bg-primary/5 p-4 rounded-md">
                      <h2 className="text-lg font-semibold mb-2">Footer Section</h2>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => {
                          const footerTemplate = `<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #9CA3AF; font-size: 14px;">
  <p>© 2023 Your Company. All rights reserved.</p>
  <p>123 Business Street, City, Country</p>
  <p><a href="#" style="color: #4F46E5;">Unsubscribe</a> | <a href="#" style="color: #4F46E5;">View in browser</a></p>
</div>`;
                          setCurrentContent(currentContent + footerTemplate);
                          handleContentChange(currentContent + footerTemplate);
                        }}>
                          Add Footer
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => {
                          const socialTemplate = `<div style="margin-top: 20px;">
  <a href="#" style="display: inline-block; margin-right: 10px;"><img src="https://via.placeholder.com/30" alt="Facebook" /></a>
  <a href="#" style="display: inline-block; margin-right: 10px;"><img src="https://via.placeholder.com/30" alt="Twitter" /></a>
  <a href="#" style="display: inline-block; margin-right: 10px;"><img src="https://via.placeholder.com/30" alt="Instagram" /></a>
</div>`;
                          setCurrentContent(currentContent + socialTemplate);
                          handleContentChange(currentContent + socialTemplate);
                        }}>
                          Social Links
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="code">
            <Textarea
              className="min-h-[300px] font-mono text-sm"
              placeholder="Enter HTML content for your email"
              value={currentContent}
              onChange={(e) => handleContentChange(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Use {{firstName}}, {{lastName}}, etc. as placeholders for personalization.
            </p>
          </TabsContent>

          <TabsContent value="preview">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Email Preview</CardTitle>
                <CardDescription>
                  Preview how your email will look to recipients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md p-4 min-h-[300px] overflow-auto">
                  {currentContent ? (
                    <div dangerouslySetInnerHTML={{ __html: currentContent }} />
                  ) : (
                    <p className="text-muted-foreground text-center">
                      No content to preview
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

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
              const newContent = currentContent + "{{email}}";
              handleContentChange(newContent);
            }}
          >
            Email
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
        </div>
      </div>
    </div>
  );
}
