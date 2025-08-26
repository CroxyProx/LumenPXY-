import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { proxyApi } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ProxyInterface from "@/components/proxy-interface";
import QuickAccess from "@/components/quick-access";
import ActivityLog from "@/components/activity-log";
import ConnectionStatus from "@/components/connection-status";
import ProxySettings from "@/components/proxy-settings";
import SecurityInfo from "@/components/security-info";

export default function Home() {
  const { toast } = useToast();
  const [showSettings, setShowSettings] = useState(false);

  // Fetch proxy status
  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ["/api/status"],
    queryFn: () => proxyApi.getStatus(),
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Fetch connections
  const { data: connections = [], isLoading: connectionsLoading } = useQuery({
    queryKey: ["/api/connections"],
    queryFn: () => proxyApi.getConnections(),
    refetchInterval: 2000, // Refresh every 2 seconds
  });

  // Test connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: (url: string) => proxyApi.testConnection(url),
    onSuccess: (data) => {
      toast({
        title: "Connection Test",
        description: data.message,
      });
      // Refresh connections after test
      queryClient.invalidateQueries({ queryKey: ["/api/connections"] });
    },
    onError: (error: any) => {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to test connection",
        variant: "destructive",
      });
    },
  });

  // Browse website mutation
  const browseWebsiteMutation = useMutation({
    mutationFn: (url: string) => proxyApi.browseWebsite(url),
    onSuccess: (data) => {
      // Navigate to in-app browser
      const encodedUrl = encodeURIComponent(data.proxyUrl.replace('http://localhost:8001/', ''));
      window.location.href = `/browse/${encodedUrl}`;
      
      toast({
        title: "Opening Website",
        description: "Loading website through proxy...",
      });
      
      // Refresh connections after browsing
      queryClient.invalidateQueries({ queryKey: ["/api/connections"] });
    },
    onError: (error: any) => {
      toast({
        title: "Browse Failed",
        description: error.message || "Failed to open website through proxy",
        variant: "destructive",
      });
    },
  });

  // Clear connections mutation
  const clearConnectionsMutation = useMutation({
    mutationFn: () => proxyApi.clearConnections(),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Activity log cleared",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/connections"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to clear activity log",
        variant: "destructive",
      });
    },
  });

  const handleConnect = (url: string) => {
    testConnectionMutation.mutate(url);
  };

  const handleQuickConnect = (siteName: string) => {
    const siteUrls: { [key: string]: string } = {
      'YouTube': 'https://www.youtube.com',
      'Facebook': 'https://www.facebook.com',
      'Twitter': 'https://www.twitter.com',
      'Instagram': 'https://www.instagram.com',
      'Netflix': 'https://www.netflix.com',
      'Spotify': 'https://www.spotify.com',
      'Google': 'https://www.google.com',
    };
    
    const url = siteUrls[siteName];
    if (url) {
      handleConnect(url);
    }
  };

  const handleQuickBrowse = (siteName: string) => {
    const siteUrls: { [key: string]: string } = {
      'YouTube': 'https://www.youtube.com',
      'Facebook': 'https://www.facebook.com',
      'Twitter': 'https://www.twitter.com',
      'Instagram': 'https://www.instagram.com',
      'Netflix': 'https://www.netflix.com',
      'Spotify': 'https://www.spotify.com',
      'Google': 'https://www.google.com',
    };
    
    const url = siteUrls[siteName];
    if (url) {
      handleBrowse(url);
    }
  };

  const handleBrowse = (url: string) => {
    browseWebsiteMutation.mutate(url);
  };

  const handleClearLog = () => {
    clearConnectionsMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <i className="fas fa-shield-alt text-primary text-2xl"></i>
                <h1 className="text-xl font-bold text-foreground">LumenPXY</h1>
              </div>
              <span className="text-sm text-muted-foreground hidden sm:inline">Advanced Web Proxy</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div 
                  className={`w-2 h-2 rounded-full ${
                    status?.isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                  }`}
                />
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {statusLoading ? 'Checking...' : status?.isOnline ? 'Connected' : 'Offline'}
                </span>
              </div>
              
              <button 
                className="p-2 hover:bg-secondary rounded-md transition-colors"
                onClick={() => setShowSettings(!showSettings)}
                data-testid="button-toggle-settings"
              >
                <i className="fas fa-cog text-muted-foreground"></i>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Proxy Interface */}
        <ProxyInterface 
          onConnect={handleConnect}
          isConnecting={testConnectionMutation.isPending}
          onBrowse={handleBrowse}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <QuickAccess onConnect={handleQuickConnect} onBrowse={handleQuickBrowse} />
            <ActivityLog 
              connections={connections}
              onClearLog={handleClearLog}
              isClearing={clearConnectionsMutation.isPending}
              isLoading={connectionsLoading}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <ConnectionStatus status={status} isLoading={statusLoading} />
            {showSettings && (
              <ProxySettings 
                onSettingsChange={() => {
                  queryClient.invalidateQueries({ queryKey: ["/api/status"] });
                }}
              />
            )}
            <SecurityInfo />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 py-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">LumenPXY</h4>
              <p className="text-xs text-muted-foreground max-w-md">
                Advanced web proxy server with SSL tunneling support, designed for secure and anonymous browsing. 
                Access blocked content safely with enterprise-grade encryption.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
              <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Support</a>
              <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Documentation</a>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">© 2025 LumenPXY. Built with modern web standards for secure proxy access.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
