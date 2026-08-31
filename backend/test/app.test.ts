import { expect, test } from 'bun:test';
import { StatusMap } from 'elysia';
import { createApp } from '#app.ts';
import type { Auth } from '#lib/auth/better-auth.ts';
import type { AssetsServiceContract } from '#services/assets.service.ts';
import type { EventsServiceContract } from '#services/events.service.ts';
import type { FilesServiceContract } from '#services/files.service.ts';
import type { HealthServiceContract } from '#services/health.service.ts';

function unexpectedCall(): never {
  throw new Error('Unexpected dependency call');
}

test('createApp uses supplied dependencies without production bootstrap', async () => {
  let healthChecks = 0;
  const auth: Auth = {
    handler: async () => new Response(null, { status: 404 }),
    getSession: async () => null,
  };
  const assetsService: AssetsServiceContract = {
    routes: () => new Map<string, Response>(),
    fallback: () => null,
  };
  const eventsService: EventsServiceContract = {
    subscribe: unexpectedCall,
    echo: unexpectedCall,
    publish: unexpectedCall,
  };
  const filesService: FilesServiceContract = {
    upload: unexpectedCall,
    list: unexpectedCall,
    download: unexpectedCall,
    remove: unexpectedCall,
  };
  const healthService: HealthServiceContract = {
    check() {
      healthChecks += 1;
      return Promise.resolve({ status: 'ok', uptime: 0 });
    },
  };

  const response = await createApp({
    auth,
    assetsService,
    eventsService,
    filesService,
    healthService,
  }).handle(new Request('http://localhost/api/health'));

  expect(response.status).toBe(StatusMap.OK);
  expect(await response.json()).toEqual({ status: 'ok', uptime: 0 });
  expect(healthChecks).toBe(1);
});
