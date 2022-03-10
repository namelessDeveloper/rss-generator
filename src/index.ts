import express from 'express';
import { isWebUri } from 'valid-url'
import getCrawler from './crawlers'
import 'dotenv/config'
import { initStructure, loadFeed, saveFeed } from './feed';

const PORT = parseInt(process.env.PORT || '3000')

const app = express()

initStructure('../feeds/');

app.get('*', async (req, res) => {
  const feedUrl = req.originalUrl.slice(1);
  if (!isWebUri(feedUrl)) {
    throw new Error('URL is not valid')
  }

  const feedFilename = `${feedUrl}.json`

  const feed = await getCrawler(feedUrl, {
    feed_url: `${req.protocol}://${req.hostname}/${feedUrl}`,
  })

  setImmediate(() => saveFeed(feedFilename, feed));

  console.log(`Feed requested: ${feedUrl}`);
  res.json(feed)
})

app.listen(PORT, () => {
  console.log(`Started listening on port ${PORT}`)
})

