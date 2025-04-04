import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LayoutGrid, List } from "lucide-react";
import { motion } from "framer-motion";

export type ViewMode = "card" | "list";

interface ViewToggleProps {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  // Framer Motion variants
  const iconVariants = {
    initial: { scale: 1 },
    active: { 
      scale: 1.1,
      transition: { type: "spring", stiffness: 500, damping: 15 }
    },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

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
            <motion.div
              variants={iconVariants}
              initial="initial"
              animate={value === "card" ? "active" : "initial"}
              whileHover="hover"
              whileTap="tap"
            >
              <LayoutGrid className="h-4 w-4" />
            </motion.div>
            <motion.span 
              className="text-xs"
              animate={{ 
                fontWeight: value === "card" ? 600 : 400,
                transition: { duration: 0.2 }
              }}
            >
              Grid
            </motion.span>
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="list" 
            aria-label="List View" 
            className="flex items-center gap-1 px-3 bg-transparent hover:bg-muted transition-colors"
            data-state={value === "list" ? "on" : "off"}
          >
            <motion.div
              variants={iconVariants}
              initial="initial"
              animate={value === "list" ? "active" : "initial"}
              whileHover="hover"
              whileTap="tap"
            >
              <List className="h-4 w-4" />
            </motion.div>
            <motion.span 
              className="text-xs"
              animate={{ 
                fontWeight: value === "list" ? 600 : 400,
                transition: { duration: 0.2 }
              }}
            >
              List
            </motion.span>
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
            <motion.div
              variants={iconVariants}
              initial="initial"
              animate={value === "card" ? "active" : "initial"}
              whileHover="hover"
              whileTap="tap"
            >
              <LayoutGrid className="h-3 w-3" />
            </motion.div>
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="list" 
            aria-label="List View" 
            className="flex items-center gap-1 px-2 py-1 bg-transparent hover:bg-muted transition-colors"
            data-state={value === "list" ? "on" : "off"}
          >
            <motion.div
              variants={iconVariants}
              initial="initial"
              animate={value === "list" ? "active" : "initial"}
              whileHover="hover"
              whileTap="tap"
            >
              <List className="h-3 w-3" />
            </motion.div>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </>
  );
} 