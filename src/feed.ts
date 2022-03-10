import JsonFeed from "@json-feed-types/1_1";
import { ExtensionMap } from '@json-feed-types/common'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import sanitize from "sanitize-filename";

const BASE_PATH = resolve(__dirname, '../feeds/')

type BaseExtension = {
  feed: {
    /** Epoch since last updated */
    last_updated: number;
  }
}

export type Feed<E extends ExtensionMap = {}> = JsonFeed<E & BaseExtension>

export function loadFeed(path: string): Feed {
  try {
    const file = readFileSync(resolve(BASE_PATH, sanitize(path)), { encoding: 'utf-8' })
    return JSON.parse(file);
  } catch (error) {
    throw new Error('Feed doesn\'t exist yet')
  }
}

export function saveFeed(path: string, data: Feed) {
  return writeFileSync(resolve(BASE_PATH, sanitize(path)), JSON.stringify(data, null, 2));
}

export function initStructure(path: string) {
  const resolvedPath = resolve(__dirname, path)
  if (!existsSync(resolvedPath)) {
    mkdirSync(resolvedPath)
  }
}
