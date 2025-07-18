# Source code for strapi 
https://github.com/strapi/strapi/tree/develop/packages


Security Analysis Guide for Strapi User-Permissions Plugin
1. Critical Files to Analyze
From the GitHub source (https://github.com/strapi/strapi), focus on these key areas:
```bash
/packages/plugins/users-permissions/
├── server/
│   ├── controllers/
│   │   ├── auth.js          # Authentication logic - CRITICAL
│   │   ├── user.js          # User management endpoints
│   │   └── validation/      # Input validation
│   ├── services/
│   │   ├── jwt.js           # JWT token generation/validation
│   │   ├── providers.js     # OAuth provider logic
│   │   └── user.js          # User service logic
│   ├── middlewares/         # Authentication middleware
│   └── routes/              # API route definitions
└── admin/
    └── src/                 # Admin panel components
```

2. http-only cookie - plugin "https://market.strapi.io/plugins/strapi-v5-http-only-auth"


## What needs to be change for the Bulletproof React and Strappi onboarding 

Summary of Changes
## Summary of Changes

| Endpoint | Bulletproof React | Strapi Equivalent | Change Required |
|----------|------------------|-------------------|-----------------|
| Login | `POST /auth/login` | `POST /auth/local` | ✅ **No change** (plugin maps this) |
| Register | `POST /auth/register` | `POST /auth/local/register` | ✅ **No change** (plugin maps this) |
| Get User | `GET /auth/me` | `GET /users/me` | ❌ **Update path** |
| Logout | `POST /auth/logout` | `DELETE /auth/logout` | ❌ **Update method** |


## Key Benefits
✅ Security: HTTP-only cookies protect against XSS attacks
✅ Simplicity: No manual JWT token management required
✅ Compatibility: Minimal changes to existing Bulletproof React code
✅ Production Ready: Secure cookie configuration for different environments

## Environment Variables
Make sure to set these in your environment:
-  env# Strapi
- CLIENT_DOMAIN=your-frontend-domain.com
- NODE_ENV=production

# React
- VITE_API_URL=http://your-strapi-server:1337/api


# 🚀 Getting started with Strapi

Strapi comes with a full featured [Command Line Interface](https://docs.strapi.io/dev-docs/cli) (CLI) which lets you scaffold and manage your project in seconds.

### `develop`

Start your Strapi application with autoReload enabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-develop)

```
npm run develop
# or
yarn develop
```

### `start`

Start your Strapi application with autoReload disabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-start)

```
npm run start
# or
yarn start
```

### `build`

Build your admin panel. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-build)

```
npm run build
# or
yarn build
```

## ⚙️ Deployment

Strapi gives you many possible deployment options for your project including [Strapi Cloud](https://cloud.strapi.io). Browse the [deployment section of the documentation](https://docs.strapi.io/dev-docs/deployment) to find the best solution for your use case.

```
yarn strapi deploy
```

## 📚 Learn more

- [Resource center](https://strapi.io/resource-center) - Strapi resource center.
- [Strapi documentation](https://docs.strapi.io) - Official Strapi documentation.
- [Strapi tutorials](https://strapi.io/tutorials) - List of tutorials made by the core team and the community.
- [Strapi blog](https://strapi.io/blog) - Official Strapi blog containing articles made by the Strapi team and the community.
- [Changelog](https://strapi.io/changelog) - Find out about the Strapi product updates, new features and general improvements.

Feel free to check out the [Strapi GitHub repository](https://github.com/strapi/strapi). Your feedback and contributions are welcome!

## ✨ Community

- [Discord](https://discord.strapi.io) - Come chat with the Strapi community including the core team.
- [Forum](https://forum.strapi.io/) - Place to discuss, ask questions and find answers, show your Strapi project and get feedback or just talk with other Community members.
- [Awesome Strapi](https://github.com/strapi/awesome-strapi) - A curated list of awesome things related to Strapi.

---

<sub>🤫 Psst! [Strapi is hiring](https://strapi.io/careers).</sub>
