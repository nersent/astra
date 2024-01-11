export const eta = (
  current: number,
  total: number,
  elapsedSeconds: number,
): number => {
  const speed = current / elapsedSeconds;
  const remaining = total - current;
  const eta = remaining / speed;
  return eta;
};

export class ETA {
  private total = 0;

  private current = 0;

  private startTime: number | undefined = undefined;

  public start(): ETA {
    this.startTime = Date.now();
    return this;
  }

  public hasStarted(): boolean {
    return this.startTime != null;
  }

  public getStartTime(): number | undefined {
    return this.startTime;
  }

  public getTotal(): number {
    return this.total;
  }

  public getCurrent(): number {
    return this.current;
  }

  public setTotal(total: number): ETA {
    this.total = total;
    return this;
  }

  public setCurrent(current: number): ETA {
    this.current = current;
    return this;
  }

  public update(current = 1): ETA {
    this.current += current;
    return this;
  }

  /**
   * Returns elapsed time in seconds
   */
  public getElapsed(): number {
    if (this.startTime == null) {
      throw new Error("Start time is not set");
    }
    return (Date.now() - this.startTime) / 1000;
  }

  /**
   * Returns estimated time arrival in seconds
   */
  public get seconds(): number {
    return eta(this.current, this.total, this.getElapsed());
  }
}
