import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Check, Image as ImageIcon, MessageSquare, ZoomIn } from "lucide-react";
import { ImagePreviewModal } from "@/components/ImagePreviewModal";
import { IssueType } from "@/lib/utils/validation";

type IssueTypeKey = "vendor_info" | "phone_number" | "watermark" | "other";

interface QualityIssueCardProps {
  id: string;
  productName: string;
  issueTypes: IssueType[];
  imageUrl?: string;
  resolved: boolean;
  onMarkResolved: (id: string) => void;
  onIgnore: (id: string) => void;
  productImages?: string[];
  allImages?: string[];
  imageIndex?: number;
}

export function QualityIssueCard({
  id,
  productName,
  issueTypes,
  imageUrl,
  resolved,
  onMarkResolved,
  onIgnore,
  productImages = []
}: QualityIssueCardProps) {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const imagesToShow = productImages.length > 0 
    ? productImages 
    : (imageUrl ? [imageUrl] : []);
  
  const currentImageIndex = imageUrl && imagesToShow.length > 0 
    ? imagesToShow.indexOf(imageUrl)
    : 0;

  // Get unique issue types for display
  const uniqueIssueTypes = Array.from(new Set(issueTypes.map(issue => issue.type)));

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
        return "Watermark";
      default:
        return "Other Issue";
    }
  };

  // Mobile-specific versions of the render functions
  const renderMobileIssueIcon = (issueType: IssueTypeKey) => {
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

  const getMobileIssueLabel = (issueType: IssueTypeKey) => {
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
      {/* Image preview modal */}
      {imageUrl && (
        <ImagePreviewModal
          imageUrl={imageUrl}
          alt={`Full size image for ${productName}`}
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          allImages={imagesToShow}
          currentIndex={currentImageIndex}
        />
      )}
      
      {/* Desktop version */}
      <Card className={`${resolved ? "opacity-60" : ""} hidden sm:block h-full`}>
        <CardHeader className="pb-2">
          <div className="space-y-2 overflow-hidden w-full">
            <div className="flex flex-col justify-between items-start">
              <div className="flex flex-col">
                <div className="flex flex-col gap-1">
                  {resolved ? (
                    <Badge variant="outline" className="flex items-center gap-1 w-fit shrink-0">
                      <Check className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">Resolved</span>
                    </Badge>
                  ) : (
                    uniqueIssueTypes.map((type) => (
                      <Badge 
                        key={type} 
                        variant="destructive" 
                        className="justify-center w-fit shrink-0 flex items-center gap-1 overflow-hidden whitespace-normal py-1 leading-tight mb-1"
                      >
                        {renderIssueIcon(type as IssueTypeKey)}
                        <span className="truncate">{getIssueLabel(type as IssueTypeKey)}</span>
                      </Badge>
                    ))
                  )}
                </div>
              </div>
            </div>
            <CardTitle className="font-semibold text-base line-clamp-2 break-words w-full overflow-hidden text-ellipsis">{productName}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <h4 className="text-sm font-semibold mb-1">Issues</h4>
              {issueTypes.map((issue, index) => (
                <div key={index} className="mb-2">
                  <p className="text-sm line-clamp-3">{issue.description}</p>
                  {issue.details && (
                    <div className="mt-1 bg-muted p-2 rounded text-sm">
                      <span className="font-medium">Matched text:</span> <span className="line-clamp-1">&ldquo;{issue.details}&rdquo;</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {imageUrl && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-semibold mb-2">Associated Image</h4>
                  <div 
                    className="relative h-32 w-full overflow-hidden rounded-md group cursor-pointer"
                    onClick={() => setIsImageModalOpen(true)}
                  >
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-10">
                      <ZoomIn className="h-8 w-8 text-white drop-shadow-md" />
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt={`Image for ${productName}`}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 px-3 py-3 mt-auto">
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

      {/* Mobile version - updated to match desktop */}
      <Card className={`${resolved ? "opacity-60" : ""} sm:hidden h-full`}>
        <CardHeader className="pb-2 px-3">
          <div className="space-y-2 overflow-hidden w-full">
            <div className="flex flex-col justify-between items-start">
              <div className="flex flex-col">
                <div className="flex flex-col gap-1">
                  {resolved ? (
                    <Badge variant="outline" className="flex items-center gap-1 text-xs w-fit shrink-0">
                      <Check className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">Resolved</span>
                    </Badge>
                  ) : (
                    uniqueIssueTypes.map((type) => (
                      <Badge 
                        key={type} 
                        variant="destructive" 
                        className="justify-center text-xs w-fit shrink-0 flex items-center gap-1 overflow-hidden whitespace-normal py-1 leading-tight mb-1"
                      >
                        {renderMobileIssueIcon(type as IssueTypeKey)}
                        <span className="truncate">{getMobileIssueLabel(type as IssueTypeKey)}</span>
                      </Badge>
                    ))
                  )}
                </div>
              </div>
            </div>
            <CardTitle className="font-semibold text-sm line-clamp-2 break-words w-full overflow-hidden text-ellipsis">{productName}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-3">
          <div className="grid gap-2">
            <div>
              <h4 className="text-xs font-semibold mb-1">Issues</h4>
              {issueTypes.map((issue, index) => (
                <div key={index} className="mb-2">
                  <p className="text-xs line-clamp-3">{issue.description}</p>
                  {issue.details && (
                    <div className="mt-1 bg-muted p-2 rounded text-xs">
                      <span className="font-medium">Matched text:</span> <span className="line-clamp-1">&ldquo;{issue.details}&rdquo;</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {imageUrl && (
              <>
                <Separator />
                <div>
                  <h4 className="text-xs font-semibold mb-2">Associated Image</h4>
                  <div 
                    className="relative h-24 w-full overflow-hidden rounded-md group cursor-pointer"
                    onClick={() => setIsImageModalOpen(true)}
                  >
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-10">
                      <ZoomIn className="h-6 w-6 text-white drop-shadow-md" />
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt={`Image for ${productName}`}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 px-3 py-3 mt-auto">
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