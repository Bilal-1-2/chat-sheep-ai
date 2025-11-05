import { pipeline } from '@huggingface/transformers';

let classifier: any = null;

export interface SentimentResult {
  score: number;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export const loadSentimentModel = async (): Promise<void> => {
  if (classifier) return;

  try {
    classifier = await pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
  } catch (error) {
    console.error('Failed to load sentiment model:', error);
    throw error;
  }
};

export const analyzeSentiment = async (text: string): Promise<SentimentResult> => {
  if (!classifier) {
    await loadSentimentModel();
  }

  if (!classifier) {
    throw new Error('Sentiment model not loaded');
  }

  const result = await classifier(text);
  const label = result[0].label.toLowerCase();
  const score = result[0].score;

  let sentiment: 'positive' | 'negative' | 'neutral';
  if (label === 'positive') {
    sentiment = 'positive';
  } else if (label === 'negative') {
    sentiment = 'negative';
  } else {
    sentiment = 'neutral';
  }

  return {
    score,
    sentiment,
  };
};

export const getSentimentEmoji = (sentiment: string): string => {
  switch (sentiment) {
    case 'positive':
      return '😊';
    case 'negative':
      return '😔';
    case 'neutral':
      return '😐';
    default:
      return '😐';
  }
};

export const getSentimentColor = (sentiment: string): string => {
  switch (sentiment) {
    case 'positive':
      return 'text-green-600';
    case 'negative':
      return 'text-red-600';
    case 'neutral':
      return 'text-gray-600';
    default:
      return 'text-gray-600';
  }
};
