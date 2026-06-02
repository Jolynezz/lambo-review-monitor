export function getConfig(key: string, defaultValue: string = ''): string {
  return process.env[key] || defaultValue;
}

export const config = {
  scraper: getConfig('SCRAPER', 'mock'),
  databaseUrl: getConfig('DATABASE_URL', 'file:./data/app.db'),
  smtp: {
    host: getConfig('SMTP_HOST', 'smtp.example.com'),
    port: parseInt(getConfig('SMTP_PORT', '465'), 10),
    secure: getConfig('SMTP_SECURE', 'true') === 'true',
    user: getConfig('SMTP_USER', ''),
    pass: getConfig('SMTP_PASS', ''),
    to: getConfig('ALERT_EMAIL_TO', ''),
  },
  scrapeCron: getConfig('SCRAPE_CRON', '0 */6 * * *'),
  hotelName: getConfig('HOTEL_NAME', '成都托尼洛兰博基尼酒店'),
};
