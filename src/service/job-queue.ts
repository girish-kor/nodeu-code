import { Job } from "../types";

export class JobQueue {
  private queue: Job[] = [];
  private processing = false;
  private stopped = false;

  async enqueue(job: Omit<Job, "id">): Promise<string> {
    const id = Math.random().toString(36).substr(2, 9);
    const fullJob: Job = { id, ...job };
    this.queue.push(fullJob);
    this.stopped = false;

    setTimeout(() => this.processQueue(), 0);
    return id;
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.stopped) return;
    this.processing = true;

    while (this.queue.length > 0 && !this.stopped) {
      const job = this.queue.shift()!;
      try {
        await this.processJob(job);
      } catch (error) {
        console.error(`Job ${job.id} failed:`, error);
      }
    }

    this.processing = false;
  }

  private async processJob(job: Job): Promise<void> {
    if (this.stopped) return;

    console.log(`Processing job: ${job.type}`, job.data);

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  clear(): void {
    this.queue = [];
    this.stopped = true;
    this.processing = false;
  }
}
