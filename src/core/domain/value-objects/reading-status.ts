/**
 * Value Object representing reading item status
 */
export enum ReadingStatusType {
  QUEUE = 'queue',       // In queue
  READING = 'reading',   // Currently reading
  DONE = 'done',         // Completed
  ABANDONED = 'abandoned' // Abandoned
}

export class ReadingStatus {
  private constructor(private readonly value: ReadingStatusType) {}

  static queue(): ReadingStatus {
    return new ReadingStatus(ReadingStatusType.QUEUE);
  }

  static reading(): ReadingStatus {
    return new ReadingStatus(ReadingStatusType.READING);
  }

  static done(): ReadingStatus {
    return new ReadingStatus(ReadingStatusType.DONE);
  }

  static abandoned(): ReadingStatus {
    return new ReadingStatus(ReadingStatusType.ABANDONED);
  }

  static fromString(value: string): ReadingStatus {
    const status = value.toLowerCase() as ReadingStatusType;
    if (!Object.values(ReadingStatusType).includes(status)) {
      return ReadingStatus.queue();
    }
    return new ReadingStatus(status);
  }

  getValue(): ReadingStatusType {
    return this.value;
  }

  toString(): string {
    return this.value;
  }

  isQueue(): boolean {
    return this.value === ReadingStatusType.QUEUE;
  }

  isReading(): boolean {
    return this.value === ReadingStatusType.READING;
  }

  isDone(): boolean {
    return this.value === ReadingStatusType.DONE;
  }

  isAbandoned(): boolean {
    return this.value === ReadingStatusType.ABANDONED;
  }

  isActive(): boolean {
    return this.value === ReadingStatusType.QUEUE || this.value === ReadingStatusType.READING;
  }

  getDisplayText(): string {
    switch (this.value) {
      case ReadingStatusType.QUEUE: return 'Queue';
      case ReadingStatusType.READING: return 'Reading';
      case ReadingStatusType.DONE: return 'Done';
      case ReadingStatusType.ABANDONED: return 'Abandoned';
    }
  }

  getIcon(): string {
    switch (this.value) {
      case ReadingStatusType.QUEUE: return '📚';
      case ReadingStatusType.READING: return '📖';
      case ReadingStatusType.DONE: return '✅';
      case ReadingStatusType.ABANDONED: return '❌';
    }
  }

  equals(other: ReadingStatus): boolean {
    return this.value === other.value;
  }
}
