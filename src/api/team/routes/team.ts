/**
 * team router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::team.team', {
  // for role base permission - use admin ui to controlled pathway
  // config: {
  //  find: { auth: false },   
  //},
});