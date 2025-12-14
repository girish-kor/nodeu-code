export interface ConnectionConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  maxConnections?: number;
  minConnections?: number;
}

export abstract class ConnectionPool {
  constructor(protected config: ConnectionConfig) {}

  abstract getConnection(): Promise<any>;
  abstract releaseConnection(connection: any): Promise<void>;
  abstract close(): Promise<void>;
  abstract getStats(): Promise<{
    total: number;
    active: number;
    idle: number;
  }>;
}

export class MockConnectionPool extends ConnectionPool {
  private connections: any[] = [];
  private activeConnections = 0;

  async getConnection(): Promise<any> {
    this.activeConnections++;
    const connection = { id: Math.random(), config: this.config };
    this.connections.push(connection);
    return connection;
  }

  async releaseConnection(connection: any): Promise<void> {
    const index = this.connections.findIndex((c) => c.id === connection.id);
    if (index > -1) {
      this.connections.splice(index, 1);
      this.activeConnections--;
    }
  }

  async close(): Promise<void> {
    this.connections = [];
    this.activeConnections = 0;
  }

  async getStats(): Promise<{ total: number; active: number; idle: number }> {
    return {
      total: this.connections.length,
      active: this.activeConnections,
      idle: this.connections.length - this.activeConnections,
    };
  }
}
