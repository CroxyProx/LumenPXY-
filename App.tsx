import { Switch, Route, useRoute, Link } from "wouter";
import { ArrowLeft, Globe } from "lucide-react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/browse/:url*" component={ProxyBrowser} />
      <Route component={NotFound} />
    </Switch>
  );
}

// Simple proxy browser component
function ProxyBrowser() {
  const [, params] = useRoute("/browse/:url*");
  const url = params?.url ? decodeURIComponent(params.url) : '';
  
  if (!url) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid URL</h1>
          <p className="text-muted-foreground">No URL provided for browsing.</p>
        </div>
      </div>
    );
  }
  
  const proxyUrl = `http://localhost:8001/${url}`;
  
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2 text-primary hover:text-primary/80">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Proxy</span>
          </Link>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Globe className="h-4 w-4" />
            <span>Browsing: {url}</span>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="bg-card border border-border rounded-lg overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
          <iframe
            src={proxyUrl}
            className="w-full h-full border-0"
            title={`Proxied: ${url}`}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-navigation"
          />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
