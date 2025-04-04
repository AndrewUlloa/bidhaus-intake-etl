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
import { ProductData, QualityIssue, validateProducts, checkImageForWatermark } from "@/lib/utils/validation";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

// Skeleton card component for loading state
function SkeletonIssueCard() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="space-y-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-6 w-full" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div>
            <Skeleton className="h-4 w-28 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <Skeleton className="h-32 w-full" />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 px-3 py-3 mt-auto">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </CardFooter>
    </Card>
  );
}

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
  const [issueTypeFilter, setIssueTypeFilter] = useState<string>("all");
  const [loadingImageCount, setLoadingImageCount] = useState(0);
  const [processedImageCount, setProcessedImageCount] = useState(0);
  const [totalImageCount, setTotalImageCount] = useState(0);
  const [currentProcessingUrl, setCurrentProcessingUrl] = useState<string | null>(null);

  // Calculate issue statistics
  const totalIssueCount = issues.reduce((count, issue) => count + issue.issueTypes.length, 0);

  // Count issues by type
  const watermarkCount = issues.reduce((count, issue) => 
    count + issue.issueTypes.filter(t => t.type === "watermark").length, 0
  );

  const vendorCount = issues.reduce((count, issue) => 
    count + issue.issueTypes.filter(t => t.type === "vendor_info").length, 0
  );

  const phoneCount = issues.reduce((count, issue) => 
    count + issue.issueTypes.filter(t => t.type === "phone_number").length, 0
  );

  const otherCount = issues.reduce((count, issue) => 
    count + issue.issueTypes.filter(t => t.type === "other").length, 0
  );

  // Filter issues based on selected type
  const filteredIssues = issues.filter(issue => {
    if (issueTypeFilter === "all") return true;
    return issue.issueTypes.some(t => t.type === issueTypeFilter);
  });

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
    setIssues([]);
    
    const toastId = toast.loading("Analyzing product data...");
    
    // Count how many products have images to check
    const productsWithImages = dataToAnalyze.filter(
      product => settings.enableImageScanning && product.imageUrl && product.imageUrl.trim() !== ''
    ).length;
    
    setTotalImageCount(productsWithImages);
    setProcessedImageCount(0);
    
    // Set initial skeletons if we have images to process
    if (productsWithImages > 0) {
      setLoadingImageCount(Math.min(productsWithImages, 8));
    }
    
    // Use async function to validate products with streaming updates
    (async () => {
      try {
        // Handle streaming updates for each issue found
        const handleIssueFound = (issue: QualityIssue) => {
          setIssues(prev => {
            // Check if this product already has an issue
            const existingIssue = prev.find(i => i.id === issue.id);
            if (existingIssue) {
              // Update existing issue
              return prev.map(i => 
                i.id === issue.id 
                  ? issue // Replace with the updated issue that has all issue types
                  : i
              );
            } else {
              // Add new issue
              return [...prev, issue];
            }
          });
          
          // Check if any of the issue types is a watermark
          const hasWatermarkIssue = issue.issueTypes.some(t => t.type === "watermark");
          if (hasWatermarkIssue) {
            toast.warning(`Watermark detected in ${issue.productName}`, {
              duration: 3000,
            });
          }
        };
        
        // Validate the text-based issues first
        await validateProducts(dataToAnalyze, {
          vendorRegex: settings.vendorRegex,
          phoneRegex: settings.phoneRegex,
          customRegexPatterns: settings.customRegexPatterns,
          enableImageScanning: false // Don't process images yet
        }, handleIssueFound);
        
        // Now handle images separately to update progress for each
        if (settings.enableImageScanning && productsWithImages > 0) {
          const productsWithImagesList = dataToAnalyze.filter(
            product => product.imageUrl && product.imageUrl.trim() !== ''
          );
          
          // Process each image one by one with progress updates
          for (let i = 0; i < productsWithImagesList.length; i++) {
            const product = productsWithImagesList[i];
            const currentImageNum = i + 1;
            
            // Set current processing URL if defined
            if (product.imageUrl) {
              setCurrentProcessingUrl(product.imageUrl);
            }
            
            // Update toast for each processing step
            toast.loading(`Processing ${currentImageNum}/${productsWithImages} image URLs`, { id: toastId });
            
            try {
              const watermarkIssue = await checkImageForWatermark(product.imageUrl!, product.name, product.id);
              
              // Always update the processed count
              setProcessedImageCount(prev => {
                const newCount = prev + 1;
                
                // Reduce loading skeletons as we process images
                if (newCount >= totalImageCount - loadingImageCount) {
                  setLoadingImageCount(count => Math.max(0, count - 1));
                }
                
                return newCount;
              });
              
              // If we found a watermark, add the issue
              if (watermarkIssue) {
                // Check if we already have an issue for this product
                setIssues(prev => {
                  const existingIssue = prev.find(i => i.id === product.id);
                  if (existingIssue) {
                    // Add watermark issue to existing product's issues
                    return prev.map(i => 
                      i.id === product.id 
                        ? { 
                            ...i, 
                            issueTypes: [...i.issueTypes, watermarkIssue]
                          } 
                        : i
                    );
                  } else {
                    // Create new issue with just this watermark issue type
                    return [...prev, {
                      id: product.id,
                      productId: product.id,
                      productName: product.name,
                      issueTypes: [watermarkIssue],
                      imageUrl: product.imageUrl,
                      resolved: false
                    }];
                  }
                });
                
                toast.warning(`Watermark detected in ${product.name}`, {
                  duration: 3000,
                });
              } else {
                toast.success(`No watermark in ${product.name}`, { 
                  duration: 2000
                });
              }
            } catch (error) {
              console.error(`Error checking image for ${product.name}:`, error);
              // Still update the processed count even on error
              setProcessedImageCount(prev => {
                const newCount = prev + 1;
                
                // Reduce loading skeletons as we process images
                if (newCount >= totalImageCount - loadingImageCount) {
                  setLoadingImageCount(count => Math.max(0, count - 1));
                }
                
                return newCount;
              });
            } finally {
              // At the end of the function in the finally block:
              setCurrentProcessingUrl(null);
            }
          }
        }
        
        // Successfully processed all items
        if (totalIssueCount > 0) {
          toast.warning(`Found ${totalIssueCount} quality issues`, { id: toastId });
          
          // Show detailed toast with the correct counts
          toast.info(
            `Issues breakdown: ${watermarkCount} watermarks, ${vendorCount} vendor info, ${phoneCount} phone numbers, ${otherCount} other issues`
          );
        } else {
          toast.success("No quality issues found", { id: toastId });
        }
        
        // Switch to the review tab
        setActiveTab("review");
      } catch (error) {
        toast.error(`Error analyzing data: ${error instanceof Error ? error.message : 'Unknown error'}`, { id: toastId });
      } finally {
        setIsAnalyzing(false);
        setLoadingImageCount(0);
      }
    })();
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

  // Group images by product ID
  const getProductImages = (productId: string) => {
    return products
      .filter(product => product.id === productId && product.imageUrl && product.imageUrl.trim() !== '')
      .map(product => product.imageUrl as string);
  };

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6">
      {/* Desktop header (hidden on small screens) */}
      <header className="hidden sm:flex sm:items-center sm:justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold">BidHaus Quality Manager</h1>
          <p className="text-muted-foreground">
            Detect and manage product listing quality issues
          </p>
        </div>
      </header>
      
      {/* Mobile header (visible only on small screens) */}
      <header className="flex flex-col items-center sm:hidden gap-4 mb-6">
        <div>
          <h1 className="text-2xl text-center font-bold">BidHaus Quality Manager</h1>
          <p className="text-muted-foreground text-center">
            Detect and manage product listing quality issues
          </p>
        </div>
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
            Review Issues {totalIssueCount > 0 && `(${totalIssueCount})`}
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
            Review Issues {totalIssueCount > 0 && `(${totalIssueCount})`}
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
        
        <div>
          <TabsContent value="upload" className="h-full">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Upload Product Data</CardTitle>
                <CardDescription>
                  Upload your CSV file containing product listings to check for quality issues
                </CardDescription>
              </CardHeader>
              <CardContent>
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
              <CardContent className="flex-1 overflow-auto">
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
                  <div className="w-full min-h-[500px]">
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
                                  {vendorCount}
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
                                  {phoneCount}
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
                                  {watermarkCount}
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
                          <span className="font-semibold">{vendorCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4 text-primary" />
                          <span className="font-semibold">{phoneCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ImageIcon className="h-4 w-4 text-primary" />
                          <span className="font-semibold">{watermarkCount}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{totalIssueCount} Total</Badge>
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
                    <div className="flex-1 overflow-y-auto overflow-x-hidden w-full">
                      {/* Issue Type Filter - applied to both views */}
                      <div className="sticky top-0 z-10 bg-background border-b mb-4 p-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Filter by issue type:</span>
                          <Select value={issueTypeFilter} onValueChange={setIssueTypeFilter}>
                            <SelectTrigger className="w-[180px] h-8">
                              <SelectValue placeholder="All Issues" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Issues</SelectItem>
                              <SelectItem value="vendor_info">Vendor Information</SelectItem>
                              <SelectItem value="phone_number">Phone Number</SelectItem>
                              <SelectItem value="watermark">Watermark</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {viewMode === "card" ? (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                          {filteredIssues.length === 0 && loadingImageCount === 0 ? (
                            <div className="text-center p-4 text-muted-foreground col-span-full">
                              No issues found with the selected filter.
                            </div>
                          ) : (
                            <>
                              {/* Real issues */}
                              {filteredIssues.map(issue => {
                                // Get images specific to this product only
                                const productImages = getProductImages(issue.productId);
                                
                                return (
                                  <QualityIssueCard
                                    key={issue.id}
                                    {...issue}
                                    onMarkResolved={handleMarkResolved}
                                    onIgnore={handleIgnore}
                                    productImages={productImages}
                                  />
                                );
                              })}
                              
                              {/* Skeleton cards for loading state */}
                              {Array.from({ length: loadingImageCount }).map((_, index) => (
                                <SkeletonIssueCard key={`skeleton-${index}`} />
                              ))}
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="h-full max-h-[calc(100vh-240px)]">
                          <QualityIssueList 
                            issues={filteredIssues}
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

      {/* Add progress indicator when analyzing with images */}
      {isAnalyzing && totalImageCount > 0 && (
        <div className="mt-4 p-4 border rounded-md">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Processing images</span>
            <span className="text-sm text-muted-foreground">
              {processedImageCount} of {totalImageCount}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${(processedImageCount / totalImageCount) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
