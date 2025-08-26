import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProxyStatus } from "@/lib/api";

interface ConnectionStatusProps {
  status: ProxyStatus | undefined;
  isLoading: boolean;
}

export default function ConnectionStatus({ status, isLoading }: ConnectionStatusProps) {
  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <i className="fas fa-wifi text-primary"></i>
          <span>Connection Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    status?.isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                  }`} />
                  <Badge variant={status?.isOnline ? "default" : "destructive"}>
                    {status?.isOnline ? 'Online' : 'Offline'}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Proxy Port</span>
                <span className="text-sm font-mono text-foreground" data-testid="text-proxy-port">
                  {status?.proxyPort || 'N/A'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Connections</span>
                <span className="text-sm font-medium text-foreground" data-testid="text-active-connections">
                  {status?.activeConnections || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Encryption</span>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-shield-alt text-green-500 text-xs"></i>
                  <span className="text-sm font-medium text-green-600">SSL/TLS</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Recent Connections</span>
                <span className="text-sm font-medium text-foreground" data-testid="text-recent-connections">
                  {status?.recentConnectionsCount || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Uptime</span>
                <span className="text-sm font-medium text-foreground" data-testid="text-uptime">
                  {status?.uptime ? formatUptime(status.uptime) : 'N/A'}
                </span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
