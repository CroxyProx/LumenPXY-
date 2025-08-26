import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProxyConnection } from "@shared/schema";

interface ActivityLogProps {
  connections: ProxyConnection[];
  onClearLog: () => void;
  isClearing: boolean;
  isLoading: boolean;
}

export default function ActivityLog({ connections, onClearLog, isClearing, isLoading }: ActivityLogProps) {
  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'connected':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'disconnected':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'disconnected':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <i className="fas fa-list text-primary"></i>
            <span>Activity Log</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearLog}
            disabled={isClearing || connections.length === 0}
            data-testid="button-clear-log"
          >
            {isClearing ? (
              <i className="fas fa-spinner fa-spin mr-1"></i>
            ) : (
              <i className="fas fa-trash mr-1"></i>
            )}
            Clear
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3 p-3">
                  <Skeleton className="h-2 w-2 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
          ) : connections.length === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-history text-4xl text-muted-foreground mb-4"></i>
              <p className="text-muted-foreground">No activity yet</p>
              <p className="text-sm text-muted-foreground">Start browsing to see connection logs</p>
            </div>
          ) : (
            <div className="space-y-3">
              {connections.map((connection) => (
                <div
                  key={connection.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-md"
                  data-testid={`activity-entry-${connection.id}`}
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className={`w-2 h-2 rounded-full ${getStatusColor(connection.status)} animate-pulse`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate" title={connection.url}>
                        {connection.url}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(connection.timestamp)}
                        {connection.responseTime && (
                          <span className="ml-2">• {connection.responseTime}ms</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getStatusVariant(connection.status)} className="text-xs">
                      {connection.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground uppercase">
                      {connection.protocol}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
