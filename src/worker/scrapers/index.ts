import { Scraper } from './types';
import { MockScraper } from './mock';
import { BackendScraper } from './backend';
import { getPlatformConfig } from './configs';
import { config } from '@/lib/config';

export function getScraper(platform: string): Scraper {
  if (config.scraper === 'mock') {
    return new MockScraper();
  }
  // playwright 模式：使用各平台商家后台抓取器
  return new BackendScraper(getPlatformConfig(platform));
}

export function getMockScraper(): Scraper {
  return new MockScraper();
}
