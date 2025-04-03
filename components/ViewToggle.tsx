import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LayoutGrid, List } from "lucide-react";

export type ViewMode = "card" | "list";

interface ViewToggleProps {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <>
      {/* Desktop version */}
      <div className="hidden sm:flex items-center">
        <span className="text-sm text-muted-foreground mr-2">View:</span>
        <ToggleGroup type="single" value={value} onValueChange={(val) => val && onChange(val as ViewMode)}>
          <ToggleGroupItem 
            value="card" 
            aria-label="Grid View" 
            className="flex items-center gap-1 px-3 bg-transparent hover:bg-muted transition-colors"
            data-state={value === "card" ? "on" : "off"}
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="text-xs">Grid</span>
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="list" 
            aria-label="List View" 
            className="flex items-center gap-1 px-3 bg-transparent hover:bg-muted transition-colors"
            data-state={value === "list" ? "on" : "off"}
          >
            <List className="h-4 w-4" />
            <span className="text-xs">List</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Mobile version */}
      <div className="flex sm:hidden items-center">
        <ToggleGroup type="single" value={value} onValueChange={(val) => val && onChange(val as ViewMode)}>
          <ToggleGroupItem 
            value="card" 
            aria-label="Grid View" 
            className="flex items-center gap-1 px-2 py-1 bg-transparent hover:bg-muted transition-colors"
            data-state={value === "card" ? "on" : "off"}
          >
            <LayoutGrid className="h-3 w-3" />
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="list" 
            aria-label="List View" 
            className="flex items-center gap-1 px-2 py-1 bg-transparent hover:bg-muted transition-colors"
            data-state={value === "list" ? "on" : "off"}
          >
            <List className="h-3 w-3" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </>
  );
} 