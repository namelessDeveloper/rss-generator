
import { Attachment, Item } from "@json-feed-types/1_1";
import go from "../go";
import { Feed, loadFeed } from "../feed";
import crawl, { feedFileName, getNumber, getText, mergeItems } from './crawl';

const getGalleryNodes = `#main > center > table > tbody > tr > td:nth-child(2) > div.blk_galleries >
center > div > table > tbody > tr > td > table > tbody > *:not(:nth-child(1))`;

export const imagefapUrl = (username: string) => `https://www.imagefap.com/profile/${username}`

export default async (url: string) => crawl(url, async page => {
  const items: Partial<Item>[] = []
  const trList = await page.$$(getGalleryNodes)

  for (let index = 0; index < trList.length; index++) {
    const el = trList[index];
    if (index % 2 === 0) {
      const title = await el.$eval('.blk_galleries', getText);
      const count = await el.$eval('font > span > center', getNumber);
      const dateString = await el.$eval('.blk_galleries:nth-child(4) center', getText);
      const date = new Date(dateString)
      const date_published = date.toUTCString();
      //@ts-ignore
      const id = (date / 1000).toFixed();
      items.push({
        title,
        id,
        date_published,
        summary: `${count} images`
      })
    } else {
      const imageEls = await el.$$eval('img', images => images.map(img => {
        const url = img.getAttribute('src')
        if (url) {
          return ({
            mime_type: 'image/png',
            url,
          })
        }
      }))
      const isAttachment = (item: any): item is Attachment => item;
      items[items.length - 1].attachments = imageEls.filter<Attachment>(isAttachment);
    }

  }

  const urlSlices = url.split('/')
  const title = urlSlices[urlSlices.length - 1]

  const feedMeta: Omit<Feed, 'items'> = {
    version: 'https://jsonfeed.org/version/1.1',
    title: `${title}'s Imagefap Profile`,
    home_page_url: url,
    // Used for update policy
    last_updated: Date.now()
  }

  // Merge feed objects
  const storedFeed = await go(() => loadFeed(feedFileName(url)))

  if (storedFeed.type === 'error') {
    return {
      ...feedMeta,
      items
    } as Feed;
  }

  // await page.waitFor(1000000);
  return {
    ...feedMeta,
    items: mergeItems(storedFeed.data.items, items),
  } as Feed;
});
