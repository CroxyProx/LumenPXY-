import { type ProxyConnection, type InsertProxyConnection, type ProxySettings, type InsertProxySettings } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Proxy connections
  createConnection(connection: InsertProxyConnection): Promise<ProxyConnection>;
  getConnections(): Promise<ProxyConnection[]>;
  getConnectionsByStatus(status: string): Promise<ProxyConnection[]>;
  clearConnections(): Promise<void>;
  
  // Proxy settings
  getSettings(): Promise<ProxySettings | undefined>;
  updateSettings(settings: InsertProxySettings): Promise<ProxySettings>;
  createDefaultSettings(): Promise<ProxySettings>;
}

export class MemStorage implements IStorage {
  private connections: Map<string, ProxyConnection>;
  private settings: ProxySettings | undefined;

  constructor() {
    this.connections = new Map();
    this.settings = undefined;
  }

  async createConnection(insertConnection: InsertProxyConnection): Promise<ProxyConnection> {
    const id = randomUUID();
    const connection: ProxyConnection = {
      id,
      url: insertConnection.url,
      status: insertConnection.status,
      protocol: insertConnection.protocol,
      timestamp: new Date(),
      userAgent: insertConnection.userAgent || null,
      responseTime: insertConnection.responseTime || null,
    };
    this.connections.set(id, connection);
    return connection;
  }

  async getConnections(): Promise<ProxyConnection[]> {
    return Array.from(this.connections.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  async getConnectionsByStatus(status: string): Promise<ProxyConnection[]> {
    return Array.from(this.connections.values())
      .filter((conn) => conn.status === status)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async clearConnections(): Promise<void> {
    this.connections.clear();
  }

  async getSettings(): Promise<ProxySettings | undefined> {
    return this.settings;
  }

  async updateSettings(insertSettings: InsertProxySettings): Promise<ProxySettings> {
    const id = this.settings?.id || randomUUID();
    const updatedSettings: ProxySettings = {
      id,
      sslVerification: insertSettings.sslVerification ?? true,
      autoConnect: insertSettings.autoConnect ?? false,
      blockAds: insertSettings.blockAds ?? true,
      enableLogging: insertSettings.enableLogging ?? true,
      connectionTimeout: insertSettings.connectionTimeout ?? 10,
      maxConnections: insertSettings.maxConnections ?? 5,
      createdAt: this.settings?.createdAt || new Date(),
    };
    this.settings = updatedSettings;
    return updatedSettings;
  }

  async createDefaultSettings(): Promise<ProxySettings> {
    const defaultSettings: ProxySettings = {
      id: randomUUID(),
      sslVerification: true,
      autoConnect: false,
      blockAds: true,
      enableLogging: true,
      connectionTimeout: 10,
      maxConnections: 5,
      createdAt: new Date(),
    };
    this.settings = defaultSettings;
    return defaultSettings;
  }
}

export const storage = new MemStorage();
