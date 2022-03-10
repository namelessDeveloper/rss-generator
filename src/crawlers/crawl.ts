import { Item } from "@json-feed-types/1_1";
import { Feed } from "feed";
import puppeteer, { ElementHandle, EvaluateFn } from "puppeteer";

export type Crawler = (url: string) => Promise<Feed>;

type CrawlerCallback = (page: puppeteer.Page) => Promise<Feed>;

export default async function crawl(url: string, cb: CrawlerCallback): Promise<Feed> {
  const browser = await puppeteer.launch({
    headless: process.env.BROWSER_DEBUG !== 'true',
  })
  let response: Feed | null = null;
  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 1000, height: 1000 })
    await page.setJavaScriptEnabled(false)
    await page.goto(url, { waitUntil: 'networkidle2' })
    await page.waitForTimeout(1000);

    response = await cb(page);

    await browser.close()
  } catch (error) {
    console.error(error);
    await browser.close()
  }

  if (response === null) {
    throw new Error('Website timed out')
  }

  return response;
}

export const feedFileName = (url: string) => `${url}.json`

export function mergeItems(stored: Item[], recent: Partial<Item>[]) {
  const merged: Item[] = [...stored]
  // Iterate the recent list until we find one we already have
  for (const item of recent) {
    if (stored[0].id === item.id) {
      break;
    }
    merged.unshift(item as Item)
  }
  return merged;
}

export const getText = (el: Element) => el.textContent?.trim() || ''
export const getNumber = (el: Element) => +(el.textContent?.trim() || 'NaN');
export const getHref = (a: Element) => a.getAttribute('href')
export const getImgSrc = (img: Element) => img.getAttribute('src')

//@ts-ignore idk how to do this properly
export const click = (el: Element) => el.click();

export async function* arrayEvaluate(array: ElementHandle<Element>[], evaluator: EvaluateFn = (data: any) => data) {
  for (let p of array) {
    //@ts-ignore
    yield await p.evaluate(evaluator);
  }
}