export default (plugin) => {
  strapi.log.info("Users-permissions plugin extension loaded");

  // Extend the user schema
  plugin.contentTypes.user.schema = {
    ...plugin.contentTypes.user.schema,
    attributes: {
      ...plugin.contentTypes.user.schema.attributes,
      firstName: {
        type: "string",
        required: true,
        minLength: 1,
        maxLength: 50,
        pluginOptions: { "users-permissions": { visible: true } },
      },
      lastName: {
        type: "string",
        required: true,
        minLength: 1,
        maxLength: 50,
        pluginOptions: { "users-permissions": { visible: true } },
      },
      businessRole: {
        type: "enumeration",
        enum: ["ADMIN", "USER"],
        default: "USER",
        required: true,
        pluginOptions: { "users-permissions": { visible: true } },
      },
      bio: {
        type: "text",
        default: "",
        pluginOptions: { "users-permissions": { visible: true } },
      },
    },
  };
  return plugin;
};
