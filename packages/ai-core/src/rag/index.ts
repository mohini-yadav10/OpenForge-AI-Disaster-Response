export interface Document {
  id: string;
  title: string;
  content: string;
  metadata?: Record<string, any>;
}

export interface Chunk {
  id: string;
  documentId: string;
  text: string;
  vector?: number[];
  metadata?: Record<string, any>;
}

export interface DocumentLoader {
  load(filePath: string): Promise<Buffer>;
}

export interface TextExtractor {
  extract(buffer: Buffer, mimeType: string): Promise<string>;
}

export interface Chunker {
  chunk(document: Document): Chunk[];
}

export interface EmbeddingProvider {
  name: string;
  embedText(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
}

export interface VectorStore {
  name: string;
  addChunks(chunks: Chunk[]): Promise<void>;
  search(queryVector: number[], topK: number): Promise<Chunk[]>;
}

export interface Retriever {
  retrieve(query: string, topK?: number): Promise<Chunk[]>;
}

export interface ContextBuilder {
  buildContext(chunks: Chunk[]): string;
}

export class MockEmbeddingProvider implements EmbeddingProvider {
  name = "MockEmbedding";

  async embedText(text: string): Promise<number[]> {
    return Array.from({ length: 1536 }, () => Math.random() - 0.5);
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    return texts.map(() => Array.from({ length: 1536 }, () => Math.random() - 0.5));
  }
}

import { pipeline, FeatureExtractionPipeline } from '@huggingface/transformers';

export class LocalEmbeddingProvider implements EmbeddingProvider {
  name = "LocalEmbedding";
  private modelPath: string;
  private extractor: FeatureExtractionPipeline | null = null;
  public dimensions: number = 0;

  constructor(modelPath: string = 'Xenova/all-MiniLM-L6-v2') {
    this.modelPath = modelPath;
  }

  private async getExtractor(): Promise<FeatureExtractionPipeline> {
    if (!this.extractor) {
      try {
        this.extractor = await pipeline('feature-extraction', this.modelPath);
      } catch (e: any) {
        throw new Error(`Failed to load embedding model ${this.modelPath}: ${e.message}`);
      }
    }
    return this.extractor;
  }

  async embedText(text: string): Promise<number[]> {
    const extractor = await this.getExtractor();
    const output = await extractor(text, { pooling: 'mean', normalize: true });
    
    // Store dimensions if not yet set
    if (this.dimensions === 0 && output.dims.length > 0) {
      this.dimensions = output.dims[output.dims.length - 1];
    }
    
    return Array.from(output.data);
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];
    
    const extractor = await this.getExtractor();
    const output = await extractor(texts, { pooling: 'mean', normalize: true });
    
    // Output dimensions: [batch_size, seq_len?, hidden_size]
    // Because of mean pooling, it usually returns [batch_size, hidden_size]
    const batchSize = output.dims[0];
    const hiddenSize = output.dims[output.dims.length - 1];
    
    if (this.dimensions === 0) {
      this.dimensions = hiddenSize;
    }

    const vectors: number[][] = [];
    for (let i = 0; i < batchSize; i++) {
      const start = i * hiddenSize;
      const end = start + hiddenSize;
      vectors.push(Array.from(output.data.slice(start, end)));
    }
    
    return vectors;
  }
}

import { cosineSimilarity } from '../utils/math';

export class InMemoryVectorStore implements VectorStore {
  name = "InMemoryStore";
  private chunks: Chunk[] = [];

  async addChunks(chunks: Chunk[]): Promise<void> {
    this.chunks.push(...chunks);
  }

  async search(queryVector: number[], topK: number): Promise<Chunk[]> {
    const scoredChunks = this.chunks.map(chunk => ({
      chunk,
      score: chunk.vector ? cosineSimilarity(queryVector, chunk.vector) : -1
    }));
    
    scoredChunks.sort((a, b) => b.score - a.score);
    
    return scoredChunks.slice(0, topK).map(s => s.chunk);
  }
}

export class BasicTextChunker implements Chunker {
  chunkSize: number;
  overlap: number;

  constructor(chunkSize = 1000, overlap = 200) {
    this.chunkSize = chunkSize;
    this.overlap = overlap;
  }

  chunk(document: Document): Chunk[] {
    const words = document.content.split(/\s+/);
    const chunks: Chunk[] = [];
    let i = 0;
    let chunkId = 0;

    while (i < words.length) {
      const chunkText = words.slice(i, i + this.chunkSize).join(' ');
      chunks.push({
        id: `${document.id}-chunk-${chunkId++}`,
        documentId: document.id,
        text: chunkText,
        metadata: document.metadata
      });
      i += Math.max(1, (this.chunkSize - this.overlap));
    }
    
    return chunks;
  }
}

export class StandardRetriever implements Retriever {
  private vectorStore: VectorStore;
  private embedder: EmbeddingProvider;

  constructor(vectorStore: VectorStore, embedder: EmbeddingProvider) {
    this.vectorStore = vectorStore;
    this.embedder = embedder;
  }

  async retrieve(query: string, topK: number = 3): Promise<Chunk[]> {
    const queryVector = await this.embedder.embedText(query);
    return this.vectorStore.search(queryVector, topK);
  }
}

export class StandardContextBuilder implements ContextBuilder {
  buildContext(chunks: Chunk[]): string {
    return chunks.map(chunk => `[Source: ${chunk.metadata?.title || chunk.documentId}]\n${chunk.text}`).join('\n\n');
  }
}
