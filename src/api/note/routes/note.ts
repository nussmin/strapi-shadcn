/**
 * note router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::note.note', {
  config: {
    find: {
      middlewares: ["api::note.is-owner"],  
    },
    findOne: {
      middlewares: ["api::note.is-owner"],
    },
    create: {
      middlewares: ["api::note.is-owner"], 
    },
    update: {
      middlewares: ["api::note.is-owner"],
    },
    delete: {
      middlewares: ["api::note.is-owner"],
    },
  },
});