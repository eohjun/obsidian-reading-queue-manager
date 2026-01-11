/**
 * Value Object representing reading priority level
 */
export enum PriorityLevelType {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export class PriorityLevel {
  private constructor(private readonly value: PriorityLevelType) {}

  static high(): PriorityLevel {
    return new PriorityLevel(PriorityLevelType.HIGH);
  }

  static medium(): PriorityLevel {
    return new PriorityLevel(PriorityLevelType.MEDIUM);
  }

  static low(): PriorityLevel {
    return new PriorityLevel(PriorityLevelType.LOW);
  }

  static fromString(value: string): PriorityLevel {
    const priority = value.toLowerCase() as PriorityLevelType;
    if (!Object.values(PriorityLevelType).includes(priority)) {
      return PriorityLevel.medium();
    }
    return new PriorityLevel(priority);
  }

  getValue(): PriorityLevelType {
    return this.value;
  }

  toString(): string {
    return this.value;
  }

  getDisplayText(): string {
    switch (this.value) {
      case PriorityLevelType.HIGH: return 'High';
      case PriorityLevelType.MEDIUM: return 'Medium';
      case PriorityLevelType.LOW: return 'Low';
    }
  }

  getNumericValue(): number {
    switch (this.value) {
      case PriorityLevelType.HIGH: return 3;
      case PriorityLevelType.MEDIUM: return 2;
      case PriorityLevelType.LOW: return 1;
    }
  }

  isHigherThan(other: PriorityLevel): boolean {
    return this.getNumericValue() > other.getNumericValue();
  }

  equals(other: PriorityLevel): boolean {
    return this.value === other.value;
  }
}
