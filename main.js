var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => ReadingQueuePlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian7 = require("obsidian");

// src/core/domain/value-objects/reading-status.ts
var ReadingStatusType = /* @__PURE__ */ ((ReadingStatusType2) => {
  ReadingStatusType2["QUEUE"] = "queue";
  ReadingStatusType2["READING"] = "reading";
  ReadingStatusType2["DONE"] = "done";
  ReadingStatusType2["ABANDONED"] = "abandoned";
  return ReadingStatusType2;
})(ReadingStatusType || {});
var ReadingStatus = class _ReadingStatus {
  constructor(value) {
    this.value = value;
  }
  static queue() {
    return new _ReadingStatus("queue" /* QUEUE */);
  }
  static reading() {
    return new _ReadingStatus("reading" /* READING */);
  }
  static done() {
    return new _ReadingStatus("done" /* DONE */);
  }
  static abandoned() {
    return new _ReadingStatus("abandoned" /* ABANDONED */);
  }
  static fromString(value) {
    const status = value.toLowerCase();
    if (!Object.values(ReadingStatusType).includes(status)) {
      return _ReadingStatus.queue();
    }
    return new _ReadingStatus(status);
  }
  getValue() {
    return this.value;
  }
  toString() {
    return this.value;
  }
  isQueue() {
    return this.value === "queue" /* QUEUE */;
  }
  isReading() {
    return this.value === "reading" /* READING */;
  }
  isDone() {
    return this.value === "done" /* DONE */;
  }
  isAbandoned() {
    return this.value === "abandoned" /* ABANDONED */;
  }
  isActive() {
    return this.value === "queue" /* QUEUE */ || this.value === "reading" /* READING */;
  }
  getDisplayText() {
    switch (this.value) {
      case "queue" /* QUEUE */:
        return "Queue";
      case "reading" /* READING */:
        return "Reading";
      case "done" /* DONE */:
        return "Done";
      case "abandoned" /* ABANDONED */:
        return "Abandoned";
    }
  }
  getIcon() {
    switch (this.value) {
      case "queue" /* QUEUE */:
        return "\u{1F4DA}";
      case "reading" /* READING */:
        return "\u{1F4D6}";
      case "done" /* DONE */:
        return "\u2705";
      case "abandoned" /* ABANDONED */:
        return "\u274C";
    }
  }
  equals(other) {
    return this.value === other.value;
  }
};

// src/core/domain/value-objects/priority-level.ts
var PriorityLevelType = /* @__PURE__ */ ((PriorityLevelType4) => {
  PriorityLevelType4["HIGH"] = "high";
  PriorityLevelType4["MEDIUM"] = "medium";
  PriorityLevelType4["LOW"] = "low";
  return PriorityLevelType4;
})(PriorityLevelType || {});
var PriorityLevel = class _PriorityLevel {
  constructor(value) {
    this.value = value;
  }
  static high() {
    return new _PriorityLevel("high" /* HIGH */);
  }
  static medium() {
    return new _PriorityLevel("medium" /* MEDIUM */);
  }
  static low() {
    return new _PriorityLevel("low" /* LOW */);
  }
  static fromString(value) {
    const priority = value.toLowerCase();
    if (!Object.values(PriorityLevelType).includes(priority)) {
      return _PriorityLevel.medium();
    }
    return new _PriorityLevel(priority);
  }
  getValue() {
    return this.value;
  }
  toString() {
    return this.value;
  }
  getDisplayText() {
    switch (this.value) {
      case "high" /* HIGH */:
        return "High";
      case "medium" /* MEDIUM */:
        return "Medium";
      case "low" /* LOW */:
        return "Low";
    }
  }
  getNumericValue() {
    switch (this.value) {
      case "high" /* HIGH */:
        return 3;
      case "medium" /* MEDIUM */:
        return 2;
      case "low" /* LOW */:
        return 1;
    }
  }
  isHigherThan(other) {
    return this.getNumericValue() > other.getNumericValue();
  }
  equals(other) {
    return this.value === other.value;
  }
};

// src/core/domain/entities/content-analysis.ts
var ContentAnalysis = class _ContentAnalysis {
  constructor(props) {
    this._id = props.id;
    this._itemId = props.itemId;
    this._title = props.title;
    this._summary = props.summary;
    this._keyInsights = [...props.keyInsights];
    this._suggestedTags = [...props.suggestedTags];
    this._suggestedPriority = props.suggestedPriority;
    this._estimatedReadingTime = props.estimatedReadingTime;
    this._language = props.language;
    this._analyzedAt = props.analyzedAt;
    this._provider = props.provider;
    this._model = props.model;
    this._tokensUsed = props.tokensUsed;
    this._suggestedNoteTopics = props.suggestedNoteTopics ? [...props.suggestedNoteTopics] : [];
  }
  static create(props) {
    return new _ContentAnalysis({
      ...props,
      id: `analysis_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      analyzedAt: /* @__PURE__ */ new Date()
    });
  }
  static fromData(data) {
    return new _ContentAnalysis({
      id: data.id,
      itemId: data.itemId,
      title: data.title,
      summary: data.summary,
      keyInsights: data.keyInsights,
      suggestedTags: data.suggestedTags,
      suggestedPriority: data.suggestedPriority,
      estimatedReadingTime: data.estimatedReadingTime,
      language: data.language,
      analyzedAt: new Date(data.analyzedAt),
      provider: data.provider,
      model: data.model,
      tokensUsed: data.tokensUsed,
      suggestedNoteTopics: data.suggestedNoteTopics
    });
  }
  // Getters
  get id() {
    return this._id;
  }
  get itemId() {
    return this._itemId;
  }
  get title() {
    return this._title;
  }
  get summary() {
    return this._summary;
  }
  get keyInsights() {
    return [...this._keyInsights];
  }
  get suggestedTags() {
    return [...this._suggestedTags];
  }
  get suggestedPriority() {
    return this._suggestedPriority;
  }
  get estimatedReadingTime() {
    return this._estimatedReadingTime;
  }
  get language() {
    return this._language;
  }
  get analyzedAt() {
    return this._analyzedAt;
  }
  get provider() {
    return this._provider;
  }
  get model() {
    return this._model;
  }
  get tokensUsed() {
    return this._tokensUsed;
  }
  get suggestedNoteTopics() {
    return [...this._suggestedNoteTopics];
  }
  // Setters
  setSuggestedNoteTopics(topics) {
    this._suggestedNoteTopics = [...topics];
  }
  hasSuggestedNoteTopics() {
    return this._suggestedNoteTopics.length > 0;
  }
  // Serialization
  toData() {
    return {
      id: this._id,
      itemId: this._itemId,
      title: this._title,
      summary: this._summary,
      keyInsights: [...this._keyInsights],
      suggestedTags: [...this._suggestedTags],
      suggestedPriority: this._suggestedPriority,
      estimatedReadingTime: this._estimatedReadingTime,
      language: this._language,
      analyzedAt: this._analyzedAt.toISOString(),
      provider: this._provider,
      model: this._model,
      tokensUsed: this._tokensUsed,
      suggestedNoteTopics: this._suggestedNoteTopics.length > 0 ? [...this._suggestedNoteTopics] : void 0
    };
  }
  // Helper methods
  hasInsights() {
    return this._keyInsights.length > 0;
  }
  hasSuggestedTags() {
    return this._suggestedTags.length > 0;
  }
  getReadingTimeDisplay() {
    if (!this._estimatedReadingTime) return "";
    if (this._estimatedReadingTime < 60) {
      return `${this._estimatedReadingTime} min`;
    }
    const hours = Math.floor(this._estimatedReadingTime / 60);
    const minutes = this._estimatedReadingTime % 60;
    return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
  }
};

// src/core/domain/entities/reading-item.ts
var ReadingItem = class _ReadingItem {
  constructor(props) {
    this._id = props.id;
    this._title = props.title;
    this._url = props.url;
    this._source = props.source;
    this._status = ReadingStatus.fromString(props.status);
    this._priority = PriorityLevel.fromString(props.priority);
    this._estimatedMinutes = props.estimatedMinutes;
    this._progress = props.progress;
    this._tags = [...props.tags];
    this._notes = props.notes;
    this._addedAt = props.addedAt;
    this._startedAt = props.startedAt;
    this._completedAt = props.completedAt;
    this._analysis = props.analysis;
    this._linkedNotes = props.linkedNotes ? [...props.linkedNotes] : [];
  }
  static create(props) {
    return new _ReadingItem({
      ...props,
      id: crypto.randomUUID(),
      status: "queue" /* QUEUE */,
      progress: 0,
      addedAt: /* @__PURE__ */ new Date()
    });
  }
  static fromData(data) {
    return new _ReadingItem({
      id: data.id,
      title: data.title,
      url: data.url,
      source: data.source,
      status: data.status,
      priority: data.priority,
      estimatedMinutes: data.estimatedMinutes,
      progress: data.progress,
      tags: data.tags,
      notes: data.notes,
      addedAt: new Date(data.addedAt),
      startedAt: data.startedAt ? new Date(data.startedAt) : void 0,
      completedAt: data.completedAt ? new Date(data.completedAt) : void 0,
      analysis: data.analysis ? ContentAnalysis.fromData(data.analysis) : void 0,
      linkedNotes: data.linkedNotes
    });
  }
  // Getters
  get id() {
    return this._id;
  }
  get title() {
    return this._title;
  }
  get url() {
    return this._url;
  }
  get source() {
    return this._source;
  }
  get status() {
    return this._status;
  }
  get priority() {
    return this._priority;
  }
  get estimatedMinutes() {
    return this._estimatedMinutes;
  }
  get progress() {
    return this._progress;
  }
  get tags() {
    return [...this._tags];
  }
  get notes() {
    return this._notes;
  }
  get addedAt() {
    return this._addedAt;
  }
  get startedAt() {
    return this._startedAt;
  }
  get completedAt() {
    return this._completedAt;
  }
  get analysis() {
    return this._analysis;
  }
  get linkedNotes() {
    return [...this._linkedNotes];
  }
  // Domain Methods
  startReading() {
    if (!this._status.isQueue()) {
      return;
    }
    this._status = ReadingStatus.reading();
    this._startedAt = /* @__PURE__ */ new Date();
  }
  markDone() {
    if (!this._status.isReading()) {
      return;
    }
    this._status = ReadingStatus.done();
    this._completedAt = /* @__PURE__ */ new Date();
    this._progress = 100;
  }
  abandon() {
    if (this._status.isDone() || this._status.isAbandoned()) {
      return;
    }
    this._status = ReadingStatus.abandoned();
    this._completedAt = /* @__PURE__ */ new Date();
  }
  backToQueue() {
    this._status = ReadingStatus.queue();
    this._startedAt = void 0;
    this._completedAt = void 0;
    this._progress = 0;
  }
  updateProgress(progress) {
    if (progress < 0 || progress > 100) {
      return;
    }
    this._progress = progress;
    if (progress > 0 && this._status.isQueue()) {
      this.startReading();
    }
    if (progress === 100 && this._status.isReading()) {
      this.markDone();
    }
  }
  updateTitle(title) {
    if (title.trim()) {
      this._title = title.trim();
    }
  }
  updateUrl(url) {
    this._url = url;
  }
  updatePriority(priority) {
    this._priority = priority;
  }
  updateEstimatedMinutes(minutes) {
    this._estimatedMinutes = minutes;
  }
  updateNotes(notes) {
    this._notes = notes;
  }
  addTag(tag) {
    const normalizedTag = tag.trim().toLowerCase();
    if (normalizedTag && !this._tags.includes(normalizedTag)) {
      this._tags.push(normalizedTag);
    }
  }
  removeTag(tag) {
    const normalizedTag = tag.trim().toLowerCase();
    this._tags = this._tags.filter((t) => t !== normalizedTag);
  }
  setTags(tags) {
    this._tags = tags.map((t) => t.trim().toLowerCase()).filter((t) => t.length > 0);
  }
  hasTag(tag) {
    return this._tags.includes(tag.trim().toLowerCase());
  }
  // AI Analysis Methods
  setAnalysis(analysis) {
    this._analysis = analysis;
    if (!this._estimatedMinutes && analysis.estimatedReadingTime) {
      this._estimatedMinutes = analysis.estimatedReadingTime;
    }
  }
  clearAnalysis() {
    this._analysis = void 0;
  }
  hasAnalysis() {
    return this._analysis !== void 0;
  }
  /**
   * Apply suggested tags from analysis
   */
  applySuggestedTags() {
    if (!this._analysis) return;
    for (const tag of this._analysis.suggestedTags) {
      this.addTag(tag);
    }
  }
  /**
   * Apply suggested priority from analysis
   */
  applySuggestedPriority() {
    var _a;
    if (!((_a = this._analysis) == null ? void 0 : _a.suggestedPriority)) return;
    this._priority = PriorityLevel.fromString(this._analysis.suggestedPriority);
  }
  // Linked Notes Methods
  addLinkedNote(notePath) {
    if (!this._linkedNotes.includes(notePath)) {
      this._linkedNotes.push(notePath);
    }
  }
  removeLinkedNote(notePath) {
    this._linkedNotes = this._linkedNotes.filter((p) => p !== notePath);
  }
  hasLinkedNotes() {
    return this._linkedNotes.length > 0;
  }
  // Check if item can be completed within time budget
  fitsTimeBudget(budgetMinutes) {
    if (!this._estimatedMinutes) return true;
    const remainingMinutes = this._estimatedMinutes * (1 - this._progress / 100);
    return remainingMinutes <= budgetMinutes;
  }
  // Get days in queue
  getDaysInQueue() {
    const now = /* @__PURE__ */ new Date();
    const diffMs = now.getTime() - this._addedAt.getTime();
    return Math.floor(diffMs / (1e3 * 60 * 60 * 24));
  }
  // Check if item is stale
  isStale(daysThreshold = 30) {
    return this._status.isActive() && this.getDaysInQueue() >= daysThreshold;
  }
  // Serialization
  toData() {
    var _a, _b, _c;
    return {
      id: this._id,
      title: this._title,
      url: this._url,
      source: this._source,
      status: this._status.toString(),
      priority: this._priority.toString(),
      estimatedMinutes: this._estimatedMinutes,
      progress: this._progress,
      tags: [...this._tags],
      notes: this._notes,
      addedAt: this._addedAt.toISOString(),
      startedAt: (_a = this._startedAt) == null ? void 0 : _a.toISOString(),
      completedAt: (_b = this._completedAt) == null ? void 0 : _b.toISOString(),
      analysis: (_c = this._analysis) == null ? void 0 : _c.toData(),
      linkedNotes: this._linkedNotes.length > 0 ? [...this._linkedNotes] : void 0
    };
  }
};

// src/core/adapters/obsidian/reading-queue-repository.ts
var ObsidianReadingQueueRepository = class {
  constructor(plugin) {
    this.plugin = plugin;
    this.items = /* @__PURE__ */ new Map();
    this.loaded = false;
  }
  async load() {
    if (this.loaded) return;
    const data = await this.plugin.loadData();
    if (data == null ? void 0 : data.items) {
      for (const itemData of data.items) {
        try {
          const item = ReadingItem.fromData(itemData);
          this.items.set(item.id, item);
        } catch (error) {
          console.error("Failed to load item:", itemData.id, error);
        }
      }
    }
    this.loaded = true;
  }
  async persist() {
    const existingData = await this.plugin.loadData();
    const data = {
      ...existingData,
      // Preserve existing data (including settings)
      items: Array.from(this.items.values()).map((item) => item.toData()),
      version: "0.1.0"
    };
    await this.plugin.saveData(data);
  }
  async findById(id) {
    await this.load();
    return this.items.get(id) || null;
  }
  async findByStatus(status) {
    await this.load();
    return Array.from(this.items.values()).filter(
      (item) => item.status.getValue() === status
    );
  }
  async findByTimeBudget(maxMinutes) {
    await this.load();
    return Array.from(this.items.values()).filter((item) => {
      if (!item.status.isActive()) return false;
      return item.fitsTimeBudget(maxMinutes);
    });
  }
  async findStaleItems(daysThreshold) {
    await this.load();
    return Array.from(this.items.values()).filter(
      (item) => item.isStale(daysThreshold)
    );
  }
  async findByFilter(filter) {
    await this.load();
    return Array.from(this.items.values()).filter((item) => {
      if (filter.status) {
        const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
        if (!statuses.includes(item.status.getValue())) {
          return false;
        }
      }
      if (filter.priority) {
        const priorities = Array.isArray(filter.priority) ? filter.priority : [filter.priority];
        if (!priorities.includes(item.priority.getValue())) {
          return false;
        }
      }
      if (filter.tags && filter.tags.length > 0) {
        const hasAllTags = filter.tags.every((tag) => item.hasTag(tag));
        if (!hasAllTags) {
          return false;
        }
      }
      if (filter.maxMinutes !== void 0) {
        if (!item.fitsTimeBudget(filter.maxMinutes)) {
          return false;
        }
      }
      if (!filter.includeStale && item.isStale()) {
        return false;
      }
      return true;
    });
  }
  async getAll() {
    await this.load();
    return Array.from(this.items.values());
  }
  async getActiveItems() {
    await this.load();
    return Array.from(this.items.values()).filter((item) => item.status.isActive());
  }
  async save(item) {
    await this.load();
    this.items.set(item.id, item);
    await this.persist();
    return item;
  }
  async delete(id) {
    await this.load();
    const deleted = this.items.delete(id);
    if (deleted) {
      await this.persist();
    }
    return deleted;
  }
  async getStats() {
    await this.load();
    const allItems = Array.from(this.items.values());
    const byStatus = {
      ["queue" /* QUEUE */]: 0,
      ["reading" /* READING */]: 0,
      ["done" /* DONE */]: 0,
      ["abandoned" /* ABANDONED */]: 0
    };
    const byPriority = {
      ["high" /* HIGH */]: 0,
      ["medium" /* MEDIUM */]: 0,
      ["low" /* LOW */]: 0
    };
    let totalEstimatedMinutes = 0;
    let totalProgress = 0;
    let staleCount = 0;
    let activeCount = 0;
    for (const item of allItems) {
      byStatus[item.status.getValue()]++;
      byPriority[item.priority.getValue()]++;
      if (item.estimatedMinutes) {
        totalEstimatedMinutes += item.estimatedMinutes;
      }
      if (item.status.isActive()) {
        totalProgress += item.progress;
        activeCount++;
      }
      if (item.isStale()) {
        staleCount++;
      }
    }
    return {
      total: allItems.length,
      byStatus,
      byPriority,
      totalEstimatedMinutes,
      averageProgress: activeCount > 0 ? totalProgress / activeCount : 0,
      staleCount
    };
  }
  async getAllTags() {
    await this.load();
    const tagSet = /* @__PURE__ */ new Set();
    for (const item of this.items.values()) {
      for (const tag of item.tags) {
        tagSet.add(tag);
      }
    }
    return Array.from(tagSet).sort();
  }
};

// src/core/adapters/llm/base-provider.ts
var import_obsidian = require("obsidian");

// src/core/domain/constants/model-configs.ts
var MODEL_CONFIGS = {
  // Claude Models
  "claude-opus-4.5": {
    id: "claude-opus-4-5-20251101",
    displayName: "Claude Opus 4.5",
    provider: "claude",
    tier: "premium",
    inputCostPer1M: 15,
    outputCostPer1M: 75,
    maxInputTokens: 2e5,
    maxOutputTokens: 32768,
    supportsVision: true,
    supportsStreaming: true
  },
  "claude-sonnet-4.5": {
    id: "claude-sonnet-4-5-20250929",
    displayName: "Claude Sonnet 4.5",
    provider: "claude",
    tier: "standard",
    inputCostPer1M: 3,
    outputCostPer1M: 15,
    maxInputTokens: 2e5,
    maxOutputTokens: 16384,
    supportsVision: true,
    supportsStreaming: true
  },
  "claude-haiku": {
    id: "claude-3-5-haiku-20241022",
    displayName: "Claude 3.5 Haiku",
    provider: "claude",
    tier: "economy",
    inputCostPer1M: 0.8,
    outputCostPer1M: 4,
    maxInputTokens: 2e5,
    maxOutputTokens: 8192,
    supportsVision: true,
    supportsStreaming: true
  },
  // Gemini Models
  "gemini-3-pro": {
    id: "gemini-3-pro-preview",
    displayName: "Gemini 3 Pro",
    provider: "gemini",
    tier: "premium",
    inputCostPer1M: 2.5,
    outputCostPer1M: 10,
    maxInputTokens: 1e6,
    maxOutputTokens: 65536,
    supportsVision: true,
    supportsStreaming: true
  },
  "gemini-3-flash": {
    id: "gemini-3-flash-preview",
    displayName: "Gemini 3 Flash",
    provider: "gemini",
    tier: "standard",
    inputCostPer1M: 0.5,
    outputCostPer1M: 3,
    maxInputTokens: 1e6,
    maxOutputTokens: 65536,
    supportsVision: true,
    supportsStreaming: true
  },
  "gemini-2-flash": {
    id: "gemini-2.0-flash",
    displayName: "Gemini 2.0 Flash",
    provider: "gemini",
    tier: "economy",
    inputCostPer1M: 0.075,
    outputCostPer1M: 0.3,
    maxInputTokens: 1e6,
    maxOutputTokens: 8192,
    supportsVision: true,
    supportsStreaming: true
  },
  // OpenAI Models
  "gpt-5.2": {
    id: "gpt-5.2",
    displayName: "GPT-5.2",
    provider: "openai",
    tier: "standard",
    inputCostPer1M: 1.75,
    outputCostPer1M: 14,
    maxInputTokens: 256e3,
    maxOutputTokens: 32768,
    supportsVision: true,
    supportsStreaming: true
  },
  "gpt-4o-mini": {
    id: "gpt-4o-mini",
    displayName: "GPT-4o Mini",
    provider: "openai",
    tier: "economy",
    inputCostPer1M: 0.15,
    outputCostPer1M: 0.6,
    maxInputTokens: 128e3,
    maxOutputTokens: 16384,
    supportsVision: true,
    supportsStreaming: true
  },
  // Grok Models
  "grok-4.1-fast": {
    id: "grok-4-1-fast",
    displayName: "Grok 4.1 Fast",
    provider: "grok",
    tier: "standard",
    inputCostPer1M: 3,
    outputCostPer1M: 15,
    maxInputTokens: 2e6,
    maxOutputTokens: 16384,
    supportsVision: true,
    supportsStreaming: true
  },
  "grok-4.1-fast-non-reasoning": {
    id: "grok-4-1-fast-non-reasoning",
    displayName: "Grok 4.1 Fast (Non-Reasoning)",
    provider: "grok",
    tier: "economy",
    inputCostPer1M: 0.6,
    outputCostPer1M: 4,
    maxInputTokens: 2e6,
    maxOutputTokens: 16384,
    supportsVision: true,
    supportsStreaming: true
  }
};
var AI_PROVIDERS = {
  claude: {
    id: "claude",
    name: "Anthropic Claude",
    displayName: "Claude",
    endpoint: "https://api.anthropic.com/v1",
    defaultModel: "claude-sonnet-4-5-20250929"
  },
  gemini: {
    id: "gemini",
    name: "Google Gemini",
    displayName: "Gemini",
    endpoint: "https://generativelanguage.googleapis.com/v1beta",
    apiKeyPrefix: "AIza",
    defaultModel: "gemini-3-flash-preview"
  },
  openai: {
    id: "openai",
    name: "OpenAI",
    displayName: "OpenAI",
    endpoint: "https://api.openai.com/v1",
    apiKeyPrefix: "sk-",
    defaultModel: "gpt-5.2"
  },
  grok: {
    id: "grok",
    name: "xAI Grok",
    displayName: "Grok",
    endpoint: "https://api.x.ai/v1",
    defaultModel: "grok-4-1-fast"
  }
};
function calculateCost(modelKey, inputTokens, outputTokens) {
  const config = MODEL_CONFIGS[modelKey];
  if (!config) return 0;
  const inputCost = inputTokens / 1e6 * config.inputCostPer1M;
  const outputCost = outputTokens / 1e6 * config.outputCostPer1M;
  return inputCost + outputCost;
}
function getModelsByProvider(provider) {
  return Object.values(MODEL_CONFIGS).filter((m) => m.provider === provider);
}
function getModelConfigById(modelId) {
  return Object.values(MODEL_CONFIGS).find((m) => m.id === modelId);
}

// src/core/adapters/llm/base-provider.ts
var BaseProvider = class {
  get config() {
    return AI_PROVIDERS[this.id];
  }
  /**
   * HTTP request wrapper using Obsidian's requestUrl
   */
  async makeRequest(options) {
    try {
      const response = await (0, import_obsidian.requestUrl)(options);
      return response.json;
    } catch (error) {
      throw this.normalizeError(error);
    }
  }
  /**
   * Handle errors and return normalized response
   */
  handleError(error) {
    const normalized = this.normalizeError(error);
    return {
      success: false,
      content: "",
      error: normalized.message,
      errorCode: normalized.code
    };
  }
  /**
   * Normalize various error types to standard format
   */
  normalizeError(error) {
    if (error instanceof Error) {
      if (error.message.includes("429") || error.message.includes("rate")) {
        return { message: "Rate limit exceeded. Please try again later.", code: "RATE_LIMIT" };
      }
      if (error.message.includes("401") || error.message.includes("403")) {
        return { message: "Invalid API key or unauthorized access.", code: "AUTH_ERROR" };
      }
      if (error.message.includes("timeout") || error.message.includes("ETIMEDOUT")) {
        return { message: "Request timed out. Please try again.", code: "TIMEOUT" };
      }
      return { message: error.message, code: "UNKNOWN" };
    }
    return { message: "An unknown error occurred", code: "UNKNOWN" };
  }
  /**
   * Estimate token count (approximate)
   * Korean: ~2 chars = 1 token, English: ~4 chars = 1 token
   */
  estimateTokens(text) {
    const koreanChars = (text.match(/[\uAC00-\uD7AF]/g) || []).length;
    const otherChars = text.length - koreanChars;
    return Math.ceil(koreanChars / 2 + otherChars / 4);
  }
};

// src/core/adapters/llm/claude-provider.ts
var ClaudeProvider = class extends BaseProvider {
  constructor() {
    super(...arguments);
    this.id = "claude";
    this.name = "Anthropic Claude";
    this.API_VERSION = "2023-06-01";
  }
  async testApiKey(apiKey) {
    try {
      const response = await this.makeRequest({
        url: `${this.config.endpoint}/messages`,
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": this.API_VERSION,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: this.config.defaultModel,
          messages: [{ role: "user", content: "Hello" }],
          max_tokens: 10
        })
      });
      return !response.error && !!response.content;
    } catch (e) {
      return false;
    }
  }
  async generateText(messages, apiKey, options) {
    var _a, _b, _c;
    const { claudeMessages, systemPrompt } = this.convertMessages(messages);
    const requestBody = {
      model: (options == null ? void 0 : options.model) || this.config.defaultModel,
      messages: claudeMessages,
      max_tokens: (_a = options == null ? void 0 : options.maxTokens) != null ? _a : 4096,
      temperature: (_b = options == null ? void 0 : options.temperature) != null ? _b : 0.7
    };
    if (systemPrompt) {
      requestBody.system = systemPrompt;
    }
    try {
      console.log(`[ClaudeProvider] Making API request:`, {
        model: requestBody.model,
        messageCount: requestBody.messages.length,
        hasSystemPrompt: !!requestBody.system,
        maxTokens: requestBody.max_tokens
      });
      const response = await this.makeRequest({
        url: `${this.config.endpoint}/messages`,
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": this.API_VERSION,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });
      console.log(`[ClaudeProvider] Raw API response:`, {
        hasContent: !!response.content,
        contentBlockCount: ((_c = response.content) == null ? void 0 : _c.length) || 0,
        usage: response.usage,
        error: response.error
      });
      if (response.error) {
        return {
          success: false,
          content: "",
          error: response.error.message,
          errorCode: response.error.type
        };
      }
      const generatedText = response.content.filter((block) => block.type === "text").map((block) => block.text).join("");
      return {
        success: true,
        content: generatedText,
        tokensUsed: response.usage ? response.usage.input_tokens + response.usage.output_tokens : void 0
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
  convertMessages(messages) {
    const claudeMessages = [];
    let systemPrompt = null;
    for (const msg of messages) {
      if (msg.role === "system") {
        systemPrompt = msg.content;
      } else {
        claudeMessages.push({
          role: msg.role,
          content: msg.content
        });
      }
    }
    return { claudeMessages, systemPrompt };
  }
};

// src/core/adapters/llm/openai-provider.ts
var OpenAIProvider = class extends BaseProvider {
  constructor() {
    super(...arguments);
    this.id = "openai";
    this.name = "OpenAI";
  }
  async testApiKey(apiKey) {
    try {
      const model = this.config.defaultModel;
      const isReasoningModel = model.startsWith("gpt-5") || model.startsWith("o1") || model.startsWith("o3");
      const requestBody = {
        model,
        messages: [{ role: "user", content: "Hello" }]
      };
      if (isReasoningModel) {
        requestBody.max_completion_tokens = 10;
      } else {
        requestBody.max_tokens = 10;
      }
      const response = await this.makeRequest({
        url: `${this.config.endpoint}/chat/completions`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });
      return !response.error && response.choices && response.choices.length > 0;
    } catch (e) {
      return false;
    }
  }
  async generateText(messages, apiKey, options) {
    var _a, _b, _c, _d;
    const openaiMessages = this.convertMessages(messages);
    const model = (options == null ? void 0 : options.model) || this.config.defaultModel;
    const isReasoningModel = model.startsWith("gpt-5") || model.startsWith("o1") || model.startsWith("o3");
    const requestBody = {
      model,
      messages: openaiMessages,
      temperature: (_a = options == null ? void 0 : options.temperature) != null ? _a : 0.7
    };
    if (isReasoningModel) {
      requestBody.max_completion_tokens = (_b = options == null ? void 0 : options.maxTokens) != null ? _b : 4096;
    } else {
      requestBody.max_tokens = (_c = options == null ? void 0 : options.maxTokens) != null ? _c : 4096;
    }
    try {
      const response = await this.makeRequest({
        url: `${this.config.endpoint}/chat/completions`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });
      if (response.error) {
        return {
          success: false,
          content: "",
          error: response.error.message,
          errorCode: response.error.code || response.error.type
        };
      }
      if (!response.choices || response.choices.length === 0) {
        return {
          success: false,
          content: "",
          error: "No response generated",
          errorCode: "EMPTY_RESPONSE"
        };
      }
      const generatedText = response.choices[0].message.content || "";
      return {
        success: true,
        content: generatedText,
        tokensUsed: (_d = response.usage) == null ? void 0 : _d.total_tokens
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
  convertMessages(messages) {
    return messages.map((msg) => ({
      role: msg.role,
      content: msg.content
    }));
  }
};

// src/core/adapters/llm/gemini-provider.ts
var GeminiProvider = class extends BaseProvider {
  constructor() {
    super(...arguments);
    this.id = "gemini";
    this.name = "Google Gemini";
  }
  async testApiKey(apiKey) {
    try {
      const model = this.config.defaultModel;
      const url = `${this.config.endpoint}/models/${model}:generateContent?key=${apiKey}`;
      const response = await this.makeRequest({
        url,
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: "Hello" }]
            }
          ],
          generationConfig: {
            maxOutputTokens: 10
          }
        })
      });
      return !response.error && !!response.candidates && response.candidates.length > 0;
    } catch (e) {
      return false;
    }
  }
  async generateText(messages, apiKey, options) {
    var _a, _b, _c;
    const { contents, systemInstruction } = this.convertMessages(messages);
    const model = (options == null ? void 0 : options.model) || this.config.defaultModel;
    const url = `${this.config.endpoint}/models/${model}:generateContent?key=${apiKey}`;
    const requestBody = {
      contents,
      generationConfig: {
        temperature: (_a = options == null ? void 0 : options.temperature) != null ? _a : 0.7,
        maxOutputTokens: (_b = options == null ? void 0 : options.maxTokens) != null ? _b : 4096
      }
    };
    if (systemInstruction) {
      requestBody.systemInstruction = systemInstruction;
    }
    try {
      const response = await this.makeRequest({
        url,
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });
      if (response.error) {
        return {
          success: false,
          content: "",
          error: response.error.message,
          errorCode: response.error.status || String(response.error.code)
        };
      }
      if (!response.candidates || response.candidates.length === 0) {
        return {
          success: false,
          content: "",
          error: "No response generated",
          errorCode: "EMPTY_RESPONSE"
        };
      }
      const generatedText = response.candidates[0].content.parts.map((part) => part.text).join("");
      return {
        success: true,
        content: generatedText,
        tokensUsed: (_c = response.usageMetadata) == null ? void 0 : _c.totalTokenCount
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
  convertMessages(messages) {
    const contents = [];
    let systemInstruction = null;
    for (const msg of messages) {
      if (msg.role === "system") {
        systemInstruction = {
          parts: [{ text: msg.content }]
        };
      } else {
        contents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }]
        });
      }
    }
    return { contents, systemInstruction };
  }
};

// src/core/adapters/llm/grok-provider.ts
var GrokProvider = class extends BaseProvider {
  constructor() {
    super(...arguments);
    this.id = "grok";
    this.name = "xAI Grok";
  }
  async testApiKey(apiKey) {
    try {
      const response = await this.makeRequest({
        url: `${this.config.endpoint}/chat/completions`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: this.config.defaultModel,
          messages: [{ role: "user", content: "Hello" }],
          max_tokens: 10
        })
      });
      return !response.error && response.choices && response.choices.length > 0;
    } catch (e) {
      return false;
    }
  }
  async generateText(messages, apiKey, options) {
    var _a, _b, _c;
    const grokMessages = this.convertMessages(messages);
    const requestBody = {
      model: (options == null ? void 0 : options.model) || this.config.defaultModel,
      messages: grokMessages,
      max_tokens: (_a = options == null ? void 0 : options.maxTokens) != null ? _a : 4096,
      temperature: (_b = options == null ? void 0 : options.temperature) != null ? _b : 0.7
    };
    try {
      const response = await this.makeRequest({
        url: `${this.config.endpoint}/chat/completions`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });
      if (response.error) {
        return {
          success: false,
          content: "",
          error: response.error.message,
          errorCode: response.error.code || response.error.type
        };
      }
      if (!response.choices || response.choices.length === 0) {
        return {
          success: false,
          content: "",
          error: "No response generated",
          errorCode: "EMPTY_RESPONSE"
        };
      }
      const generatedText = response.choices[0].message.content;
      return {
        success: true,
        content: generatedText,
        tokensUsed: (_c = response.usage) == null ? void 0 : _c.total_tokens
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
  convertMessages(messages) {
    return messages.map((msg) => ({
      role: msg.role,
      content: msg.content
    }));
  }
};

// src/core/domain/errors/ai-errors.ts
var AIError = class extends Error {
  constructor(message, code, retryable = false) {
    super(message);
    this.code = code;
    this.retryable = retryable;
    this.name = "AIError";
  }
};
var BudgetExceededError = class extends AIError {
  constructor(message = "Budget limit exceeded.", currentSpend, budgetLimit) {
    super(message, "BUDGET_EXCEEDED", false);
    this.currentSpend = currentSpend;
    this.budgetLimit = budgetLimit;
    this.name = "BudgetExceededError";
  }
};

// src/core/application/services/ai-service.ts
var AIService = class {
  constructor(settings) {
    this.providers = /* @__PURE__ */ new Map();
    this.settings = settings;
  }
  /**
   * Register a provider
   */
  registerProvider(provider) {
    this.providers.set(provider.id, provider);
  }
  /**
   * Update settings
   */
  updateSettings(settings) {
    this.settings = settings;
  }
  /**
   * Get current provider
   */
  getCurrentProvider() {
    return this.providers.get(this.settings.provider);
  }
  /**
   * Get current API key
   */
  getCurrentApiKey() {
    return this.settings.apiKeys[this.settings.provider];
  }
  /**
   * Get current model
   */
  getCurrentModel() {
    return this.settings.models[this.settings.provider];
  }
  /**
   * Test current API key
   */
  async testCurrentApiKey() {
    const provider = this.getCurrentProvider();
    const apiKey = this.getCurrentApiKey();
    if (!provider || !apiKey) return false;
    return provider.testApiKey(apiKey);
  }
  /**
   * Generate text completion
   */
  async generateText(messages, options, currentSpend) {
    const provider = this.getCurrentProvider();
    const apiKey = this.getCurrentApiKey();
    if (!provider) {
      return { success: false, content: "", error: "No provider selected" };
    }
    if (!apiKey) {
      return { success: false, content: "", error: "No API key configured" };
    }
    if (this.settings.budgetLimit && currentSpend !== void 0) {
      if (currentSpend >= this.settings.budgetLimit) {
        throw new BudgetExceededError(
          "Budget limit exceeded",
          currentSpend,
          this.settings.budgetLimit
        );
      }
    }
    const mergedOptions = {
      model: this.settings.models[this.settings.provider],
      ...options
    };
    return provider.generateText(messages, apiKey, mergedOptions);
  }
  /**
   * Simple generation helper
   */
  async simpleGenerate(userPrompt, systemPrompt, options, currentSpend) {
    const messages = [];
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: userPrompt });
    return this.generateText(messages, options, currentSpend);
  }
  /**
   * Estimate cost for a response
   */
  estimateCost(inputTokens, outputTokens) {
    const modelId = this.getCurrentModel();
    const modelConfig = getModelConfigById(modelId);
    if (!modelConfig) return 0;
    return calculateCost(
      Object.keys(modelConfig).find(
        (key) => modelConfig.id === modelId
      ) || "",
      inputTokens,
      outputTokens
    );
  }
  /**
   * Get feature-specific provider and model
   */
  getFeatureConfig(feature) {
    var _a;
    const featureSettings = (_a = this.settings.featureModels) == null ? void 0 : _a[feature];
    if (featureSettings) {
      return {
        provider: featureSettings.provider,
        model: featureSettings.model
      };
    }
    return {
      provider: this.settings.provider,
      model: this.settings.models[this.settings.provider]
    };
  }
  /**
   * Generate text for a specific feature using its configured model
   */
  async generateForFeature(feature, messages, options, currentSpend) {
    var _a, _b;
    const { provider: providerType, model } = this.getFeatureConfig(feature);
    const provider = this.providers.get(providerType);
    const apiKey = this.settings.apiKeys[providerType];
    console.log(`[AIService] generateForFeature called:`, {
      feature,
      providerType,
      model,
      hasProvider: !!provider,
      hasApiKey: !!apiKey,
      apiKeyLength: (apiKey == null ? void 0 : apiKey.length) || 0,
      registeredProviders: Array.from(this.providers.keys())
    });
    if (!provider) {
      return { success: false, content: "", error: `Provider ${providerType} not available` };
    }
    if (!apiKey) {
      return { success: false, content: "", error: `No API key configured for ${providerType}` };
    }
    if (this.settings.budgetLimit && currentSpend !== void 0) {
      if (currentSpend >= this.settings.budgetLimit) {
        throw new BudgetExceededError(
          "Budget limit exceeded",
          currentSpend,
          this.settings.budgetLimit
        );
      }
    }
    const mergedOptions = {
      model,
      ...options
    };
    const response = await provider.generateText(messages, apiKey, mergedOptions);
    console.log(`[AIService] Provider response:`, {
      success: response.success,
      contentLength: ((_a = response.content) == null ? void 0 : _a.length) || 0,
      contentPreview: ((_b = response.content) == null ? void 0 : _b.substring(0, 200)) || "(empty)",
      error: response.error,
      tokensUsed: response.tokensUsed
    });
    return response;
  }
  /**
   * Simple generation helper for a specific feature
   */
  async simpleGenerateForFeature(feature, userPrompt, systemPrompt, options, currentSpend) {
    const messages = [];
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: userPrompt });
    return this.generateForFeature(feature, messages, options, currentSpend);
  }
  /**
   * Get all registered providers
   */
  getAvailableProviders() {
    return Array.from(this.providers.keys());
  }
  /**
   * Check if a provider is configured (has API key)
   */
  isProviderConfigured(provider) {
    return !!this.settings.apiKeys[provider];
  }
};
var aiServiceInstance = null;
function initializeAIService(settings) {
  aiServiceInstance = new AIService(settings);
  return aiServiceInstance;
}
function getAIService() {
  return aiServiceInstance;
}
function updateAIServiceSettings(settings) {
  if (aiServiceInstance) {
    aiServiceInstance.updateSettings(settings);
  }
}
function resetAIService() {
  aiServiceInstance = null;
}

// src/core/application/services/event-emitter.ts
var EventEmitter = class {
  constructor() {
    this.listeners = /* @__PURE__ */ new Map();
  }
  /**
   * Subscribe to an event
   * @returns Unsubscribe function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, /* @__PURE__ */ new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }
  /**
   * Unsubscribe from an event
   */
  off(event, callback) {
    var _a;
    (_a = this.listeners.get(event)) == null ? void 0 : _a.delete(callback);
  }
  /**
   * Emit an event to all listeners
   */
  emit(event, data) {
    var _a;
    (_a = this.listeners.get(event)) == null ? void 0 : _a.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Event handler error for ${event}:`, error);
      }
    });
  }
  /**
   * Subscribe to an event once (auto-unsubscribe after first call)
   */
  once(event, callback) {
    const unsubscribe = this.on(event, (data) => {
      unsubscribe();
      callback(data);
    });
  }
  /**
   * Remove all listeners for an event (or all events)
   */
  removeAllListeners(event) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
  /**
   * Get listener count for an event
   */
  listenerCount(event) {
    var _a, _b;
    return (_b = (_a = this.listeners.get(event)) == null ? void 0 : _a.size) != null ? _b : 0;
  }
};
var emitterInstance = null;
function getEventEmitter() {
  if (!emitterInstance) {
    emitterInstance = new EventEmitter();
  }
  return emitterInstance;
}
function resetEventEmitter() {
  if (emitterInstance) {
    emitterInstance.removeAllListeners();
  }
  emitterInstance = null;
}

// src/core/application/services/cost-tracker.ts
var CostTracker = class {
  constructor(budgetLimit, emitter) {
    this.records = [];
    this.budgetLimit = budgetLimit;
    this.emitter = emitter != null ? emitter : getEventEmitter();
  }
  /**
   * Set budget limit
   */
  setBudgetLimit(limit) {
    this.budgetLimit = limit;
  }
  /**
   * Track a new usage
   */
  trackUsage(provider, model, inputTokens, outputTokens, feature) {
    const cost = calculateCost(model, inputTokens, outputTokens);
    const record = {
      id: `usage_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: /* @__PURE__ */ new Date(),
      provider,
      model,
      inputTokens,
      outputTokens,
      cost,
      feature
    };
    this.records.push(record);
    this.emitter.emit("cost:updated", {
      totalSpend: this.getCurrentSpend(),
      budgetLimit: this.budgetLimit
    });
    return record;
  }
  /**
   * Get current total spend
   */
  getCurrentSpend() {
    return this.records.reduce((sum, r) => sum + r.cost, 0);
  }
  /**
   * Get spend for a specific time period
   */
  getSpendForPeriod(startDate, endDate) {
    return this.records.filter((r) => r.timestamp >= startDate && r.timestamp <= endDate).reduce((sum, r) => sum + r.cost, 0);
  }
  /**
   * Get current month's spend
   */
  getCurrentMonthSpend() {
    const now = /* @__PURE__ */ new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return this.getSpendForPeriod(startOfMonth, now);
  }
  /**
   * Get remaining budget
   */
  getRemainingBudget() {
    if (!this.budgetLimit) return void 0;
    return Math.max(0, this.budgetLimit - this.getCurrentSpend());
  }
  /**
   * Check if budget is exceeded
   */
  isBudgetExceeded() {
    if (!this.budgetLimit) return false;
    return this.getCurrentSpend() >= this.budgetLimit;
  }
  /**
   * Get budget usage percentage
   */
  getBudgetUsagePercent() {
    if (!this.budgetLimit) return void 0;
    return this.getCurrentSpend() / this.budgetLimit * 100;
  }
  /**
   * Get usage history
   */
  getHistory(limit) {
    const sorted = [...this.records].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
    return limit ? sorted.slice(0, limit) : sorted;
  }
  /**
   * Get cost summary
   */
  getSummary() {
    const byProvider = {};
    const byModel = {};
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    for (const record of this.records) {
      byProvider[record.provider] = (byProvider[record.provider] || 0) + record.cost;
      byModel[record.model] = (byModel[record.model] || 0) + record.cost;
      totalInputTokens += record.inputTokens;
      totalOutputTokens += record.outputTokens;
    }
    return {
      totalCost: this.getCurrentSpend(),
      totalInputTokens,
      totalOutputTokens,
      recordCount: this.records.length,
      byProvider,
      byModel
    };
  }
  /**
   * Clear all records
   */
  clear() {
    this.records = [];
  }
  /**
   * Export records as JSON
   */
  exportRecords() {
    return JSON.stringify(this.records, null, 2);
  }
  /**
   * Import records from JSON
   */
  importRecords(json) {
    try {
      const imported = JSON.parse(json);
      imported.forEach((r) => {
        r.timestamp = new Date(r.timestamp);
      });
      this.records = imported;
    } catch (error) {
      console.error("Failed to import cost records:", error);
    }
  }
  /**
   * Get total record count
   */
  getRecordCount() {
    return this.records.length;
  }
};

// src/views/reading-queue-view.ts
var import_obsidian4 = require("obsidian");

// src/core/application/use-cases/add-reading-item.ts
var AddReadingItemUseCase = class {
  constructor(repository) {
    this.repository = repository;
  }
  async execute(input) {
    var _a, _b;
    try {
      if (!((_a = input.title) == null ? void 0 : _a.trim())) {
        return { success: false, error: "Please enter a title." };
      }
      const item = ReadingItem.create({
        title: input.title.trim(),
        url: ((_b = input.url) == null ? void 0 : _b.trim()) || void 0,
        source: input.source || "manual",
        priority: input.priority || "medium" /* MEDIUM */,
        estimatedMinutes: input.estimatedMinutes,
        tags: input.tags || [],
        notes: input.notes,
        analysis: input.analysis
      });
      const savedItem = await this.repository.save(item);
      return { success: true, item: savedItem };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error adding item."
      };
    }
  }
};

// src/core/application/use-cases/update-item-status.ts
var UpdateItemStatusUseCase = class {
  constructor(repository) {
    this.repository = repository;
  }
  async execute(input) {
    try {
      const item = await this.repository.findById(input.itemId);
      if (!item) {
        return { success: false, error: "Item not found." };
      }
      const previousStatus = item.status.getValue();
      switch (input.action) {
        case "start":
          item.startReading();
          break;
        case "done":
          item.markDone();
          break;
        case "abandon":
          item.abandon();
          break;
        case "backToQueue":
          item.backToQueue();
          break;
        default:
          return { success: false, error: "Unknown action." };
      }
      const newStatus = item.status.getValue();
      if (previousStatus === newStatus) {
        return {
          success: true,
          item,
          previousStatus,
          newStatus
        };
      }
      const savedItem = await this.repository.save(item);
      return {
        success: true,
        item: savedItem,
        previousStatus,
        newStatus
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error updating status."
      };
    }
  }
};

// src/core/application/use-cases/update-reading-item.ts
var UpdateReadingItemUseCase = class {
  constructor(repository) {
    this.repository = repository;
  }
  async execute(input) {
    try {
      const item = await this.repository.findById(input.itemId);
      if (!item) {
        return { success: false, error: "Item not found." };
      }
      if (input.title !== void 0) {
        item.updateTitle(input.title);
      }
      if (input.url !== void 0) {
        item.updateUrl(input.url || void 0);
      }
      if (input.priority !== void 0) {
        item.updatePriority(PriorityLevel.fromString(input.priority));
      }
      if (input.estimatedMinutes !== void 0) {
        item.updateEstimatedMinutes(input.estimatedMinutes);
      }
      if (input.tags !== void 0) {
        item.setTags(input.tags);
      }
      if (input.notes !== void 0) {
        item.updateNotes(input.notes);
      }
      if (input.progress !== void 0) {
        item.updateProgress(input.progress);
      }
      if (input.analysis !== void 0) {
        item.setAnalysis(input.analysis);
      }
      const savedItem = await this.repository.save(item);
      return { success: true, item: savedItem };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error updating item."
      };
    }
  }
};

// src/core/application/use-cases/delete-reading-item.ts
var DeleteReadingItemUseCase = class {
  constructor(repository) {
    this.repository = repository;
  }
  async execute(input) {
    try {
      const item = await this.repository.findById(input.itemId);
      if (!item) {
        return { success: false, error: "Item not found." };
      }
      const deleted = await this.repository.delete(input.itemId);
      if (!deleted) {
        return { success: false, error: "Failed to delete item." };
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error deleting item."
      };
    }
  }
};

// src/core/application/use-cases/get-queue-items.ts
var GetQueueItemsUseCase = class {
  constructor(repository) {
    this.repository = repository;
  }
  async execute(input = {}) {
    try {
      let items;
      if (input.filter) {
        items = await this.repository.findByFilter(input.filter);
      } else {
        items = await this.repository.getActiveItems();
      }
      if (input.sortBy) {
        items = this.sortItems(items, input.sortBy, input.sortOrder || "desc");
      } else {
        items = this.sortItems(items, "priority", "desc");
      }
      const stats = await this.repository.getStats();
      return { success: true, items, stats };
    } catch (error) {
      return {
        success: false,
        items: [],
        error: error instanceof Error ? error.message : "Error retrieving queue items."
      };
    }
  }
  sortItems(items, sortBy, order) {
    const sorted = [...items].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "priority":
          comparison = a.priority.getNumericValue() - b.priority.getNumericValue();
          break;
        case "addedAt":
          comparison = a.addedAt.getTime() - b.addedAt.getTime();
          break;
        case "estimatedMinutes":
          comparison = (a.estimatedMinutes || 0) - (b.estimatedMinutes || 0);
          break;
        case "progress":
          comparison = a.progress - b.progress;
          break;
        default:
          comparison = 0;
      }
      return order === "desc" ? -comparison : comparison;
    });
    return sorted;
  }
};

// src/core/application/use-cases/analyze-url-content.ts
var import_obsidian2 = require("obsidian");
var ANALYSIS_PROMPT = `You are a reading content analyzer. Analyze the following web content and provide a structured analysis.

Content:
---
{content}
---

Provide your analysis in the following JSON format (respond ONLY with valid JSON, no markdown):
{
  "title": "Extracted or improved title",
  "summary": "3-5 sentence summary of the main points",
  "keyInsights": ["insight 1", "insight 2", "insight 3"],
  "suggestedTags": ["tag1", "tag2", "tag3"],
  "suggestedPriority": "high" | "medium" | "low",
  "estimatedReadingTime": <number in minutes>,
  "language": "detected language code (ko, en, etc.)"
}

Guidelines:
- Summary should capture the essential message
- Key insights should be actionable or memorable points
- Tags should be lowercase, single words or hyphenated phrases
- Priority should be based on: depth of content (high for deep analysis), relevance to knowledge building (high for foundational concepts), time-sensitivity (high for rapidly changing topics)
- Reading time is based on average reading speed (200 words/min for English, 500 characters/min for Korean)
- Detect content language and respond in the same language for summary and insights`;
var AnalyzeUrlContentUseCase = class {
  constructor(costTracker) {
    this.aiService = getAIService();
    this.costTracker = costTracker;
  }
  async execute(input) {
    const emitter = getEventEmitter();
    emitter.emit("analysis:started", { itemId: input.itemId });
    try {
      const parsed = await this.fetchAndParseUrl(input.url);
      if (!parsed.content) {
        return {
          success: false,
          error: "Failed to extract content from URL"
        };
      }
      if (!this.aiService) {
        return {
          success: false,
          error: "AI service not initialized"
        };
      }
      const contentForAnalysis = this.prepareContentForAnalysis(parsed);
      const prompt = ANALYSIS_PROMPT.replace("{content}", contentForAnalysis);
      const currentSpend = this.costTracker.getCurrentSpend();
      const response = await this.aiService.simpleGenerateForFeature(
        "url-analysis",
        prompt,
        void 0,
        { temperature: 0.3, maxTokens: 8192 },
        // Reasoning models need more tokens
        currentSpend
      );
      if (!response.success) {
        emitter.emit("analysis:failed", { itemId: input.itemId, error: response.error || "Unknown error" });
        return {
          success: false,
          error: response.error || "Failed to analyze content"
        };
      }
      const analysisResult = this.parseAnalysisResponse(response.content);
      if (!analysisResult) {
        emitter.emit("analysis:failed", { itemId: input.itemId, error: "Failed to parse analysis response" });
        return {
          success: false,
          error: "Failed to parse analysis response"
        };
      }
      if (response.tokensUsed) {
        const { provider: providerType2, model: model2 } = this.aiService.getFeatureConfig("url-analysis");
        const inputTokens = Math.floor(response.tokensUsed * 0.7);
        const outputTokens = response.tokensUsed - inputTokens;
        this.costTracker.trackUsage(providerType2, model2, inputTokens, outputTokens, "url-analysis");
      }
      const { provider: providerType, model } = this.aiService.getFeatureConfig("url-analysis");
      const analysis = ContentAnalysis.create({
        itemId: input.itemId,
        title: analysisResult.title || parsed.title,
        summary: analysisResult.summary,
        keyInsights: analysisResult.keyInsights,
        suggestedTags: this.mergeTags(analysisResult.suggestedTags, input.existingTags),
        suggestedPriority: analysisResult.suggestedPriority,
        estimatedReadingTime: analysisResult.estimatedReadingTime || this.estimateReadingTime(parsed.wordCount),
        language: analysisResult.language || input.language,
        provider: providerType,
        model,
        tokensUsed: response.tokensUsed
      });
      emitter.emit("analysis:completed", { itemId: input.itemId, summary: analysis.summary });
      return {
        success: true,
        analysis
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      emitter.emit("analysis:failed", { itemId: input.itemId, error: errorMessage });
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  async fetchAndParseUrl(url) {
    try {
      const fetchPromise = (0, import_obsidian2.requestUrl)({
        url,
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; ObsidianReadingQueue/1.0)",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }
      });
      const timeoutPromise = new Promise(
        (_, reject) => setTimeout(() => reject(new Error("Request timeout (15s)")), 15e3)
      );
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      const html = response.text;
      return this.parseHtml(html, url);
    } catch (error) {
      console.error("Failed to fetch URL:", error);
      return {
        title: "",
        description: "",
        content: "",
        wordCount: 0
      };
    }
  }
  parseHtml(html, url) {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const ogTitleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i);
    const title = (ogTitleMatch == null ? void 0 : ogTitleMatch[1]) || (titleMatch == null ? void 0 : titleMatch[1]) || "";
    const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);
    const ogDescMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i);
    const description = (ogDescMatch == null ? void 0 : ogDescMatch[1]) || (descMatch == null ? void 0 : descMatch[1]) || "";
    let content = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "").replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, "").replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "").replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "").replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "").replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, "").replace(/.*?(<article[^>]*>[\s\S]*?<\/article>).*/gi, "$1").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (content.length < 100) {
      content = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    }
    const wordCount = content.split(/\s+/).length;
    return {
      title: this.decodeHtmlEntities(title),
      description: this.decodeHtmlEntities(description),
      content: this.decodeHtmlEntities(content),
      wordCount
    };
  }
  decodeHtmlEntities(text) {
    return text.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ");
  }
  prepareContentForAnalysis(parsed) {
    const maxChars = 8e3;
    let content = `Title: ${parsed.title}

`;
    if (parsed.description) {
      content += `Description: ${parsed.description}

`;
    }
    content += `Content:
${parsed.content}`;
    if (content.length > maxChars) {
      content = content.substring(0, maxChars) + "\n\n[Content truncated...]";
    }
    return content;
  }
  parseAnalysisResponse(response) {
    try {
      let cleaned = response.trim();
      if (cleaned.startsWith("```json")) {
        cleaned = cleaned.slice(7);
      } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.slice(3);
      }
      if (cleaned.endsWith("```")) {
        cleaned = cleaned.slice(0, -3);
      }
      cleaned = cleaned.trim();
      const parsed = JSON.parse(cleaned);
      return {
        title: parsed.title,
        summary: parsed.summary || "",
        keyInsights: Array.isArray(parsed.keyInsights) ? parsed.keyInsights : [],
        suggestedTags: Array.isArray(parsed.suggestedTags) ? parsed.suggestedTags.map((t) => t.toLowerCase().trim()) : [],
        suggestedPriority: this.normalizePriority(parsed.suggestedPriority),
        estimatedReadingTime: typeof parsed.estimatedReadingTime === "number" ? parsed.estimatedReadingTime : void 0,
        language: parsed.language
      };
    } catch (error) {
      console.error("Failed to parse analysis response:", error);
      return null;
    }
  }
  normalizePriority(priority) {
    if (!priority) return void 0;
    const normalized = priority.toLowerCase().trim();
    if (["high", "medium", "low"].includes(normalized)) {
      return normalized;
    }
    return void 0;
  }
  mergeTags(suggested, existing) {
    if (!existing || existing.length === 0) return suggested;
    const merged = /* @__PURE__ */ new Set([...existing.map((t) => t.toLowerCase()), ...suggested]);
    return Array.from(merged);
  }
  estimateReadingTime(wordCount) {
    return Math.max(1, Math.ceil(wordCount / 200));
  }
};

// src/core/application/use-cases/suggest-note-topics.ts
var NOTE_TOPIC_PROMPT = `You are a PKM (Personal Knowledge Management) expert. Suggest topics for permanent notes from reading materials.

Reading Material:
---
Title: {title}
URL: {url}

Summary: {summary}

Key Insights:
{insights}

User Notes:
{userNotes}
---

Based on the above content, suggest 2-4 permanent note topics. Each topic should:
1. Be a single concept that can stand on its own
2. Be generalizable beyond this specific source
3. Be connectable to broader areas of knowledge
4. Contain actionable or applicable insights

**Write in English.**

Respond with valid JSON only (no markdown):
{
  "topics": [
    {
      "title": "Clear and specific topic title",
      "description": "2-3 sentences explaining the core idea",
      "keyPoints": ["Point 1", "Point 2", "Point 3"],
      "suggestedTags": ["tag1", "tag2"]
    }
  ]
}`;
var SuggestNoteTopicsUseCase = class {
  constructor(app, costTracker) {
    this.app = app;
    this.aiService = getAIService();
    this.costTracker = costTracker;
  }
  async execute(input) {
    var _a, _b, _c;
    try {
      if (!this.aiService) {
        return {
          success: false,
          topics: [],
          error: "AI service not initialized"
        };
      }
      const summary = ((_a = input.analysis) == null ? void 0 : _a.summary) || "";
      const insights = ((_c = (_b = input.analysis) == null ? void 0 : _b.keyInsights) == null ? void 0 : _c.join("\n- ")) || "None provided";
      const prompt = NOTE_TOPIC_PROMPT.replace("{title}", input.title).replace("{url}", input.url || "N/A").replace("{summary}", summary).replace("{insights}", insights).replace("{userNotes}", input.userNotes || "None");
      const currentSpend = this.costTracker.getCurrentSpend();
      const response = await this.aiService.simpleGenerateForFeature(
        "insight-extraction",
        prompt,
        void 0,
        { temperature: 0.5, maxTokens: 8192 },
        // Reasoning models (GPT-5.x, o1, o3) need more tokens for internal reasoning
        currentSpend
      );
      if (!response.success) {
        return {
          success: false,
          topics: [],
          error: response.error || "Failed to generate note topics"
        };
      }
      const parseResult = this.parseTopicsResponse(response.content);
      if (response.tokensUsed) {
        const { provider, model } = this.aiService.getFeatureConfig("insight-extraction");
        const inputTokens = Math.floor(response.tokensUsed * 0.7);
        const outputTokens = response.tokensUsed - inputTokens;
        this.costTracker.trackUsage(provider, model, inputTokens, outputTokens, "insight-extraction");
      }
      if (parseResult.error) {
        return {
          success: false,
          topics: [],
          error: parseResult.error
        };
      }
      if (parseResult.topics.length === 0) {
        return {
          success: false,
          topics: [],
          error: "No note topics found. Please check if analysis results are available."
        };
      }
      return {
        success: true,
        topics: parseResult.topics
      };
    } catch (error) {
      return {
        success: false,
        topics: [],
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
  parseTopicsResponse(response) {
    try {
      let cleaned = response.trim();
      console.log("[SuggestNoteTopics] Raw AI response:", cleaned.substring(0, 500));
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/```json?\n?/g, "").replace(/```$/g, "");
      }
      cleaned = cleaned.trim();
      if (!cleaned) {
        return { topics: [], error: "AI response is empty." };
      }
      const parsed = JSON.parse(cleaned);
      const topics = parsed.topics || parsed;
      if (!Array.isArray(topics)) {
        return { topics: [], error: "Invalid AI response format (not an array)." };
      }
      const validTopics = topics.map((t) => ({
        title: String(t.title || ""),
        description: String(t.description || ""),
        keyPoints: Array.isArray(t.keyPoints) ? t.keyPoints.map(String) : [],
        suggestedTags: Array.isArray(t.suggestedTags) ? t.suggestedTags.map(String) : []
      })).filter((t) => t.title.length > 0);
      return { topics: validTopics };
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : "Unknown parse error";
      console.error("[SuggestNoteTopics] Parse error:", errorMsg, "\nResponse:", response.substring(0, 500));
      return { topics: [], error: `Failed to parse AI response: ${errorMsg}` };
    }
  }
};

// src/views/insights-modal.ts
var import_obsidian3 = require("obsidian");
var InsightsModal = class extends import_obsidian3.Modal {
  constructor(plugin, item) {
    super(plugin.app);
    this.isLoadingTopics = false;
    this.noteTopics = [];
    this.plugin = plugin;
    this.item = item;
  }
  onOpen() {
    var _a;
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("reading-queue-insights-modal");
    if ((_a = this.item.analysis) == null ? void 0 : _a.hasSuggestedNoteTopics()) {
      this.noteTopics = this.item.analysis.suggestedNoteTopics;
    }
    contentEl.createEl("h2", { text: "\u{1F4A1} Insights & Note Suggestions" });
    contentEl.createEl("p", {
      text: this.item.title,
      cls: "insights-modal-title"
    });
    if (this.item.analysis) {
      this.renderAnalysisSection(contentEl);
    } else {
      this.renderNoAnalysisState(contentEl);
    }
    this.renderNoteTopicsSection(contentEl);
    const buttonContainer = contentEl.createDiv({
      cls: "modal-button-container"
    });
    buttonContainer.style.marginTop = "20px";
    buttonContainer.style.textAlign = "center";
    const closeBtn = buttonContainer.createEl("button", {
      text: "Close",
      cls: "mod-cta"
    });
    closeBtn.addEventListener("click", () => this.close());
  }
  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
  renderAnalysisSection(container) {
    const analysis = this.item.analysis;
    const section = container.createDiv({ cls: "insights-section" });
    section.createEl("h3", { text: "\u{1F4DD} Summary" });
    section.createEl("p", { text: analysis.summary });
    if (analysis.keyInsights.length > 0) {
      section.createEl("h3", { text: "\u{1F511} Key Insights" });
      const list = section.createEl("ul", { cls: "insights-list" });
      for (const insight of analysis.keyInsights) {
        const li = list.createEl("li");
        li.createSpan({ text: insight });
        const copyBtn = li.createEl("button", { cls: "insights-copy-btn" });
        (0, import_obsidian3.setIcon)(copyBtn, "copy");
        copyBtn.addEventListener("click", async () => {
          await navigator.clipboard.writeText(insight);
          new import_obsidian3.Notice("Insight copied to clipboard.");
        });
      }
    }
    if (analysis.suggestedTags.length > 0) {
      section.createEl("h3", { text: "\u{1F3F7}\uFE0F Suggested Tags" });
      const tagsEl = section.createDiv({ cls: "insights-tags" });
      for (const tag of analysis.suggestedTags) {
        tagsEl.createSpan({ cls: "reading-queue-tag", text: `#${tag}` });
      }
    }
    const metaEl = section.createDiv({ cls: "insights-meta" });
    metaEl.createEl("small", {
      text: `Analyzed: ${analysis.analyzedAt.toLocaleString()} | Model: ${analysis.model}`
    });
  }
  renderNoAnalysisState(container) {
    const section = container.createDiv({ cls: "insights-section empty" });
    section.createEl("p", {
      text: "No analysis results available for this item."
    });
    section.createEl("p", {
      text: "Run analysis from the edit screen.",
      cls: "muted"
    });
  }
  renderNoteTopicsSection(container) {
    const section = container.createDiv({ cls: "note-topics-section" });
    section.createEl("h3", { text: "\u{1F4DD} Permanent Note Topic Suggestions" });
    const topicsContainer = section.createDiv({ cls: "note-topics-container" });
    if (this.noteTopics.length > 0) {
      this.renderNoteTopics(topicsContainer);
    } else {
      this.renderGenerateTopicsButton(topicsContainer);
    }
  }
  renderGenerateTopicsButton(container) {
    container.empty();
    if (this.isLoadingTopics) {
      const loadingEl = container.createDiv({ cls: "note-topics-loading" });
      loadingEl.createSpan({ text: "Generating note topics..." });
      return;
    }
    const description = container.createEl("p", {
      text: "Get suggestions for permanent note topics based on what you read."
    });
    const generateBtn = container.createEl("button", {
      text: "\u{1F4DD} Get Note Topic Suggestions",
      cls: "mod-cta"
    });
    generateBtn.style.marginTop = "10px";
    generateBtn.addEventListener("click", async () => {
      await this.generateNoteTopics(container);
    });
  }
  async generateNoteTopics(container) {
    if (!this.plugin.costTracker) {
      new import_obsidian3.Notice("AI service not initialized.");
      return;
    }
    this.isLoadingTopics = true;
    this.renderGenerateTopicsButton(container);
    try {
      const useCase = new SuggestNoteTopicsUseCase(this.app, this.plugin.costTracker);
      const result = await useCase.execute({
        itemId: this.item.id,
        title: this.item.title,
        url: this.item.url,
        analysis: this.item.analysis,
        userNotes: this.item.notes
      });
      if (result.success && result.topics.length > 0) {
        this.noteTopics = result.topics;
        if (this.item.analysis) {
          this.item.analysis.setSuggestedNoteTopics(result.topics);
          await this.plugin.repository.save(this.item);
        }
        this.renderNoteTopics(container);
        new import_obsidian3.Notice(`${result.topics.length} note topics suggested.`);
      } else {
        new import_obsidian3.Notice(result.error || "Failed to generate note topics.");
        this.isLoadingTopics = false;
        this.renderGenerateTopicsButton(container);
      }
    } catch (error) {
      new import_obsidian3.Notice("Error generating note topics.");
      console.error("Note topic generation error:", error);
      this.isLoadingTopics = false;
      this.renderGenerateTopicsButton(container);
    }
  }
  renderNoteTopics(container) {
    container.empty();
    const actionRow = container.createDiv({ cls: "note-topics-actions" });
    actionRow.style.marginBottom = "16px";
    actionRow.style.display = "flex";
    actionRow.style.gap = "10px";
    actionRow.style.flexWrap = "wrap";
    const createAllBtn = actionRow.createEl("button", {
      text: "\u{1F4C4} Create Combined Note",
      cls: "mod-cta"
    });
    createAllBtn.addEventListener("click", () => this.createCombinedNote());
    const regenerateBtn = actionRow.createEl("button", {
      text: "\u{1F504} Regenerate"
    });
    regenerateBtn.addEventListener("click", async () => {
      this.noteTopics = [];
      this.isLoadingTopics = false;
      this.renderGenerateTopicsButton(container);
      await this.generateNoteTopics(container);
    });
    for (const topic of this.noteTopics) {
      const topicCard = container.createDiv({ cls: "note-topic-card" });
      const titleRow = topicCard.createDiv({ cls: "note-topic-title-row" });
      titleRow.createEl("h4", { text: topic.title });
      const createBtn = titleRow.createEl("button", { text: "Create Note" });
      createBtn.addEventListener("click", () => this.createNoteFromTopic(topic));
      topicCard.createEl("p", {
        text: topic.description,
        cls: "note-topic-description"
      });
      if (topic.keyPoints.length > 0) {
        const pointsList = topicCard.createEl("ul", { cls: "note-topic-points" });
        for (const point of topic.keyPoints) {
          pointsList.createEl("li", { text: point });
        }
      }
      if (topic.suggestedTags.length > 0) {
        const tagsEl = topicCard.createDiv({ cls: "note-topic-tags" });
        for (const tag of topic.suggestedTags) {
          tagsEl.createSpan({ cls: "reading-queue-tag", text: `#${tag}` });
        }
      }
    }
  }
  async createNoteFromTopic(topic) {
    const content = this.generateNoteContent(topic);
    const fileName = `${topic.title.replace(/[\\/:*?"<>|]/g, "")}.md`;
    const folderPath = this.plugin.settings.defaultNoteFolder;
    const filePath = (0, import_obsidian3.normalizePath)(folderPath ? `${folderPath}/${fileName}` : fileName);
    try {
      if (folderPath) {
        await this.ensureFolder((0, import_obsidian3.normalizePath)(folderPath));
      }
      const fileExists = await this.fileExists(filePath);
      if (fileExists) {
        new import_obsidian3.Notice("A note with the same name already exists.");
        return;
      }
      await this.createFile(filePath, content);
      this.item.addLinkedNote(filePath);
      await this.plugin.repository.save(this.item);
      new import_obsidian3.Notice(`Note created: ${fileName}`);
      await this.app.workspace.openLinkText(filePath, "", true);
    } catch (error) {
      new import_obsidian3.Notice("Failed to create note.");
      console.error("Note creation error:", error);
    }
  }
  /**
   * Ensure folder exists with cross-platform compatibility
   */
  async ensureFolder(path) {
    const normalizedPath = (0, import_obsidian3.normalizePath)(path);
    const existing = this.app.vault.getAbstractFileByPath(normalizedPath);
    if (existing instanceof import_obsidian3.TFolder) {
      return;
    }
    try {
      await this.app.vault.createFolder(normalizedPath);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.toLowerCase().includes("already exists")) {
        return;
      }
      throw error;
    }
  }
  /**
   * Check if file exists with adapter fallback
   */
  async fileExists(path) {
    const normalizedPath = (0, import_obsidian3.normalizePath)(path);
    const file = this.app.vault.getAbstractFileByPath(normalizedPath);
    if (file) return true;
    try {
      return await this.app.vault.adapter.exists(normalizedPath);
    } catch (e) {
      return false;
    }
  }
  /**
   * Create file with cross-platform compatibility
   */
  async createFile(path, content) {
    const normalizedPath = (0, import_obsidian3.normalizePath)(path);
    try {
      await this.app.vault.create(normalizedPath, content);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.toLowerCase().includes("already exists")) {
        await this.app.vault.adapter.write(normalizedPath, content);
        return;
      }
      throw error;
    }
  }
  /**
   * Create a combined note with all insights and note topics
   */
  async createCombinedNote() {
    const analysis = this.item.analysis;
    if (!analysis) {
      new import_obsidian3.Notice("No analysis results available.");
      return;
    }
    const content = this.generateCombinedNoteContent();
    const safeTitle = this.item.title.replace(/[\\/:*?"<>|]/g, "").substring(0, 50);
    const fileName = `${safeTitle} - Comprehensive Insights.md`;
    const folderPath = this.plugin.settings.defaultNoteFolder;
    const filePath = (0, import_obsidian3.normalizePath)(folderPath ? `${folderPath}/${fileName}` : fileName);
    try {
      if (folderPath) {
        await this.ensureFolder((0, import_obsidian3.normalizePath)(folderPath));
      }
      const fileExists = await this.fileExists(filePath);
      if (fileExists) {
        new import_obsidian3.Notice("A note with the same name already exists.");
        return;
      }
      await this.createFile(filePath, content);
      this.item.addLinkedNote(filePath);
      await this.plugin.repository.save(this.item);
      new import_obsidian3.Notice(`Combined note created: ${fileName}`);
      await this.app.workspace.openLinkText(filePath, "", true);
    } catch (error) {
      new import_obsidian3.Notice("Failed to create combined note.");
      console.error("Combined note creation error:", error);
    }
  }
  /**
   * Generate combined note content with all insights and topics
   */
  generateCombinedNoteContent() {
    const analysis = this.item.analysis;
    const sourceLink = this.item.url ? `[${this.item.title}](${this.item.url})` : this.item.title;
    const allTags = /* @__PURE__ */ new Set();
    for (const tag of analysis.suggestedTags) {
      allTags.add(tag);
    }
    for (const topic of this.noteTopics) {
      for (const tag of topic.suggestedTags) {
        allTags.add(tag);
      }
    }
    const tagsArray = Array.from(allTags);
    const insightsList = analysis.keyInsights.map((i) => `- ${i}`).join("\n");
    let topicsSection = "";
    if (this.noteTopics.length > 0) {
      topicsSection = "\n## \u{1F4DD} Permanent Note Topics\n\n";
      for (const topic of this.noteTopics) {
        topicsSection += `### ${topic.title}

`;
        topicsSection += `${topic.description}

`;
        if (topic.keyPoints.length > 0) {
          topicsSection += "**Key Points:**\n";
          topicsSection += topic.keyPoints.map((p) => `- ${p}`).join("\n");
          topicsSection += "\n\n";
        }
      }
    }
    return `---
tags: [${tagsArray.join(", ")}]
source: "[[Reading Queue]]"
created: ${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}
type: comprehensive-insight
---

# ${this.item.title} - Comprehensive Insights

## \u{1F4CC} Source

- ${sourceLink}

## \u{1F4DD} Summary

${analysis.summary}

## \u{1F511} Key Insights

${insightsList}
${topicsSection}
## \u{1F4AD} Related Thoughts



## \u{1F4CB} Metadata

- Analyzed: ${analysis.analyzedAt.toLocaleString()}
- Model: ${analysis.model}
${analysis.estimatedReadingTime ? `- Estimated reading time: ${analysis.getReadingTimeDisplay()}` : ""}
`;
  }
  generateNoteContent(topic) {
    const sourceLink = this.item.url ? `[${this.item.title}](${this.item.url})` : this.item.title;
    const keyPointsList = topic.keyPoints.map((p) => `- ${p}`).join("\n");
    return `---
tags: [${topic.suggestedTags.join(", ")}]
source: "[[Reading Queue]]"
created: ${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}
---

# ${topic.title}

${topic.description}

## Key Points

${keyPointsList}

## Source

- ${sourceLink}

## Related Thoughts



`;
  }
};

// src/views/reading-queue-view.ts
var VIEW_TYPE_READING_QUEUE = "reading-queue-view";
var ReadingQueueView = class extends import_obsidian4.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.items = [];
    this.currentFilter = {};
    this.plugin = plugin;
  }
  getViewType() {
    return VIEW_TYPE_READING_QUEUE;
  }
  getDisplayText() {
    return "Reading Queue";
  }
  getIcon() {
    return "list-checks";
  }
  async onOpen() {
    await this.render();
  }
  async onClose() {
    this.items = [];
    this.currentFilter = {};
  }
  async refresh() {
    await this.render();
  }
  async render() {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass("reading-queue-container");
    this.renderHeader(container);
    this.renderFilters(container);
    await this.loadItems();
    if (this.items.length === 0) {
      this.renderEmptyState(container);
    } else {
      this.renderItems(container);
    }
  }
  renderHeader(container) {
    const header = container.createDiv({ cls: "reading-queue-header" });
    header.createEl("h4", { text: "Reading Queue" });
    const addBtn = header.createEl("button", { cls: "reading-queue-action-btn primary" });
    (0, import_obsidian4.setIcon)(addBtn, "plus");
    addBtn.addEventListener("click", () => {
      this.plugin.showAddItemModal();
    });
  }
  renderFilters(container) {
    const filtersEl = container.createDiv({ cls: "reading-queue-filters" });
    const statusSelect = filtersEl.createEl("select");
    statusSelect.createEl("option", { text: "All Status", value: "" });
    statusSelect.createEl("option", { text: "\u{1F4DA} Queue", value: "queue" /* QUEUE */ });
    statusSelect.createEl("option", { text: "\u{1F4D6} Reading", value: "reading" /* READING */ });
    statusSelect.createEl("option", { text: "\u2705 Done", value: "done" /* DONE */ });
    statusSelect.createEl("option", { text: "\u274C Abandoned", value: "abandoned" /* ABANDONED */ });
    statusSelect.addEventListener("change", async () => {
      if (statusSelect.value) {
        this.currentFilter.status = [statusSelect.value];
      } else {
        delete this.currentFilter.status;
      }
      await this.render();
    });
    const prioritySelect = filtersEl.createEl("select");
    prioritySelect.createEl("option", { text: "All Priority", value: "" });
    prioritySelect.createEl("option", { text: "\u{1F534} High", value: "high" /* HIGH */ });
    prioritySelect.createEl("option", { text: "\u{1F7E1} Medium", value: "medium" /* MEDIUM */ });
    prioritySelect.createEl("option", { text: "\u{1F7E2} Low", value: "low" /* LOW */ });
    prioritySelect.addEventListener("change", async () => {
      if (prioritySelect.value) {
        this.currentFilter.priority = [prioritySelect.value];
      } else {
        delete this.currentFilter.priority;
      }
      await this.render();
    });
  }
  async loadItems() {
    const useCase = new GetQueueItemsUseCase(this.plugin.repository);
    const result = await useCase.execute({
      filter: {
        status: this.currentFilter.status,
        priority: this.currentFilter.priority,
        includeStale: true
      },
      sortBy: "priority",
      sortOrder: "desc"
    });
    if (result.success) {
      this.items = result.items;
    } else {
      this.items = [];
    }
  }
  renderEmptyState(container) {
    const emptyEl = container.createDiv({ cls: "reading-queue-empty" });
    emptyEl.createDiv({ cls: "reading-queue-empty-icon", text: "\u{1F4DA}" });
    emptyEl.createEl("p", { text: "Your reading queue is empty." });
    emptyEl.createEl("p", { text: "Click the + button to add reading materials." });
  }
  renderItems(container) {
    const listEl = container.createDiv({ cls: "reading-queue-list" });
    for (const item of this.items) {
      this.renderItem(listEl, item);
    }
  }
  renderItem(container, item) {
    var _a;
    const itemEl = container.createDiv({
      cls: `reading-queue-item priority-${item.priority.getValue()} status-${item.status.getValue()}`
    });
    const titleRow = itemEl.createDiv({ cls: "reading-queue-item-title" });
    titleRow.createSpan({ cls: "status-icon", text: item.status.getIcon() });
    titleRow.createSpan({ text: item.title });
    const metaRow = itemEl.createDiv({ cls: "reading-queue-item-meta" });
    const priorityBadge = metaRow.createSpan({
      cls: `priority-badge ${item.priority.getValue()}`,
      text: item.priority.getDisplayText()
    });
    if (item.estimatedMinutes) {
      const timeEl = metaRow.createSpan({ cls: "time-estimate" });
      (0, import_obsidian4.setIcon)(timeEl.createSpan(), "clock");
      timeEl.createSpan({ text: `${item.estimatedMinutes} min` });
    }
    if (item.tags.length > 0) {
      const tagsEl = itemEl.createDiv({ cls: "reading-queue-tags" });
      for (const tag of item.tags.slice(0, 3)) {
        tagsEl.createSpan({ cls: "reading-queue-tag", text: `#${tag}` });
      }
      if (item.tags.length > 3) {
        tagsEl.createSpan({ cls: "reading-queue-tag", text: `+${item.tags.length - 3}` });
      }
    }
    if ((_a = item.analysis) == null ? void 0 : _a.summary) {
      const summaryEl = itemEl.createDiv({ cls: "reading-queue-summary" });
      const previewText = item.analysis.summary.length > 100 ? item.analysis.summary.substring(0, 100) + "..." : item.analysis.summary;
      summaryEl.createEl("span", { text: "\u{1F4DD} ", cls: "summary-icon" });
      summaryEl.createEl("span", { text: previewText, cls: "summary-text" });
    }
    if (item.status.isReading() && item.progress > 0) {
      const progressEl = itemEl.createDiv({ cls: "reading-queue-progress" });
      const progressBar = progressEl.createDiv({ cls: "reading-queue-progress-bar" });
      progressBar.style.width = `${item.progress}%`;
    }
    const actionsEl = itemEl.createDiv({ cls: "reading-queue-actions" });
    this.renderItemActions(actionsEl, item);
    itemEl.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      this.showItemContextMenu(e, item);
    });
    if (item.url) {
      itemEl.addEventListener("click", (e) => {
        if (!e.target.closest(".reading-queue-actions")) {
          window.open(item.url, "_blank");
        }
      });
      itemEl.style.cursor = "pointer";
    }
  }
  renderItemActions(container, item) {
    if (item.status.isQueue()) {
      const startBtn = container.createEl("button", {
        cls: "reading-queue-action-btn",
        text: "Start"
      });
      startBtn.addEventListener("click", () => this.updateStatus(item.id, "start"));
    }
    if (item.status.isReading()) {
      const doneBtn = container.createEl("button", {
        cls: "reading-queue-action-btn primary",
        text: "Done"
      });
      doneBtn.addEventListener("click", () => this.updateStatus(item.id, "done"));
    }
    if (item.status.isActive()) {
      const abandonBtn = container.createEl("button", {
        cls: "reading-queue-action-btn",
        text: "Abandon"
      });
      abandonBtn.addEventListener("click", () => this.updateStatus(item.id, "abandon"));
    }
    if (item.analysis || item.status.isDone()) {
      const insightsBtn = container.createEl("button", {
        cls: "reading-queue-action-btn insights",
        text: "\u{1F4A1}"
      });
      insightsBtn.title = "View Insights";
      insightsBtn.addEventListener("click", () => this.showInsightsModal(item));
    }
    if (item.status.isDone() || item.status.isAbandoned()) {
      const restoreBtn = container.createEl("button", {
        cls: "reading-queue-action-btn",
        text: "Restore"
      });
      restoreBtn.addEventListener("click", () => this.updateStatus(item.id, "backToQueue"));
    }
  }
  showInsightsModal(item) {
    const modal = new InsightsModal(this.plugin, item);
    modal.open();
  }
  showItemContextMenu(e, item) {
    const menu = new import_obsidian4.Menu();
    if (item.url) {
      menu.addItem((menuItem) => {
        menuItem.setTitle("Open URL").setIcon("external-link").onClick(() => {
          window.open(item.url, "_blank");
        });
      });
    }
    menu.addItem((menuItem) => {
      menuItem.setTitle("Edit").setIcon("pencil").onClick(() => {
        this.plugin.showEditItemModal(item);
      });
    });
    menu.addSeparator();
    menu.addItem((menuItem) => {
      menuItem.setTitle("Delete").setIcon("trash").onClick(async () => {
        await this.deleteItem(item.id);
      });
    });
    menu.showAtMouseEvent(e);
  }
  async updateStatus(itemId, action) {
    const useCase = new UpdateItemStatusUseCase(this.plugin.repository);
    const result = await useCase.execute({ itemId, action });
    if (result.success) {
      await this.render();
    }
  }
  async deleteItem(itemId) {
    const useCase = new DeleteReadingItemUseCase(this.plugin.repository);
    const result = await useCase.execute({ itemId });
    if (result.success) {
      await this.render();
    }
  }
};

// src/views/add-item-modal.ts
var import_obsidian5 = require("obsidian");
var AddItemModal = class extends import_obsidian5.Modal {
  constructor(plugin, onSave, editItem) {
    super(plugin.app);
    // Form values
    this.title = "";
    this.url = "";
    this.priority = "medium" /* MEDIUM */;
    this.tagsInput = "";
    this.notes = "";
    this.isAnalyzing = false;
    this.plugin = plugin;
    this.onSave = onSave;
    this.editItem = editItem;
    if (editItem) {
      this.title = editItem.title;
      this.url = editItem.url || "";
      this.priority = editItem.priority.getValue();
      this.estimatedMinutes = editItem.estimatedMinutes;
      this.tagsInput = editItem.tags.join(", ");
      this.notes = editItem.notes || "";
    }
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("reading-queue-modal");
    contentEl.createEl("h2", {
      text: this.editItem ? "Edit Reading Item" : "Add Reading Item"
    });
    new import_obsidian5.Setting(contentEl).setName("Title").setDesc("Title of the reading material").addText((text) => {
      this.titleInput = text.inputEl;
      text.setPlaceholder("e.g., Clean Architecture").setValue(this.title).onChange((value) => {
        this.title = value;
      });
      text.inputEl.style.width = "100%";
    });
    const urlSetting = new import_obsidian5.Setting(contentEl).setName("URL").setDesc("Web link (optional)").addText((text) => {
      text.setPlaceholder("https://...").setValue(this.url).onChange((value) => {
        this.url = value;
        this.updateAnalyzeButtonState();
        this.scheduleAutoAnalyze();
      });
      text.inputEl.style.width = "100%";
    });
    const aiService = getAIService();
    if (aiService) {
      urlSetting.addButton((button) => {
        this.analyzeButton = button.buttonEl;
        button.setIcon("sparkles").setTooltip("Analyze content with AI").onClick(() => this.analyzeUrl());
        button.buttonEl.addClass("reading-queue-analyze-btn");
        this.updateAnalyzeButtonState();
      });
    }
    this.analysisContainer = contentEl.createDiv({
      cls: "reading-queue-analysis-container"
    });
    this.analysisContainer.style.display = "none";
    new import_obsidian5.Setting(contentEl).setName("Priority").setDesc("Reading priority").addDropdown((dropdown) => {
      this.priorityDropdown = dropdown.selectEl;
      dropdown.addOption("high" /* HIGH */, "\u{1F534} High").addOption("medium" /* MEDIUM */, "\u{1F7E1} Medium").addOption("low" /* LOW */, "\u{1F7E2} Low").setValue(this.priority).onChange((value) => {
        this.priority = value;
      });
    });
    new import_obsidian5.Setting(contentEl).setName("Estimated Time").setDesc("In minutes (optional)").addText((text) => {
      var _a;
      this.estimatedMinutesInput = text.inputEl;
      text.setPlaceholder("30").setValue(((_a = this.estimatedMinutes) == null ? void 0 : _a.toString()) || "").onChange((value) => {
        const parsed = parseInt(value, 10);
        this.estimatedMinutes = isNaN(parsed) ? void 0 : parsed;
      });
      text.inputEl.type = "number";
      text.inputEl.min = "1";
      text.inputEl.style.width = "80px";
    });
    new import_obsidian5.Setting(contentEl).setName("Tags").setDesc("Comma separated (optional)").addText((text) => {
      this.tagsInputEl = text.inputEl;
      text.setPlaceholder("development, architecture, clean-code").setValue(this.tagsInput).onChange((value) => {
        this.tagsInput = value;
      });
      text.inputEl.style.width = "100%";
    });
    new import_obsidian5.Setting(contentEl).setName("Notes").setDesc("Quick notes (optional)").addTextArea((textarea) => {
      textarea.setPlaceholder("Notes about this material...").setValue(this.notes).onChange((value) => {
        this.notes = value;
      });
      textarea.inputEl.style.width = "100%";
      textarea.inputEl.rows = 3;
    });
    const buttonContainer = contentEl.createDiv({
      cls: "modal-button-container"
    });
    buttonContainer.style.display = "flex";
    buttonContainer.style.justifyContent = "flex-end";
    buttonContainer.style.gap = "8px";
    buttonContainer.style.marginTop = "16px";
    const cancelBtn = buttonContainer.createEl("button", { text: "Cancel" });
    cancelBtn.addEventListener("click", () => this.close());
    const saveBtn = buttonContainer.createEl("button", {
      text: this.editItem ? "Update" : "Add",
      cls: "mod-cta"
    });
    saveBtn.addEventListener("click", () => this.save());
  }
  onClose() {
    if (this.autoAnalyzeTimeout) {
      clearTimeout(this.autoAnalyzeTimeout);
    }
    const { contentEl } = this;
    contentEl.empty();
  }
  async save() {
    if (!this.title.trim()) {
      new import_obsidian5.Notice("Please enter a title.");
      return;
    }
    const tags = this.tagsInput.split(",").map((t) => t.trim()).filter((t) => t.length > 0);
    try {
      if (this.editItem) {
        const useCase = new UpdateReadingItemUseCase(this.plugin.repository);
        const result = await useCase.execute({
          itemId: this.editItem.id,
          title: this.title.trim(),
          url: this.url.trim() || void 0,
          priority: this.priority,
          estimatedMinutes: this.estimatedMinutes,
          tags,
          notes: this.notes.trim() || void 0,
          analysis: this.analysis
        });
        if (result.success) {
          new import_obsidian5.Notice("Item updated successfully.");
          this.onSave();
          this.close();
        } else {
          new import_obsidian5.Notice(result.error || "Failed to update item.");
        }
      } else {
        const useCase = new AddReadingItemUseCase(this.plugin.repository);
        const result = await useCase.execute({
          title: this.title.trim(),
          url: this.url.trim() || void 0,
          priority: this.priority,
          estimatedMinutes: this.estimatedMinutes,
          tags,
          notes: this.notes.trim() || void 0,
          analysis: this.analysis
        });
        if (result.success) {
          new import_obsidian5.Notice("Item added successfully.");
          this.onSave();
          this.close();
        } else {
          new import_obsidian5.Notice(result.error || "Failed to add item.");
        }
      }
    } catch (error) {
      new import_obsidian5.Notice("An error occurred.");
      console.error(error);
    }
  }
  updateAnalyzeButtonState() {
    if (!this.analyzeButton) return;
    const hasValidUrl = this.url.trim().startsWith("http");
    this.analyzeButton.disabled = !hasValidUrl || this.isAnalyzing;
    if (this.isAnalyzing) {
      this.analyzeButton.addClass("is-loading");
    } else {
      this.analyzeButton.removeClass("is-loading");
    }
  }
  scheduleAutoAnalyze() {
    if (this.autoAnalyzeTimeout) {
      clearTimeout(this.autoAnalyzeTimeout);
      this.autoAnalyzeTimeout = void 0;
    }
    const aiSettings = this.plugin.settings.ai;
    if (!aiSettings.autoAnalyzeOnAdd) return;
    if (this.editItem) return;
    if (!this.url.trim().startsWith("http")) return;
    this.autoAnalyzeTimeout = setTimeout(() => {
      this.analyzeUrl();
    }, 1500);
  }
  async analyzeUrl() {
    if (this.isAnalyzing || !this.url.trim()) return;
    const costTracker = this.plugin.costTracker;
    if (!costTracker) {
      new import_obsidian5.Notice("AI service not initialized.");
      return;
    }
    this.isAnalyzing = true;
    this.updateAnalyzeButtonState();
    new import_obsidian5.Notice("Analyzing content...");
    try {
      const useCase = new AnalyzeUrlContentUseCase(costTracker);
      const result = await useCase.execute({
        itemId: "temp-" + Date.now(),
        url: this.url.trim(),
        existingTags: this.tagsInput.split(",").map((t) => t.trim()).filter((t) => t)
      });
      if (result.success && result.analysis) {
        this.analysis = result.analysis;
        this.renderAnalysisResults();
        this.autoApplySuggestions();
        new import_obsidian5.Notice("Analysis complete!");
      } else {
        new import_obsidian5.Notice(result.error || "Analysis failed.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error during analysis";
      new import_obsidian5.Notice(message);
      console.error("Analysis error:", error);
    } finally {
      this.isAnalyzing = false;
      this.updateAnalyzeButtonState();
    }
  }
  renderAnalysisResults() {
    if (!this.analysisContainer || !this.analysis) return;
    this.analysisContainer.empty();
    this.analysisContainer.style.display = "block";
    this.analysisContainer.style.padding = "12px";
    this.analysisContainer.style.marginBottom = "12px";
    this.analysisContainer.style.border = "1px solid var(--background-modifier-border)";
    this.analysisContainer.style.borderRadius = "8px";
    this.analysisContainer.style.backgroundColor = "var(--background-secondary)";
    const header = this.analysisContainer.createDiv({ cls: "analysis-header" });
    header.style.display = "flex";
    header.style.justifyContent = "space-between";
    header.style.alignItems = "center";
    header.style.marginBottom = "12px";
    header.createEl("h4", { text: "\u2728 AI Analysis Results" }).style.margin = "0";
    const applyAllBtn = header.createEl("button", {
      text: "Apply All",
      cls: "mod-cta"
    });
    applyAllBtn.style.fontSize = "12px";
    applyAllBtn.style.padding = "4px 8px";
    applyAllBtn.addEventListener("click", () => this.applyAllSuggestions());
    if (this.analysis.title && this.analysis.title !== this.title) {
      this.renderSuggestionItem("Title", this.analysis.title, () => {
        this.title = this.analysis.title;
        new import_obsidian5.Notice("Title applied.");
      });
    }
    const summarySection = this.analysisContainer.createDiv({ cls: "analysis-section" });
    summarySection.createEl("strong", { text: "\u{1F4DD} Summary" });
    summarySection.createEl("p", { text: this.analysis.summary }).style.margin = "4px 0 12px 0";
    if (this.analysis.keyInsights.length > 0) {
      const insightsSection = this.analysisContainer.createDiv({ cls: "analysis-section" });
      insightsSection.createEl("strong", { text: "\u{1F4A1} Key Insights" });
      const insightsList = insightsSection.createEl("ul");
      insightsList.style.margin = "4px 0 12px 0";
      insightsList.style.paddingLeft = "20px";
      for (const insight of this.analysis.keyInsights) {
        insightsList.createEl("li", { text: insight });
      }
    }
    if (this.analysis.suggestedTags.length > 0) {
      this.renderSuggestionItem(
        "Tags",
        this.analysis.suggestedTags.join(", "),
        () => this.applySuggestedTags()
      );
    }
    if (this.analysis.suggestedPriority) {
      const priorityLabels = {
        high: "\u{1F534} High",
        medium: "\u{1F7E1} Medium",
        low: "\u{1F7E2} Low"
      };
      this.renderSuggestionItem(
        "Priority",
        priorityLabels[this.analysis.suggestedPriority] || this.analysis.suggestedPriority,
        () => this.applySuggestedPriority()
      );
    }
    if (this.analysis.estimatedReadingTime) {
      this.renderSuggestionItem(
        "Estimated Time",
        `${this.analysis.estimatedReadingTime} min`,
        () => this.applySuggestedReadingTime()
      );
    }
  }
  renderSuggestionItem(label, value, onApply) {
    if (!this.analysisContainer) return;
    const item = this.analysisContainer.createDiv({ cls: "suggestion-item" });
    item.style.display = "flex";
    item.style.justifyContent = "space-between";
    item.style.alignItems = "center";
    item.style.padding = "6px 0";
    item.style.borderBottom = "1px solid var(--background-modifier-border)";
    const labelSpan = item.createSpan({ cls: "suggestion-label" });
    labelSpan.createEl("strong", { text: label + ": " });
    labelSpan.createSpan({ text: value });
    const applyBtn = item.createEl("button", { text: "Apply" });
    applyBtn.style.fontSize = "11px";
    applyBtn.style.padding = "2px 6px";
    applyBtn.addEventListener("click", () => {
      onApply();
      item.style.opacity = "0.5";
      applyBtn.disabled = true;
    });
  }
  autoApplySuggestions() {
    if (!this.analysis) return;
    const aiSettings = this.plugin.settings.ai;
    let applied = [];
    if (this.analysis.title && !this.title.trim()) {
      this.title = this.analysis.title;
      if (this.titleInput) {
        this.titleInput.value = this.title;
      }
      applied.push("Title");
    }
    if (aiSettings.autoSuggestTags && this.analysis.suggestedTags.length > 0) {
      this.applySuggestedTags(false);
      applied.push("Tags");
    }
    if (aiSettings.autoSuggestPriority && this.analysis.suggestedPriority) {
      this.applySuggestedPriority(false);
      applied.push("Priority");
    }
    if (this.analysis.estimatedReadingTime && !this.estimatedMinutes) {
      this.applySuggestedReadingTime(false);
      applied.push("Estimated Time");
    }
    if (applied.length > 0) {
      new import_obsidian5.Notice(`Auto-applied: ${applied.join(", ")}`);
    }
  }
  applyAllSuggestions() {
    if (!this.analysis) return;
    if (this.analysis.title) {
      this.title = this.analysis.title;
      if (this.titleInput) {
        this.titleInput.value = this.title;
      }
    }
    this.applySuggestedTags(true);
    this.applySuggestedPriority(true);
    this.applySuggestedReadingTime(true);
    new import_obsidian5.Notice("All suggestions applied.");
    this.renderAnalysisResults();
  }
  applySuggestedTags(showNotice = true) {
    if (!this.analysis) return;
    const existingTags = this.tagsInput.split(",").map((t) => t.trim().toLowerCase()).filter((t) => t);
    const newTags = [.../* @__PURE__ */ new Set([...existingTags, ...this.analysis.suggestedTags])];
    this.tagsInput = newTags.join(", ");
    if (this.tagsInputEl) {
      this.tagsInputEl.value = this.tagsInput;
    }
    if (showNotice) {
      new import_obsidian5.Notice("Tags applied.");
    }
  }
  applySuggestedPriority(showNotice = true) {
    var _a;
    if (!((_a = this.analysis) == null ? void 0 : _a.suggestedPriority)) return;
    this.priority = this.analysis.suggestedPriority;
    if (this.priorityDropdown) {
      this.priorityDropdown.value = this.priority;
    }
    if (showNotice) {
      new import_obsidian5.Notice("Priority applied.");
    }
  }
  applySuggestedReadingTime(showNotice = true) {
    var _a;
    if (!((_a = this.analysis) == null ? void 0 : _a.estimatedReadingTime)) return;
    this.estimatedMinutes = this.analysis.estimatedReadingTime;
    if (this.estimatedMinutesInput) {
      this.estimatedMinutesInput.value = this.estimatedMinutes.toString();
    }
    if (showNotice) {
      new import_obsidian5.Notice("Estimated time applied.");
    }
  }
};

// src/views/settings/reading-queue-setting-tab.ts
var import_obsidian6 = require("obsidian");
var DEFAULT_AI_SETTINGS = {
  provider: "claude",
  apiKeys: {},
  models: {
    claude: "claude-3-5-haiku-20241022",
    gemini: "gemini-2.0-flash",
    openai: "gpt-4o-mini",
    grok: "grok-4-1-fast-non-reasoning"
  },
  featureModels: {},
  defaultLanguage: "en",
  budgetLimit: 5,
  autoAnalyzeOnAdd: true,
  autoSuggestTags: true,
  autoSuggestPriority: false
};
var DEFAULT_SETTINGS = {
  defaultPriority: "medium" /* MEDIUM */,
  staleDaysThreshold: 30,
  showCompletedItems: false,
  showAbandonedItems: false,
  defaultNoteFolder: "",
  ai: DEFAULT_AI_SETTINGS
};
var ReadingQueueSettingTab = class extends import_obsidian6.PluginSettingTab {
  constructor(plugin) {
    super(plugin.app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Reading Queue Manager Settings" });
    this.displayGeneralSection(containerEl);
    this.displayDisplaySection(containerEl);
    this.displayAISection(containerEl);
    this.displayAboutSection(containerEl);
  }
  displayGeneralSection(containerEl) {
    containerEl.createEl("h3", { text: "General" });
    new import_obsidian6.Setting(containerEl).setName("Default Priority").setDesc("Default priority when adding new items").addDropdown((dropdown) => {
      dropdown.addOption("high" /* HIGH */, "High").addOption("medium" /* MEDIUM */, "Medium").addOption("low" /* LOW */, "Low").setValue(this.plugin.settings.defaultPriority).onChange(async (value) => {
        this.plugin.settings.defaultPriority = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian6.Setting(containerEl).setName("Stale Item Threshold (days)").setDesc('Mark items in queue for this many days as "stale"').addText((text) => {
      text.setPlaceholder("30").setValue(this.plugin.settings.staleDaysThreshold.toString()).onChange(async (value) => {
        const parsed = parseInt(value, 10);
        if (!isNaN(parsed) && parsed > 0) {
          this.plugin.settings.staleDaysThreshold = parsed;
          await this.plugin.saveSettings();
        }
      });
      text.inputEl.type = "number";
      text.inputEl.min = "1";
      text.inputEl.style.width = "80px";
    });
    new import_obsidian6.Setting(containerEl).setName("Note Creation Folder").setDesc("Folder path for permanent notes (leave empty for vault root)").addDropdown((dropdown) => {
      dropdown.addOption("", "/ (Vault Root)");
      const folders = this.plugin.app.vault.getAllLoadedFiles().filter((f) => f instanceof import_obsidian6.TFolder).map((f) => f.path).sort();
      for (const folder of folders) {
        dropdown.addOption(folder, folder);
      }
      dropdown.setValue(this.plugin.settings.defaultNoteFolder).onChange(async (value) => {
        this.plugin.settings.defaultNoteFolder = value;
        await this.plugin.saveSettings();
      });
    });
  }
  displayDisplaySection(containerEl) {
    containerEl.createEl("h3", { text: "Display" });
    new import_obsidian6.Setting(containerEl).setName("Show Completed Items").setDesc("Show completed items in the default list").addToggle((toggle) => {
      toggle.setValue(this.plugin.settings.showCompletedItems).onChange(async (value) => {
        this.plugin.settings.showCompletedItems = value;
        await this.plugin.saveSettings();
        this.plugin.refreshView();
      });
    });
    new import_obsidian6.Setting(containerEl).setName("Show Abandoned Items").setDesc("Show abandoned items in the default list").addToggle((toggle) => {
      toggle.setValue(this.plugin.settings.showAbandonedItems).onChange(async (value) => {
        this.plugin.settings.showAbandonedItems = value;
        await this.plugin.saveSettings();
        this.plugin.refreshView();
      });
    });
  }
  displayAISection(containerEl) {
    containerEl.createEl("h3", { text: "AI Settings" });
    const aiSettings = this.plugin.settings.ai;
    new import_obsidian6.Setting(containerEl).setName("AI Provider").setDesc("Select the LLM provider to use").addDropdown((dropdown) => {
      for (const [id, config] of Object.entries(AI_PROVIDERS)) {
        dropdown.addOption(id, config.displayName);
      }
      dropdown.setValue(aiSettings.provider).onChange(async (value) => {
        this.plugin.settings.ai.provider = value;
        await this.plugin.saveSettings();
        this.display();
      });
    });
    const currentProvider = aiSettings.provider;
    const providerConfig = AI_PROVIDERS[currentProvider];
    new import_obsidian6.Setting(containerEl).setName(`${providerConfig.displayName} API Key`).setDesc(`Enter your ${providerConfig.name} API key`).addText((text) => {
      text.setPlaceholder("API Key").setValue(aiSettings.apiKeys[currentProvider] || "").onChange(async (value) => {
        this.plugin.settings.ai.apiKeys[currentProvider] = value;
        await this.plugin.saveSettings();
      });
      text.inputEl.type = "password";
      text.inputEl.style.width = "300px";
    }).addButton((button) => {
      button.setButtonText("Test").onClick(async () => {
        const aiService = getAIService();
        if (!aiService) {
          new import_obsidian6.Notice("AI service not initialized.");
          return;
        }
        button.setButtonText("Testing...");
        button.setDisabled(true);
        try {
          const isValid = await aiService.testCurrentApiKey();
          if (isValid) {
            new import_obsidian6.Notice("API key is valid!");
          } else {
            new import_obsidian6.Notice("API key is invalid.");
          }
        } catch (error) {
          new import_obsidian6.Notice(`Test failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        } finally {
          button.setButtonText("Test");
          button.setDisabled(false);
        }
      });
    });
    const models = getModelsByProvider(currentProvider);
    new import_obsidian6.Setting(containerEl).setName("Model").setDesc("Select the model to use").addDropdown((dropdown) => {
      for (const model of models) {
        dropdown.addOption(model.id, `${model.displayName} (${model.tier})`);
      }
      dropdown.setValue(aiSettings.models[currentProvider]).onChange(async (value) => {
        this.plugin.settings.ai.models[currentProvider] = value;
        await this.plugin.saveSettings();
      });
    });
    containerEl.createEl("h4", { text: "Auto Analysis" });
    new import_obsidian6.Setting(containerEl).setName("Auto-analyze on URL Add").setDesc("Automatically analyze content when adding a new URL").addToggle((toggle) => {
      toggle.setValue(aiSettings.autoAnalyzeOnAdd).onChange(async (value) => {
        this.plugin.settings.ai.autoAnalyzeOnAdd = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian6.Setting(containerEl).setName("Auto-suggest Tags").setDesc("Automatically suggest tags based on analysis results").addToggle((toggle) => {
      toggle.setValue(aiSettings.autoSuggestTags).onChange(async (value) => {
        this.plugin.settings.ai.autoSuggestTags = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian6.Setting(containerEl).setName("Auto-suggest Priority").setDesc("Suggest priority based on content and existing notes").addToggle((toggle) => {
      toggle.setValue(aiSettings.autoSuggestPriority).onChange(async (value) => {
        this.plugin.settings.ai.autoSuggestPriority = value;
        await this.plugin.saveSettings();
      });
    });
    containerEl.createEl("h4", { text: "Budget Management" });
    new import_obsidian6.Setting(containerEl).setName("Monthly Budget Limit ($)").setDesc("Set to 0 for no limit").addText((text) => {
      var _a;
      text.setPlaceholder("5.00").setValue(((_a = aiSettings.budgetLimit) == null ? void 0 : _a.toString()) || "").onChange(async (value) => {
        const parsed = parseFloat(value);
        if (!isNaN(parsed) && parsed >= 0) {
          this.plugin.settings.ai.budgetLimit = parsed > 0 ? parsed : void 0;
          await this.plugin.saveSettings();
        }
      });
      text.inputEl.type = "number";
      text.inputEl.step = "0.01";
      text.inputEl.min = "0";
      text.inputEl.style.width = "100px";
    });
    const costTracker = this.plugin.costTracker;
    if (costTracker) {
      const currentSpend = costTracker.getCurrentMonthSpend();
      const budgetLimit = aiSettings.budgetLimit;
      const costEl = containerEl.createDiv({ cls: "rq-cost-display" });
      costEl.createEl("p", {
        text: `This month's usage: $${currentSpend.toFixed(4)}${budgetLimit ? ` / $${budgetLimit.toFixed(2)}` : ""}`
      });
      if (budgetLimit) {
        const percentage = currentSpend / budgetLimit * 100;
        const progressEl = costEl.createDiv({ cls: "rq-budget-progress" });
        progressEl.style.cssText = `
          width: 100%;
          height: 8px;
          background: var(--background-modifier-border);
          border-radius: 4px;
          overflow: hidden;
        `;
        const barEl = progressEl.createDiv();
        barEl.style.cssText = `
          width: ${Math.min(percentage, 100)}%;
          height: 100%;
          background: ${percentage > 80 ? "var(--text-error)" : "var(--interactive-accent)"};
          transition: width 0.3s ease;
        `;
      }
    }
  }
  displayAboutSection(containerEl) {
    containerEl.createEl("h3", { text: "About" });
    const aboutEl = containerEl.createDiv();
    aboutEl.createEl("p", {
      text: `Reading Queue Manager v${this.plugin.manifest.version}`
    });
    aboutEl.createEl("p", {
      text: "A PKM tool for systematically managing reading materials with AI-powered analysis."
    });
  }
};

// src/main.ts
var ReadingQueuePlugin = class extends import_obsidian7.Plugin {
  async onload() {
    console.log("Loading Reading Queue Manager plugin");
    await this.loadSettings();
    this._repositoryImpl = new ObsidianReadingQueueRepository(this);
    this.repository = this._repositoryImpl;
    await this._repositoryImpl.load();
    this.initializeAIServices();
    this.registerView(
      VIEW_TYPE_READING_QUEUE,
      (leaf) => new ReadingQueueView(leaf, this)
    );
    this.addRibbonIcon("list-checks", "Reading Queue", () => {
      this.activateView();
    });
    this.addCommand({
      id: "open-reading-queue",
      name: "Open Reading Queue",
      callback: () => {
        this.activateView();
      }
    });
    this.addCommand({
      id: "add-reading-item",
      name: "Add Reading Item",
      callback: () => {
        this.showAddItemModal();
      }
    });
    this.addCommand({
      id: "add-reading-item-from-clipboard",
      name: "Add Reading Item from Clipboard",
      callback: async () => {
        await this.addFromClipboard();
      }
    });
    this.addSettingTab(new ReadingQueueSettingTab(this));
    this.app.workspace.onLayoutReady(() => {
    });
  }
  async onunload() {
    console.log("Unloading Reading Queue Manager plugin");
    resetAIService();
    resetEventEmitter();
  }
  initializeAIServices() {
    const emitter = getEventEmitter();
    this.costTracker = new CostTracker(
      this.settings.ai.budgetLimit,
      emitter
    );
    const aiService = initializeAIService(this.settings.ai);
    aiService.registerProvider(new ClaudeProvider());
    aiService.registerProvider(new OpenAIProvider());
    aiService.registerProvider(new GeminiProvider());
    aiService.registerProvider(new GrokProvider());
    console.log("AI services initialized");
  }
  async loadSettings() {
    const loaded = await this.loadData();
    this.settings = {
      ...DEFAULT_SETTINGS,
      ai: {
        ...DEFAULT_SETTINGS.ai,
        apiKeys: { ...DEFAULT_SETTINGS.ai.apiKeys },
        models: { ...DEFAULT_SETTINGS.ai.models },
        featureModels: { ...DEFAULT_SETTINGS.ai.featureModels }
      }
    };
    if (loaded) {
      if (loaded.defaultPriority !== void 0) this.settings.defaultPriority = loaded.defaultPriority;
      if (loaded.staleDaysThreshold !== void 0) this.settings.staleDaysThreshold = loaded.staleDaysThreshold;
      if (loaded.showCompletedItems !== void 0) this.settings.showCompletedItems = loaded.showCompletedItems;
      if (loaded.showAbandonedItems !== void 0) this.settings.showAbandonedItems = loaded.showAbandonedItems;
      if (loaded.defaultNoteFolder !== void 0) this.settings.defaultNoteFolder = loaded.defaultNoteFolder;
      if (loaded.ai) {
        if (loaded.ai.provider !== void 0) this.settings.ai.provider = loaded.ai.provider;
        if (loaded.ai.defaultLanguage !== void 0) this.settings.ai.defaultLanguage = loaded.ai.defaultLanguage;
        if (loaded.ai.budgetLimit !== void 0) this.settings.ai.budgetLimit = loaded.ai.budgetLimit;
        if (loaded.ai.autoAnalyzeOnAdd !== void 0) this.settings.ai.autoAnalyzeOnAdd = loaded.ai.autoAnalyzeOnAdd;
        if (loaded.ai.autoSuggestTags !== void 0) this.settings.ai.autoSuggestTags = loaded.ai.autoSuggestTags;
        if (loaded.ai.autoSuggestPriority !== void 0) this.settings.ai.autoSuggestPriority = loaded.ai.autoSuggestPriority;
        if (loaded.ai.apiKeys) {
          this.settings.ai.apiKeys = { ...this.settings.ai.apiKeys, ...loaded.ai.apiKeys };
        }
        if (loaded.ai.models) {
          this.settings.ai.models = { ...this.settings.ai.models, ...loaded.ai.models };
        }
        if (loaded.ai.featureModels) {
          this.settings.ai.featureModels = { ...this.settings.ai.featureModels, ...loaded.ai.featureModels };
        }
      }
    }
  }
  async saveSettings() {
    await this.saveData(this.settings);
    updateAIServiceSettings(this.settings.ai);
    if (this.costTracker) {
      this.costTracker.setBudgetLimit(this.settings.ai.budgetLimit);
    }
  }
  async activateView() {
    const { workspace } = this.app;
    let leaf = null;
    const leaves = workspace.getLeavesOfType(VIEW_TYPE_READING_QUEUE);
    if (leaves.length > 0) {
      leaf = leaves[0];
    } else {
      leaf = workspace.getRightLeaf(false);
      if (leaf) {
        await leaf.setViewState({
          type: VIEW_TYPE_READING_QUEUE,
          active: true
        });
      }
    }
    if (leaf) {
      workspace.revealLeaf(leaf);
    }
  }
  showAddItemModal() {
    const modal = new AddItemModal(this, async () => {
      await this.activateView();
      this.refreshView();
    });
    modal.open();
  }
  showEditItemModal(item) {
    const modal = new AddItemModal(
      this,
      () => {
        this.refreshView();
      },
      item
    );
    modal.open();
  }
  async addFromClipboard() {
    try {
      const clipboardText = await navigator.clipboard.readText();
      const trimmed = clipboardText.trim();
      if (!trimmed) {
        return;
      }
      const isUrl = trimmed.startsWith("http://") || trimmed.startsWith("https://");
      const modal = new AddItemModal(this, () => {
        this.refreshView();
      });
      if (isUrl) {
        modal.url = trimmed;
        modal.title = trimmed;
      } else {
        modal.title = trimmed;
      }
      modal.open();
    } catch (error) {
      console.error("Failed to read clipboard:", error);
    }
  }
  refreshView() {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_READING_QUEUE);
    for (const leaf of leaves) {
      const view = leaf.view;
      if (view && typeof view.refresh === "function") {
        view.refresh();
      }
    }
  }
  /**
   * Get the AI service instance
   */
  getAIService() {
    return getAIService();
  }
};
