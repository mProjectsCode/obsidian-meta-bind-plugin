import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';

new Elysia().use(cors()).get('/', Bun.file('./Publish.js')).listen(31000);
