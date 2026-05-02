import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';

export interface BrowserPoolOptions {
  headless?: boolean;
  defaultTimeout?: number;
  rateLimitMs?: number;
}

export interface RateLimiter {
  lastRequestTime: number;
  minDelayMs: number;
}

const DEFAULT_TIMEOUT = 30000;
const DEFAULT_RATE_LIMIT_MS = 2000;

export class BrowserPool {
  private browser: Browser | null = null;
  private contexts: Map<string, BrowserContext> = new Map();
  private rateLimiters: Map<string, RateLimiter> = new Map();
  private options: Required<BrowserPoolOptions>;
  private isShuttingDown = false;

  constructor(options: BrowserPoolOptions = {}) {
    this.options = {
      headless: options.headless ?? true,
      defaultTimeout: options.defaultTimeout ?? DEFAULT_TIMEOUT,
      rateLimitMs: options.rateLimitMs ?? DEFAULT_RATE_LIMIT_MS,
    };

    this.setupShutdownHandlers();
  }

  private setupShutdownHandlers(): void {
    const shutdown = async () => {
      if (this.isShuttingDown) return;
      this.isShuttingDown = true;
      await this.close();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  }

  async initialize(): Promise<void> {
    if (this.browser) return;

    this.browser = await chromium.launch({
      headless: this.options.headless,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-features=IsolateOrigins,site-per-process',
      ],
    });
  }

  async getContext(name: string): Promise<BrowserContext> {
    if (!this.browser) {
      await this.initialize();
    }

    let context = this.contexts.get(name);
    if (!context) {
      context = await this.browser!.newContext({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1920, height: 1080 },
        locale: 'en-US',
        timezoneId: 'America/New_York',
      });
      this.contexts.set(name, context);
      this.rateLimiters.set(name, {
        lastRequestTime: 0,
        minDelayMs: this.options.rateLimitMs,
      });
    }

    return context;
  }

  async createPage(contextName: string): Promise<Page> {
    const context = await this.getContext(contextName);
    const page = await context.newPage();
    page.setDefaultTimeout(this.options.defaultTimeout);
    return page;
  }

  async waitForRateLimit(contextName: string): Promise<void> {
    const limiter = this.rateLimiters.get(contextName);
    if (!limiter) return;

    const now = Date.now();
    const elapsed = now - limiter.lastRequestTime;
    const remaining = limiter.minDelayMs - elapsed;

    if (remaining > 0) {
      await new Promise(resolve => setTimeout(resolve, remaining));
    }

    limiter.lastRequestTime = Date.now();
  }

  async close(): Promise<void> {
    for (const context of this.contexts.values()) {
      await context.close();
    }
    this.contexts.clear();
    this.rateLimiters.clear();

    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

let globalPool: BrowserPool | null = null;

export function getBrowserPool(options?: BrowserPoolOptions): BrowserPool {
  if (!globalPool) {
    globalPool = new BrowserPool(options);
  }
  return globalPool;
}

export async function closeBrowserPool(): Promise<void> {
  if (globalPool) {
    await globalPool.close();
    globalPool = null;
  }
}