/**
 * Odoo JSON-RPC Client
 * Connects Next.js to Odoo 19 running on Odoo.sh or a private VPS.
 */

interface OdooRpcResponse<T = unknown> {
  jsonrpc: '2.0';
  id: number;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: {
      name?: string;
      debug?: string;
      message?: string;
    };
  };
}

export class OdooClient {
  private url: string;
  private db: string;
  private username: string;
  private apiKey: string;
  private uid: number | null = null;

  constructor() {
    this.url = (process.env.ODOO_URL || 'https://demo.odoo.sh').replace(/\/$/, '');
    this.db = process.env.ODOO_DB || 'odoo';
    this.username = process.env.ODOO_USERNAME || '';
    this.apiKey = process.env.ODOO_API_KEY || '';
  }

  private async jsonRpc<T>(service: string, method: string, args: unknown[]): Promise<T> {
    const payload = {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        service,
        method,
        args,
      },
      id: Math.floor(Math.random() * 1000000),
    };

    const response = await fetch(`${this.url}/jsonrpc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Odoo HTTP error: ${response.status} ${response.statusText}`);
    }

    const data: OdooRpcResponse<T> = await response.json();

    if (data.error) {
      const msg = data.error.data?.message || data.error.message || 'Unknown Odoo RPC error';
      throw new Error(`Odoo RPC Error: ${msg}`);
    }

    return data.result as T;
  }

  /**
   * Authenticate with Odoo and obtain UID
   */
  async authenticate(): Promise<number> {
    if (this.uid) return this.uid;

    const uid = await this.jsonRpc<number | false>('common', 'authenticate', [
      this.db,
      this.username,
      this.apiKey,
      {},
    ]);

    if (!uid) {
      throw new Error('Odoo authentication failed: Invalid credentials or database');
    }

    this.uid = uid;
    return uid;
  }

  /**
   * Execute model method via execute_kw
   */
  async executeKw<T = unknown>(
    model: string,
    method: string,
    args: unknown[] = [],
    kwargs: Record<string, unknown> = {}
  ): Promise<T> {
    const uid = await this.authenticate();
    return this.jsonRpc<T>('object', 'execute_kw', [
      this.db,
      uid,
      this.apiKey,
      model,
      method,
      args,
      kwargs,
    ]);
  }

  /**
   * Search and read records
   */
  async searchRead<T = unknown>(
    model: string,
    domain: unknown[] = [],
    fields: string[] = [],
    limit?: number,
    order?: string
  ): Promise<T[]> {
    const kwargs: Record<string, unknown> = { fields };
    if (limit) kwargs.limit = limit;
    if (order) kwargs.order = order;

    return this.executeKw<T[]>(model, 'search_read', [domain], kwargs);
  }

  /**
   * Create a new record
   */
  async create(model: string, values: Record<string, unknown>): Promise<number> {
    return this.executeKw<number>(model, 'create', [values]);
  }

  /**
   * Write/update a record
   */
  async write(model: string, id: number, values: Record<string, unknown>): Promise<boolean> {
    return this.executeKw<boolean>(model, 'write', [[id], values]);
  }

  /**
   * Unlink/delete a record
   */
  async unlink(model: string, id: number): Promise<boolean> {
    return this.executeKw<boolean>(model, 'unlink', [[id]]);
  }
}

export const odooClient = new OdooClient();
