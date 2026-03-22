interface TokenPayload {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface CachedToken {
  token: string;
  expiresAt: number;
}

export class OAuth2ClientCredentials {
  private tokenUrl: string;
  private clientId: string;
  private clientSecret: string;
  private scope: string;
  private cached: CachedToken | null = null;

  // 60-second buffer so we refresh before actual expiry
  private static readonly EXPIRY_BUFFER_MS = 60_000;

  constructor(config: { tokenUrl: string; clientId: string; clientSecret: string; scope?: string }) {
    this.tokenUrl = config.tokenUrl;
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.scope = config.scope ?? "";
  }

  async getToken(): Promise<string> {
    if (this.cached && Date.now() < this.cached.expiresAt) {
      return this.cached.token;
    }
    return this.refresh();
  }

  private async refresh(): Promise<string> {
    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });
    if (this.scope) body.set("scope", this.scope);

    const res = await fetch(this.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`Token request failed (${res.status}): ${detail}`);
    }

    const payload: TokenPayload = await res.json();
    this.cached = {
      token: payload.access_token,
      expiresAt: Date.now() + payload.expires_in * 1000 - OAuth2ClientCredentials.EXPIRY_BUFFER_MS,
    };
    return this.cached.token;
  }
}
