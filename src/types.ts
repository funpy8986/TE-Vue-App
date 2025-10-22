
export interface VocabItem {
  term: string;
  etymology: string;
  definition: string;
  roleInText: string;
  originalSentence: string;
  collocations: string[];
}

export interface Phonetic {
  text?: string;
  audio?: string;
}

export interface Definition {
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
}

export interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
  synonyms?: string[];
  antonyms?: string[];
}

export interface SavedWord {
  word: string;
  phonetics: Phonetic[];
  meanings: Meaning[];
  timestamp: number; // To track when the word was saved
  notes?: string; // New: Optional field for user notes
  noteHeight?: number; // New: Optional field to store textarea height
}

export interface ArticleData {
  title: string;
  subtitle:string;
  source: string;
  audioUrl: string;
  paragraphs: { en: string; zh: string; }[];
  summaryPoints: string[];
  criticalReviewPoints: string[];
  vocabulary: VocabItem[];
}
