import type {
  ClientApi,
  Project,
  Scan,
  Issue,
  ScanStartedEvent,
  IssueFoundEvent,
  ScanCompletedEvent,
} from './clientApi';
import { QWebChannel } from './qwebchannel';

export type ScanProgressEvent =
  ScanStartedEvent | IssueFoundEvent | ScanCompletedEvent | { type: 'progress'; progress: number };

export interface WebBridge {
  handleMessage: (jsonRpcRequest: string) => Promise<string>;
  eventNotification: {
    connect: (callback: (eventJson: string) => void) => void;
    disconnect: (callback: (eventJson: string) => void) => void;
  };
}

// Declaring the window extension for Qt QWebEngine
declare global {
  interface Window {
    qt?: {
      webChannelTransport: {
        send: (payload: string) => void;
        onmessage: (message: { data: string }) => void;
      };
    };
    webBridge?: WebBridge;
  }
}

export class QtBridgeClient implements ClientApi {
  private channelPromise: Promise<WebBridge>;
  private scanProgressCallbacks: Map<string, Array<(event: ScanProgressEvent) => void>> = new Map();

  constructor() {
    this.channelPromise = this.initChannel();
  }

  private initChannel(): Promise<WebBridge> {
    return new Promise((resolve, reject) => {
      if (typeof window.qt === 'undefined') {
        reject(new Error('Qt WebEngine environment not found.'));
        return;
      }

      new QWebChannel(window.qt.webChannelTransport, (channel) => {
        const webBridge = channel.objects.webBridge as WebBridge | undefined;
        if (!webBridge) {
          reject(new Error('WebBridge not found on channel objects.'));
          return;
        }
        window.webBridge = webBridge;

        // Register the eventNotification signal listener
        if (webBridge.eventNotification) {
          webBridge.eventNotification.connect((eventJson: string) => {
            try {
              const event = JSON.parse(eventJson) as ScanProgressEvent;
              this.handleEvent(event);
            } catch (err) {
              // eslint-disable-next-line no-console
              console.error('Failed to parse eventNotification JSON:', err);
            }
          });
        }

        resolve(webBridge);
      });
    });
  }

  private handleEvent(event: unknown) {
    if (typeof event === 'object' && event !== null && 'scanId' in event) {
      const scanId = (event as { scanId?: string }).scanId;
      if (!scanId) return;

      const callbacks = this.scanProgressCallbacks.get(scanId);
      if (callbacks) {
        for (const cb of callbacks) {
          cb(event as ScanProgressEvent);
        }
      }
    }
  }

  private async callBridge<T>(method: string, params: Record<string, unknown> = {}): Promise<T> {
    const bridge = await this.channelPromise;
    const request = {
      jsonrpc: '2.0',
      id: Math.floor(Math.random() * 1000000).toString(),
      method,
      params,
    };

    const responseStr = await bridge.handleMessage(JSON.stringify(request));
    const response = JSON.parse(responseStr) as {
      error?: { message?: string; code?: number };
      result: T;
    };

    if (response.error) {
      throw new Error(response.error.message || `JSON-RPC error: ${response.error.code}`);
    }

    return response.result;
  }

  async OpenProject(path: string): Promise<Project> {
    return this.callBridge<Project>('OpenProject', { path });
  }

  async RunScan(projectId: string, onProgress?: (event: ScanProgressEvent) => void): Promise<Scan> {
    const scan = await this.callBridge<Scan>('RunScan', { projectId });

    if (onProgress) {
      const scanId = scan.id;
      if (!this.scanProgressCallbacks.has(scanId)) {
        this.scanProgressCallbacks.set(scanId, []);
      }
      this.scanProgressCallbacks.get(scanId)!.push(onProgress);
    }

    return scan;
  }

  async GetIssues(projectId: string): Promise<Issue[]> {
    return this.callBridge<Issue[]>('GetIssues', { projectId });
  }

  async ApplyAutofix(issueId: string): Promise<boolean> {
    return this.callBridge<boolean>('ApplyAutofix', { issueId });
  }

  async GetProjectSummary(projectId: string): Promise<Project> {
    return this.callBridge<Project>('GetProjectSummary', { projectId });
  }

  async GetProjects(): Promise<Project[]> {
    return this.callBridge<Project[]>('GetProjects');
  }
}
