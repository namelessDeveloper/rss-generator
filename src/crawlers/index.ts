import Feed from '@json-feed-types/1_1';
import { Crawler } from './crawl';
import imagefap from './imagefap'

type FeedMeta = Pick<Feed,
  | 'feed_url'
>

export default async function getCrawler(urlString: string, meta: FeedMeta) {
  const url = new URL(urlString);

  let crawler: Crawler | null = null;

  if (url.hostname.endsWith('imagefap.com')) {
    crawler = imagefap
  }

  if (!crawler) {
    throw new Error('This website is not supported')
  }

  const feed = await crawler(urlString);
  return { ...meta, ...feed }
}