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
  
  // Override the auth controller factory
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
      
      try {
        // Extract custom fields
        const { firstName, lastName, teamName, businessRole = 'USER', bio } = ctx.request.body;
        
        // Validate YOUR custom required fields
        if (!firstName || !lastName) {
          return ctx.badRequest('firstName and lastName are required');
        }
        
        // Handle team creation
        let teamId = null;
        if (teamName) {
          try {
            let team = await strapi.db.query('api::team.team').findOne({
              where: { name: teamName }
            });
            
            if (!team) {
              console.log(`🏢 Creating new team: ${teamName}`);
              team = await strapi.db.query('api::team.team').create({
                data: { 
                  name: teamName, 
                  publishedAt: new Date() 
                }
              });
              console.log(`✅ Team created with ID: ${team.id}, DocumentID: ${team.documentId}`);
            } else {
              console.log(`✅ Using existing team: ${team.name} (ID: ${team.id})`);
            }
            
            // Store the team ID (not documentId) for the relation
            teamId = team.id;
          } catch (error) {
            console.error('❌ Team handling failed:', error);
            // Continue without team if it fails
          }
        }
        
        // Store original body
        const originalBody = { ...ctx.request.body };
        
        // Prepare body for original register (only basic fields)
        ctx.request.body = {
          email: originalBody.email,
          username: originalBody.username,
          password: originalBody.password
        };
        
        console.log('📞 Calling original register with basic fields...');
        
        // CRITICAL: Actually call the original register!
        await originalRegister.call(controller, ctx);
        
        console.log('✅ Original register completed');
        console.log('Response status:', ctx.status);
        
        // If user was created successfully, update with custom fields
        if (ctx.status === 200 && ctx.body?.user?.id) {
          const userId = ctx.body.user.id;
          console.log(`📝 Updating user ${userId} with custom fields...`);
          
          try {
            // Prepare update data with proper typing
            interface UpdateData {
              firstName: string;
              lastName: string;
              businessRole: string;
              bio?: string;
              team?: number;
            }
            
            const updateData: UpdateData = {
              firstName,
              lastName,
              businessRole
            };
            
            // Add optional fields if provided
            if (bio) updateData.bio = bio;
            if (teamId) updateData.team = teamId; // Use the ID for the relation
            
            console.log('Update data:', updateData);
            
            // Update the user with custom fields
            const updatedUser = await strapi.db.query('plugin::users-permissions.user').update({
              where: { id: userId },
              data: updateData,
              populate: {
                team: true,
                role: true
              }
            });
            
            console.log('✅ User updated with custom fields');
            
            // Enhance the response with the updated user data
            ctx.body.user = {
              ...ctx.body.user,
              firstName: updatedUser.firstName,
              lastName: updatedUser.lastName,
              businessRole: updatedUser.businessRole,
              bio: updatedUser.bio
            };
            
            // Add team info if it exists
            if (updatedUser.team) {
              ctx.body.user.team = {
                id: updatedUser.team.id,
                documentId: updatedUser.team.documentId,
                name: updatedUser.team.name
              };
              console.log(`✅ User linked to team: ${updatedUser.team.name}`);
            }
            
          } catch (updateError) {
            console.error('⚠️ Failed to update user with custom fields:', updateError);
            // User is created but without custom fields - registration still successful
          }
        }
        
        // Log final response
        console.log('\n📤 Final Response:');
        console.log('  - Status:', ctx.status);
        console.log('  - Has JWT:', !!ctx.body?.jwt);
        console.log('  - User ID:', ctx.body?.user?.id);
        console.log('  - User Email:', ctx.body?.user?.email);
        console.log('  - Team:', ctx.body?.user?.team?.name || 'No team');
        console.log('========================================\n');
        
      } catch (error) {
        console.error('❌ Error in custom register:', error);
        console.error('Stack:', error.stack);
        
        // If the original register hasn't set a response, set an error
        if (!ctx.body) {
          ctx.status = 400;
          ctx.body = {
            error: {
              message: error.message || 'Registration failed',
              name: 'ApplicationError'
            }
          };
        }
      }
    };
    
    return controller;
  };
  
  strapi.log.info("✅ Extension setup complete");
  
  return plugin;
};