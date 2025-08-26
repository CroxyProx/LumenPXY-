import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { proxyApi } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import type { InsertProxySettings } from "@shared/schema";

interface ProxySettingsProps {
  onSettingsChange: () => void;
}

export default function ProxySettings({ onSettingsChange }: ProxySettingsProps) {
  const { toast } = useToast();
  
  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/settings"],
    queryFn: () => proxyApi.getSettings(),
  });

  const [localSettings, setLocalSettings] = useState<InsertProxySettings>({
    sslVerification: true,
    autoConnect: false,
    blockAds: true,
    enableLogging: true,
    connectionTimeout: 10,
    maxConnections: 5,
  });

  // Update local settings when data is loaded
  useState(() => {
    if (settings) {
      setLocalSettings({
        sslVerification: settings.sslVerification,
        autoConnect: settings.autoConnect,
        blockAds: settings.blockAds,
        enableLogging: settings.enableLogging,
        connectionTimeout: settings.connectionTimeout,
        maxConnections: settings.maxConnections,
      });
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (newSettings: InsertProxySettings) => proxyApi.updateSettings(newSettings),
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Proxy settings have been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      onSettingsChange();
    },
    onError: (error: any) => {
      toast({
        title: "Settings Update Failed",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const handleSettingChange = (key: keyof InsertProxySettings, value: any) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    updateSettingsMutation.mutate(newSettings);
  };

  const handleResetSettings = () => {
    const defaultSettings: InsertProxySettings = {
      sslVerification: true,
      autoConnect: false,
      blockAds: true,
      enableLogging: true,
      connectionTimeout: 10,
      maxConnections: 5,
    };
    setLocalSettings(defaultSettings);
    updateSettingsMutation.mutate(defaultSettings);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <i className="fas fa-sliders-h text-primary"></i>
          <span>Proxy Settings</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-12" />
                </div>
              ))}
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <Label className="text-sm text-foreground flex items-center space-x-2">
                  <span>SSL Verification</span>
                  <i className="fas fa-info-circle text-muted-foreground text-xs cursor-help" title="Verify SSL certificates" />
                </Label>
                <Switch
                  checked={localSettings.sslVerification}
                  onCheckedChange={(checked) => handleSettingChange('sslVerification', checked)}
                  disabled={updateSettingsMutation.isPending}
                  data-testid="switch-ssl-verification"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm text-foreground">Auto-Connect</Label>
                <Switch
                  checked={localSettings.autoConnect}
                  onCheckedChange={(checked) => handleSettingChange('autoConnect', checked)}
                  disabled={updateSettingsMutation.isPending}
                  data-testid="switch-auto-connect"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm text-foreground">Block Ads</Label>
                <Switch
                  checked={localSettings.blockAds}
                  onCheckedChange={(checked) => handleSettingChange('blockAds', checked)}
                  disabled={updateSettingsMutation.isPending}
                  data-testid="switch-block-ads"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm text-foreground">Enable Logging</Label>
                <Switch
                  checked={localSettings.enableLogging}
                  onCheckedChange={(checked) => handleSettingChange('enableLogging', checked)}
                  disabled={updateSettingsMutation.isPending}
                  data-testid="switch-enable-logging"
                />
              </div>
              
              <div>
                <Label className="text-sm text-foreground block mb-2">Connection Timeout</Label>
                <Select
                  value={localSettings.connectionTimeout?.toString() || "10"}
                  onValueChange={(value) => handleSettingChange('connectionTimeout', parseInt(value))}
                  disabled={updateSettingsMutation.isPending}
                >
                  <SelectTrigger data-testid="select-connection-timeout">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 seconds</SelectItem>
                    <SelectItem value="10">10 seconds</SelectItem>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">60 seconds</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm text-foreground block mb-2">Max Connections</Label>
                <Input
                  type="number"
                  value={localSettings.maxConnections}
                  onChange={(e) => handleSettingChange('maxConnections', parseInt(e.target.value) || 1)}
                  min="1"
                  max="20"
                  disabled={updateSettingsMutation.isPending}
                  data-testid="input-max-connections"
                />
              </div>
              
              <Button
                variant="secondary"
                className="w-full"
                onClick={handleResetSettings}
                disabled={updateSettingsMutation.isPending}
                data-testid="button-reset-settings"
              >
                {updateSettingsMutation.isPending ? (
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                ) : (
                  <i className="fas fa-undo mr-2"></i>
                )}
                Reset to Default
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
