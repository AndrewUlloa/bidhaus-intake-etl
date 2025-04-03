"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Info, Upload, FileCheck, Settings, AlertCircle, MessageSquare, Phone, Image as ImageIcon, RefreshCw } from "lucide-react";
import { CsvUploader } from "@/components/CsvUploader";
import { QualityIssueCard } from "@/components/QualityIssueCard";
import { QualityIssueList } from "@/components/QualityIssueList";
import { ViewToggle, ViewMode } from "@/components/ViewToggle";
import { DetectionSettingsForm } from "@/components/DetectionSettingsForm";
import { toast } from "sonner";
import { ProductData, QualityIssue, validateProducts } from "@/lib/utils/validation";
import { motion } from "framer-motion";

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
  phoneRegex: "(\\+\\d{1,3}[\\s-]?)?(\\(\\d{3}\\)\\s?\\d{3}-\\d{4})",
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
  const [viewMode, setViewMode] = useState<ViewMode>("card");

  const handleFileUploaded = (file: File, data: ProductData[]) => {
    // Store the parsed products
    setProducts(data);
    setFileUploaded(true);
    toast.success(`CSV file processed: ${data.length} products loaded`);
    
    // Run validation with current settings
    handleAnalyzeData(data);
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

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6">
      {/* Desktop header (hidden on small screens) */}
      <header className="hidden sm:flex sm:items-center sm:justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold">BidHaus Quality Manager</h1>
          <p className="text-muted-foreground">Detect and manage product listing quality issues</p>
        </div>
        <Button variant="outline" onClick={() => setActiveTab("settings")}>Settings</Button>
      </header>
      
      {/* Mobile header (visible only on small screens) */}
      <header className="flex flex-col sm:hidden gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">BidHaus Quality Manager</h1>
          <p className="text-muted-foreground">Detect and manage product listing quality issues</p>
        </div>
        <Button variant="outline" onClick={() => setActiveTab("settings")}>Settings</Button>
      </header>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Desktop tab list (hidden on small screens) */}
        <TabsList className="hidden sm:grid w-full grid-cols-3 mb-8">
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
        
        {/* Mobile tab list (visible only on small screens) */}
        <div className="flex sm:hidden gap-2 mb-6 overflow-x-auto overflow-y-hidden">
          <Button 
            variant={activeTab === "upload" ? "default" : "outline"} 
            className="flex items-center gap-1 flex-1"
            onClick={() => setActiveTab("upload")}
          >
            <Upload className="h-4 w-4" />
            Upload CSV
          </Button>
          <Button 
            variant={activeTab === "review" ? "default" : "outline"} 
            className="flex items-center gap-1 flex-1"
            onClick={() => setActiveTab("review")}
          >
            <FileCheck className="h-4 w-4" />
            Review Issues {issues.length > 0 && `(${issues.length})`}
          </Button>
          <Button 
            variant={activeTab === "settings" ? "default" : "outline"} 
            className="flex items-center gap-1 flex-1"
            onClick={() => setActiveTab("settings")}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>
        
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
                    <p className="text-sm text-muted-foreground text-center">
                      Supported format: CSV with headers
                    </p>
                    
                    <Alert className="bg-muted/50 mt-6">
                      <Info className="h-4 w-4" />
                      <AlertTitle>Detection Information</AlertTitle>
                      <AlertDescription>
                        We&apos;ll scan for vendor names, phone numbers, and potential watermarks in images
                      </AlertDescription>
                    </Alert>
                    
                    {fileUploaded && (
                      <div className="mt-6">
                        <Button 
                          className="w-full" 
                          size="default"
                          onClick={() => handleAnalyzeData()}
                          disabled={isAnalyzing}
                        >
                          {isAnalyzing ? (
                            <span className="flex items-center gap-1.5">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="inline-block"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </motion.div>
                              Analyzing...
                            </span>
                          ) : "Analyze for Issues"}
                        </Button>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="review" className="h-full">
            <Card className="h-full flex flex-col">
              <CardHeader className="flex flex-row justify-between items-start">
                <div>
                  <CardTitle>Review Flagged Issues</CardTitle>
                  <CardDescription>
                    Review and address quality issues detected in your product listings
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  {issues.length > 0 && (
                    <>
                      <ViewToggle value={viewMode} onChange={setViewMode} />
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleAnalyzeData()}
                        disabled={isAnalyzing}
                        className="hidden md:inline-flex"
                      >
                        {isAnalyzing ? (
                          <span className="flex items-center gap-1.5">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="inline-block"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </motion.div>
                            Re-analyzing...
                          </span>
                        ) : "Re-analyze Data"}
                      </Button>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col h-[500px] pb-0">
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
                  <div className="flex flex-col h-full">
                    {/* Desktop Stats Cards - Only visible on desktop */}
                    <div className="hidden md:block sticky top-0 bg-background z-10 pb-4">
                      <div className="grid grid-cols-3 gap-4 mb-2">
                        {/* Vendor Information */}
                        <Card className="bg-muted/30">
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className="bg-background p-3 rounded-full">
                              <MessageSquare className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold">Vendor Information</h3>
                              <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold">
                                  {issues.filter(issue => issue.issueType === "vendor_info").length}
                                </span>
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
                                <span className="text-2xl font-bold">
                                  {issues.filter(issue => issue.issueType === "phone_number").length}
                                </span>
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
                                <span className="text-2xl font-bold">
                                  {issues.filter(issue => issue.issueType === "watermark").length}
                                </span>
                                <span className="text-muted-foreground text-sm">issues found</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    {/* Mobile Stats - Minimal compact version that takes less vertical space */}
                    <div className="md:hidden flex justify-between items-center bg-background sticky top-0 z-10 pb-2 mb-2 text-sm border-b">
                      <div className="flex gap-3">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4 text-primary" />
                          <span className="font-semibold">{issues.filter(issue => issue.issueType === "vendor_info").length}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4 text-primary" />
                          <span className="font-semibold">{issues.filter(issue => issue.issueType === "phone_number").length}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ImageIcon className="h-4 w-4 text-primary" />
                          <span className="font-semibold">{issues.filter(issue => issue.issueType === "watermark").length}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{issues.length} Total</Badge>
                        {issues.length > 0 && (
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8"
                            onClick={() => handleAnalyzeData()}
                            disabled={isAnalyzing}
                          >
                            <motion.div
                              animate={isAnalyzing ? { rotate: 360 } : { rotate: 0 }}
                              transition={isAnalyzing ? { duration: 1, repeat: Infinity, ease: "linear" } : { duration: 0 }}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </motion.div>
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Scrollable Issues Area */}
                    <div className="flex-1 overflow-y-auto overflow-x-hidden">
                      {viewMode === "card" ? (
                        <div className="space-y-4 pr-4">
                          {issues.map(issue => (
                            <QualityIssueCard
                              key={issue.id}
                              {...issue}
                              onMarkResolved={handleMarkResolved}
                              onIgnore={handleIgnore}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="h-full max-h-[calc(100vh-240px)]">
                          <QualityIssueList 
                            issues={issues}
                            onMarkResolved={handleMarkResolved}
                            onIgnore={handleIgnore}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
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
