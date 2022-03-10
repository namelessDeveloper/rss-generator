
import { Attachment, Item } from "@json-feed-types/1_1";
import { Feed } from "feed";
import crawl, { getNumber, getText } from './crawl';

const getGalleryNodes = `#main > center > table > tbody > tr > td:nth-child(2) > div.blk_galleries >
center > div > table > tbody > tr > td > table > tbody > *:not(:nth-child(1))`;

export default async (url: string) => crawl(url, async page => {
  const items: Partial<Item>[] = []
  const trList = await page.$$(getGalleryNodes)
  console.log('Start');

  for (let index = 0; index < trList.length; index++) {
    const el = trList[index];
    console.log(el);

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

  const feed: Feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: `${title}'s Imagefap Profile`,
    home_page_url: url,
    items: items as Item[],
    // Used for update policy
    last_updated: Date.now()
  }

  console.log('FUCK');


  // await page.waitFor(1000000);
  return feed;
});
