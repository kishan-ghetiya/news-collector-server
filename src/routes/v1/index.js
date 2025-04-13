const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const blogRoute = require('./blog.route');
const categoryRoute = require('./category.route');
const contactusRoute = require('./contactus.route');
const subscribeRoute = require('./subscribe.route');
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/blog',
    route: blogRoute,
  },
  {
    path: '/category',
    route: categoryRoute,
  },
  {
    path: '/contact-us',
    route: contactusRoute,
  },
  {
    path: '/subscribe',
    route: subscribeRoute,
  },
];

// routes available only in development mode
const devRoutes = [];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
