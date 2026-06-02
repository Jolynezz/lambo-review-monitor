export interface ScrapedReview {
  externalId: string;
  rating: number;
  ratingScale: number;
  reviewerName: string;
  content: string;
  roomType: string;
  stayDate: string | null;
  replyStatus: string;
}

export interface ScraperResult {
  platform: string;
  reviews: ScrapedReview[];
  success: boolean;
  error?: string;
}

export interface Scraper {
  platform: string;
  scrape(accountId: string): Promise<ScraperResult>;
}
