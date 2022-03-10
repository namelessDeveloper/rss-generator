import { appendFile } from 'fs'
import { resolve } from 'path';

// TODO replace with something like winston from npm

export class Logger {
  constructor(
    private logFile: string,
  ) {
    this.logFile = resolve(__dirname, '../', logFile);
  }

  private _log(json: any,) {
    setImmediate(() => {
      const str = JSON.stringify({
        timestamp: Date.now(),
        ...json,
      });
      appendFile(this.logFile, str + '\n', () => console.log(str));

    })
  }

  public startup(port: number) {
    this._log({
      meta: {
        message: `Started listening on port ${port}`
      }
    })
  }

  public shutdown() {
    this._log({
      meta: {
        message: `Service shutting down`
      }
    })
  }

  public feedRequest(service: string, user: string) {
    this._log({
      service, user
    })
  }
}
