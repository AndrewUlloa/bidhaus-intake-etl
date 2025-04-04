import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ImageIcon, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface WatermarkTesterProps {
  onWatermarkDetected?: (hasWatermark: boolean, imageUrl: string, response: string) => void;
}

export function WatermarkTester({ onWatermarkDetected }: WatermarkTesterProps) {
  const [imageUrl, setImageUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    hasWatermark: boolean;
    response: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyzeImage = async () => {
    if (!imageUrl) {
      toast.error("Please enter an image URL");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    const toastId = toast.loading("Analyzing image for watermarks...");

    try {
      const response = await fetch('/api/check-watermark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          imageUrl,
          productName: "Test Image" 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze image');
      }

      const data = await response.json();
      
      // Set the result
      setResult({
        hasWatermark: data.hasWatermark,
        response: data.originalResponse
      });

      // Call the callback if provided
      if (onWatermarkDetected) {
        onWatermarkDetected(data.hasWatermark, imageUrl, data.originalResponse);
      }

      // Show success toast
      if (data.hasWatermark) {
        toast.warning("Watermark detected", { 
          id: toastId,
          description: "The image appears to contain a watermark"
        });
      } else {
        toast.success("Analysis complete", { 
          id: toastId,
          description: "No watermark detected in this image"
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast.error("Failed to analyze image", { 
        id: toastId,
        description: err instanceof Error ? err.message : 'An unknown error occurred'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAnalyzeImage();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Watermark Detection Tester
        </CardTitle>
        <CardDescription>
          Test if an image contains a watermark using OpenAI vision
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image-url">Image URL</Label>
            <div className="flex gap-2">
              <Input
                id="image-url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="https://example.com/image.jpg"
                className="flex-1"
                disabled={isAnalyzing}
              />
              <Button 
                onClick={handleAnalyzeImage} 
                disabled={isAnalyzing || !imageUrl}
                className="gap-2"
              >
                <Search className="h-4 w-4" />
                {isAnalyzing ? "Analyzing..." : "Analyze"}
              </Button>
            </div>
          </div>

          {result && (
            <div className={`p-4 rounded-md border ${result.hasWatermark ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800' : 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800'}`}>
              <h3 className="text-sm font-medium mb-2">Analysis Result</h3>
              <p className="text-sm mb-1">
                <span className="font-medium">Watermark detected:</span> {result.hasWatermark ? 'Yes' : 'No'}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">AI response:</span> &ldquo;{result.response}&rdquo;
              </p>
            </div>
          )}

          {imageUrl && !isAnalyzing && !error && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Preview</h3>
              <div className="border rounded-md overflow-hidden w-full h-64 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={imageUrl} 
                  alt="Preview" 
                  className="w-full h-full object-contain"
                  onError={() => setError("Failed to load image preview")}
                />
              </div>
            </div>
          )}
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Using OpenAI&apos;s GPT-4o-mini model to detect watermarks in images
      </CardFooter>
    </Card>
  );
} 