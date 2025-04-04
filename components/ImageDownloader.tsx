import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Download, Image as ImageIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface ImageData {
  id: number;
  sku: string;
  original_url: string;
  filename: string;
  path: string;
  row: number;
}

interface ImageSummary {
  total_images: number;
  images: ImageData[];
  watermarkIssues?: QualityIssue[];
}

interface QualityIssue {
  id: string;
  productId: string;
  productName: string;
  issueType: "vendor_info" | "phone_number" | "watermark" | "other";
  description: string;
  details?: string;
  imageUrl?: string;
  resolved: boolean;
}

interface ImageDownloaderProps {
  csvFile: File | null;
  onImagesDownloaded?: (imagePaths: string[], imageSummary: ImageSummary | null) => void;
  onWatermarkIssuesDetected?: (issues: QualityIssue[]) => void;
}

export function ImageDownloader({ 
  csvFile, 
  onImagesDownloaded,
  onWatermarkIssuesDetected 
}: ImageDownloaderProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [imageSummary, setImageSummary] = useState<ImageSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [watermarkCount, setWatermarkCount] = useState(0);

  const handleDownloadImages = async () => {
    if (!csvFile) {
      toast.error("No CSV file selected");
      return;
    }

    setIsDownloading(true);
    setProgress(10);
    setError(null);
    setWatermarkCount(0);

    // Create a toast ID for updating the toast as processing occurs
    const toastId = toast.loading("Starting image processing...");

    try {
      // Create FormData with the CSV file
      const formData = new FormData();
      formData.append('file', csvFile);

      // Parsing CSV
      setProgress(20);
      toast.loading("Parsing CSV data...", { id: toastId });

      // Call our API endpoint
      setProgress(30);
      toast.loading("Downloading images from URLs...", { id: toastId });
      
      const response = await fetch('/api/upload-csv', {
        method: 'POST',
        body: formData,
      });

      setProgress(60);
      toast.loading("Analyzing images for watermarks...", { id: toastId });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to download images');
      }

      setProgress(90);
      toast.loading("Processing results...", { id: toastId });

      const result = await response.json();
      setProgress(100);

      // Extract image paths and summary from result
      const imagePaths = result.imageDirectory 
        ? [`${result.imageDirectory}`] 
        : [];
      
      // Store image summary if available
      if (result.summary) {
        setImageSummary(result.summary);
      }

      // Handle watermark issues if any were detected
      if (result.watermarkIssues && result.watermarkIssues.length > 0) {
        setWatermarkCount(result.watermarkIssues.length);
        
        if (onWatermarkIssuesDetected) {
          onWatermarkIssuesDetected(result.watermarkIssues);
        }
        
        toast.warning(`Detected ${result.watermarkIssues.length} images with potential watermarks`, {
          description: "Check the quality issues list to review them",
          duration: 5000
        });
      }
      
      if (onImagesDownloaded) {
        onImagesDownloaded(imagePaths, result.summary || null);
      }
      
      // Update the initial toast to complete
      toast.success("Process completed", { 
        id: toastId, 
        description: `Downloaded ${result.summary?.total_images || 0} images successfully` 
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast.error("Failed to download images", { 
        id: toastId,
        description: err instanceof Error ? err.message : 'An unknown error occurred'
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Image Downloader
        </CardTitle>
        <CardDescription>
          Download product images from the CSV for quality analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        {csvFile ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Selected file:</span>
              <span className="font-medium">{csvFile.name}</span>
            </div>
            
            {isDownloading && (
              <div className="my-4 space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Downloading images: {progress}%
                </p>
              </div>
            )}
            
            {imageSummary && (
              <div className="bg-muted/30 p-4 rounded-md">
                <h3 className="text-sm font-medium mb-2">Download Complete</h3>
                <p className="text-sm text-muted-foreground">
                  Downloaded {imageSummary.total_images} images
                </p>
                {watermarkCount > 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    ⚠️ Detected {watermarkCount} images with potential watermarks
                  </p>
                )}
                {imageSummary.total_images > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Images are available for quality review
                  </p>
                )}
              </div>
            )}
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Please select a CSV file first
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleDownloadImages} 
          disabled={!csvFile || isDownloading}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          {isDownloading ? "Downloading..." : "Download Images"}
        </Button>
      </CardFooter>
    </Card>
  );
} 