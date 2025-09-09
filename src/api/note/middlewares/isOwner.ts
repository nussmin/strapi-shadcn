/**
 * `isOwner` middleware (Strapi v5, Documents API)
 */
"use strict";

import type { Core } from '@strapi/strapi';

interface UserData {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  businessRole: 'ADMIN' | 'USER';
}

interface NoteWithUser {
  id: number;
  documentId: string;
  description?: string;
  dbfile?: any;
  users_permissions_user?: UserData | number | null;
}

export default (_config, { strapi }: { strapi: Core.Strapi }) => {
  return async (ctx, next) => {
    const user = ctx.state.user as (UserData | undefined);
    const method = ctx.request.method;
    const entryId = ctx.params?.documentId ?? ctx.params?.id;

    if (!user) {
      return ctx.unauthorized("You must be logged in."); // 401 - correct!
    }

    switch (method) {
      case 'GET': {
        if (!entryId) {
          // find (list) – restrict to caller's notes
          const existingFilters = ctx.query?.filters ?? {};
          ctx.query = {
            ...ctx.query,
            filters: {
              ...existingFilters,
              users_permissions_user: { id: { $eq: user.id } },
            },
          };
        } else {
          // findOne – verify ownership
          const entry = await strapi.documents('api::note.note').findOne({
            documentId: entryId,
            populate: ['users_permissions_user'],
          }) as NoteWithUser | null;

          if (!entry) {
            return ctx.notFound("Note not found.");
          }

          const ownerId =
            typeof entry.users_permissions_user === 'object'
              ? entry.users_permissions_user?.id
              : entry.users_permissions_user;

          if (!ownerId || ownerId !== user.id) {
            // CHANGE: Use 404 to prevent redirect in frontend instead of unauthorized (401)
            return ctx.notFound("Note not found.");
          }
        }
        break;
      }

      case 'POST': {
        // Enforce 1:1 (one note per user)
        const existing = await strapi.documents('api::note.note').findMany({
          filters: { users_permissions_user: { id: { $eq: user.id } } },
          page: 1,
          pageSize: 1,
        }) as NoteWithUser[] | null;

        if (existing && existing.length > 0) {
          return ctx.badRequest("You already have a note. Please update it instead.");
        }

        // Ensure body.data exists and set owner
        const bodyData = (ctx.request.body && ctx.request.body.data) ? ctx.request.body.data : {};
        ctx.request.body = {
          ...(ctx.request.body ?? {}),
          data: {
            ...bodyData,
            users_permissions_user: user.id,
          },
        };
        break;
      }

      case 'PUT':
      case 'PATCH':
      case 'DELETE': {
        if (!entryId) {
          return ctx.badRequest("Missing documentId.");
        }

        // Verify ownership
        const entryToModify = await strapi.documents('api::note.note').findOne({
          documentId: entryId,
          populate: ['users_permissions_user'],
        }) as NoteWithUser | null;

        if (!entryToModify) {
          return ctx.notFound("Note not found.");
        }

        const ownerId =
          typeof entryToModify.users_permissions_user === 'object'
            ? entryToModify.users_permissions_user?.id
            : entryToModify.users_permissions_user;

        if (!ownerId || ownerId !== user.id) {
          // CHANGE: Use forbidden (403) instead of unauthorized (401)
          return ctx.notFound("Note not found.");
        }

        // Prevent changing the owner on updates
        if ((method === 'PUT' || method === 'PATCH') && ctx.request.body?.data?.users_permissions_user) {
          delete ctx.request.body.data.users_permissions_user;
        }

        break;
      }
    }

    return next();
  };
};