// src/extensions/users-permissions/strapi-server.ts

export default (plugin) => {
  strapi.log.info("🔌 Users-permissions plugin extension loaded");
  
  // Extend user schema (keep your existing schema extensions)
  plugin.contentTypes.user.schema = {
    ...plugin.contentTypes.user.schema,
    attributes: {
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
        inversedBy: "users"
      }
    },
  };
  
  // 
  // Override the auth controller factory - working example
  const originalAuthFactory = plugin.controllers.auth;
  
  plugin.controllers.auth = (context) => {
    console.log('🏭 Auth controller factory called');
    const controller = originalAuthFactory(context);
    
    // Save original register
    const originalRegister = controller.register;
    
    // Override register method
    controller.register = async (ctx) => {
      console.log('\n========================================');
      console.log('🎯 REGISTER ENDPOINT INTERCEPTED!');
      console.log('========================================');
      console.log('📅 Time:', new Date().toISOString());
      console.log('📧 Email:', ctx.request.body?.email);
      console.log('👤 Username:', ctx.request.body?.username);
      console.log('🔑 Has Password:', !!ctx.request.body?.password);
      console.log('📦 All fields:', Object.keys(ctx.request.body || {}));
      console.log('========================================\n');
      
      // Call the original register
      console.log('📞 Calling original register...');
      await originalRegister(ctx);
      console.log('✅ Original register completed');
      
      // Check what we got back
      console.log('\n📤 Response check:');
      console.log('  - Status:', ctx.status);
      console.log('  - Has JWT:', !!ctx.body?.jwt);
      console.log('  - User ID:', ctx.body?.user?.id);
      console.log('  - User Email:', ctx.body?.user?.email);
      console.log('========================================\n');
    };
    
    return controller;
  };
  
  strapi.log.info("✅ Extension setup complete");
  
  return plugin;
};