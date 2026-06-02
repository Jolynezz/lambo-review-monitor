import { Scraper } from './types';
import { MockScraper } from './mock';
import { CtripScraper } from './ctrip';
import { FliggyScraper } from './fliggy';
import { QunarScraper } from './qunar';
import { config } from '@/lib/config';

const scraperRegistry: Record<string, () => Scraper> = {
  ctrip: () => new CtripScraper(),
  fliggy: () => new FliggyScraper(),
  qunar: () => new QunarScraper(),
};

export function getScraper(platform: string): Scraper {
  if (config.scraper === 'mock') {
    return new MockScraper();
  }
  const factory = scraperRegistry[platform];
  if (!factory) {
    throw new Error(`No scraper registered for platform: ${platform}`);
  }
  return factory();
}

export function getMockScraper(): Scraper {
  return new MockScraper();
}
