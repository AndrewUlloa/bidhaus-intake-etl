"use client";

import * as React from "react";
import { Moon, Sun, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/ThemeProvider";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const iconVariants = {
    initial: { scale: 0.8, opacity: 0, rotate: -30 },
    animate: { 
      scale: 1, 
      opacity: 1, 
      rotate: 0,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 15
      }
    },
    exit: { 
      scale: 0.8, 
      opacity: 0,
      rotate: 30,
      transition: { duration: 0.15 }
    }
  };

  const dropdownItemVariants = {
    initial: { y: -5, opacity: 0 },
    animate: (i: number) => ({ 
      y: 0, 
      opacity: 1,
      transition: { 
        delay: i * 0.05,
        duration: 0.2
      }
    }),
    hover: { 
      backgroundColor: "var(--muted)",
      transition: { duration: 0.1 }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative h-9 w-9">
          <motion.div 
            className="absolute" 
            animate={theme === "light" ? "animate" : "exit"} 
            variants={iconVariants}
            initial="initial"
          >
            <Sun className="h-5 w-5" />
          </motion.div>
          <motion.div 
            className="absolute" 
            animate={theme === "dark" ? "animate" : "exit"} 
            variants={iconVariants}
            initial="initial"
          >
            <Moon className="h-5 w-5" />
          </motion.div>
          <motion.div 
            className="absolute" 
            animate={theme === "system" ? "animate" : "exit"} 
            variants={iconVariants}
            initial="initial"
          >
            <Laptop className="h-5 w-5" />
          </motion.div>
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <motion.div
          custom={0}
          variants={dropdownItemVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
        >
          <DropdownMenuItem onClick={() => setTheme("light")} className="flex gap-2 items-center">
            <Sun className="h-4 w-4" />
            <span>Light</span>
          </DropdownMenuItem>
        </motion.div>
        <motion.div
          custom={1}
          variants={dropdownItemVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
        >
          <DropdownMenuItem onClick={() => setTheme("dark")} className="flex gap-2 items-center">
            <Moon className="h-4 w-4" />
            <span>Dark</span>
          </DropdownMenuItem>
        </motion.div>
        <motion.div
          custom={2}
          variants={dropdownItemVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
        >
          <DropdownMenuItem onClick={() => setTheme("system")} className="flex gap-2 items-center">
            <Laptop className="h-4 w-4" />
            <span>System</span>
          </DropdownMenuItem>
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 