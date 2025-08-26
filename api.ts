import { apiRequest } from "./queryClient";
import type { ProxyConnection, ProxySettings, InsertProxySettings } from "@shared/schema";

export interface ProxyStatus {
  isOnline: boolean;
  proxyPort: number;
  activeConnections: number;
  settings: ProxySettings;
  recentConnectionsCount: number;
  uptime: number;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  proxyUrl: string;
}

export interface BrowseResult {
  success: boolean;
  message: string;
  proxyUrl: string;
  directAccess: string;
}

export const proxyApi = {
  // Get proxy connections
  getConnections: async (): Promise<ProxyConnection[]> => {
    const response = await apiRequest("GET", "/api/connections");
    return response.json();
  },

  // Clear proxy connections
  clearConnections: async (): Promise<void> => {
    await apiRequest("DELETE", "/api/connections");
  },

  // Get proxy settings
  getSettings: async (): Promise<ProxySettings> => {
    const response = await apiRequest("GET", "/api/settings");
    return response.json();
  },

  // Update proxy settings
  updateSettings: async (settings: InsertProxySettings): Promise<ProxySettings> => {
    const response = await apiRequest("PUT", "/api/settings", settings);
    return response.json();
  },

  // Test proxy connection
  testConnection: async (url: string): Promise<ConnectionTestResult> => {
    const response = await apiRequest("POST", "/api/test-connection", { url });
    return response.json();
  },

  // Browse website through proxy
  browseWebsite: async (url: string): Promise<BrowseResult> => {
    const response = await apiRequest("POST", "/api/browse", { url });
    return response.json();
  },

  // Get proxy status
  getStatus: async (): Promise<ProxyStatus> => {
    const response = await apiRequest("GET", "/api/status");
    return response.json();
  },
};
