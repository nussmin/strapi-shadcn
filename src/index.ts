// import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {
    strapi.server.use(async (ctx, next) => {
      /* Skip admin routes
      if (ctx.request.url.startsWith("/admin")) {
        return await next();
      } */

      console.log("=== Incoming Request ===");
      console.log("Method:", ctx.request.method);
      console.log("URL:", ctx.request.url);
      console.log("Headers:", ctx.request.headers);
      console.log("Cookies:", ctx.request.headers.cookie);
      console.log("=====================");

      await next();
    });
  },
};
