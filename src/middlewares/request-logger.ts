module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    console.log('=== Incoming Request ===');
    console.log('Method:', ctx.request.method);
    console.log('App Name:', strapi.config.get('info.name'));
    console.log('URL:', ctx.request.url);
    console.log('Headers:', ctx.request.headers);
    console.log('Cookies:', ctx.cookies.get()); // If you're using cookies
    console.log('=====================');
    
    await next();
  };
};