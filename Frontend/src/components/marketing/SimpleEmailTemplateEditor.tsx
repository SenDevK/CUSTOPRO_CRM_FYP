import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Eye,
  Code,
  Plus,
  Image,
  Type,
  Link,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Check,
  Loader2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createTemplate } from "@/services/marketingApi";

interface SimpleEmailTemplateEditorProps {
  subject?: string;
  content?: string;
  onContentUpdate: (content: string, subject: string) => void;
}

// Get default template
const getDefaultTemplate = () => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Email Template</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 20px; }
    .content { margin-bottom: 30px; }
    .footer { text-align: center; font-size: 12px; color: #777; }
    .button { display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to Our Service</h1>
    </div>
    <div class="content">
      <p>Hello {firstName},</p>
      <p>Thank you for joining our platform. We're excited to have you on board!</p>
      <p>Feel free to explore our services and reach out if you have any questions.</p>
      <p><a href="#" class="button">Get Started</a></p>
    </div>
    <div class="footer">
      <p>© 2023 Your Company. All rights reserved.</p>
      <p>You're receiving this email because you signed up for our service.</p>
    </div>
  </div>
</body>
</html>`;
};

export function SimpleEmailTemplateEditor({
  subject = "",
  content = "",
  onContentUpdate
}: SimpleEmailTemplateEditorProps) {
  const [activeTab, setActiveTab] = useState("design");
  const [currentSubject, setCurrentSubject] = useState(subject);
  const [currentContent, setCurrentContent] = useState(content || getDefaultTemplate());
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [isSaving, setIsSaving] = useState(false);

  // Initialize with default template if empty
  useEffect(() => {
    if (!content && currentContent === "") {
      const defaultTemplate = getDefaultTemplate();
      setCurrentContent(defaultTemplate);
      onContentUpdate(defaultTemplate, currentSubject);
    }
  }, []);

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

  // Insert HTML at cursor position or at the end
  const insertHTML = (html: string) => {
    const textarea = document.getElementById('html-editor') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent =
        currentContent.substring(0, start) +
        html +
        currentContent.substring(end);

      handleContentChange(newContent);

      // Set cursor position after the inserted HTML
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + html.length, start + html.length);
      }, 0);
    } else {
      // If textarea not found, append to the end
      handleContentChange(currentContent + html);
    }
  };

  // Apply formatting to selected text
  const applyFormatting = (tag: string, attributes: string = "") => {
    const textarea = document.getElementById('html-editor') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = currentContent.substring(start, end);

      if (selectedText) {
        const formattedText = `<${tag}${attributes ? ' ' + attributes : ''}>${selectedText}</${tag}>`;
        const newContent =
          currentContent.substring(0, start) +
          formattedText +
          currentContent.substring(end);

        handleContentChange(newContent);
      } else {
        const emptyTag = `<${tag}${attributes ? ' ' + attributes : ''}></${tag}>`;
        insertHTML(emptyTag);
      }
    }
  };

  // Insert personalization tag
  const insertPersonalizationTag = (tag: string) => {
    insertHTML(`{${tag}}`);
    toast({
      title: "Personalization tag added",
      description: `The {${tag}} tag has been added to your template.`,
      duration: 3000,
    });
  };

  // State for save template dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateTags, setTemplateTags] = useState("");

  // Save as template
  const saveAsTemplate = async () => {
    if (!templateName.trim()) {
      toast({
        title: "Template name required",
        description: "Please enter a name for your template.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsSaving(true);

    try {
      // Create tags array from comma-separated string
      const tags = templateTags
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // Create template object
      const template = {
        name: templateName,
        type: 'email',
        content: currentContent,
        subject: currentSubject,
        tags
      };

      // Call API to create template
      const result = await createTemplate(template);

      toast({
        title: "Template saved",
        description: "Your template has been saved successfully.",
        duration: 3000,
      });

      // Close dialog and reset form
      setIsDialogOpen(false);
      setTemplateName("");
      setTemplateTags("");
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Error saving template",
        description: "There was an error saving your template. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // This function is now defined at the top of the file

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <Label htmlFor="subject">Email Subject</Label>
          <div className="flex gap-2">
            <Input
              id="subject"
              placeholder="Enter email subject"
              value={currentSubject}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="w-[400px]"
            />
            <Button
              variant="outline"
              size="icon"
              title="Add First Name"
              onClick={() => {
                handleSubjectChange(currentSubject + " {firstName}");
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              Save as Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Email Template</DialogTitle>
              <DialogDescription>
                Save this email design as a reusable template for future campaigns.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  placeholder="Enter a name for your template"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-tags">Tags (comma separated)</Label>
                <Input
                  id="template-tags"
                  placeholder="promotion, newsletter, welcome"
                  value={templateTags}
                  onChange={(e) => setTemplateTags(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Tags help you organize and find your templates more easily.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={saveAsTemplate}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Template"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-1 space-y-4">
                    <div className="bg-primary/5 p-4 rounded-md">
                      <h3 className="text-sm font-medium mb-3">Content Blocks</h3>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-left"
                          onClick={() => {
                            const headerBlock = `<div style="text-align: center; margin-bottom: 20px;">
  <h1 style="color: #333; font-size: 24px; margin-bottom: 10px;">Your Heading</h1>
  <p style="color: #666; font-size: 16px;">Your subheading or tagline</p>
</div>`;
                            insertHTML(headerBlock);
                          }}
                        >
                          <Type className="h-4 w-4 mr-2" />
                          Header
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-left"
                          onClick={() => {
                            const textBlock = `<p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
  Your paragraph text goes here. This is where you can add your main message content.
</p>`;
                            insertHTML(textBlock);
                          }}
                        >
                          <AlignLeft className="h-4 w-4 mr-2" />
                          Text Block
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-left"
                          onClick={() => {
                            const imageBlock = `<div style="text-align: center; margin-bottom: 20px;">
  <img src="https://via.placeholder.com/600x300" alt="Image" style="max-width: 100%; height: auto;" />
</div>`;
                            insertHTML(imageBlock);
                          }}
                        >
                          <Image className="h-4 w-4 mr-2" />
                          Image
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-left"
                          onClick={() => {
                            const buttonBlock = `<div style="text-align: center; margin-bottom: 20px;">
  <a href="#" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">Click Here</a>
</div>`;
                            insertHTML(buttonBlock);
                          }}
                        >
                          <Link className="h-4 w-4 mr-2" />
                          Button
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-left"
                          onClick={() => {
                            const dividerBlock = `<hr style="border: 0; height: 1px; background-color: #e5e7eb; margin: 30px 0;" />`;
                            insertHTML(dividerBlock);
                          }}
                        >
                          <Separator className="h-4 w-4 mr-2" />
                          Divider
                        </Button>
                      </div>
                    </div>

                    <div className="bg-primary/5 p-4 rounded-md">
                      <h3 className="text-sm font-medium mb-3">Personalization</h3>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-left"
                          onClick={() => insertPersonalizationTag("firstName")}
                        >
                          First Name
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-left"
                          onClick={() => insertPersonalizationTag("lastName")}
                        >
                          Last Name
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-left"
                          onClick={() => insertPersonalizationTag("email")}
                        >
                          Email
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-left"
                          onClick={() => insertPersonalizationTag("companyName")}
                        >
                          Company Name
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-3">
                    <div className="border rounded-md p-4 min-h-[500px] overflow-auto">
                      <div dangerouslySetInnerHTML={{ __html: currentContent }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="code">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applyFormatting('b')}
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applyFormatting('i')}
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applyFormatting('u')}
                >
                  <Underline className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="h-8" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applyFormatting('p')}
                >
                  Paragraph
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applyFormatting('h1')}
                >
                  H1
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applyFormatting('h2')}
                >
                  H2
                </Button>
                <Separator orientation="vertical" className="h-8" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applyFormatting('div', 'style="text-align: left;"')}
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applyFormatting('div', 'style="text-align: center;"')}
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applyFormatting('div', 'style="text-align: right;"')}
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="h-8" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applyFormatting('a', 'href="#"')}
                >
                  <Link className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    insertHTML('<img src="https://via.placeholder.com/600x300" alt="Image" style="max-width: 100%; height: auto;" />');
                  }}
                >
                  <Image className="h-4 w-4" />
                </Button>
              </div>

              <Textarea
                id="html-editor"
                className="min-h-[500px] font-mono text-sm"
                placeholder="Enter HTML content for your email"
                value={currentContent}
                onChange={(e) => handleContentChange(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Use &#123;firstName&#125;, &#123;lastName&#125;, etc. as placeholders for personalization.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="preview">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-sm">Email Preview</CardTitle>
                    <CardDescription>
                      Preview how your email will look to recipients
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="preview-mode" className="text-sm">View as:</Label>
                    <Select
                      value={previewMode}
                      onValueChange={(value) => setPreviewMode(value as "desktop" | "mobile")}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Select view" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desktop">Desktop</SelectItem>
                        <SelectItem value="mobile">Mobile</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className={`border rounded-md ${previewMode === "mobile" ? "max-w-[375px] mx-auto" : ""}`}>
                  <div className="bg-gray-100 p-2 border-b flex items-center gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium truncate">{currentSubject || "No subject"}</p>
                      <p className="text-xs text-muted-foreground">From: Your Company &lt;marketing@yourcompany.com&gt;</p>
                    </div>
                  </div>
                  <div className="p-4 min-h-[400px] overflow-auto">
                    {currentContent ? (
                      <div dangerouslySetInnerHTML={{ __html: currentContent
                        .replace(/{firstName}/g, "John")
                        .replace(/{lastName}/g, "Doe")
                        .replace(/{email}/g, "john.doe@example.com")
                        .replace(/{companyName}/g, "ACME Inc.")
                      }} />
                    ) : (
                      <p className="text-muted-foreground text-center">
                        No content to preview
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
