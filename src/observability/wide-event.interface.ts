export interface WideEvent {
  timestamp: string;
  userType: 'guest';
  method: string;
  endpoint: string;
  statusCode: number;
  upstreamResponse?: unknown;
  responseToClient?: unknown;
  errorMessage?: string;
}
