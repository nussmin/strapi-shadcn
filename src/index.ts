// import type { Core } from '@strapi/strapi';
const util = require('util');

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   */
  bootstrap({ strapi }) {
    strapi.log.info("bootstrap loaded");

    // Log any unhandled Koa errors with full stack and response body
    strapi.server.app.on('error', (err, ctx) => {
      console.error('Unhandled Koa error:');
      console.error(
        util.inspect(err, { showHidden: true, depth: null, colors: true })
      );
      console.error('Response Body:', util.inspect(ctx.response.body, { depth: null }));
    });

    strapi.server.use(async (ctx, next) => {
      // Skip logging for admin routes if desired
      // if (ctx.request.url.startsWith('/admin')) {
      //   return await next();
      // }

      // Capture raw request body
      let rawBody = '';
      if (['POST', 'PUT', 'PATCH'].includes(ctx.request.method)) {
        ctx.req.on('data', (chunk) => {
          rawBody += chunk.toString();
        });
      }

      try {
        // Proceed through next middleware / policies / controllers
        await next();
      } catch (err) {
        // Log comprehensive error details
        console.error('=== Error Thrown by Strapi ===');
        console.error('Status:', err.status || err.statusCode || 500);
        console.error('Name:', err.name);
        console.error('Message:', err.message);
        if (err.details) console.error('Details:', err.details);
        if (err.errors) console.error('Errors:', err.errors);
        if (err.code) console.error('Code:', err.code);
        if (typeof err.expose !== 'undefined') console.error('Expose:', err.expose);
        if (err.headers) console.error('Headers:', err.headers);
        // Inspect raw Error instance
        console.error('⛔ Raw Error object:');
        console.error(
          util.inspect(err, { showHidden: true, depth: null, colors: true })
        );
        // Inspect response body that Strapi will send
        console.error('🔍 ctx.response.body:');
        console.error(
          util.inspect(ctx.response.body, { showHidden: false, depth: null })
        );
        console.error('==============');
        // Re-throw so Strapi can handle the response
        throw err;
      }

      // After successful response
      if (['POST', 'PUT', 'PATCH'].includes(ctx.request.method)) {
        console.log('=== Request Body ===');
        console.log('Parsed Body:', ctx.request.body);
        console.log('Raw Body:', rawBody);
        console.log('===================');
      }

      console.log('=== Response ===');
      console.log('Status:', ctx.response.status);
      console.log('Response Body:', util.inspect(ctx.response.body, { depth: null }));
      console.log('==============');
    });
  },
};
