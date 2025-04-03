import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Check, Image as ImageIcon, MessageSquare } from "lucide-react";

type IssueType = "vendor_info" | "phone_number" | "watermark" | "other";

interface QualityIssueCardProps {
  id: string;
  productId: string;
  productName: string;
  issueType: IssueType;
  description: string;
  details?: string;
  imageUrl?: string;
  resolved: boolean;
  onMarkResolved: (id: string) => void;
  onIgnore: (id: string) => void;
}

export function QualityIssueCard({
  id,
  productId,
  productName,
  issueType,
  description,
  details,
  imageUrl,
  resolved,
  onMarkResolved,
  onIgnore,
}: QualityIssueCardProps) {
  const renderIssueIcon = () => {
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

  const getIssueLabel = () => {
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

  // Mobile-specific versions of the render functions
  const renderMobileIssueIcon = () => {
    switch (issueType) {
      case "vendor_info":
        return <MessageSquare className="h-3 w-3" />;
      case "phone_number":
        return <MessageSquare className="h-3 w-3" />;
      case "watermark":
        return <ImageIcon className="h-3 w-3" />;
      default:
        return <AlertTriangle className="h-3 w-3" />;
    }
  };

  const getMobileIssueLabel = () => {
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
    <>
      {/* Desktop version */}
      <Card className={`${resolved ? "opacity-60" : ""} hidden sm:block`}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-base">{productName}</CardTitle>
              <p className="text-xs text-muted-foreground">ID: {productId}</p>
            </div>
            <Badge variant={resolved ? "outline" : "destructive"} className="flex items-center gap-1">
              {resolved ? (
                <>
                  <Check className="h-3 w-3" />
                  Resolved
                </>
              ) : (
                <>
                  {renderIssueIcon()}
                  {getIssueLabel()}
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <h4 className="text-sm font-semibold mb-1">Issue Description</h4>
              <p className="text-sm">{description}</p>
              {details && (
                <div className="mt-2 bg-muted p-2 rounded text-sm">
                  <span className="font-medium">Matched text:</span> &ldquo;{details}&rdquo;
                </div>
              )}
            </div>
            
            {imageUrl && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-semibold mb-2">Associated Image</h4>
                  <div className="relative h-32 w-full overflow-hidden rounded-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt={`Image for ${productName}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          {!resolved ? (
            <>
              <Button variant="outline" size="sm" onClick={() => onIgnore(id)}>
                Ignore
              </Button>
              <Button size="sm" onClick={() => onMarkResolved(id)}>
                Mark as Reviewed
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => onMarkResolved(id)}>
              Undo
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Mobile version */}
      <Card className={`${resolved ? "opacity-60" : ""} sm:hidden`}>
        <CardHeader className="pb-2 px-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-sm">{productName}</CardTitle>
              <p className="text-xs text-muted-foreground">ID: {productId}</p>
            </div>
            <Badge variant={resolved ? "outline" : "destructive"} className="flex items-center gap-1 text-xs">
              {resolved ? (
                <>
                  <Check className="h-3 w-3" />
                  Resolved
                </>
              ) : (
                <>
                  {renderMobileIssueIcon()}
                  {getMobileIssueLabel()}
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-3">
          <div className="grid gap-3">
            <div>
              <h4 className="text-xs font-semibold mb-1">Issue Description</h4>
              <p className="text-xs">{description}</p>
              {details && (
                <div className="mt-2 bg-muted p-2 rounded text-xs">
                  <span className="font-medium">Matched text:</span> &ldquo;{details}&rdquo;
                </div>
              )}
            </div>
            
            {imageUrl && (
              <>
                <Separator />
                <div>
                  <h4 className="text-xs font-semibold mb-2">Associated Image</h4>
                  <div className="relative h-24 w-full overflow-hidden rounded-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt={`Image for ${productName}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 px-3 py-3">
          {!resolved ? (
            <>
              <Button variant="outline" size="sm" onClick={() => onIgnore(id)} className="w-full">
                Ignore
              </Button>
              <Button size="sm" onClick={() => onMarkResolved(id)} className="w-full">
                Mark as Reviewed
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => onMarkResolved(id)} className="w-full">
              Undo
            </Button>
          )}
        </CardFooter>
      </Card>
    </>
  );
} 