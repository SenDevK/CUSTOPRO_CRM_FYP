import React from 'react';
import { Plus, Edit, Copy, Mail, MessageSquare, FileText, Eye, Code, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function IconTest() {
  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-lg font-semibold mb-4">Icon Test Component</h2>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Plus Icon
        </Button>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Edit Icon
        </Button>
        <Button variant="outline" size="sm">
          <Copy className="h-4 w-4 mr-2" />
          Copy Icon
        </Button>
        <Button variant="outline" size="sm">
          <Mail className="h-4 w-4 mr-2" />
          Mail Icon
        </Button>
        <Button variant="outline" size="sm">
          <MessageSquare className="h-4 w-4 mr-2" />
          MessageSquare Icon
        </Button>
        <Button variant="outline" size="sm">
          <FileText className="h-4 w-4 mr-2" />
          FileText Icon
        </Button>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-2" />
          Eye Icon
        </Button>
        <Button variant="outline" size="sm">
          <Code className="h-4 w-4 mr-2" />
          Code Icon
        </Button>
        <Button variant="outline" size="sm">
          <AlertCircle className="h-4 w-4 mr-2" />
          AlertCircle Icon
        </Button>
      </div>
    </div>
  );
}
