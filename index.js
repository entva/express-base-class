const { Router } = require('express');

const getError = (func) => `Context binding error, argument is not a function: ${func}`;

const bindFunctions = (functions, context) => (
  functions.map((func) => {
    if (Array.isArray(func)) return bindFunctions(func, context);
    if (typeof func !== 'function') throw new Error(getError(func));
    return func.bind(context);
  })
);

const getMethod = (type) => (
  function(route, ...callbacks) {
    return this.router[type](route, ...bindFunctions(callbacks, this));
  }
);

const createMethods = () => (
  ['get', 'post', 'head', 'put', 'delete', 'all', 'options'].reduce((acc, type) => {
    acc[type] = getMethod(type);
    return acc;
  }, {})
);

class BaseController {
  constructor() {
    this.router = Router();
  }

  async use(app) {
    if (this.attachRoutes) await this.attachRoutes();
    return app.use(this.router);
  }
}

Object.assign(BaseController.prototype, createMethods());
module.exports = BaseController;
