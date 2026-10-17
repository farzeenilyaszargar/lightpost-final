export const topics = [
  "world",
  "politics",
  "business",
  "technology",
  "science",
  "sports",
  "entertainment",
] as const;
export type Topic = (typeof topics)[number];
export const topicLabels: Record<Topic, string> = {
  world: "World",
  politics: "Politics",
  business: "Business",
  technology: "Technology",
  science: "Science",
  sports: "Sports",
  entertainment: "Culture",
};
export type NewsItem = {
  id: string;
  title: string;
  description: string;
  published_at: string;
  image_url: string | null;
  topic: Topic;
  slug: string;
  source: string;
  source_url: string;
};
export type NewsFeed = {
  articles: NewsItem[];
  updatedAt: string | null;
  stale: boolean;
  unavailableSources: string[];
};
