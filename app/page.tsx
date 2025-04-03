"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Info, Upload, FileCheck, Settings, AlertCircle } from "lucide-react";
import { CsvUploader } from "@/components/CsvUploader";
import { QualityIssueCard } from "@/components/QualityIssueCard";
import { DetectionSettingsForm } from "@/components/DetectionSettingsForm";
import { toast } from "sonner";

// Import the DetectionSettings type
interface DetectionSettings {
  vendorRegex: string;
  phoneRegex: string;
  watermarkThreshold: number;
  enableImageScanning: boolean;
  customRegexPatterns: string;
}

// Sample data for demonstration
const sampleIssues = [
  {
    id: "issue1",
    productId: "PROD-001",
    productName: "Vintage Wooden Chair",
    issueType: "vendor_info" as const,
    description: "Description contains vendor name 'ABC Furniture'",
    resolved: false,
  },
  {
    id: "issue2",
    productId: "PROD-002",
    productName: "Antique Desk Lamp",
    issueType: "phone_number" as const,
    description: "Contains phone number '555-123-4567' in the description",
    imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
    resolved: false,
  },
  {
    id: "issue3",
    productId: "PROD-003",
    productName: "Modern Coffee Table",
    issueType: "watermark" as const,
    description: "Potential watermark detected in product image",
    imageUrl: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
    resolved: true,
  }
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("upload");
  const [issues, setIssues] = useState(sampleIssues);
  const [fileUploaded, setFileUploaded] = useState(false);

  const handleFileUploaded = (file: File) => {
    // In a real app, you would send this file to the server or process it
    console.log("File uploaded:", file.name);
    setFileUploaded(true);
    
    // Switch to the review tab after upload
    setTimeout(() => {
      setActiveTab("review");
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

  const handleSaveSettings = (settings: DetectionSettings) => {
    console.log("Settings saved:", settings);
    // In a real app, you would save these settings to the server
  };

  return (
    <div className="container mx-auto py-10">
      <header className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold">BidHaus Quality Manager</h1>
          <p className="text-muted-foreground">Detect and manage product listing quality issues</p>
        </div>
        <Button variant="outline">Help</Button>
      </header>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload CSV
          </TabsTrigger>
          <TabsTrigger value="review" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            Review Issues
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Detection Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload Product Data</CardTitle>
              <CardDescription>
                Upload your CSV file containing product listings to check for quality issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CsvUploader onFileUploaded={handleFileUploaded} />
              
              <Alert className="bg-muted/50 mt-6">
                <Info className="h-4 w-4" />
                <AlertTitle>Detection Information</AlertTitle>
                <AlertDescription>
                  We&apos;ll scan for vendor names, phone numbers, and potential watermarks in images
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-sm text-muted-foreground">
                Supported format: CSV with headers
              </p>
              <Button disabled={!fileUploaded} onClick={() => setActiveTab("review")}>
                View Results
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="review">
          <Card>
            <CardHeader>
              <CardTitle>Review Flagged Issues</CardTitle>
              <CardDescription>
                Review and address quality issues detected in your product listings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {issues.length === 0 ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No issues found</AlertTitle>
                  <AlertDescription>
                    No quality issues were detected in your product listings
                  </AlertDescription>
                </Alert>
              ) : (
                <ScrollArea className="h-[600px] w-full pr-4">
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
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Detection Settings</CardTitle>
              <CardDescription>
                Configure rules for detecting quality issues in product listings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DetectionSettingsForm onSaveSettings={handleSaveSettings} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
