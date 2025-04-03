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
        <ToggleGroupItem value="card" aria-label="Card View" className="px-2">
          <LayoutGrid className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="list" aria-label="List View" className="px-2">
          <List className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
} 