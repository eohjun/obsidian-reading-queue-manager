/**
 * 읽기 아이템의 상태를 나타내는 Value Object
 */
export enum ReadingStatusType {
  QUEUE = 'queue',       // 대기 중
  READING = 'reading',   // 읽는 중
  DONE = 'done',         // 완료
  ABANDONED = 'abandoned' // 포기
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
      case ReadingStatusType.QUEUE: return '대기';
      case ReadingStatusType.READING: return '읽는 중';
      case ReadingStatusType.DONE: return '완료';
      case ReadingStatusType.ABANDONED: return '포기';
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
