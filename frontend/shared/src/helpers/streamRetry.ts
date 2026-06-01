export class StreamRetry {
  private attempt = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;

  schedule(onRetry: () => void): void {
    this.clear();
    const delay = Math.min(2000 * Math.pow(2, this.attempt), 30000);
    this.attempt++;
    this.timer = setTimeout(onRetry, delay);
  }

  reset(): void {
    this.clear();
    this.attempt = 0;
  }

  private clear(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
