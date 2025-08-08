export default ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
  app: {
    keys: env.array("APP_KEYS"),
  },
  // tell Strapi to show debug / silly logs
  logger: { config: { level: 'debug' }},
  // emit errors up to Koa so you can catch full stack traces
  emitErrors: true,
});
