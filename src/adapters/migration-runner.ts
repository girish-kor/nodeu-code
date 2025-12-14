export interface Migration {
  id: string;
  name: string;
  up(): Promise<void>;
  down(): Promise<void>;
}

export class MigrationRunner {
  private migrations: Migration[] = [];
  private executedMigrations = new Set<string>();

  addMigration(migration: Migration): void {
    this.migrations.push(migration);
  }

  async runPending(): Promise<void> {
    const pending = this.migrations.filter(
      (m) => !this.executedMigrations.has(m.id),
    );

    for (const migration of pending) {
      console.log(`Running migration: ${migration.name}`);
      await migration.up();
      this.executedMigrations.add(migration.id);
    }
  }

  async rollback(steps: number = 1): Promise<void> {
    if (steps <= 0) return;

    const executed = this.migrations.filter((m) =>
      this.executedMigrations.has(m.id),
    );
    const toRollback = executed.slice(-steps);

    for (const migration of toRollback.reverse()) {
      console.log(`Rolling back migration: ${migration.name}`);
      await migration.down();
      this.executedMigrations.delete(migration.id);
    }
  }

  getExecutedMigrations(): string[] {
    return Array.from(this.executedMigrations);
  }
}
