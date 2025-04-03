"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Info, Upload, FileCheck, Settings, AlertCircle, FileText, MessageSquare, Phone, Image as ImageIcon } from "lucide-react";
import { CsvUploader } from "@/components/CsvUploader";
import { QualityIssueCard } from "@/components/QualityIssueCard";
import { DetectionSettingsForm } from "@/components/DetectionSettingsForm";
import { toast } from "sonner";
import { ProductData, QualityIssue, validateProducts, parseCSV } from "@/lib/utils/validation";

// Import the DetectionSettings type
interface DetectionSettings {
  vendorRegex: string;
  phoneRegex: string;
  watermarkThreshold: number;
  enableImageScanning: boolean;
  customRegexPatterns: string;
}

// Default detection settings
const defaultSettings: DetectionSettings = {
  vendorRegex: "\\b(company|vendor|store|consignor|seller)\\b",
  phoneRegex: "\\b\\d{3}[-.]?\\d{3}[-.]?\\d{4}\\b",
  watermarkThreshold: 50,
  enableImageScanning: true,
  customRegexPatterns: ""
};

export default function Home() {
  const [activeTab, setActiveTab] = useState("upload");
  const [issues, setIssues] = useState<QualityIssue[]>([]);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [settings, setSettings] = useState<DetectionSettings>(defaultSettings);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingSample, setIsLoadingSample] = useState(false);

  const handleFileUploaded = (file: File, data: ProductData[]) => {
    // Store the parsed products
    setProducts(data);
    setFileUploaded(true);
    toast.success(`CSV file processed: ${data.length} products loaded`);
    
    // Run validation with current settings
    handleAnalyzeData(data);
  };

  const handleLoadSampleData = async () => {
    setIsLoadingSample(true);
    try {
      const response = await fetch('/sample-data.csv');
      if (!response.ok) {
        throw new Error('Failed to load sample data');
      }
      
      const csvText = await response.text();
      const data = parseCSV(csvText);
      
      setProducts(data);
      setFileUploaded(true);
      toast.success(`Sample data loaded: ${data.length} products`);
      
      // Run validation
      handleAnalyzeData(data);
    } catch (error) {
      toast.error(`Error loading sample data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoadingSample(false);
    }
  };

  const handleAnalyzeData = (dataToAnalyze: ProductData[] = products) => {
    if (dataToAnalyze.length === 0) {
      toast.error("No data to analyze");
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate processing delay for larger files
    setTimeout(() => {
      try {
        // Validate the products using current settings
        const detectedIssues = validateProducts(dataToAnalyze, {
          vendorRegex: settings.vendorRegex,
          phoneRegex: settings.phoneRegex,
          customRegexPatterns: settings.customRegexPatterns
        });
        
        setIssues(detectedIssues);
        
        if (detectedIssues.length > 0) {
          toast.warning(`Found ${detectedIssues.length} quality issues`);
        } else {
          toast.success("No quality issues found");
        }
        
        // Switch to the review tab
        setActiveTab("review");
      } catch (error) {
        toast.error(`Error analyzing data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsAnalyzing(false);
      }
    }, 1000);
  };

  const handleMarkResolved = (id: string) => {
    setIssues(currentIssues => 
      currentIssues.map(issue => 
        issue.id === id ? { ...issue, resolved: !issue.resolved } : issue
      )
    );
    toast.success("Issue status updated");
  };

  const handleIgnore = (id: string) => {
    setIssues(currentIssues => 
      currentIssues.filter(issue => issue.id !== id)
    );
    toast.success("Issue ignored");
  };

  const handleSaveSettings = (newSettings: DetectionSettings) => {
    setSettings(newSettings);
    toast.success("Settings saved");
    
    // Re-analyze data with new settings if we have products loaded
    if (products.length > 0) {
      handleAnalyzeData(products);
    }
  };

  // Helper functions to count issues by type
  const countIssuesByType = (type: "vendor_info" | "phone_number" | "watermark") => {
    return issues.filter(issue => issue.issueType === type).length;
  };

  return (
    <div className="container mx-auto py-10">
      <header className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold">BidHaus Quality Manager</h1>
          <p className="text-muted-foreground">Detect and manage product listing quality issues</p>
        </div>
        <Button variant="outline" onClick={() => setActiveTab("settings")}>Settings</Button>
      </header>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload CSV
          </TabsTrigger>
          <TabsTrigger value="review" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            Review Issues {issues.length > 0 && `(${issues.length})`}
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Detection Settings
          </TabsTrigger>
        </TabsList>
        
        <div className="min-h-[700px]">
          <TabsContent value="upload" className="h-full">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Upload Product Data</CardTitle>
                <CardDescription>
                  Upload your CSV file containing product listings to check for quality issues
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[500px]">
                <ScrollArea className="h-full">
                  <div className="space-y-6 pr-4">
                    <CsvUploader onFileUploaded={handleFileUploaded} />
                    
                    <div className="flex items-center justify-center">
                      <div className="border-t w-full my-6"></div>
                      <span className="bg-background px-4 text-xs text-muted-foreground">OR</span>
                      <div className="border-t w-full my-6"></div>
                    </div>
                    
                    <div className="text-center">
                      <Button 
                        variant="outline" 
                        className="gap-2"
                        onClick={handleLoadSampleData}
                        disabled={isLoadingSample}
                      >
                        <FileText className="h-4 w-4" />
                        {isLoadingSample ? "Loading..." : "Load Sample Data"}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        Try with our pre-made sample data containing quality issues
                      </p>
                    </div>
                    
                    <Alert className="bg-muted/50 mt-6">
                      <Info className="h-4 w-4" />
                      <AlertTitle>Detection Information</AlertTitle>
                      <AlertDescription>
                        We&apos;ll scan for vendor names, phone numbers, and potential watermarks in images
                      </AlertDescription>
                    </Alert>
                    
                    {fileUploaded && (
                      <div className="bg-muted/30 p-4 rounded-md">
                        <h3 className="text-sm font-medium mb-2">CSV Data Preview</h3>
                        <p className="text-sm text-muted-foreground">
                          Loaded {products.length} products from CSV file.
                        </p>
                        {products.length > 0 && (
                          <Button 
                            className="mt-3" 
                            size="sm"
                            onClick={() => handleAnalyzeData()}
                            disabled={isAnalyzing}
                          >
                            {isAnalyzing ? "Analyzing..." : "Analyze for Issues"}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter className="flex justify-between">
                <p className="text-sm text-muted-foreground">
                  Supported format: CSV with headers
                </p>
                <Button 
                  disabled={!fileUploaded || isAnalyzing} 
                  onClick={() => setActiveTab("review")}
                >
                  View Results
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="review" className="h-full">
            <Card className="h-full">
              <CardHeader className="flex flex-row justify-between items-start">
                <div>
                  <CardTitle>Review Flagged Issues</CardTitle>
                  <CardDescription>
                    Review and address quality issues detected in your product listings
                  </CardDescription>
                </div>
                {issues.length > 0 && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleAnalyzeData()}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? "Re-analyzing..." : "Re-analyze Data"}
                  </Button>
                )}
              </CardHeader>
              <CardContent className="h-[500px]">
                {!fileUploaded ? (
                  <div className="h-full flex items-center justify-center">
                    <Alert className="max-w-md">
                      <Info className="h-4 w-4" />
                      <AlertTitle>No data uploaded</AlertTitle>
                      <AlertDescription>
                        Please upload a CSV file first to see quality issues
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : issues.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <Alert className="max-w-md">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>No issues found</AlertTitle>
                      <AlertDescription>
                        No quality issues were detected in your product listings
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <ScrollArea className="h-full">
                    <div className="space-y-6 pr-4">
                      {/* Bento Cards for Issue Counts */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {/* Vendor Information */}
                        <Card className="bg-muted/30">
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className="bg-background p-3 rounded-full">
                              <MessageSquare className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold">Vendor Information</h3>
                              <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold">{countIssuesByType("vendor_info")}</span>
                                <span className="text-muted-foreground text-sm">issues found</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        {/* Phone Number */}
                        <Card className="bg-muted/30">
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className="bg-background p-3 rounded-full">
                              <Phone className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold">Phone Numbers</h3>
                              <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold">{countIssuesByType("phone_number")}</span>
                                <span className="text-muted-foreground text-sm">issues found</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        {/* Watermark */}
                        <Card className="bg-muted/30">
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className="bg-background p-3 rounded-full">
                              <ImageIcon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold">Watermarks</h3>
                              <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold">{countIssuesByType("watermark")}</span>
                                <span className="text-muted-foreground text-sm">issues found</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      {/* Issue Cards */}
                      <div className="space-y-4">
                        {issues.map(issue => (
                          <QualityIssueCard
                            key={issue.id}
                            {...issue}
                            onMarkResolved={handleMarkResolved}
                            onIgnore={handleIgnore}
                          />
                        ))}
                      </div>
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex gap-2">
                  <Badge variant="outline">
                    {issues.length} Total Issues
                  </Badge>
                  <Badge variant="outline">
                    {issues.filter(i => i.resolved).length} Resolved
                  </Badge>
                </div>
                <Button disabled={issues.length === 0}>Export Report</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="h-full">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Detection Settings</CardTitle>
                <CardDescription>
                  Configure rules for detecting quality issues in product listings
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[500px]">
                <ScrollArea className="h-full">
                  <div className="pr-4">
                    <DetectionSettingsForm 
                      onSaveSettings={handleSaveSettings} 
                      initialSettings={settings}
                    />
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter className="flex justify-end">
                <p className="text-sm text-muted-foreground mr-auto">
                  Settings are automatically saved
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
