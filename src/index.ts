import express from 'express';
import 'dotenv/config'
import { initStructure, saveFeed } from './feed';
import { feedFileName } from './crawlers/crawl';
import imagefap, { imagefapUrl } from './crawlers/imagefap';
import { Logger } from './logger';

const PORT = parseInt(process.env.PORT || '4001')

const app = express()

initStructure('../feeds/');

const logger = new Logger('logs.log');

app.get('/imagefap/:profile', async (req, res) => {
  logger.feedRequest('Imagefap', req.params.profile)

  const feedUrl = imagefapUrl(req.params.profile);
  const feed = {
    feed_url: `${req.protocol}://${req.hostname}/${feedUrl}`,
    ...await imagefap(feedUrl)
  }

  setImmediate(() => saveFeed(feedFileName(feedUrl), feed));

  res.json(feed)
})

const server = app.listen(PORT, () => {
  logger.startup(PORT)
})

function gracefulShutdown() {
  logger.shutdown()
  server.close(() => {
    console.log('HTTP server closed')
  })
}

process.on('SIGINT', gracefulShutdown)
// process.on('SIGTERM', gracefulShutdown)
