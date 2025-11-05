import * as tf from '@tensorflow/tfjs';
import * as sentiment from '@tensorflow-models/sentiment';

let model: sentiment.SentimentModel | null = null;

export interface SentimentResult {
  score: number;
  magnitude: number;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export const loadSentimentModel = async (): Promise<void> => {
  if (model) return;

  try {
    model = await sentiment.load();
  } catch (error) {
    console.error('Failed to load sentiment model:', error);
    throw error;
  }
};

export const analyzeSentiment = async (text: string): Promise<SentimentResult> => {
  if (!model) {
    await loadSentimentModel();
  }

  if (!model) {
    throw new Error('Sentiment model not loaded');
  }

  const result = await model.classify(text);

  let sentiment: 'positive' | 'negative' | 'neutral';
  if (result.score > 0.6) {
    sentiment = 'positive';
  } else if (result.score < 0.4) {
    sentiment = 'negative';
  } else {
    sentiment = 'neutral';
  }

  return {
    score: result.score,
    magnitude: result.magnitude || 0,
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
