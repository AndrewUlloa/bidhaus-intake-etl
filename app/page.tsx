import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Info, Upload, FileCheck, Settings, AlertCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="container mx-auto py-10">
      <header className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold">BidHaus Quality Manager</h1>
          <p className="text-muted-foreground">Detect and manage product listing quality issues</p>
        </div>
        <Button>Settings</Button>
      </header>
      
      <Tabs defaultValue="upload" className="w-full">
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
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="csv-file">CSV File</Label>
                  <div className="border-2 border-dashed rounded-lg p-10 text-center cursor-pointer hover:bg-muted/50">
                    <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm font-medium mb-1">Drag and drop your CSV file here</p>
                    <p className="text-xs text-muted-foreground mb-4">or click to browse files</p>
                    <Input id="csv-file" type="file" accept=".csv" className="hidden" />
                    <Button variant="outline" size="sm">Select File</Button>
                  </div>
                </div>
                
                <Alert className="bg-muted/50">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Detection Information</AlertTitle>
                  <AlertDescription>
                    We&apos;ll scan for vendor names, phone numbers, and potential watermarks in images
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button>Upload and Analyze</Button>
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
              <div className="grid gap-6">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No data available</AlertTitle>
                  <AlertDescription>
                    Please upload a CSV file first to see flagged quality issues
                  </AlertDescription>
                </Alert>
                
                <ScrollArea className="h-[400px] w-full rounded-md border">
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground text-center py-10">
                      Flagged items will appear here after analysis
                    </p>
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex gap-2">
                <Badge variant="outline">0 Total Issues</Badge>
                <Badge variant="outline">0 Resolved</Badge>
              </div>
              <Button disabled>Export Report</Button>
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
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="vendor-regex">Vendor Name Pattern</Label>
                  <Input id="vendor-regex" placeholder="Regular expression to detect vendor names" />
                  <p className="text-xs text-muted-foreground">Example: \b(company|vendor|store)\b</p>
                </div>
                
                <div className="grid gap-3">
                  <Label htmlFor="phone-regex">Phone Number Pattern</Label>
                  <Input id="phone-regex" placeholder="Regular expression to detect phone numbers" />
                  <p className="text-xs text-muted-foreground">Example: \b\d{3}[-.]?\d{3}[-.]?\d{4}\b</p>
                </div>
                
                <div className="grid gap-3">
                  <Label htmlFor="watermark-threshold">Watermark Detection Threshold</Label>
                  <Input id="watermark-threshold" type="range" min="0" max="100" defaultValue="50" />
                  <p className="text-xs text-muted-foreground">Higher values mean stricter detection</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button>Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
