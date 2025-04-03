import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, Check, Image as ImageIcon, MessageSquare, ChevronDown, Trash } from "lucide-react";
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

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="overflow-x-auto">
        {/* Filters Bar */}
        <div className="bg-gray-50 dark:bg-gray-900/10 border-b p-2">
          <div className="flex items-center justify-between min-w-[1000px]">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium ml-2">Filter by:</span>
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
            <div className="text-sm text-muted-foreground">
              {filteredIssues.length} issues {typeFilter !== "all" && " filtered"}
            </div>
          </div>
        </div>
        
        {/* Fixed Header */}
        <div className="border-b">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr>
                <th className="w-[50px] h-12 text-left p-2 font-medium">
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
                </th>
                <th className="w-[350px] h-12 text-left p-2 font-medium">Issue</th>
                <th className="w-[430px] h-12 text-left p-2 font-medium">Description</th>
                <th className="w-[130px] h-12 text-right p-2 font-medium">Actions</th>
              </tr>
            </thead>
          </table>
        </div>
        
        {/* Selection Info Banner */}
        {selectedIssues.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-950/20 border-b p-2">
            <div className="flex items-center justify-between min-w-[1000px]">
              <span className="text-sm font-medium ml-2">
                All {selectedIssues.length} issues on this page are selected
              </span>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={ignoreSelected}
                >
                  <Trash className="h-4 w-4 mr-1" />
                  Ignore Selected
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={markSelectedAsReviewed}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Mark Selected as Reviewed
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Scrollable Content */}
        <div className="max-h-[500px] overflow-y-auto">
          <table className="w-full min-w-[1000px]">
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
                    <td className="p-2 align-middle w-[50px]">
                      <Checkbox 
                        checked={selectedIssues.includes(issue.id)}
                        onCheckedChange={() => toggleSelect(issue.id)} 
                      />
                    </td>
                    <td className="p-2 align-middle w-[350px]">
                      <div className="flex items-center">
                        <Badge variant={issue.resolved ? "outline" : "secondary"} className="flex items-center gap-1 mr-3">
                          {renderIssueIcon(issue.issueType)}
                          {getIssueLabel(issue.issueType)}
                        </Badge>
                        <div>
                          <div className="font-medium">{issue.productName}</div>
                          <div className="text-xs text-muted-foreground">ID: {issue.productId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-2 align-middle w-[430px]">
                      <div className="text-sm">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="line-clamp-1 text-ellipsis overflow-hidden">
                                {issue.description}
                                {issue.details && (
                                  <span className="ml-1 font-medium">
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
                    <td className="p-2 align-middle w-[130px] text-right whitespace-nowrap">
                      {!issue.resolved ? (
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => onIgnore(issue.id)}>
                            Ignore
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="flex items-center gap-1"
                            onClick={() => onMarkResolved(issue.id)}
                          >
                            <Check className="h-4 w-4" />
                            Reviewed
                          </Button>
                        </div>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => onMarkResolved(issue.id)}>
                          Undo
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