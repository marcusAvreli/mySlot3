import { pathToRegexp } from '../path-to-regexp/dist.es2015/index.js';

const assoc = (obj, attr, val) => { obj[attr] = val; return obj };
const isArray = Array.isArray;

const keys = Object.keys;

const clone = obj =>
  obj
    ? isArray(obj)
      ? obj.slice(0)
      : extend({}, obj)
    : obj;

const pick = (obj, attrs) =>
  attrs.reduce((acc, attr) =>
    obj[attr] === undefined
      ? acc
      : assoc(acc, attr, obj[attr]), {});

const isEqual = (obj1, obj2) => {
  const keys1 = keys(obj1);
  return keys1.length === keys(obj2).length &&
    keys1.every(key => obj2[key] === obj1[key])
};

const extend = Object.assign;

function invariant (condition, format, ...args) {
  if (!condition) {
    let argIndex = 0;
    throw new Error(
      'Invariant Violation: ' +
      format.replace(/%s/g, () => args[argIndex++])
    )
  }
}

/* eslint-disable standard/no-callback-literal */

function functionDsl (callback) {
  let ancestors = [];
  const matches = {};
  const names = {};

  callback(function route (name, options, childrenCallback) {
    let routes;

    invariant(!names[name], 'Route names must be unique, but route "%s" is declared multiple times', name);

    names[name] = true;

    if (arguments.length === 1) {
      options = {};
    }

    if (arguments.length === 2 && typeof options === 'function') {
      childrenCallback = options;
      options = {};
    }

    if (typeof options.path !== 'string') {
      const parts = name.split('.');
      options.path = parts[parts.length - 1];
    }

    // go to the next level
    if (childrenCallback) {
      ancestors = ancestors.concat(name);
      childrenCallback();
      routes = pop();
      ancestors.splice(-1);
    }

    // add the node to the tree
    push({
      name: name,
      path: options.path,
      routes: routes || [],
      options: options
    });
  });

  function pop () {
    return matches[currentLevel()] || []
  }

  function push (route) {
    const level = currentLevel();
    matches[level] = matches[level] || [];
    matches[level].push(route);
  }

  function currentLevel () {
    return ancestors.join('.')
  }

  return pop()
}

function arrayDsl (routes) {
  const result = [];

  routes.forEach(({ name, children, ...options }) => {
    if (typeof options.path !== 'string') {
      const parts = name.split('.');
      options.path = parts[parts.length - 1];
    }
    result.push(
      {
        name,
        path: options.path,
        options,
        routes: children ? arrayDsl(children) : []
      }
    );
  });

  return result
}

const paramInjectMatcher = /:([a-zA-Z_$][a-zA-Z0-9_$?]*[?+*]?)/g;
const specialParamChars = /[+*?]$/g;
const queryMatcher = /\?(.+)/;

const _compiledPatterns = {};

function compilePattern (pattern) {
  if (!(pattern in _compiledPatterns)) {
    const paramNames = [];
    const re = pathToRegexp(pattern, paramNames);

    _compiledPatterns[pattern] = {
      matcher: re,
      paramNames: paramNames.map(p => p.name)
    };
  }

  return _compiledPatterns[pattern]
}

/**
 * Returns an array of the names of all parameters in the given pattern.
 */
function extractParamNames (pattern) {
  return compilePattern(pattern).paramNames
}

/**
 * Extracts the portions of the given URL path that match the given pattern
 * and returns an object of param name => value pairs. Returns null if the
 * pattern does not match the given path.
 */
function extractParams (pattern, path) {
  const cp = compilePattern(pattern);
  const matcher = cp.matcher;
  const paramNames = cp.paramNames;
  const match = path.match(matcher);

  if (!match) {
    return null
  }

  const params = {};

  paramNames.forEach(function (paramName, index) {
    params[paramName] = match[index + 1] && decodeURIComponent(match[index + 1]);
  });

  return params
}

/**
 * Returns a version of the given route path with params interpolated. Throws
 * if there is a dynamic segment of the route path for which there is no param.
 */
function injectParams (pattern, params) {
  params = params || {};

  return pattern.replace(paramInjectMatcher, function (match, param) {
    const paramName = param.replace(specialParamChars, '');
    const lastChar = param.slice(-1);

    // If param is optional don't check for existence
    if (lastChar === '?' || lastChar === '*') {
      if (params[paramName] == null) {
        return ''
      }
    } else {
      invariant(
        params[paramName] != null,
        "Missing '%s' parameter for path '%s'",
        paramName, pattern
      );
    }

    let paramValue = encodeURIComponent(params[paramName]);
    if (lastChar === '*' || lastChar === '+') {
      // restore / for splats
      paramValue = paramValue.replaceAll('%2F', '/');
    }
    return paramValue
  })
}

/**
 * Returns an object that is the result of parsing any query string contained
 * in the given path, null if the path contains no query string.
 */
function extractQuery (qs, path) {
  const match = path.match(queryMatcher);
  return match && qs.parse(match[1])
}

/**
 * Returns a version of the given path with the parameters in the given
 * query merged into the query string.
 */
function withQuery (qs, path, query) {
  const queryString = qs.stringify(query, { indices: false });

  if (queryString) {
    return withoutQuery(path) + '?' + queryString
  }

  return path
}

/**
 * Returns a version of the given path without the query string.
 */
function withoutQuery (path) {
  return path.replace(queryMatcher, '')
}

/**
* Bind `el` event `type` to `fn`.
*
* @param {Element} el
* @param {String} type
* @param {Function} fn
* @return {Function}
* @api public
*/

function bindEvent (el, type, fn) {
  el.addEventListener(type, fn);
  return fn
}

/**
* Unbind `el` event `type`'s callback `fn`.
*
* @param {Element} el
* @param {String} type
* @param {Function} fn
* @return {Function}
* @api public
*/

function unbindEvent (el, type, fn) {
  el.removeEventListener(type, fn);
  return fn
}

/* eslint-disable */

// this is mostly original code with minor modifications
// to avoid dependency on 3rd party libraries
//
// Backbone.History
// ----------------

// Handles cross-browser history management, based on either
// [pushState](http://diveintohtml5.info/history.html) and real URLs, or
// [onhashchange](https://developer.mozilla.org/en-US/docs/DOM/window.onhashchange)
// and URL fragments.
class History {
  constructor() {
    this.handlers = [];
    this.checkUrl = this.checkUrl.bind(this);
    this.location = window.location;
    this.history = window.history;
  }

  // Set up all inheritable **Backbone.History** properties and methods.
  // Are we at the app root?
  atRoot() {
    return this.location.pathname.replace(/[^\/]$/, '$&/') === this.root;
  }

  // Gets the true hash value. Cannot use location.hash directly due to bug
  // in Firefox where location.hash will always be decoded.
  getHash() {
    const match = this.location.href.match(/#(.*)$/);
    return match ? match[1] : '';
  }

  // Get the cross-browser normalized URL fragment, either from the URL,
  // the hash, or the override.
  getFragment(fragment, forcePushState) {
    if (fragment == null) {
      if (this._hasPushState || !this._wantsHashChange || forcePushState) {
        fragment = decodeURI(this.location.pathname + this.location.search);
        const root = this.root.replace(trailingSlash, '');
        if (!fragment.indexOf(root)) fragment = fragment.slice(root.length);
      } else {
        fragment = this.getHash();
      }
    }
    return fragment.replace(routeStripper, '');
  }

  // Start the hash change handling, returning `true` if the current URL matches
  // an existing route, and `false` otherwise.
  start(options = {}) {
    // MODIFICATION OF ORIGINAL BACKBONE.HISTORY
    // if (History.started) throw new Error("LocationBar has already been started");
    // History.started = true;
    this.started = true;

    // Figure out the initial configuration.
    // Is pushState desired ... is it available?
    this.options          = extend({root: '/'}, options);
    this.location         = this.options.location || this.location;
    this.history          = this.options.history || this.history;
    this.root             = this.options.root;
    this._wantsHashChange = this.options.hashChange !== false;
    this._wantsPushState  = !!this.options.pushState;
    this._hasPushState    = this._wantsPushState;
    const fragment        = this.getFragment();

    // Normalize root to always include a leading and trailing slash.
    this.root = (`/${this.root}/`).replace(rootStripper, '/');

    // Depending on whether we're using pushState or hashes, and whether
    // 'onhashchange' is supported, determine how we check the URL state.
    
    bindEvent(window, this._hasPushState ? 'popstate' : 'hashchange', this.checkUrl);

    // Determine if we need to change the base url, for a pushState link
    // opened by a non-pushState browser.
    this.fragment = fragment;
    const loc = this.location;

    // Transition from hashChange to pushState or vice versa if both are
    // requested.
    if (this._wantsHashChange && this._wantsPushState) {

      // If we've started off with a route from a `pushState`-enabled
      // browser, but we're currently in a browser that doesn't support it...
      if (!this._hasPushState && !this.atRoot()) {
        this.fragment = this.getFragment(null, true);
        this.location.replace(`${this.root}#${this.fragment}`);
        // Return immediately as browser will do redirect to new url
        return true;

      // Or if we've started out with a hash-based route, but we're currently
      // in a browser where it could be `pushState`-based instead...
      } else if (this._hasPushState && this.atRoot() && loc.hash) {
        this.fragment = this.getHash().replace(routeStripper, '');
        this.history.replaceState({}, document.title, this.root + this.fragment);
      }

    }

    if (!this.options.silent) return this.loadUrl();
  }

  // Disable Backbone.history, perhaps temporarily. Not useful in a real app,
  // but possibly useful for unit testing Routers.
  stop() {
    unbindEvent(window, this._hasPushState ? 'popstate' : 'hashchange', this.checkUrl);
    this.started = false;
  }

  // Add a route to be tested when the fragment changes. Routes added later
  // may override previous routes.
  route(route, callback) {
    this.handlers.unshift({route, callback});
  }

  // Checks the current URL to see if it has changed, and if it has,
  // calls `loadUrl`.
  checkUrl() {
    
    const current = this.getFragment();
    if (current === this.fragment) return false;
    this.loadUrl();
  }

  // Attempt to load the current URL fragment. If a route succeeds with a
  // match, returns `true`. If no defined routes matches the fragment,
  // returns `false`.
  loadUrl(fragment) {
    fragment = this.fragment = this.getFragment(fragment);
    return this.handlers.some(handler => {
      if (handler.route.test(fragment)) {
        handler.callback(fragment);
        return true;
      }
    });
  }

  // Save a fragment into the hash history, or replace the URL state if the
  // 'replace' option is passed. You are responsible for properly URL-encoding
  // the fragment in advance.
  //
  // The options object can contain `trigger: true` if you wish to have the
  // route callback be fired (not usually desirable), or `replace: true`, if
  // you wish to modify the current URL without adding an entry to the history.
  update(fragment, options) {
    if (!this.started) return false;
    if (!options || options === true) options = {trigger: !!options};

    let url = this.root + (fragment = this.getFragment(fragment || ''));

    // Strip the hash for matching.
    fragment = fragment.replace(pathStripper, '');

    if (this.fragment === fragment) return;
    this.fragment = fragment;

    // Don't include a trailing slash on the root.
    if (fragment === '' && url !== '/') url = url.slice(0, -1);

    // If pushState is available, we use it to set the fragment as a real URL.
    if (this._hasPushState) {
      this.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);

    // If hash changes haven't been explicitly disabled, update the hash
    // fragment to store history.
    } else if (this._wantsHashChange) {
      this._updateHash(this.location, fragment, options.replace);
    // If you've told us that you explicitly don't want fallback hashchange-
    // based history, then `update` becomes a page refresh.
    } else {
      return this.location.assign(url);
    }
    if (options.trigger) return this.loadUrl(fragment);
  }

  // Update the hash location, either replacing the current entry, or adding
  // a new one to the browser history.
  _updateHash(location, fragment, replace) {
    if (replace) {
      const href = location.href.replace(/(javascript:|#).*$/, '');
      location.replace(`${href}#${fragment}`);
    } else {
      // Some browsers require that `hash` contains a leading #.
      location.hash = `#${fragment}`;
    }
  }

  // add some features to History

  // a generic callback for any changes
  onChange(callback) {
    this.route(/^(.*?)$/, callback);
  }

  // checks if the browser has pushstate support
  hasPushState() {
    // MODIFICATION OF ORIGINAL BACKBONE.HISTORY
    if (!this.started) {
      throw new Error("only available after LocationBar.start()");
    }
    return this._hasPushState;
  }
}

// Cached regex for stripping a leading hash/slash and trailing space.
const routeStripper = /^[#\/]|\s+$/g;

// Cached regex for stripping leading and trailing slashes.
const rootStripper = /^\/+|\/+$/g;

// Cached regex for removing a trailing slash.
const trailingSlash = /\/$/;

// Cached regex for stripping urls of hash.
const pathStripper = /#.*$/;

class BrowserLocation {
  constructor (options = {}) {
    this.path = options.path || '';

    this.options = extend({
      pushState: false,
      root: '/'
    }, options);

    // we're using the location-bar module for actual
    // URL management
    this.locationBar = new History();
    this.locationBar.onChange(path => {
      this.handleURL(`/${path || ''}`);
    });

    this.locationBar.start(options);
  }

  /**
   * Get the current URL
   */

  getURL () {
    return this.path
  }

  /**
   * Set the current URL without triggering any events
   * back to the router. Add a new entry in browser's history.
   */

  setURL (path, options = {}) {
    if (this.path !== path) {
      this.path = path;
      this.locationBar.update(path, extend({ trigger: true }, options));
    }
  }

  /**
   * Set the current URL without triggering any events
   * back to the router. Replace the latest entry in broser's history.
   */

  replaceURL (path, options = {}) {
    if (this.path !== path) {
      this.path = path;
      this.locationBar.update(path, extend({ trigger: true, replace: true }, options));
    }
  }

  /**
   * Setup a URL change handler
   * @param  {Function} callback
   */
  onChange (callback) {
    this.changeCallback = callback;
  }

  /**
   * Given a path, generate a URL appending root
   * if pushState is used and # if hash state is used
   */
  formatURL (path) {
    if (this.locationBar.hasPushState()) {
      let rootURL = this.options.root;
      if (path !== '') {
        rootURL = rootURL.replace(/\/$/, '');
      }
      return rootURL + path
    } else {
      if (path[0] === '/') {
        path = path.substr(1);
      }
      return `#${path}`
    }
  }

  /**
   * When we use pushState with a custom root option,
   * we need to take care of removingRoot at certain points.
   * Specifically
   * - browserLocation.update() can be called with the full URL by router
   * - LocationBar expects all .update() calls to be called without root
   * - this method is public so that we could dispatch URLs without root in router
   */
  removeRoot (url) {
    if (this.options.pushState && this.options.root && this.options.root !== '/') {
      return url.replace(this.options.root, '')
    } else {
      return url
    }
  }

  /**
   * Stop listening to URL changes and link clicks
   */
  destroy () {
    this.locationBar.stop();
  }

  /**
    initially, the changeCallback won't be defined yet, but that's good
    because we dont' want to kick off routing right away, the router
    does that later by manually calling this handleURL method with the
    url it reads of the location. But it's important this is called
    first by Backbone, because we wanna set a correct this.path value

    @private
   */
  handleURL (url) {
    this.path = url;
    if (this.changeCallback) {
      this.changeCallback(url);
    }
  }
}

class MemoryLocation {
  constructor ({ path }) {
    this.path = path || '';
  }

  getURL () {
    return this.path
  }

  setURL (path, options) {
    if (this.path !== path) {
      this.path = path;
      this.handleURL(this.getURL(), options);
    }
  }

  replaceURL (path, options) {
    if (this.path !== path) {
      this.setURL(path, options);
    }
  }

  onChange (callback) {
    this.changeCallback = callback;
  }

  handleURL (url, options = {}) {
    this.path = url;
    options = extend({ trigger: true }, options);
    if (this.changeCallback && options.trigger) {
      this.changeCallback(url);
    }
  }

  removeRoot (url) {
    return url
  }

  formatURL (url) {
    return url
  }
}

const TRANSITION_REDIRECTED = 'TransitionRedirected';

const TRANSITION_CANCELLED = 'TransitionCancelled';

/* eslint-disable promise/param-names */

function runError (router, transition, err) {
  router.middleware.forEach((m) => {
    m.error && m.error(transition, err);
  });
}

function transition (options) {
  options = options || {};

  const router = options.router;
  const log = router.log;
  const logError = router.logError;

  const path = options.path;
  const match = options.match;
  const routes = match.routes;
  const params = match.params;
  const pathname = match.pathname;
  const query = match.query;

  const id = options.id;
  const startTime = Date.now();
  log('---');
  log('Transition #' + id, 'to', path);
  log('Transition #' + id, 'routes:', routes.map(r => r.name));
  log('Transition #' + id, 'params:', params);
  log('Transition #' + id, 'query:', query);

  // create the transition promise
  let resolve, reject;
  const promise = new Promise(function (res, rej) {
    resolve = res;
    reject = rej;
  });

  // 1. make transition errors loud
  // 2. by adding this handler we make sure
  //    we don't trigger the default 'Potentially
  //    unhandled rejection' for cancellations
  promise.then(function () {
    log('Transition #' + id, 'completed in', (Date.now() - startTime) + 'ms');
  }).catch(function (err) {
    if (err.type !== TRANSITION_REDIRECTED && err.type !== TRANSITION_CANCELLED) {
      log('Transition #' + id, 'FAILED');
      logError(err);
    }
  });

  let cancelled = false;

  const transition = {
    id: id,
    prev: {
      routes: clone(router.state.routes) || [],
      path: router.state.path || '',
      pathname: router.state.pathname || '',
      params: clone(router.state.params) || {},
      query: clone(router.state.query) || {}
    },
    routes: clone(routes),
    path: path,
    pathname: pathname,
    params: clone(params),
    query: clone(query),
    redirectTo: function (...args) {
      return router.transitionTo(...args)
    },
    retry: function () {
      return router.transitionTo(path)
    },
    cancel: function (err) {
      if (router.state.activeTransition !== transition) {
        return
      }

      if (transition.isCancelled) {
        return
      }

      router.state.activeTransition = null;
      transition.isCancelled = true;
      cancelled = true;

      if (!err) {
        err = new Error(TRANSITION_CANCELLED);
        err.type = TRANSITION_CANCELLED;
      }
      if (err.type === TRANSITION_CANCELLED) {
        log('Transition #' + id, 'cancelled');
      }
      if (err.type === TRANSITION_REDIRECTED) {
        log('Transition #' + id, 'redirected');
      }

      router.middleware.forEach((m) => {
        m.cancel && m.cancel(transition, err);
      });
      reject(err);
    },
    followRedirects: function () {
      return promise.catch(function (reason) {
        if (router.state.activeTransition) {
          return router.state.activeTransition.followRedirects()
        }
        return Promise.reject(reason)
      })
    },

    then: promise.then.bind(promise),
    catch: promise.catch.bind(promise)
  };

  router.middleware.forEach((m) => {
    m.before && m.before(transition);
  });

  // here we handle calls to all of the middlewares
  function callNext (i, prevResult) {
    let middleware;
    let middlewareName;
    // if transition has been cancelled - nothing left to do
    if (cancelled) {
      return
    }
    // done
    if (i < router.middleware.length) {
      middleware = router.middleware[i];
      middlewareName = middleware.name || 'anonymous';
      log('Transition #' + id, 'resolving middleware:', middlewareName);
      let middlewarePromise;
      try {
        middlewarePromise = middleware.resolve ? middleware.resolve(transition, prevResult) : prevResult;
        invariant(transition !== middlewarePromise, 'Middleware %s returned a transition which resulted in a deadlock', middlewareName);
      } catch (err) {
        router.state.activeTransition = null;
        runError(router, transition, err);
        return reject(err)
      }
      Promise.resolve(middlewarePromise)
        .then(function (result) {
          callNext(i + 1, result);
        })
        .catch(function (err) {
          log('Transition #' + id, 'resolving middleware:', middlewareName, 'FAILED');
          router.state.activeTransition = null;
          runError(router, transition, err);
          reject(err);
        });
    } else {
      router.state = {
        activeTransition: null,
        routes,
        path,
        pathname,
        params,
        query
      };
      router.middleware.forEach((m) => {
        m.done && m.done(transition);
      });
      resolve();
    }
  }

  if (!options.noop) {
    Promise.resolve().then(() => callNext(0));
  } else {
    resolve();
  }

  if (options.noop) {
    transition.noop = true;
  }

  return transition
}

/**
 * Handle link delegation on `el` or the document,
 * and invoke `fn(e)` when clickable.
 *
 * @param {Element} el
 * @param {Function} fn
 * @api public
 */

function intercept (el, fn) {
  const cb = delegate(el, 'click', function (e, el) {
    if (clickable(e, el)) fn(e, el);
  });

  return function dispose () {
    undelegate(el, 'click', cb);
  }
}

function link (element) {
  element = { parentNode: element };

  const root = document;

  // Make sure `element !== document` and `element != null`
  // otherwise we get an illegal invocation
  while ((element = element.parentNode) && element !== document) {
    if (element.tagName?.toLowerCase() === 'a') {
      return element
    }
    // After `matches` on the edge case that
    // the selector matches the root
    // (when the root is not the document)
    if (element === root) {
      return
    }
  }
}

/**
 * Delegate event `type` to links
 * and invoke `fn(e)`. A callback function
 * is returned which may be passed to `.unbind()`.
 *
 * @param {Element} el
 * @param {String} selector
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

function delegate (el, type, fn) {
  return bindEvent(el, type, function (e) {
    const target = e.target || e.srcElement;
    const el = link(target);
    if (el) {
      fn(e, el);
    }
  })
}

/**
 * Unbind event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @api public
 */

function undelegate (el, type, fn) {
  unbindEvent(el, type, fn);
}

/**
 * Check if `e` is clickable.
 */

function clickable (e, el) {
  if (which(e) !== 1) return
  if (e.metaKey || e.ctrlKey || e.shiftKey) return
  if (e.defaultPrevented) return

  // check target
  if (el.target) return

  // check for data-bypass attribute
  if (el.getAttribute('data-bypass') !== null) return

  // inspect the href
  const href = el.getAttribute('href');
  if (!href || href.length === 0) return
  // don't handle hash links
  if (href[0] === '#') return
  // external/absolute links
  if (href.indexOf('http://') === 0 || href.indexOf('https://') === 0) return
  // email links
  if (href.indexOf('mailto:') === 0) return
  // don't intercept javascript links
  /* eslint-disable no-script-url */
  if (href.indexOf('javascript:') === 0) return
  /* eslint-enable no-script-url */

  return true
}

/**
 * Event button.
 */

function which (e) {
  e = e || window.event;
  return e.which === null ? e.button : e.which
}

function defineLogger (router, method, fn) {
  if (fn === true) return
  router[method] = typeof fn === 'function' ? fn : () => {};
}

var qs = {
  parse (querystring) {
    return querystring.split('&').reduce((acc, pair) => {
      const parts = pair.split('=');
      acc[parts[0]] = decodeURIComponent(parts[1]);
      return acc
    }, {})
  },

  stringify (params) {
    return Object.keys(params).reduce((acc, key) => {
      if (params[key] !== undefined) {
        acc.push(key + '=' + encodeURIComponent(params[key]));
      }
      return acc
    }, []).join('&')
  }
};

class Router {
  constructor (options = {}) {
    this.nextId = 1;
    this.state = {};
    this.middleware = [];
    this.options = extend({
      location: 'browser',
      logError: true,
      qs
    }, options);
    defineLogger(this, 'log', this.options.log);
    defineLogger(this, 'logError', this.options.logError);
    if (options.routes) {
      this.map(options.routes);
    }
  }

  /**
   * Add a middleware
   * @param  {Function} middleware
   * @return {Object}   router
   * @api public
   */
  use (middleware, options = {}) {
    const m = typeof middleware === 'function' ? { resolve: middleware } : middleware;
    typeof options.at === 'number' ? this.middleware.splice(options.at, 0, m) : this.middleware.push(m);
    m.create && m.create(this);
    return this
  }

  /**
   * Add the route map
   * @param  {Function} routes
   * @return {Object}   router
   * @api public
   */
  map (routes) {
    // create the route tree
    this.routes = Array.isArray(routes) ? arrayDsl(routes) : functionDsl(routes);

    // create the matcher list, which is like a flattened
    // list of routes = a list of all branches of the route tree
    const matchers = this.matchers = [];
    // keep track of whether duplicate paths have been created,
    // in which case we'll warn the dev
    const dupes = {};
    // keep track of abstract routes to build index route forwarding
    const abstracts = {};

    eachBranch({ routes: this.routes }, [], routes => {
      // concatenate the paths of the list of routes
      let path = routes.reduce((memo, r) => // reset if there's a leading slash, otherwise concat
      // and keep resetting the trailing slash
        (r.path[0] === '/' ? r.path : `${memo}/${r.path}`).replace(/\/$/, ''), '');
      // ensure we have a leading slash
      if (path === '') {
        path = '/';
      }

      const lastRoute = routes[routes.length - 1];

      if (lastRoute.options.abstract) {
        abstracts[path] = lastRoute.name;
        return
      }

      if (lastRoute.path === '') {
        let matcher;
        matchers.some(m => {
          if (m.path === path) {
            matcher = m;
            return true
          }
        });

        if (matcher) {
          // remap the matcher of a parent route
          matcher.routes = routes;
        } else if (abstracts[path]) {
          matchers.push({
            routes,
            name: abstracts[path],
            path
          });
        }
      }

      // register routes
      matchers.push({
        routes,
        name: lastRoute.name,
        path
      });

      // dupe detection
      if (dupes[path] && lastRoute.path !== '') {
        throw new Error(`Routes ${dupes[path]} and ${lastRoute.name} have the same url path '${path}'`)
      }
      dupes[path] = lastRoute.name;
    });

    function eachBranch (node, memo, fn) {
      node.routes.forEach(route => {
        fn(memo.concat(route));

        if (route.routes.length) {
          eachBranch(route, memo.concat(route), fn);
        }
      });
    }

    return this
  }

  /**
   * Starts listening to the location changes.
   * @param  {Object}  location (optional)
   * @return {Promise} initial transition
   *
   * @api public
   */
  listen (path) {
    const location = this.location = this.createLocation(path || '');
    // setup the location onChange handler
    location.onChange((url) => {
      const previousUrl = this.state.path;
      this.dispatch(url).catch((err) => {
        if (err && err.type === TRANSITION_CANCELLED) {
          // reset the URL in case the transition has been cancelled
          this.location.replaceURL(previousUrl, { trigger: false });
        }
        return err
      });
    });
    // and also kick off the initial transition
    return this.dispatch(location.getURL())
  }

  /**
   * Transition to a different route. Passe in url or a route name followed by params and query
   * @param  {String} url     url or route name
   * @param  {Object} params  Optional
   * @param  {Object} query   Optional
   * @return {Object}         transition
   *
   * @api public
   */
  transitionTo (name, params, query) {
    if (this.state.activeTransition) {
      return this.replaceWith(name, params, query)
    }
    return this.doTransition('setURL', name, params, query)
  }

  /**
   * Like transitionTo, but doesn't leave an entry in the browser's history,
   * so clicking back will skip this route
   * @param  {String} url     url or route name followed by params and query
   * @param  {Object} params  Optional
   * @param  {Object} query   Optional
   * @return {Object}         transition
   *
   * @api public
   */
  replaceWith (name, params, query) {
    return this.doTransition('replaceURL', name, params, query)
  }

  /**
   * Create an href
   * @param  {String} name   target route name
   * @param  {Object} params
   * @param  {Object} query
   * @return {String}        href
   *
   * @api public
   */
  generate (name, params, query) {
    invariant(this.location, 'call .listen() before using .generate()');
    let matcher;

    query = query || {};

    this.matchers.forEach(m => {
      if (m.name === name) {
        matcher = m;
      }
    });

    if (!matcher) {
      throw new Error(`No route is named ${name}`)
    }

    const url = withQuery(this.options.qs, injectParams(matcher.path, params), query);
    return this.location.formatURL(url)
  }

  /**
   * Stop listening to URL changes
   * @api public
   */
  destroy () {
    if (this.location && this.location.destroy) {
      this.location.destroy();
    }
    if (this.state.activeTransition) {
      this.state.activeTransition.cancel();
    }
    this.state = {};
    this.middleware.forEach(m => {
      m.destroy && m.destroy(this);
    });
  }

  /**
   * Check if the given route/params/query combo is active
   * @param  {String} name   target route name
   * @param  {Object} params
   * @param  {Object} query
   * @return {Boolean}
   *
   * @api public
   */
  isActive (name, params, query, exact) {
    const activeRoutes = this.state.routes || [];
    const activeParams = this.state.params;
    const activeQuery = this.state.query;

    let isActive = activeRoutes.some(route => route.name === name) &&
      (!exact || activeRoutes[activeRoutes.length - 1].name === name);
    isActive = isActive && (!params || keys(params).every(key => activeParams[key] === params[key]));
    isActive = isActive && (!query || keys(query).every(key => activeQuery[key] === query[key]));

    return isActive
  }

  /**
   * @api private
   */
  doTransition (method, name, params, query) {
    const previousUrl = this.location.getURL();

    let url = name;
    if (url[0] !== '/') {
      url = this.generate(name, params, query);
      url = url.replace(/^#/, '/');
    }

    if (this.options.pushState) {
      url = this.location.removeRoot(url);
    }

    const transition = this.dispatch(url);

    transition.catch((err) => {
      if (err && err.type === TRANSITION_CANCELLED) {
        // reset the URL in case the transition has been cancelled
        this.location.replaceURL(previousUrl, { trigger: false });
      }
      return err
    });

    this.location[method](url, { trigger: false });

    return transition
  }

  /**
   * Match the path against the routes
   * @param  {String} path
   * @return {Object} the list of matching routes and params
   *
   * @api private
   */
  match (path) {
    path = (path || '').replace(/\/$/, '') || '/';
    let params;
    let routes = [];
    const pathWithoutQuery = withoutQuery(path);
    const qs = this.options.qs;
    this.matchers.some(matcher => {
      params = extractParams(matcher.path, pathWithoutQuery);
      if (params) {
        routes = matcher.routes;
        return true
      }
    });
    return {
      routes: routes.map(descriptor),
      params: params || {},
      pathname: pathWithoutQuery,
      query: extractQuery(qs, path) || {}
    }

    // clone the data (only a shallow clone of options)
    // to make sure the internal route store is not mutated
    // by the middleware. The middleware can mutate data
    // before it gets passed into the resolve middleware, but
    // only within the same transition. New transitions
    // will get to use pristine data.
    function descriptor (route) {
      return {
        name: route.name,
        path: route.path,
        params: pick(params, extractParamNames(route.path)),
        options: clone(route.options)
      }
    }
  }

  dispatch (path) {
    const match = this.match(path);
    const query = match.query;
    const pathname = match.pathname;

    const activeTransition = this.state.activeTransition;

    // if we already have an active transition with all the same
    // params - return that and don't do anything else
    if (activeTransition &&
        activeTransition.pathname === pathname &&
        isEqual(activeTransition.query, query)) {
      return activeTransition
    }

    // otherwise, cancel the active transition since we're
    // redirecting (or initiating a brand new transition)
    if (activeTransition) {
      const err = new Error(TRANSITION_REDIRECTED);
      err.type = TRANSITION_REDIRECTED;
      err.nextPath = path;
      activeTransition.cancel(err);
    }

    // if there is no active transition, check if
    // this is a noop transition, in which case, return
    // a transition to respect the function signature,
    // but don't actually run any of the middleware
    if (!activeTransition) {
      if (this.state.pathname === pathname &&
          isEqual(this.state.query, query)) {
        return transition({
          id: this.nextId++,
          path,
          match,
          noop: true,
          router: this
        })
      }
    }

    const t = transition({
      id: this.nextId++,
      path,
      match,
      router: this
    });

    this.state.activeTransition = t;

    return t
  }

  /**
   * Create the default location.
   * This is used when no custom location is passed to
   * the listen call.
   * @return {Object} location
   *
   * @api private
   */
  createLocation (path) {

    
    const location = this.options.location;
    if (typeof location !== 'string') {
      return location
    }
    if (location === 'browser') {
      return new BrowserLocation(pick(this.options, ['pushState', 'root']))
    } else if (location === 'memory') {
      return new MemoryLocation({ path })
    } else {
      throw new Error('Location can be `browser`, `memory` or a custom implementation')
    }
  }

  log (...args) {
    console.info(...args);
  }

  logError (...args) {
    console.error(...args);
  }
}

function defaultClickHandler (event, link, router) {
  if(!link.hasAttribute('download') && !link.hasAttribute('data-phone-number')){
    event.preventDefault();
    router.transitionTo(router.location.removeRoot(link.getAttribute('href')));
  }
}

/**
 * Helper to intercept links when using pushState but server is not configured for it
 * Link clicks are handled via the router avoiding browser page reload
 */
function interceptLinks (router, el = document, clickHandler = defaultClickHandler) {
  return intercept(el, (event, link) => clickHandler(event, link, router))
}

export { Router, interceptLinks };
