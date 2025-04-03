import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface DetectionSettings {
  vendorRegex: string;
  phoneRegex: string;
  watermarkThreshold: number;
  enableImageScanning: boolean;
  customRegexPatterns: string;
}

const defaultSettings: DetectionSettings = {
  vendorRegex: "\\b(company|vendor|store|consignor|seller)\\b",
  phoneRegex: "\\b\\d{3}[-.]?\\d{3}[-.]?\\d{4}\\b",
  watermarkThreshold: 50,
  enableImageScanning: true,
  customRegexPatterns: ""
};

interface DetectionSettingsFormProps {
  onSaveSettings: (settings: DetectionSettings) => void;
  initialSettings?: Partial<DetectionSettings>;
}

export function DetectionSettingsForm({ 
  onSaveSettings, 
  initialSettings = {} 
}: DetectionSettingsFormProps) {
  const [settings, setSettings] = useState<DetectionSettings>({
    ...defaultSettings,
    ...initialSettings
  });

  const handleChange = (field: keyof DetectionSettings, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(settings);
    toast.success("Settings saved successfully");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-3">
        <Label htmlFor="vendorRegex">Vendor Name Pattern</Label>
        <Input 
          id="vendorRegex" 
          value={settings.vendorRegex} 
          onChange={(e) => handleChange("vendorRegex", e.target.value)}
          placeholder="Regular expression to detect vendor names" 
        />
        <p className="text-xs text-muted-foreground">
          Example: \b(company|vendor|store)\b
        </p>
      </div>
      
      <div className="grid gap-3">
        <Label htmlFor="phoneRegex">Phone Number Pattern</Label>
        <Input 
          id="phoneRegex" 
          value={settings.phoneRegex}
          onChange={(e) => handleChange("phoneRegex", e.target.value)}
          placeholder="Regular expression to detect phone numbers" 
        />
        <p className="text-xs text-muted-foreground">
          Example: \b\d{3}[-.]?\d{3}[-.]?\d{4}\b
        </p>
      </div>
      
      <div className="grid gap-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="watermarkThreshold">Watermark Detection Threshold</Label>
          <span className="text-sm">{settings.watermarkThreshold}%</span>
        </div>
        <Input 
          id="watermarkThreshold" 
          type="range" 
          min="0" 
          max="100" 
          value={settings.watermarkThreshold}
          onChange={(e) => handleChange("watermarkThreshold", parseInt(e.target.value))}
        />
        <p className="text-xs text-muted-foreground">
          Higher values mean stricter detection (more false negatives, fewer false positives)
        </p>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch 
          id="enableImageScanning" 
          checked={settings.enableImageScanning}
          onCheckedChange={(checked) => handleChange("enableImageScanning", checked)}
        />
        <Label htmlFor="enableImageScanning">Enable Image Watermark Scanning</Label>
      </div>
      
      <div className="grid gap-3">
        <Label htmlFor="customRegexPatterns">Custom Regex Patterns</Label>
        <Textarea 
          id="customRegexPatterns" 
          value={settings.customRegexPatterns}
          onChange={(e) => handleChange("customRegexPatterns", e.target.value)}
          placeholder="Add custom regex patterns, one per line"
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          Add custom patterns to detect specific issues in your product descriptions
        </p>
      </div>
      
      <Button type="submit" className="w-full">Save Settings</Button>
    </form>
  );
} 