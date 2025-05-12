
import { useState } from "react";
import { UploadCloud, FileSpreadsheet, Database, ChevronRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { toast } from "sonner";
import { uploadAndValidateFile, FileUploadResponse } from "@/services/api";
import { ColumnMapper } from "@/components/data-import/ColumnMapper";

const DataImportPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mappingDone, setMappingDone] = useState(false);
  const [validationDone, setValidationDone] = useState(false);
  const [importSource, setImportSource] = useState("file");
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showColumnMapper, setShowColumnMapper] = useState(false);
  const [columnMappings, setColumnMappings] = useState<Record<string, string>>({});
  const [validationResults, setValidationResults] = useState<FileUploadResponse | null>(null);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      toast.success(`File "${files[0].name}" selected`);
      setMappingDone(false);
      setValidationDone(false);
      setColumnMappings({});
      setValidationResults(null);
      setShowColumnMapper(true);
    }
  };

  // Handle mapping completion
  const handleMappingsConfirmed = (mappings: Record<string, string>) => {
    setColumnMappings(mappings);
    setMappingDone(true);
    setShowColumnMapper(false);
    toast.success("Column mapping completed");
  };

  // Handle mapping cancellation
  const handleMappingCancel = () => {
    setShowColumnMapper(false);
    // Optionally reset the file selection if user cancels mapping
    // setSelectedFile(null);
  };

  // Handle validation
  const handleValidateClick = async () => {
    if (!selectedFile) {
      toast.error("No file selected");
      return;
    }

    setIsValidating(true);
    toast.info("Validating data...");

    try {
      // Pass the column mappings to the upload function
      const result = await uploadAndValidateFile(selectedFile, columnMappings);

      setValidationResults(result);
      setValidationDone(true);

      if (result.failed > 0) {
        toast.warning(`Validation completed with ${result.failed} errors`);
      } else {
        toast.success("Data validation successful");
      }
    } catch (error) {
      console.error("Validation error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to validate data");
    } finally {
      setIsValidating(false);
    }
  };

  // Handle import
  const handleImportClick = () => {
    // The actual import is already done during validation in the backend
    // We just need to inform the user that the process is complete
    setIsImporting(true);
    toast.info("Finalizing import...");

    // Small delay to show the user something is happening
    setTimeout(() => {
      setIsImporting(false);
      toast.success("Data successfully imported to MongoDB");

      // Reset the form for a new import
      setSelectedFile(null);
      setMappingDone(false);
      setValidationDone(false);
      setValidationResults(null);
    }, 1000);
  };

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Data Import</h1>
        <p className="text-muted-foreground">Import and process customer data from various sources.</p>
      </div>

      <Tabs defaultValue="file" value={importSource} onValueChange={setImportSource} className="space-y-4">
        <TabsList className="grid grid-cols-3 md:w-[400px]">
          <TabsTrigger value="file">File Upload</TabsTrigger>
          <TabsTrigger value="api">API/Website</TabsTrigger>
          <TabsTrigger value="pos">POS System</TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="space-y-4">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Steps</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1">
                    <div className={`flex items-center p-3 ${selectedFile ? 'bg-primary/10 text-primary' : ''}`}>
                      <div className="mr-2 h-6 w-6 flex items-center justify-center rounded-full bg-primary/20 text-primary">
                        1
                      </div>
                      <span>Select File</span>
                      {selectedFile && <CheckCircle2 className="h-4 w-4 ml-auto" />}
                    </div>
                    <div className={`flex items-center p-3 ${mappingDone ? 'bg-primary/10 text-primary' : ''}`}>
                      <div className="mr-2 h-6 w-6 flex items-center justify-center rounded-full bg-primary/20 text-primary">
                        2
                      </div>
                      <span>Map Columns</span>
                      {mappingDone && <CheckCircle2 className="h-4 w-4 ml-auto" />}
                    </div>
                    <div className={`flex items-center p-3 ${validationDone ? 'bg-primary/10 text-primary' : ''}`}>
                      <div className="mr-2 h-6 w-6 flex items-center justify-center rounded-full bg-primary/20 text-primary">
                        3
                      </div>
                      <span>Validate Data</span>
                      {validationDone && <CheckCircle2 className="h-4 w-4 ml-auto" />}
                    </div>
                    <div className="flex items-center p-3">
                      <div className="mr-2 h-6 w-6 flex items-center justify-center rounded-full bg-primary/20 text-primary">
                        4
                      </div>
                      <span>Import</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">File Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>Supported formats: CSV, XLSX</p>
                  <p>Maximum size: 10MB</p>
                  <p>Required columns: Name, Email, Phone</p>
                  <p>First row should be column headers</p>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-3 space-y-4">
              {!selectedFile ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                      <UploadCloud className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium mb-2">Upload Customer Data</h3>
                      <p className="text-sm text-center text-muted-foreground mb-4">
                        Drag and drop your CSV or Excel file here, or click to browse
                      </p>
                      <div className="relative">
                        <Button variant="default" className="relative">
                          <FileSpreadsheet className="mr-2 h-4 w-4" />
                          <span>Select File</span>
                          <input
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            accept=".csv,.xlsx,.xls,.json"
                            onChange={handleFileChange}
                          />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : showColumnMapper ? (
                <ColumnMapper
                  file={selectedFile}
                  onMappingsConfirmed={handleMappingsConfirmed}
                  onCancel={handleMappingCancel}
                />
              ) : (
                <>
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle>File Selected</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={() => {
                            setSelectedFile(null);
                            setMappingDone(false);
                            setValidationDone(false);
                          }}
                        >
                          Change File
                        </Button>
                      </div>
                      <CardDescription className="flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedFile.name}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Alert className="border-green-200 bg-green-50 text-green-800">
                          <CheckCircle2 className="h-4 w-4" />
                          <AlertTitle>Column Mapping Complete</AlertTitle>
                          <AlertDescription>
                            You've successfully mapped {Object.keys(columnMappings).length} columns from your file.
                          </AlertDescription>
                        </Alert>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="rounded-md border p-3 bg-gray-50">
                            <div className="text-sm font-medium mb-1">Mapped Columns</div>
                            <div className="text-2xl font-bold text-green-600">{Object.keys(columnMappings).length}</div>
                          </div>

                          <div className="rounded-md border p-3 bg-gray-50">
                            <div className="text-sm font-medium mb-1">Required Fields</div>
                            <div className="text-sm">
                              {columnMappings['contact_number'] ? (
                                <span className="text-green-600 flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3" /> Phone/Contact
                                </span>
                              ) : (
                                <span className="text-amber-600">Phone/Contact (Required)</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end mt-4">
                          <Button
                            variant="outline"
                            className="mr-2"
                            onClick={() => setShowColumnMapper(true)}
                          >
                            Edit Mappings
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {mappingDone && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Data Validation</CardTitle>
                        <CardDescription>
                          Validate data before importing to ensure quality
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {!validationDone ? (
                          <>
                            <Alert className="border-amber-200 bg-amber-50 text-amber-800">
                              <AlertCircle className="h-4 w-4" />
                              <AlertTitle>Validation Required</AlertTitle>
                              <AlertDescription>
                                Please validate your data before importing.
                              </AlertDescription>
                            </Alert>

                            <div className="flex justify-end mt-4">
                              <Button onClick={handleValidateClick} disabled={isValidating}>
                                {isValidating ? "Validating..." : "Validate Data"}
                              </Button>
                            </div>
                          </>
                        ) : (
                          <>
                            <Alert className="border-green-200 bg-green-50 text-green-800">
                              <CheckCircle2 className="h-4 w-4" />
                              <AlertTitle>Validation Successful</AlertTitle>
                              <AlertDescription>
                                Your data is valid and ready to be imported.
                              </AlertDescription>
                            </Alert>

                            <div className="grid grid-cols-2 gap-4 mt-4">
                              <div className="rounded-md border p-3 bg-gray-50">
                                <div className="text-sm font-medium mb-1">Valid Records</div>
                                <div className="text-2xl font-bold text-green-600">{validationResults?.processed || 0}</div>
                              </div>

                              <div className="rounded-md border p-3 bg-gray-50">
                                <div className="text-sm font-medium mb-1">Error Records</div>
                                <div className="text-2xl font-bold text-amber-600">{validationResults?.failed || 0}</div>
                              </div>
                            </div>

                            {validationResults?.errors && validationResults.errors.length > 0 && (
                              <div className="mt-4 border rounded-md p-3 bg-gray-50 max-h-40 overflow-y-auto">
                                <div className="text-sm font-medium mb-2">Validation Errors:</div>
                                <ul className="text-xs text-red-600 space-y-1">
                                  {validationResults.errors.slice(0, 10).map((error, index) => (
                                    <li key={index}>{error}</li>
                                  ))}
                                  {validationResults.errors.length > 10 && (
                                    <li>...and {validationResults.errors.length - 10} more errors</li>
                                  )}
                                </ul>
                              </div>
                            )}

                            <div className="flex justify-end mt-4">
                              <Button onClick={handleImportClick} disabled={isImporting}>
                                {isImporting ? "Importing..." : "Import Data"}
                              </Button>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API/Website Integration</CardTitle>
              <CardDescription>
                Connect to your website or third-party services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                <Database className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Connect Data Source</h3>
                <p className="text-sm text-center text-muted-foreground mb-4">
                  This feature will be available in the next version
                </p>
                <Button variant="outline" disabled>
                  Configure Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>POS Integration</CardTitle>
              <CardDescription>
                Connect directly to your Point of Sale system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                <Database className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Connect POS System</h3>
                <p className="text-sm text-center text-muted-foreground mb-4">
                  This feature will be available in the next version
                </p>
                <Button variant="outline" disabled>
                  Configure POS Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataImportPage;
