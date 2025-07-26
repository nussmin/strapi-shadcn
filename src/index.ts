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
    strapi.log.info("bootstrap loaded");
    // You can access various Strapi properties:
    // console.log("Config:", strapi.config);
    // console.log("Server:", strapi.server);
    // console.log("Database:", strapi.db);
    // console.log("Entity Service:", strapi.entityService);
    // console.log("Services:", strapi.services);
    // console.log("Controllers:", strapi.controllers);
    // console.log("Models:", strapi.contentTypes);
    // console.log("Plugins:", strapi.plugins);

    // Example: List all content types
    console.log("Content Types available:", Object.keys(strapi.contentTypes));
    Object.keys(strapi.contentTypes).forEach(uid => {
      console.log(`${uid}:`, strapi.contentTypes[uid].attributes);
    });

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
