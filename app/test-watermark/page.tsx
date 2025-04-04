"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { WatermarkTester } from "@/components/WatermarkTester";
import { toast } from "sonner";
import { QualityIssue } from "@/lib/utils/validation";
import { QualityIssueCard } from "@/components/QualityIssueCard";
import { Skeleton } from "@/components/ui/skeleton";

// Skeleton card component for loading state
function SkeletonCard() {
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

export default function TestWatermarkPage() {
  const [csvData, setCsvData] = useState("");
  const [issues, setIssues] = useState<QualityIssue[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingCount, setLoadingCount] = useState(0);
  const [totalImages, setTotalImages] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [currentProcessingUrl, setCurrentProcessingUrl] = useState<string | null>(null);

  const handleWatermarkDetected = (hasWatermark: boolean) => {
    if (hasWatermark) {
      toast.warning("Watermark detected");
    } else {
      toast.success("No watermark detected");
    }
  };

  const parseCSVImageUrls = (csv: string): string[] => {
    const lines = csv.split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const imageUrlIndex = headers.findIndex(
      h => h.includes('image') || h.includes('img') || h.includes('photo') || h.includes('url')
    );
    
    if (imageUrlIndex === -1) return [];
    
    return lines.slice(1)
      .filter(line => line.trim() !== '')
      .map(line => {
        const values = line.split(',').map(v => v.trim());
        return values[imageUrlIndex] || '';
      })
      .filter(url => url !== '');
  };

  const processCSV = async () => {
    if (!csvData.trim()) {
      toast.error("Please enter CSV data");
      return;
    }

    setIsProcessing(true);
    setIssues([]);
    setProcessedCount(0);
    const toastId = toast.loading("Processing CSV data...");
    
    try {
      const imageUrls = parseCSVImageUrls(csvData);
      
      if (imageUrls.length === 0) {
        toast.error("No image URLs found in CSV", { id: toastId });
        setIsProcessing(false);
        return;
      }
      
      toast.loading(`Found ${imageUrls.length} image URLs to check`, { id: toastId });
      setTotalImages(imageUrls.length);
      // Set initial loading skeletons
      setLoadingCount(Math.min(imageUrls.length, 6));
      
      // Process images one by one
      for (let i = 0; i < imageUrls.length; i++) {
        const url = imageUrls[i];
        const currentImage = i + 1;
        
        // Update the toast for each image being processed and set current URL
        setCurrentProcessingUrl(url);
        toast.loading(`Processing ${currentImage}/${imageUrls.length} image URLs`, { id: toastId });
        
        try {
          const response = await fetch('/api/check-watermark', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              imageUrl: url,
              productName: `Product ${currentImage}`,
              productId: `product-${currentImage}`
            }),
          });
          
          if (!response.ok) {
            console.error(`Failed to check image ${url}`);
            // Update processed count even for failed requests
            setProcessedCount(prev => {
              const newCount = prev + 1;
              
              // Update loading skeletons - reduce by 1 if we're near the end
              if (imageUrls.length - currentImage < loadingCount) {
                setLoadingCount(count => Math.max(0, count - 1));
              }
              
              return newCount;
            });
            continue;
          }
          
          const data = await response.json();
          setProcessedCount(prev => {
            const newCount = prev + 1;
            
            // Update loading skeletons - reduce by 1 if we're near the end
            if (imageUrls.length - currentImage < loadingCount) {
              setLoadingCount(count => Math.max(0, count - 1));
            }
            
            return newCount;
          });
          
          if (data.hasWatermark && data.issueType) {
            // Create a new quality issue with the watermark issue type
            const newIssue = {
              id: data.productId,
              productId: data.productId,
              productName: data.productName,
              issueTypes: [data.issueType],
              imageUrl: url,
              resolved: false
            };
            
            // Add new issue to the list with animation effect
            setIssues(prev => [...prev, newIssue]);
            
            // Show separate toast for detected watermark
            toast.warning(`Watermark detected in image ${currentImage}`, { 
              duration: 3000,
              description: "Added to results"
            });
          } else {
            // Show separate toast for no watermark
            toast.success(`No watermark in image ${currentImage}`, { 
              duration: 3000
            });
          }
        } catch (error) {
          console.error(`Error checking image ${url}:`, error);
          // Update processed count even for errors
          setProcessedCount(prev => {
            const newCount = prev + 1;
            
            // Update loading skeletons - reduce by 1 if near the end
            if (imageUrls.length - currentImage < loadingCount) {
              setLoadingCount(count => Math.max(0, count - 1));
            }
            
            return newCount;
          });
        }
      }
      
      // Final results toast
      if (issues.length > 0) {
        toast.warning(`Found ${issues.length} images with watermarks`, { id: toastId });
      } else {
        toast.success("No watermarks detected in any images", { id: toastId });
      }
      
    } catch (error) {
      console.error('Error processing CSV:', error);
      toast.error("Failed to process CSV data", { id: toastId });
    } finally {
      setIsProcessing(false);
      setLoadingCount(0);
      setCurrentProcessingUrl(null);
    }
  };

  const handleMarkResolved = (id: string) => {
    setIssues(prev => prev.map(issue => 
      issue.id === id ? { ...issue, resolved: !issue.resolved } : issue
    ));
  };

  const handleIgnore = (id: string) => {
    setIssues(prev => prev.filter(issue => issue.id !== id));
  };

  // Group images by product ID for the test watermark page
  const getProductImages = (productId: string) => {
    // In this case, we only have one image per product/issue
    const issue = issues.find(i => i.id === productId);
    return issue?.imageUrl ? [issue.imageUrl] : [];
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-4">Watermark Detection Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <WatermarkTester onWatermarkDetected={handleWatermarkDetected} />
        
        <Card>
          <CardHeader>
            <CardTitle>Batch CSV Processing</CardTitle>
            <CardDescription>
              Process multiple image URLs from a CSV file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="csv-data">CSV Data</Label>
                <Textarea
                  id="csv-data"
                  placeholder="name,description,image_url"
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  rows={6}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Include a header row with an &quot;image_url&quot; column (or similar name)
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button 
              onClick={processCSV} 
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? "Processing..." : "Process CSV"}
            </Button>
            {isProcessing && totalImages > 0 && (
              <div className="w-full bg-muted rounded-full h-2.5 mt-2">
                <div 
                  className="bg-primary h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${(processedCount / totalImages) * 100}%` }}
                ></div>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  {processedCount} of {totalImages} images processed
                </p>
              </div>
            )}
            {isProcessing && currentProcessingUrl && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground">
                  Currently checking: <span className="font-mono truncate inline-block max-w-[300px]">{currentProcessingUrl}</span>
                </p>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
      
      {(issues.length > 0 || loadingCount > 0) && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">
            {issues.length > 0 
              ? `Detected Watermarks (${issues.length})` 
              : "Processing Images..."}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Real issues */}
            {issues.map(issue => (
              <QualityIssueCard
                key={issue.id}
                id={issue.id}
                productName={issue.productName}
                issueTypes={issue.issueTypes}
                imageUrl={issue.imageUrl}
                resolved={issue.resolved}
                onMarkResolved={handleMarkResolved}
                onIgnore={handleIgnore}
                productImages={getProductImages(issue.id)}
              />
            ))}
            
            {/* Skeleton loading cards */}
            {Array.from({ length: loadingCount }).map((_, index) => (
              <SkeletonCard key={`skeleton-${index}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 