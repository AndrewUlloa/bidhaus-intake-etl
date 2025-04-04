import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, Check, Image as ImageIcon, MessageSquare, ChevronDown, Trash, ZoomIn } from "lucide-react";
import { useState } from "react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ImagePreviewModal } from "@/components/ImagePreviewModal";
import { IssueType } from "@/lib/utils/validation";

type IssueTypeKey = "vendor_info" | "phone_number" | "watermark" | "other";

interface QualityIssue {
  id: string;
  productId: string;
  productName: string;
  issueTypes: IssueType[];
  imageUrl?: string;
  resolved: boolean;
  timestamp?: string; // Optional timestamp
}

interface QualityIssueListProps {
  issues: QualityIssue[];
  onMarkResolved: (id: string) => void;
  onIgnore: (id: string) => void;
  allImages?: string[];  // Add all images for navigation
}

export function QualityIssueList({
  issues,
  onMarkResolved,
  onIgnore,
  allImages = []
}: QualityIssueListProps) {
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [selectPopoverOpen, setSelectPopoverOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ url: string, alt: string, index: number } | null>(null);
  
  // Use provided allImages if available, otherwise collect from issues
  const imageUrls = allImages.length > 0 
    ? allImages 
    : issues
        .filter(issue => issue.imageUrl)
        .map(issue => issue.imageUrl as string);
  
  // Find the index of an image URL in the collection
  const getImageIndex = (url: string) => {
    return imageUrls.indexOf(url);
  };
  
  // Calculate checkbox state based on selection
  const getSelectAllState = () => {
    if (selectedIssues.length === 0) return false;
    if (issues.length > 0 && selectedIssues.length === issues.length) return true;
    return "indeterminate" as const;
  };
  
  const toggleSelect = (id: string) => {
    setSelectedIssues(prev => 
      prev.includes(id) 
        ? prev.filter(issueId => issueId !== id) 
        : [...prev, id]
    );
  };
  
  const selectAll = () => {
    setSelectedIssues(issues.map(issue => issue.id));
    setSelectPopoverOpen(false);
  };
  
  const deselectAll = () => {
    setSelectedIssues([]);
    setSelectPopoverOpen(false);
  };
  
  const selectReviewed = () => {
    setSelectedIssues(issues.filter(issue => issue.resolved).map(issue => issue.id));
    setSelectPopoverOpen(false);
  };
  
  const selectUnreviewed = () => {
    setSelectedIssues(issues.filter(issue => !issue.resolved).map(issue => issue.id));
    setSelectPopoverOpen(false);
  };
  
  const markSelectedAsReviewed = () => {
    selectedIssues.forEach(id => onMarkResolved(id));
  };
  
  const ignoreSelected = () => {
    selectedIssues.forEach(id => onIgnore(id));
    setSelectedIssues([]);
  };
  
  const renderIssueIcon = (issueType: IssueTypeKey) => {
    switch (issueType) {
      case "vendor_info":
        return <MessageSquare className="h-4 w-4" />;
      case "phone_number":
        return <MessageSquare className="h-4 w-4" />;
      case "watermark":
        return <ImageIcon className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getIssueLabel = (issueType: IssueTypeKey) => {
    switch (issueType) {
      case "vendor_info":
        return "Vendor Information";
      case "phone_number":
        return "Phone Number";
      case "watermark":
        return "Potential Watermark";
      default:
        return "Other Issue";
    }
  };

  // Simple label for mobile view
  const getShortIssueLabel = (issueType: IssueTypeKey) => {
    switch (issueType) {
      case "vendor_info":
        return "Vendor";
      case "phone_number":
        return "Phone";
      case "watermark":
        return "Watermark";
      default:
        return "Other";
    }
  };

  // Calculate total number of issues across all cards
  const totalIssueCount = issues.reduce((count, issue) => count + issue.issueTypes.length, 0);

  return (
    <div className="relative">
      {/* Image preview modal */}
      {previewImage && (
        <ImagePreviewModal
          imageUrl={previewImage.url}
          alt={previewImage.alt}
          isOpen={!!previewImage}
          onClose={() => setPreviewImage(null)}
          allImages={imageUrls}
          currentIndex={previewImage.index}
        />
      )}
    
      {/* Select all controls */}
      <div className="sticky top-0 z-10 bg-background border-b mb-2">
        <div className="flex items-center justify-between p-2">
          {/* Select all/none controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <Popover open={selectPopoverOpen} onOpenChange={setSelectPopoverOpen}>
                <PopoverTrigger asChild>
                  <div className="flex items-center cursor-pointer">
                    <Checkbox 
                      checked={getSelectAllState()} 
                      onCheckedChange={() => {
                        if (issues.length > 0 && selectedIssues.length === issues.length) {
                          deselectAll();
                        } else {
                          selectAll();
                        }
                      }}
                      className="cursor-pointer h-5 w-5"
                    />
                    <ChevronDown className="h-4 w-4 ml-1 text-muted-foreground cursor-pointer" />
                  </div>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-[150px] p-0">
                  <div className="py-1">
                    <div 
                      className="px-2 py-1.5 text-sm cursor-pointer hover:bg-muted/50" 
                      onClick={selectAll}
                    >
                      All
                    </div>
                    <div 
                      className="px-2 py-1.5 text-sm cursor-pointer hover:bg-muted/50" 
                      onClick={deselectAll}
                    >
                      None
                    </div>
                    <div 
                      className="px-2 py-1.5 text-sm cursor-pointer hover:bg-muted/50" 
                      onClick={selectReviewed}
                    >
                      Reviewed
                    </div>
                    <div 
                      className="px-2 py-1.5 text-sm cursor-pointer hover:bg-muted/50" 
                      onClick={selectUnreviewed}
                    >
                      Unreviewed
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            <span className="text-xs text-muted-foreground ml-2">
              {totalIssueCount} {totalIssueCount === 1 ? 'issue' : 'issues'} across {issues.length} products
            </span>
          </div>
        </div>
      </div>

      {/* Selection banner */}
      {selectedIssues.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border rounded-md mb-4 p-2 flex items-center justify-between">
          <span className="text-sm font-medium ml-2">
            {selectedIssues.length} selected
          </span>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={ignoreSelected}
              className="whitespace-nowrap"
            >
              <Trash className="h-4 w-4 md:mr-1" />
              <span className="hidden md:inline">Ignore Selected</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="whitespace-nowrap"
              onClick={markSelectedAsReviewed}
            >
              <Check className="h-4 w-4 md:mr-1" />
              <span className="hidden md:inline">Mark Selected as Reviewed</span>
            </Button>
          </div>
        </div>
      )}

      {/* Table View */}
      <div className="border rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-muted/40">
                <th className="w-[50px] h-10 text-left p-2 font-medium"></th>
                <th className="w-[30%] h-10 text-left p-2 font-medium">
                  <span className="hidden md:inline">Issue Types</span>
                  <span className="md:hidden">Type</span>
                </th>
                <th className="w-[45%] h-10 text-left p-2 font-medium">
                  <span className="hidden sm:inline">Product Details</span>
                  <span className="sm:hidden">Details</span>
                </th>
                <th className="w-[20%] h-10 text-right p-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {issues.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-muted-foreground">
                    No issues found with the selected filter.
                  </td>
                </tr>
              ) : (
                issues.map((issue) => {
                  // Get unique issue types for this product
                  const uniqueIssueTypes = Array.from(new Set(issue.issueTypes.map(t => t.type)));
                  
                  return (
                    <tr 
                      key={issue.id} 
                      className={`border-b hover:bg-gray-50 dark:hover:bg-gray-900/10 
                        ${issue.resolved ? "bg-gray-50 dark:bg-gray-900/5" : ""} 
                        ${selectedIssues.includes(issue.id) ? "bg-blue-50 dark:bg-blue-900/10" : ""}`}
                    >
                      <td className="p-2 align-middle">
                        <Checkbox 
                          checked={selectedIssues.includes(issue.id)}
                          onCheckedChange={() => toggleSelect(issue.id)} 
                          className="h-5 w-5"
                        />
                      </td>
                      <td className="p-2 align-middle">
                        <div className="flex flex-col md:flex-row md:items-center gap-1">
                          {issue.resolved ? (
                            <Badge variant="outline" className="flex items-center gap-1 mr-3 max-w-full">
                              <Check className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">Resolved</span>
                            </Badge>
                          ) : (
                            <div className="flex flex-wrap gap-1 max-w-full">
                              {uniqueIssueTypes.map((type) => (
                                <Badge 
                                  key={type} 
                                  variant="destructive" 
                                  className="flex items-center gap-1 mr-1 overflow-hidden"
                                >
                                  {renderIssueIcon(type as IssueTypeKey)}
                                  <span className="hidden md:inline truncate">{getIssueLabel(type as IssueTypeKey)}</span>
                                  <span className="md:hidden truncate">{getShortIssueLabel(type as IssueTypeKey)}</span>
                                </Badge>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-1 md:mt-0">
                            {issue.imageUrl && (
                              <div 
                                className="relative h-10 w-10 overflow-hidden rounded-md group cursor-pointer shrink-0"
                                onClick={() => setPreviewImage({ 
                                  url: issue.imageUrl!, 
                                  alt: `Full size image for ${issue.productName}`,
                                  index: getImageIndex(issue.imageUrl!)
                                })}
                              >
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-10">
                                  <ZoomIn className="h-4 w-4 text-white drop-shadow-md" />
                                </div>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={issue.imageUrl}
                                  alt={`Thumbnail for ${issue.productName}`}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            )}
                            <div className="text-sm font-medium line-clamp-1">{issue.productName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-2 align-middle">
                        <div className="text-xs md:text-sm space-y-1">
                          {issue.issueTypes.map((issueType, idx) => (
                            <TooltipProvider key={idx}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="line-clamp-1 text-ellipsis overflow-hidden">
                                    {issueType.description}
                                    {issueType.details && (
                                      <span className="ml-1 font-medium hidden md:inline text-xs">
                                        Match: &ldquo;{issueType.details}&rdquo;
                                      </span>
                                    )}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="max-w-sm">
                                  <p>{issueType.description}</p>
                                  {issueType.details && (
                                    <p className="mt-1">
                                      <span className="font-medium">Matched text:</span> &ldquo;{issueType.details}&rdquo;
                                    </p>
                                  )}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </div>
                      </td>
                      <td className="p-2 align-middle text-right whitespace-nowrap">
                        {!issue.resolved ? (
                          <div className="flex justify-end gap-1 sm:gap-2">
                            <Button variant="ghost" size="sm" className="h-8 px-2 sm:px-3" onClick={() => onIgnore(issue.id)}>
                              <span className="hidden sm:inline">Ignore</span>
                              <Trash className="h-4 w-4 sm:hidden" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 px-2 sm:px-3 flex items-center gap-1"
                              onClick={() => onMarkResolved(issue.id)}
                            >
                              <Check className="h-4 w-4" />
                              <span className="hidden sm:inline">Reviewed</span>
                            </Button>
                          </div>
                        ) : (
                          <Button variant="ghost" size="sm" className="h-8 px-2 sm:px-3" onClick={() => onMarkResolved(issue.id)}>
                            <span className="hidden sm:inline">Undo</span>
                            <Check className="h-4 w-4 sm:hidden" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 