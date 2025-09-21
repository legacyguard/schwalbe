
/**
 * Google API Type Definitions
 * TypeScript interfaces for Google APIs used in the application
 */

export interface GoogleAuthUser {
  getAuthResponse(): GoogleAuthResponse;
  getBasicProfile(): GoogleBasicProfile;
  getId(): string;
}

export interface GoogleAuthResponse {
  access_token: string;
  expires_at: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
}

export interface GoogleBasicProfile {
  getEmail(): string;
  getFamilyName(): string;
  getGivenName(): string;
  getId(): string;
  getImageUrl(): string;
  getName(): string;
}

export interface GoogleAuthInstance {
  currentUser: {
    get(): GoogleAuthUser;
  };
  isSignedIn: {
    get(): boolean;
    listen(listener: (isSignedIn: boolean) => void): void;
  };
  signIn(): Promise<GoogleAuthUser>;
  signOut(): Promise<void>;
}

export interface GoogleAPI {
  auth2: {
    getAuthInstance(): GoogleAuthInstance;
    init(config: GoogleAuthInitConfig): Promise<void>;
  };
  client: {
    gmail: {
      users: {
        messages: {
          attachments: {
            get(
              params: GmailAttachmentParams
            ): Promise<GmailAttachmentResponse>;
          };
          get(params: GmailGetParams): Promise<GmailGetResponse>;
          list(params: GmailListParams): Promise<GmailListResponse>;
        };
      };
    };
    init(config: GoogleClientInitConfig): Promise<void>;
  };
  load(api: string, callback: () => void): void;
}

export interface GoogleAuthInitConfig {
  client_id: string;
  scope: string;
}

export interface GoogleClientInitConfig {
  apiKey: string;
  clientId: string;
  discoveryDocs: string[];
  scope: string;
}

export interface GmailListParams {
  maxResults: number;
  q: string;
  userId: string;
}

export interface GmailListResponse {
  result: {
    messages?: Array<{ id: string }>;
  };
}

export interface GmailGetParams {
  id: string;
  userId: string;
}

export interface GmailGetResponse {
  result: GmailMessage;
}

export interface GmailAttachmentParams {
  id: string;
  messageId: string;
  userId: string;
}

export interface GmailAttachmentResponse {
  result: {
    data: string;
  };
}

export interface GmailMessage {
  historyId: string;
  id: string;
  internalDate: string;
  labelIds: string[];
  payload: GmailPayload;
  sizeEstimate: number;
  snippet: string;
  threadId: string;
}

export interface GmailPayload {
  body?: GmailBody;
  filename?: string;
  headers: GmailHeader[];
  mimeType: string;
  partId: string;
  parts?: GmailPayload[];
}

export interface GmailHeader {
  name: string;
  value: string;
}

export interface GmailBody {
  attachmentId?: string;
  data?: string;
  size: number;
}

// Extend the global Window interface
declare global {
  interface Window {
    gapi: GoogleAPI;
  }
}
