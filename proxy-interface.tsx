import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";

interface ProxyInterfaceProps {
  onConnect: (url: string) => void;
  isConnecting: boolean;
  onBrowse?: (url: string) => void;
}

export default function ProxyInterface({ onConnect, isConnecting, onBrowse }: ProxyInterfaceProps) {
  const [url, setUrl] = useState("");
  const [protocol, setProtocol] = useState("https");
  const [bypassRestrictions, setBypassRestrictions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    
    let fullUrl = url.trim();
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
      fullUrl = `${protocol}://${fullUrl}`;
    }
    
    onConnect(fullUrl);
  };

  return (
    <div className="mb-8">
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-end space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex-1 w-full">
                <Label htmlFor="url-input" className="text-sm font-medium">
                  Enter Website URL
                </Label>
                <div className="relative mt-2">
                  <Input
                    id="url-input"
                    type="url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="pr-10"
                    data-testid="input-url"
                  />
                  <i className="fas fa-globe absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  type="submit" 
                  disabled={isConnecting || !url.trim()}
                  variant="outline"
                  data-testid="button-connect"
                >
                  {isConnecting ? (
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                  ) : (
                    <i className="fas fa-arrow-right mr-2"></i>
                  )}
                  {isConnecting ? 'Testing...' : 'Test'}
                </Button>
                
                {onBrowse && (
                  <Button 
                    type="button"
                    variant="default"
                    disabled={isConnecting || !url.trim()}
                    onClick={() => {
                      if (!url.trim()) return;
                      let fullUrl = url.trim();
                      if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
                        fullUrl = `${protocol}://${fullUrl}`;
                      }
                      onBrowse(fullUrl);
                    }}
                    data-testid="button-browse"
                  >
                    <i className="fas fa-external-link-alt mr-2"></i>
                    Browse
                  </Button>
                )}
              </div>
            </div>
            
            {/* Protocol Selection */}
            <div className="flex flex-wrap items-center gap-6">
              <RadioGroup
                value={protocol}
                onValueChange={setProtocol}
                className="flex items-center space-x-6"
                data-testid="radio-group-protocol"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="http" id="http" />
                  <Label htmlFor="http" className="text-sm">HTTP</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="https" id="https" />
                  <Label htmlFor="https" className="text-sm">HTTPS (SSL/TLS)</Label>
                </div>
              </RadioGroup>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="bypass"
                  checked={bypassRestrictions}
                  onCheckedChange={(checked) => setBypassRestrictions(!!checked)}
                  data-testid="checkbox-bypass"
                />
                <Label htmlFor="bypass" className="text-sm">Bypass restrictions</Label>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
