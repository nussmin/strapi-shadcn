export default (plugin) => {
  // Extend the user schema from users-permissions plugin
  strapi.log.info("🔌 Users-permissions plugin extension loaded");

  console.log(
    "users-permissions default and type",
    plugin.contentTypes.user.schema.attributes
  );

  plugin.contentTypes.user.schema = {
    ...plugin.contentTypes.user.schema,
    attributes: {
      ...plugin.contentTypes.user.schema.attributes,
      // Add custom fields
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
    },
  };

  // 2. Override the register controller
  plugin.controllers.auth.register = async (ctx) => {
    const { identifier, password, firstName, lastName, teamId, teamName } =
      ctx.request.body;

    if (!identifier || !password || !firstName || !lastName) {
      return ctx.badRequest("Missing required fields");
    }

    let team = null;

    if (teamId) {
      team = await strapi.entityService.findOne("api::team.team", teamId);
      if (!team) return ctx.badRequest("Team ID is invalid");
    } else if (teamName) {
      team = await strapi.entityService.create("api::team.team", {
        data: { name: teamName },
      });
    }

    // Register the user
    const user = await strapi
      .plugin("users-permissions")
      .service("user")
      .add({
        email: identifier,
        username: identifier,
        password,
        firstName,
        lastName,
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
