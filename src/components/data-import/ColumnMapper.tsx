import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { detectFileColumns, ColumnMappingResponse } from '@/services/api';
import { toast } from "sonner";

interface ColumnMapperProps {
  file: File;
  onMappingsConfirmed: (mappings: Record<string, string>) => void;
  onCancel: () => void;
}

export function ColumnMapper({ file, onMappingsConfirmed, onCancel }: ColumnMapperProps) {
  const [headers, setHeaders] = useState<string[]>([]);
  const [suggestedMappings, setSuggestedMappings] = useState<Record<string, string | null>>({});
  const [customMappings, setCustomMappings] = useState<Record<string, string | null>>({});
  const [availableFields, setAvailableFields] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      detectColumns(file);
    }
  }, [file]);

  const detectColumns = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await detectFileColumns(file);

      // Ensure we have valid data with fallbacks
      const headers = data.headers || [];
      const suggestedMappings = data.suggested_mappings || {};
      const availableFields = data.available_fields || [
        'full_name', 'contact_number', 'email', 'gender', 'age',
        'transaction_id', 'purchase_datetime', 'total_amount_lkr'
      ];

      setHeaders(headers);
      setSuggestedMappings(suggestedMappings);

      // Convert null/empty values to 'ignore' for the UI
      const initialMappings = Object.entries(suggestedMappings).reduce((acc, [key, value]) => {
        acc[key] = value || 'ignore';
        return acc;
      }, {} as Record<string, string>);

      setCustomMappings(initialMappings);
      setAvailableFields(availableFields);
    } catch (err) {
      console.error('Error detecting columns:', err);
      setError(err instanceof Error ? err.message : 'Failed to detect columns');
      toast.error(err instanceof Error ? err.message : 'Failed to detect columns');

      // Set some default values for testing if API fails
      setHeaders(['Column A', 'Column B', 'Column C']);
      setSuggestedMappings({
        'Column A': 'full_name',
        'Column B': 'contact_number',
        'Column C': 'email'
      });
      setCustomMappings({
        'Column A': 'full_name',
        'Column B': 'contact_number',
        'Column C': 'email'
      });
      setAvailableFields([
        'full_name', 'contact_number', 'email', 'gender', 'age',
        'transaction_id', 'purchase_datetime', 'total_amount_lkr'
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMappingChange = (header: string, value: string) => {
    setCustomMappings(prev => ({
      ...prev,
      [header]: value
    }));
  };

  const handleConfirm = () => {
    // Filter out empty/null/undefined mappings
    const finalMappings = Object.entries(customMappings)
      .filter(([_, value]) => value && value !== 'ignore')
      .reduce((acc, [key, value]) => {
        if (value && value !== 'ignore') {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, string>);

    onMappingsConfirmed(finalMappings);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <h3 className="text-lg font-medium mb-2">Analyzing File Columns</h3>
            <p className="text-sm text-center text-muted-foreground">
              Please wait while we analyze your file and suggest column mappings...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="flex justify-end mt-4">
            <Button onClick={onCancel}>Go Back</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Map Columns</CardTitle>
        <CardDescription>
          We've detected the columns from your file. Please confirm or adjust the mappings below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2 font-medium text-sm mb-2">
            <div>File Column</div>
            <div>Suggested Mapping</div>
            <div>Custom Mapping</div>
          </div>

          {headers.map(header => (
            <div key={header} className="grid grid-cols-3 gap-2 items-center">
              <div className="text-sm font-medium">{header}</div>
              <div>
                {suggestedMappings[header] ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {suggestedMappings[header]}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700">
                    No match
                  </Badge>
                )}
              </div>
              <Select
                value={customMappings[header] || 'ignore'}
                onValueChange={(value) => handleMappingChange(header, value === 'ignore' ? '' : value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select field or ignore" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ignore">Ignore this column</SelectItem>
                  {availableFields.map((field, index) => (
                    <SelectItem key={`${field}-${index}`} value={field}>{field}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleConfirm}>Confirm & Continue</Button>
      </CardFooter>
    </Card>
  );
}
