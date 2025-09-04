

export type NewsItem = {
    id: string;
    title: string;
    description: string;
    summary: string;
    published_at: string;
    image_url?: string | null;
    bias_score: number;
    bias_reason: string;
    topic: string;
    rating: number;
    likes: number;
    dislikes: number;
    slug: string;
    tags: string[];
};