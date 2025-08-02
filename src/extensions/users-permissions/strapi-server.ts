export default (plugin) => {
  strapi.log.info("🔌 Users-permissions plugin extension loaded");

  // Extend the user content type schema
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

  // In Strapi v5, we need to use the new middleware syntax
  const registerRoute = plugin.routes["content-api"].routes.find(
    (route) => route.method === "POST" && route.path === "/auth/local/register"
  );

  if (registerRoute) {
    // Create a custom middleware
    const transformIdentifierMiddleware = async (ctx, next) => {
      // Transform identifier to email and username before validation
      if (ctx.request.body?.identifier) {
        ctx.request.body.email = ctx.request.body.identifier;
        ctx.request.body.username = ctx.request.body.identifier;
        delete ctx.request.body.identifier;
      }
      
      strapi.log.info("Transformed body:", ctx.request.body);
      
      await next();
    };

    // Add middleware to the route
    if (!registerRoute.config) {
      registerRoute.config = {};
    }
    if (!registerRoute.config.middlewares) {
      registerRoute.config.middlewares = [];
    }
    
    // Add our middleware at the beginning
    registerRoute.config.middlewares.unshift(transformIdentifierMiddleware);
  }

  // Override the register controller
  plugin.controllers.auth.register = async (ctx) => {
    const { email, password, firstName, lastName, teamId, teamName } = ctx.request.body;
    
    strapi.log.info("Register controller - request body", ctx.request.body);

    if (!email || !password || !firstName || !lastName) {
      return ctx.badRequest("Missing required fields");
    }

    let team = null;
    let businessRole = "USER";

    if (teamId) {
      // Joining an existing team - Strapi v5 syntax
      team = await strapi.documents("api::team.team").findOne({
        documentId: teamId,
      });
      if (!team) return ctx.badRequest("Invalid team ID");
    } else if (teamName) {
      // Check if team name already exists - Strapi v5 syntax
      const existing = await strapi.documents("api::team.team").findMany({
        filters: { name: teamName },
        limit: 1,
      });

      if (existing.length > 0) {
        return ctx.badRequest("Team name already exists");
      }

      // Create new team - Strapi v5 syntax
      team = await strapi.documents("api::team.team").create({
        data: { name: teamName },
      });

      businessRole = "ADMIN"; // creator of team becomes admin
    }

    try {
      // Get the default role
      const defaultRole = await strapi
        .query("plugin::users-permissions.role")
        .findOne({ where: { type: "authenticated" } });

      // Create the user - Strapi v5 syntax
      const user = await strapi
        .plugin("users-permissions")
        .service("user")
        .add({
          email,
          username: email, // Use email as username
          password,
          firstName,
          lastName,
          businessRole,
          team: team?.id || null,
          provider: "local",
          confirmed: true,
          blocked: false,
          role: defaultRole.id,
        });

      // Generate JWT
      const jwt = strapi
        .plugin("users-permissions")
        .service("jwt")
        .issue({ id: user.id });

      // Return response
      return ctx.send({
        jwt,
        user: {
          id: user.id,
          documentId: user.documentId,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          businessRole: user.businessRole,
          team: user.team,
          confirmed: user.confirmed,
          blocked: user.blocked,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error) {
      strapi.log.error("Registration error:", error);
      return ctx.badRequest(
        error.message || "Failed to create user"
      );
    }
  };

  return plugin;
};