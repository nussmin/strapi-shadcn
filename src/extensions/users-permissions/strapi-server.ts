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
  return plugin;
};
