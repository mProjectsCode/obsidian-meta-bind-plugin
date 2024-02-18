import { Elysia } from 'elysia';

new Elysia().get('/', Bun.file('./Publish.js')).listen(31000);
