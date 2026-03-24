const API_BASE = "https://api.github.com";

interface RateLimitInfo {
  remaining: number;
  resetAt: Date;
}

export class GitHubClient {
  private token: string;
  private rateLimit: RateLimitInfo = { remaining: 5000, resetAt: new Date() };

  constructor(token: string) {
    this.token = token;
  }

  private async request<T>(path: string, params?: Record<string, string>): Promise<T> {
    if (this.rateLimit.remaining < 10 && new Date() < this.rateLimit.resetAt) {
      const waitMs = this.rateLimit.resetAt.getTime() - Date.now() + 1000;
      await new Promise((r) => setTimeout(r, waitMs));
    }

    const url = new URL(`${API_BASE}${path}`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    }

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    this.rateLimit = {
      remaining: parseInt(res.headers.get("x-ratelimit-remaining") ?? "5000", 10),
      resetAt: new Date(parseInt(res.headers.get("x-ratelimit-reset") ?? "0", 10) * 1000),
    };

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`GitHub ${res.status}: ${body.slice(0, 500)}`);
    }

    return res.json() as Promise<T>;
  }

  async listRepos(owner: string, page = 1, perPage = 30) {
    return this.request<Array<Record<string, unknown>>>(`/users/${owner}/repos`, {
      page: String(page),
      per_page: String(perPage),
      sort: "updated",
    });
  }

  async getFileContent(owner: string, repo: string, path: string) {
    const data = await this.request<{ content?: string; encoding?: string; size?: number }>(
      `/repos/${owner}/${repo}/contents/${path}`
    );
    if (data.content && data.encoding === "base64") {
      return Buffer.from(data.content, "base64").toString("utf-8");
    }
    return JSON.stringify(data);
  }

  async searchCode(query: string, owner?: string) {
    const q = owner ? `${query} user:${owner}` : query;
    return this.request<{ total_count: number; items: Array<Record<string, unknown>> }>(
      "/search/code",
      { q }
    );
  }
}
