export default ({ env }) => ({
  "strapi-v5-http-only-auth": {
    enabled: true,
    config: {
      // Default cookie settings
      cookieOptions: {
        secure: env('NODE_ENV') === "production",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        sameSite: "lax",
        domain: env('CLIENT_DOMAIN'),
        path: "/",
      },
      // If set to true, the JWT will be removed from the response
      // after a successful login or registration 
      deleteJwtFromResponse: true,
    },
  },
});
