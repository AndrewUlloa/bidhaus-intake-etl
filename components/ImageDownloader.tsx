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
}

interface ImageDownloaderProps {
  csvFile: File | null;
  onImagesDownloaded?: (imagePaths: string[], imageSummary: ImageSummary | null) => void;
}

export function ImageDownloader({ csvFile, onImagesDownloaded }: ImageDownloaderProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [imageSummary, setImageSummary] = useState<ImageSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDownloadImages = async () => {
    if (!csvFile) {
      toast.error("No CSV file selected");
      return;
    }

    setIsDownloading(true);
    setProgress(10);
    setError(null);

    try {
      // Create FormData with the CSV file
      const formData = new FormData();
      formData.append('file', csvFile);

      // Call our API endpoint
      setProgress(30);
      const response = await fetch('/api/upload-csv', {
        method: 'POST',
        body: formData,
      });

      setProgress(70);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to download images');
      }

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
      
      if (onImagesDownloaded) {
        onImagesDownloaded(imagePaths, result.summary || null);
      }
      
      toast.success(`Downloaded ${result.summary?.total_images || 0} images successfully`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast.error("Failed to download images");
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