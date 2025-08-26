import http from 'http';
import https from 'https';
import net from 'net';
import url from 'url';
import { storage } from './storage';

export interface ProxyServerOptions {
  enableLogging?: boolean;
  connectionTimeout?: number;
  maxConnections?: number;
  sslVerification?: boolean;
}

export class ProxyServer {
  private server: http.Server;
  private activeConnections: Set<net.Socket>;
  private options: ProxyServerOptions;

  constructor(options: ProxyServerOptions = {}) {
    this.activeConnections = new Set();
    this.options = {
      enableLogging: true,
      connectionTimeout: 10000,
      maxConnections: 5,
      sslVerification: true,
      ...options,
    };

    this.server = http.createServer(this.handleHttpRequest.bind(this));
    this.server.on('connect', this.handleConnect.bind(this));
    this.server.on('connection', this.handleConnection.bind(this));
  }

  private handleConnection(socket: net.Socket) {
    this.activeConnections.add(socket);
    socket.on('close', () => {
      this.activeConnections.delete(socket);
    });

    // Set connection timeout
    socket.setTimeout(this.options.connectionTimeout || 10000, () => {
      socket.destroy();
    });
  }

  private async handleHttpRequest(req: http.IncomingMessage, res: http.ServerResponse) {
    if (!req.url) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Bad Request: No URL provided');
      return;
    }

    let targetUrl: URL;
    let targetUrlString: string;
    const startTime = Date.now();

    // Handle different proxy URL formats
    if (req.url.startsWith('/http://') || req.url.startsWith('/https://')) {
      // Path-based proxy request (e.g., /https://example.com)
      targetUrlString = req.url.substring(1);
    } else if (req.url === '/' || req.url === '/favicon.ico' || req.url.startsWith('/api/')) {
      // Handle non-proxy requests with a simple response or API pass-through
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>LumenPXY Server</title>
          <meta charset="UTF-8">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              max-width: 800px; 
              margin: 50px auto; 
              padding: 20px;
              background: #f5f5f5;
            }
            .container { 
              background: white; 
              padding: 30px; 
              border-radius: 10px; 
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 { color: #333; margin-bottom: 20px; }
            .status { 
              background: #e8f5e8; 
              padding: 15px; 
              border-radius: 5px; 
              margin: 20px 0;
              border-left: 4px solid #4CAF50;
            }
            .info { 
              background: #f0f8ff; 
              padding: 15px; 
              border-radius: 5px; 
              margin: 20px 0;
              border-left: 4px solid #2196F3;
            }
            ul { margin-left: 20px; }
            li { margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🛡️ LumenPXY Proxy Server</h1>
            <div class="status">
              <strong>✅ Status:</strong> Proxy server is running on port 8001
            </div>
            
            <h2>How to use this proxy:</h2>
            <div class="info">
              <strong>Option 1: Web Interface</strong><br>
              Use the web interface at <a href="http://localhost:5000" target="_blank">http://localhost:5000</a> and click "Browse" buttons
            </div>
            
            <div class="info">
              <strong>Option 2: Browser Configuration</strong><br>
              Configure your browser to use <code>localhost:8001</code> as HTTP proxy
            </div>
            
            <div class="info">
              <strong>Option 3: Direct URL Access</strong><br>
              Access URLs like: <code>http://localhost:8001/https://example.com</code>
            </div>

            <h2>Supported Features:</h2>
            <ul>
              <li>HTTP and HTTPS website proxying</li>
              <li>SSL/TLS tunneling with CONNECT method</li>
              <li>Real-time connection logging</li>
              <li>Configurable security settings</li>
            </ul>
          </div>
        </body>
        </html>
      `);
      return;
    } else {
      // Default to HTTP for plain requests
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Bad Request: Please provide a full URL starting with /http:// or /https://');
      return;
    }

    try {
      targetUrl = new URL(targetUrlString);

      // Create request to target server
      const requestModule = targetUrl.protocol === 'https:' ? https : http;
      const proxyReq = requestModule.request({
        hostname: targetUrl.hostname,
        port: targetUrl.port || (targetUrl.protocol === 'https:' ? 443 : 80),
        path: targetUrl.pathname + targetUrl.search,
        method: req.method,
        headers: {
          ...req.headers,
          host: targetUrl.host,
        },
        rejectUnauthorized: false, // Disable SSL verification for broader compatibility
      });

      proxyReq.on('response', (proxyRes) => {
        const responseTime = Date.now() - startTime;
        
        // Log connection if enabled
        if (this.options.enableLogging) {
          storage.createConnection({
            url: targetUrlString,
            status: 'connected',
            protocol: targetUrl.protocol.replace(':', ''),
            userAgent: req.headers['user-agent'],
            responseTime,
          });
        }

        // Check if this is HTML content that needs URL rewriting
        const contentType = proxyRes.headers['content-type'] || '';
        const isHtml = contentType.includes('text/html');
        
        if (isHtml && req.url?.startsWith('/http')) {
          // For HTML content, we need to rewrite URLs
          let body = '';
          proxyRes.setEncoding('utf8');
          
          proxyRes.on('data', (chunk) => {
            body += chunk;
          });
          
          proxyRes.on('end', () => {
            // Basic URL rewriting for HTML content
            const rewrittenBody = this.rewriteHtmlUrls(body, targetUrl);
            
            // Update headers
            const headers = { ...proxyRes.headers };
            delete headers['content-length']; // Will be recalculated
            headers['content-length'] = Buffer.byteLength(rewrittenBody, 'utf8').toString();
            
            res.writeHead(proxyRes.statusCode || 200, headers);
            res.end(rewrittenBody);
          });
        } else {
          // For non-HTML content, just pipe through
          res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
          proxyRes.pipe(res);
        }
      });

      proxyReq.on('error', (err) => {
        console.error('Proxy request error:', err);
        
        if (this.options.enableLogging) {
          storage.createConnection({
            url: targetUrlString,
            status: 'failed',
            protocol: targetUrl.protocol.replace(':', ''),
            userAgent: req.headers['user-agent'],
            responseTime: Date.now() - startTime,
          });
        }

        if (!res.headersSent) {
          res.writeHead(502, { 'Content-Type': 'text/plain' });
          res.end('Bad Gateway: Could not connect to target server');
        }
      });

      req.pipe(proxyReq);
    } catch (error) {
      console.error('URL parsing error:', error);
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Bad Request: Invalid URL');
    }
  }

  private async handleConnect(req: http.IncomingMessage, clientSocket: net.Socket, head: Buffer) {
    const { port, hostname } = url.parse(`http://${req.url}`);
    const targetPort = parseInt(port || '443');
    const startTime = Date.now();

    // Security check: only allow specific ports
    const allowedPorts = [443, 8443, 993, 995];
    if (!allowedPorts.includes(targetPort)) {
      clientSocket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
      clientSocket.end();
      return;
    }

    console.log(`CONNECT ${hostname}:${targetPort}`);

    try {
      // Create connection to target server
      const serverSocket = net.connect(targetPort, hostname!, () => {
        const responseTime = Date.now() - startTime;
        
        // Send 200 Connection Established
        clientSocket.write('HTTP/1.1 200 Connection Established\r\n' +
                          'Proxy-agent: LumenPXY\r\n' +
                          '\r\n');

        // Forward the initial data
        serverSocket.write(head);

        // Log successful connection
        if (this.options.enableLogging) {
          storage.createConnection({
            url: `https://${hostname}:${targetPort}`,
            status: 'connected',
            protocol: 'https',
            userAgent: req.headers['user-agent'],
            responseTime,
          });
        }

        // Bidirectional pipe
        serverSocket.pipe(clientSocket, { end: false });
        clientSocket.pipe(serverSocket, { end: false });
      });

      serverSocket.on('error', (err) => {
        console.error('Server socket error:', err);
        
        if (this.options.enableLogging) {
          storage.createConnection({
            url: `https://${hostname}:${targetPort}`,
            status: 'failed',
            protocol: 'https',
            userAgent: req.headers['user-agent'],
            responseTime: Date.now() - startTime,
          });
        }

        clientSocket.end();
      });

      clientSocket.on('error', (err) => {
        console.error('Client socket error:', err);
        serverSocket.end();
      });

      // Set timeouts
      serverSocket.setTimeout(this.options.connectionTimeout || 10000, () => {
        serverSocket.destroy();
        clientSocket.end();
      });

      clientSocket.setTimeout(this.options.connectionTimeout || 10000, () => {
        clientSocket.destroy();
        serverSocket.end();
      });

    } catch (error) {
      console.error('CONNECT error:', error);
      clientSocket.write('HTTP/1.1 500 Connection Failed\r\n\r\n');
      clientSocket.end();
    }
  }

  public listen(port: number, callback?: () => void) {
    this.server.listen(port, '0.0.0.0', callback);
  }

  public updateOptions(options: Partial<ProxyServerOptions>) {
    this.options = { ...this.options, ...options };
  }

  public getActiveConnectionsCount(): number {
    return this.activeConnections.size;
  }

  public close(callback?: () => void) {
    this.server.close(callback);
  }

  private rewriteHtmlUrls(html: string, baseUrl: URL): string {
    const proxyBase = `http://localhost:8001`;
    
    // Rewrite various URL patterns to go through our proxy
    let rewritten = html;
    
    // Rewrite absolute URLs in href and src attributes
    rewritten = rewritten.replace(
      /(href|src|action)=["']https?:\/\/[^"']+["']/gi,
      (match) => {
        const url = match.match(/["'](https?:\/\/[^"']+)["']/)?.[1];
        if (url) {
          return match.replace(url, `${proxyBase}/${url}`);
        }
        return match;
      }
    );

    // Rewrite relative URLs to be absolute through proxy
    rewritten = rewritten.replace(
      /(href|src|action)=["']\/[^"']*["']/gi,
      (match) => {
        const path = match.match(/["'](\/?[^"']+)["']/)?.[1];
        if (path && !path.startsWith('//')) {
          const absoluteUrl = new URL(path, baseUrl).href;
          return match.replace(path, `${proxyBase}/${absoluteUrl}`);
        }
        return match;
      }
    );

    // Add a base tag to handle relative URLs
    const baseTag = `<base href="${proxyBase}/${baseUrl.origin}/">`;
    if (rewritten.includes('<head>')) {
      rewritten = rewritten.replace('<head>', `<head>${baseTag}`);
    } else if (rewritten.includes('<HEAD>')) {
      rewritten = rewritten.replace('<HEAD>', `<HEAD>${baseTag}`);
    }

    return rewritten;
  }
}
