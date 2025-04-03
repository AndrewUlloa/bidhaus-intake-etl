import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, AlertTriangle, Check } from "lucide-react";
import { toast } from "sonner";
import { parseCSV } from "@/lib/utils/validation";
import { ProductData } from "@/lib/utils/validation";

interface CsvUploaderProps {
  onFileUploaded: (file: File, data: ProductData[]) => void;
}

export function CsvUploader({ onFileUploaded }: CsvUploaderProps) {
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    // Reset states
    setError(null);
    setUploadProgress(0);

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      setError("Only CSV files are allowed");
      setSelectedFile(null);
      return;
    }

    // Set the selected file
    setSelectedFile(file);
    
    // Read the file content
    const reader = new FileReader();
    
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(progress);
      }
    };
    
    reader.onload = (event) => {
      try {
        const csvContent = event.target?.result as string;
        if (!csvContent) {
          throw new Error("Failed to read file content");
        }
        
        // Parse the CSV data
        const productData = parseCSV(csvContent);
        
        // Call the callback with the file and parsed data
        setUploadProgress(100);
        setTimeout(() => {
          onFileUploaded(file, productData);
          toast.success(`Processed ${productData.length} products successfully`);
        }, 500);
      } catch (err) {
        setError(`Error processing file: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setUploadProgress(0);
      }
    };
    
    reader.onerror = () => {
      setError("Error reading file");
      setUploadProgress(0);
    };
    
    reader.readAsText(file);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="grid gap-6">
      <div className="grid gap-3">
        <Label htmlFor="csv-file">CSV File</Label>
        <div
          className={`border-2 ${
            dragging ? "border-primary" : "border-dashed"
          } rounded-lg p-10 text-center cursor-pointer hover:bg-muted/50 transition-colors`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
        >
          {!selectedFile ? (
            <>
              <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">Drag and drop your CSV file here</p>
              <p className="text-xs text-muted-foreground mb-4">or click to browse files</p>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleInputChange}
                ref={fileInputRef}
              />
              <Button variant="outline" size="sm" type="button">
                Select File
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-primary">
                <Check className="h-5 w-5" />
                <span className="font-medium">{selectedFile.name}</span>
              </div>
              
              {uploadProgress < 100 && (
                <div className="w-full max-w-xs mx-auto">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Processing: {uploadProgress}%
                  </p>
                </div>
              )}
              
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                }}
              >
                Choose a different file
              </Button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
} 