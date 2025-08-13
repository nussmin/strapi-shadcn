// src/extensions/users-permissions/strapi-server.ts
// Helper functions

async function findOrCreateTeam(teamName: string) {
  try {
    // Check if team exists
    let team = await strapi.db.query("api::team.team").findOne({
      where: { name: teamName },
    });

    // Create if doesn't exist
    if (!team) {
      team = await strapi.db.query("api::team.team").create({
        data: {
          name: teamName,
          publishedAt: new Date(),
        },
      });
      strapi.log.info(`Created new team: ${teamName}`);
    }

    return team;
  } catch (error) {
    strapi.log.error(`Failed to handle team ${teamName}:`, error);
    return null;
  }
}

async function updateUserWithCustomFields(
  userId: number,
  fields: {
    firstName: string;
    lastName: string;
    businessRole: string;
    bio: string;
    teamId: number | null;
  }
) {
  try {
    const updateData: any = {
      firstName: fields.firstName,
      lastName: fields.lastName,
      businessRole: fields.businessRole,
    };

    if (fields.bio) updateData.bio = fields.bio;
    if (fields.teamId) updateData.team = fields.teamId;

    await strapi.db.query("plugin::users-permissions.user").update({
      where: { id: userId },
      data: updateData,
    });

    strapi.log.info(`Updated user ${userId} with custom fields`);
  } catch (error) {
    strapi.log.error(`Failed to update user ${userId}:`, error);
    // Don't throw - user is already created, just missing custom fields
  }
}

function formatUserResponse(user: any) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    businessRole: user.businessRole,
    bio: user.bio,
    confirmed: user.confirmed,
    blocked: user.blocked,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    ...(user.team && {
      team: {
        id: user.team.id,
        name: user.team.name,
      },
    }),
  };
}

export default (plugin) => {
  strapi.log.info("🔌 Users-permissions plugin extension loaded");

  // Extend user schema with custom fields
  plugin.contentTypes.user.schema.attributes = {
    ...plugin.contentTypes.user.schema.attributes,
    firstName: {
      type: "string",
      required: true,
      minLength: 1,
      maxLength: 50,
    },
    lastName: {
      type: "string",
      required: true,
      minLength: 1,
      maxLength: 50,
    },
    businessRole: {
      type: "enumeration",
      enum: ["ADMIN", "USER"],
      default: "USER",
      required: true,
    },
    bio: {
      type: "text",
      default: "",
    },
    team: {
      type: "relation",
      relation: "manyToOne",
      target: "api::team.team",
      inversedBy: "users",
    },
  };

  // Override the auth controller
  const originalAuthFactory = plugin.controllers.auth;

  plugin.controllers.auth = (context) => {
    const controller = originalAuthFactory(context);
    const originalRegister = controller.register;

    controller.register = async (ctx) => {
      try {
        // 1. Extract and validate custom fields
        const {
          email,
          username,
          password,
          firstName,
          lastName,
          teamName,
          businessRole = "USER",
          bio = "",
        } = ctx.request.body;

        if (!firstName || !lastName) {
          return ctx.badRequest("firstName and lastName are required");
        }

        // 2. Create or find team if provided
        let teamId = null;
        if (teamName) {
          const team = await findOrCreateTeam(teamName);
          teamId = team?.id;
        }

        // 3. Register user with basic fields only
        ctx.request.body = { email, username, password };
        await originalRegister.call(controller, ctx);

        // 4. If registration successful, update user with custom fields
        if (ctx.status === 200 && ctx.body?.user?.id) {
          await updateUserWithCustomFields(ctx.body.user.id, {
            firstName,
            lastName,
            businessRole,
            bio,
            teamId,
          });

          // 5. Fetch and return complete user data
          const completeUser = await strapi.db
            .query("plugin::users-permissions.user")
            .findOne({
              where: { id: ctx.body.user.id },
              populate: ["team"],
            });

          if (completeUser) {
            // Preserve the original sanitized structure, just add the new fields
            ctx.body.user = {
              ...ctx.body.user, // Keep original sanitized fields
              firstName: completeUser.firstName,
              lastName: completeUser.lastName,
              businessRole: completeUser.businessRole,
              bio: completeUser.bio,
              team: completeUser.team || null
            };
            // ctx.body.user = formatUserResponse(completeUser); customised response
          }
        }
      } catch (error) {
        strapi.log.error("Registration error:", error);
        if (!ctx.body) {
          ctx.badRequest("Registration failed: " + error.message);
        }
      }
    };

    return controller;
  };

  strapi.log.info("✅ Extension setup complete");
  return plugin;
};
