import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, Check, Image as ImageIcon, MessageSquare, ChevronDown, Trash, Filter } from "lucide-react";
import { useState, useEffect } from "react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type IssueType = "vendor_info" | "phone_number" | "watermark" | "other";

interface QualityIssue {
  id: string;
  productId: string;
  productName: string;
  issueType: IssueType;
  description: string;
  details?: string;
  imageUrl?: string;
  resolved: boolean;
  timestamp?: string; // Optional timestamp
}

interface QualityIssueListProps {
  issues: QualityIssue[];
  onMarkResolved: (id: string) => void;
  onIgnore: (id: string) => void;
}

export function QualityIssueList({
  issues,
  onMarkResolved,
  onIgnore,
}: QualityIssueListProps) {
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [selectPopoverOpen, setSelectPopoverOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  
  // Reset selection when filter changes
  useEffect(() => {
    setSelectedIssues([]);
  }, [typeFilter]);
  
  // Filter issues based on selected type
  const filteredIssues = issues.filter(issue => {
    if (typeFilter === "all") return true;
    return issue.issueType === typeFilter;
  });
  
  // Calculate checkbox state based on selection
  const getSelectAllState = () => {
    if (selectedIssues.length === 0) return false;
    if (filteredIssues.length > 0 && selectedIssues.length === filteredIssues.length) return true;
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
    setSelectedIssues(filteredIssues.map(issue => issue.id));
    setSelectPopoverOpen(false);
  };
  
  const deselectAll = () => {
    setSelectedIssues([]);
    setSelectPopoverOpen(false);
  };
  
  const selectReviewed = () => {
    setSelectedIssues(filteredIssues.filter(issue => issue.resolved).map(issue => issue.id));
    setSelectPopoverOpen(false);
  };
  
  const selectUnreviewed = () => {
    setSelectedIssues(filteredIssues.filter(issue => !issue.resolved).map(issue => issue.id));
    setSelectPopoverOpen(false);
  };
  
  const markSelectedAsReviewed = () => {
    selectedIssues.forEach(id => onMarkResolved(id));
  };
  
  const ignoreSelected = () => {
    selectedIssues.forEach(id => onIgnore(id));
    setSelectedIssues([]);
  };
  
  const renderIssueIcon = (issueType: IssueType) => {
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

  const getIssueLabel = (issueType: IssueType) => {
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
  const getShortIssueLabel = (issueType: IssueType) => {
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

  return (
    <div className="relative">
      {/* Selection banner - only appears when items are selected */}
      {selectedIssues.length > 0 && (
        <div className="sticky top-0 left-0 right-0 z-20 bg-blue-50 dark:bg-blue-950/20 border-b p-2 flex items-center justify-between">
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

      {/* Filter controls - visible on all viewports */}
      <div className="sticky top-0 z-10 bg-background border-b mb-2">
        <div className="flex items-center justify-between p-2">
          {/* Select all/none controls - Now on the left */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <Popover open={selectPopoverOpen} onOpenChange={setSelectPopoverOpen}>
                <PopoverTrigger asChild>
                  <div className="flex items-center cursor-pointer">
                    <Checkbox 
                      checked={getSelectAllState()} 
                      onCheckedChange={() => {
                        if (filteredIssues.length > 0 && selectedIssues.length === filteredIssues.length) {
                          deselectAll();
                        } else {
                          selectAll();
                        }
                      }}
                      className="cursor-pointer"
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
              {filteredIssues.length} {filteredIssues.length === 1 ? 'issue' : 'issues'}
            </span>
          </div>

          {/* Desktop filters - Now on the right */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-sm font-medium">Filter by:</span>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
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
          
          {/* Mobile filters - Now on the right */}
          <div className="md:hidden flex items-center">
            <Popover open={filterPopoverOpen} onOpenChange={setFilterPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Filter className="h-4 w-4" />
                  {typeFilter !== "all" ? getShortIssueLabel(typeFilter as IssueType) : "All Issues"}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-[180px] p-0">
                <div className="py-1">
                  <div 
                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-muted/50 ${typeFilter === "all" ? "bg-muted" : ""}`}
                    onClick={() => {
                      setTypeFilter("all");
                      setFilterPopoverOpen(false);
                    }}
                  >
                    All Issues
                  </div>
                  <div 
                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-muted/50 ${typeFilter === "vendor_info" ? "bg-muted" : ""}`}
                    onClick={() => {
                      setTypeFilter("vendor_info");
                      setFilterPopoverOpen(false);
                    }}
                  >
                    Vendor Information
                  </div>
                  <div 
                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-muted/50 ${typeFilter === "phone_number" ? "bg-muted" : ""}`}
                    onClick={() => {
                      setTypeFilter("phone_number");
                      setFilterPopoverOpen(false);
                    }}
                  >
                    Phone Number
                  </div>
                  <div 
                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-muted/50 ${typeFilter === "watermark" ? "bg-muted" : ""}`}
                    onClick={() => {
                      setTypeFilter("watermark");
                      setFilterPopoverOpen(false);
                    }}
                  >
                    Watermark
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Table View - for all viewports with responsive design */}
      <div className="border rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-muted/40">
                <th className="w-[50px] h-10 text-left p-2 font-medium"></th>
                <th className="w-[30%] h-10 text-left p-2 font-medium">
                  <span className="hidden md:inline">Issue</span>
                  <span className="md:hidden">Type</span>
                </th>
                <th className="w-[45%] h-10 text-left p-2 font-medium">
                  <span className="hidden sm:inline">Description</span>
                  <span className="sm:hidden">Info</span>
                </th>
                <th className="w-[20%] h-10 text-right p-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-muted-foreground">
                    No issues found with the selected filter.
                  </td>
                </tr>
              ) : (
                filteredIssues.map((issue) => (
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
                        <Badge variant={issue.resolved ? "outline" : "secondary"} className="flex items-center gap-1 mr-3">
                          {renderIssueIcon(issue.issueType)}
                          <span className="hidden md:inline">{getIssueLabel(issue.issueType)}</span>
                          <span className="md:hidden">{getShortIssueLabel(issue.issueType)}</span>
                        </Badge>
                        <div>
                          <div className="text-sm font-medium line-clamp-1">{issue.productName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-2 align-middle">
                      <div className="text-xs md:text-sm">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="line-clamp-1 text-ellipsis overflow-hidden">
                                {issue.description}
                                {issue.details && (
                                  <span className="ml-1 font-medium hidden md:inline">
                                    Match: &ldquo;{issue.details}&rdquo;
                                  </span>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="max-w-sm">
                              <p>{issue.description}</p>
                              {issue.details && (
                                <p className="mt-1">
                                  <span className="font-medium">Matched text:</span> &ldquo;{issue.details}&rdquo;
                                </p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 