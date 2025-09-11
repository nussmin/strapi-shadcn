/**
 * note router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::dbsync.dbsync', {
  config: {
    find: {
      middlewares: ["api::dbsync.is-owner"],  
    },
    findOne: {
      middlewares: ["api::dbsync.is-owner"],
    },
    create: {
      middlewares: ["api::dbsync.is-owner"], 
    },
    update: {
      middlewares: ["api::dbsync.is-owner"],
    },
    delete: {
      middlewares: ["api::dbsync.is-owner"],
    },
  },
});