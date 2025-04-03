import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LayoutGrid, List } from "lucide-react";

export type ViewMode = "card" | "list";

interface ViewToggleProps {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center">
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
  );
} 