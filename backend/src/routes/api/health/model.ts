import { t } from 'elysia';

export const GetHealthResponseSchema = t.Object({
  status: t.Literal('ok'),
  uptime: t.Number(),
});
