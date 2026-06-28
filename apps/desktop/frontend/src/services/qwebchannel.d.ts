export interface QWebChannelTransport {
  send: (payload: string) => void;
  onmessage: (message: { data: string }) => void;
}

export interface QWebChannelChannel {
  objects: {
    [key: string]: unknown;
    webBridge?: {
      handleMessage: (jsonRpcRequest: string) => Promise<string>;
      eventNotification: {
        connect: (callback: (eventJson: string) => void) => void;
        disconnect: (callback: (eventJson: string) => void) => void;
      };
    };
  };
}

export class QWebChannel {
  constructor(transport: QWebChannelTransport, initCallback: (channel: QWebChannelChannel) => void);
  objects: QWebChannelChannel['objects'];
}
