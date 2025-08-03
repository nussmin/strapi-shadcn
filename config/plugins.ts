export default ({ env }) => ({
  'users-permissions': {
    config: {
      register: {
        // include all the params you want the /auth/local/register endpoint to accept:
        allowedFields: [
          'username',
          'email',
          'password',
          'firstName',
          'lastName',
          'businessRole',
          'bio',
          'team',
          'teamName',      
        ],
      },
    },
  },
  "strapi-v5-http-only-auth": {
    enabled: true,
    config: {
      // Default cookie settings
      cookieOptions: {
        secure: env("NODE_ENV") === "production",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        sameSite: "lax",
        domain: env("CLIENT_DOMAIN"),
        path: "/",
      },
      // If set to true, the JWT will be removed from the response
      // after a successful login or registration
      deleteJwtFromResponse: true,
    },
  },
  documentation: {
    enabled: true,
    config: {
      restrictedAccess: true,
      openapi: '3.0.0',
      info: {
        version: '1.0.0',
        title: 'API news',
      },
    },
  },
});
