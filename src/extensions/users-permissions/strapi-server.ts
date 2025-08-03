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
      pluginOptions: {
        "users-permissions": { visible: true },
      },
    },
    lastName: {
      type: "string",
      required: true,
      minLength: 1,
      maxLength: 50,
      pluginOptions: {
        "users-permissions": { visible: true },
      },
    },
    businessRole: {
      type: "enumeration",
      enum: ["ADMIN", "USER"],
      default: "USER",
      required: true,
      pluginOptions: {
        "users-permissions": { visible: true },
      },
    },
    bio: {
      type: "text",
      default: "",
      pluginOptions: {
        "users-permissions": { visible: true },
      },
    },
    team: {
      type: "relation",
      relation: "manyToOne",
      target: "api::team.team",
      inversedBy: "users",
      pluginOptions: {
        "users-permissions": { visible: true },
      },
    },
  };
  
  // Override the defualt register validation
  plugin.routes["content-api"].routes = plugin.routes["content-api"].routes.map(
    (route) => {
      if (route.method === "POST" && route.path === "/auth/local/register") {
        return {
          ...route,
          config: {
            ...route.config,
            // Remove or customize validation
            validate: {
              body: {
                identifier: { required: true },
                password: { required: true },
                firstName: { required: true },
                lastName: { required: true },
                teamId: { required: false },
                teamName: { required: false },
              },
            },
          },
        };
      }
      return route;
    }
  );

  // Override the register controller
  plugin.controllers.auth.register = async (ctx) => {
    const { identifier, password, firstName, lastName, teamId, teamName } =
      ctx.request.body;

    strapi.log.info("register request body", ctx.request.body);

    if (!identifier || !password || !firstName || !lastName) {
      return ctx.badRequest("Missing required fields");
    }

    let team = null;
    let businessRole = "USER";

    if (teamId) {
      // Joining an existing team
      team = await strapi.entityService.findOne("api::team.team", teamId);
      if (!team) return ctx.badRequest("Invalid team ID");
    } else if (teamName) {
      // Check if team name already exists
      const existing = await strapi.entityService.findMany("api::team.team", {
        filters: { name: teamName },
        limit: 1,
      });

      if (existing.length > 0) {
        return ctx.badRequest("Team name already exists");
      }

      // Create new team
      team = await strapi.entityService.create("api::team.team", {
        data: { name: teamName },
      });

      businessRole = "ADMIN"; // creator of team becomes admin
    }

    // Create the user
    const user = await strapi
      .plugin("users-permissions")
      .service("user")
      .add({
        email: identifier,
        username: identifier,
        password,
        firstName,
        lastName,
        businessRole,
        team: team?.id || null,
      });

    const token = strapi
      .plugin("users-permissions")
      .service("jwt")
      .issue({ id: user.id });

    ctx.send({
      jwt: token,
      user,
    });
  };

  return plugin;
};
