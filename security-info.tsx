import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SecurityInfo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <i className="fas fa-lock text-primary"></i>
          <span>Security Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
            <i className="fas fa-shield-alt text-green-500 mt-0.5"></i>
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-200">SSL/TLS Active</p>
              <p className="text-xs text-green-600 dark:text-green-300">Your connection is encrypted and secure</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <i className="fas fa-eye-slash text-blue-500 mt-0.5"></i>
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Anonymous Browsing</p>
              <p className="text-xs text-blue-600 dark:text-blue-300">Your real IP address is hidden</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-md">
            <i className="fas fa-server text-orange-500 mt-0.5"></i>
            <div>
              <p className="text-sm font-medium text-orange-800 dark:text-orange-200">HTTPS Tunneling</p>
              <p className="text-xs text-orange-600 dark:text-orange-300">Using CONNECT method for secure tunneling</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Certificate Valid Until</span>
            <Badge variant="outline" className="font-mono text-xs" data-testid="text-cert-expiry">
              Dec 31, 2024
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
