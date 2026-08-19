import { Injectable } from '@nestjs/common';
import { appendFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { WideEvent } from './wide-event.interface';

const LOG_DIR = join(process.cwd(), 'logs');

@Injectable()
export class WideEventService {
  async record(event: WideEvent): Promise<void> {
    await mkdir(LOG_DIR, { recursive: true });

    const day = event.timestamp.slice(0, 10);
    const filePath = join(LOG_DIR, `wide-events-${day}.log`);

    await appendFile(filePath, JSON.stringify(event) + '\n', 'utf8');
  }
}
