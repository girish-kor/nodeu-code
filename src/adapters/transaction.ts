export abstract class Transaction<T = any> {
  constructor(protected dataSource: any) {}

  abstract begin(): Promise<void>;
  abstract commit(): Promise<void>;
  abstract rollback(): Promise<void>;
  abstract run<R>(fn: () => Promise<R>): Promise<R>;
}

export class InMemoryTransaction extends Transaction {
  private operations: Array<() => void> = [];
  private rolledBack = false;

  async begin(): Promise<void> {
    this.operations = [];
    this.rolledBack = false;
  }

  async commit(): Promise<void> {
    if (this.rolledBack) throw new Error("Transaction already rolled back");

    this.operations.forEach((op) => op());
    this.operations = [];
  }

  async rollback(): Promise<void> {
    this.operations = [];
    this.rolledBack = true;
  }

  async run<R>(fn: () => Promise<R>): Promise<R> {
    await this.begin();
    try {
      const result = await fn();
      await this.commit();
      return result;
    } catch (error) {
      await this.rollback();
      throw error;
    }
  }
}
