import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QuickAccessProps {
  onConnect: (siteName: string) => void;
  onBrowse?: (siteName: string) => void;
}

export default function QuickAccess({ onConnect, onBrowse }: QuickAccessProps) {
  const popularSites = [
    { name: 'YouTube', icon: 'fab fa-youtube', color: 'text-red-500' },
    { name: 'Facebook', icon: 'fab fa-facebook', color: 'text-blue-600' },
    { name: 'Twitter', icon: 'fab fa-twitter', color: 'text-blue-400' },
    { name: 'Instagram', icon: 'fab fa-instagram', color: 'text-pink-500' },
    { name: 'Netflix', icon: 'fab fa-netflix', color: 'text-red-600' },
    { name: 'Spotify', icon: 'fab fa-spotify', color: 'text-green-500' },
    { name: 'Google', icon: 'fab fa-google', color: 'text-blue-500' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <i className="fas fa-star text-primary"></i>
          <span>Quick Access</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {popularSites.map((site) => (
            <div key={site.name} className="space-y-2">
              <Button
                variant="secondary"
                className="w-full h-16 flex flex-col items-center justify-center space-y-1 hover:scale-105 transition-all duration-200"
                onClick={() => onBrowse ? onBrowse(site.name) : onConnect(site.name)}
                data-testid={`button-quick-access-${site.name.toLowerCase()}`}
              >
                <i className={`${site.icon} text-xl ${site.color}`}></i>
                <span className="text-xs font-medium">{site.name}</span>
              </Button>
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-6 text-xs"
                  onClick={() => onConnect(site.name)}
                  data-testid={`button-test-${site.name.toLowerCase()}`}
                >
                  Test
                </Button>
                {onBrowse && (
                  <Button
                    size="sm"
                    variant="default"
                    className="flex-1 h-6 text-xs"
                    onClick={() => onBrowse(site.name)}
                    data-testid={`button-browse-${site.name.toLowerCase()}`}
                  >
                    Browse
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
