import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, Check, Image as ImageIcon, MessageSquare, ExternalLink } from "lucide-react";

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
    <div className="overflow-auto rounded-md border">
      <div className="min-w-[1000px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Status</TableHead>
              <TableHead className="w-[200px]">Product</TableHead>
              <TableHead className="w-[160px]">Issue Type</TableHead>
              <TableHead className="w-[350px]">Description</TableHead>
              <TableHead className="w-[100px]">Image</TableHead>
              <TableHead className="text-right w-[140px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {issues.map((issue) => (
              <TableRow key={issue.id} className={issue.resolved ? "bg-muted/20" : ""}>
                <TableCell>
                  <Checkbox 
                    checked={issue.resolved}
                    onCheckedChange={() => onMarkResolved(issue.id)} 
                  />
                </TableCell>
                <TableCell className="font-medium">
                  <div>
                    <div className="truncate max-w-[180px]">{issue.productName}</div>
                    <div className="text-xs text-muted-foreground">ID: {issue.productId}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={issue.resolved ? "outline" : "secondary"} className="flex items-center gap-1">
                    {renderIssueIcon(issue.issueType)}
                    {getIssueLabel(issue.issueType)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm w-[330px]">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="line-clamp-2 text-ellipsis overflow-hidden">
                            {issue.description}
                            {issue.details && (
                              <div className="mt-1 font-medium">
                                Match: &ldquo;{issue.details}&rdquo;
                              </div>
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
                </TableCell>
                <TableCell>
                  {issue.imageUrl ? (
                    <a 
                      href={issue.imageUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center text-blue-500 hover:text-blue-700"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />View
                    </a>
                  ) : (
                    <span className="text-muted-foreground text-sm">None</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {!issue.resolved ? (
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => onIgnore(issue.id)}>
                        Ignore
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-1"
                        onClick={() => onMarkResolved(issue.id)}
                      >
                        <Check className="h-3 w-3" />
                        Resolve
                      </Button>
                    </div>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => onMarkResolved(issue.id)}>
                      Undo
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 