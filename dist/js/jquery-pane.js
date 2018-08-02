/*!
  * jQuery Pane v1.0.0 (https://github.com/ElGigi/jQueryPane#readme)
  * Copyright 2018 jQuery Pane Authors (https://github.com/ElGigi/jQueryPane/graphs/contributors)
  * Licensed under MIT (https://github.com/ElGigi/jQueryPane/blob/master/LICENSE)
  */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('jquery')) :
  typeof define === 'function' && define.amd ? define(['jquery'], factory) :
  (global.Pane = factory(global.jQuery));
}(this, (function ($) { 'use strict';

  $ = $ && $.hasOwnProperty('default') ? $['default'] : $;

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      var ownKeys = Object.keys(source);

      if (typeof Object.getOwnPropertySymbols === 'function') {
        ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        }));
      }

      ownKeys.forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    }

    return target;
  }

  var PaneManager = function ($$$1) {
    // Check jQuery requirements
    if (typeof $$$1 === 'undefined') {
      throw new TypeError('jQuery Pane requires jQuery. jQuery must be included before.');
    }
    /**
     * Defaults
     */


    var Default = {
      debug: false,
      container: 'body',
      loader: '',
      transitionInTime: 50,
      transitionOutTime: 400
      /**
       * Events
       */

    };
    var Event = {
      // Pane
      SHOW: 'show.pane',
      SHOWN: 'shown.pane',
      HIDE: 'hide.pane',
      HIDDEN: 'hidden.pane',
      // Pane content
      LOADING: 'loading.content.pane',
      LOADED: 'loaded.content.pane',
      LOADING_ERROR: 'error.content.pane',
      PRINTED: 'printed.content.pane',
      // Selectors
      CLICK_DISMISS: 'click.dismiss.pane',
      CLICK_DATA_API: 'click.pane',
      SUBMIT_DATA_API: 'submit.pane'
      /**
       * SELECTORS
       */

    };
    var Selector = {
      WRAPPER: '.pane-wrapper:first',
      LOADER: '.pane-loader',
      PANE: '.pane',
      FORM: 'form:not([target])',
      SUBMIT: 'form:not([target]) :submit[name]',
      DATA_TOGGLE: '[data-toggle="pane"]',
      DATA_DISMISS: '[data-dismiss="pane"]'
      /**
       * PaneManager
       */

    };

    var PaneManager =
    /*#__PURE__*/
    function () {
      function PaneManager(config) {
        _classCallCheck(this, PaneManager);

        this._config = this._getConfig(config);
        this._wrapper = null;

        this._events(); // Debug


        if (this.config('debug')) {
          console.debug('PaneManager initialized');
        }
      } // Getters


      _createClass(PaneManager, [{
        key: "refresh",
        // Public
        value: function refresh() {
          this._wrapper.toggleClass('is-open', $$$1(Selector.PANE, this._wrapper).length > 0);
        }
      }, {
        key: "config",
        value: function config(key) {
          if (!_typeof(this._config[key])) {
            throw new TypeError('Undefined option name "' + key + '"');
          }

          return this._config[key];
        } // Private

      }, {
        key: "_events",
        value: function _events() {
          var manager = this;
          $$$1(document).off(Event.CLICK_DATA_API, Selector.DATA_TOGGLE).on(Event.CLICK_DATA_API, Selector.DATA_TOGGLE, function (event) {
            event.preventDefault(); // Debug

            if (manager.config('debug')) {
              console.debug('Selector', Selector.DATA_TOGGLE, 'has been clicked');
            }

            manager._newPane(this);
          });
        }
      }, {
        key: "_newPane",
        value: function _newPane(relatedTarget) {
          var href = $$$1(relatedTarget).data('href') || $$$1(relatedTarget).attr('href');

          if (!href) {
            console.error('Pane has no href to load content');
            return;
          }

          var pane = new Pane(this);
          pane.open($$$1(relatedTarget).attr('paneClass') || '');
          pane.load(href);
          return pane;
        }
      }, {
        key: "_getConfig",
        value: function _getConfig(config) {
          config = _objectSpread({}, Default, config);
          return config;
        }
      }, {
        key: "wrapper",
        get: function get() {
          if (!this._wrapper) {
            this._wrapper = $$$1(Selector.WRAPPER);

            if (this._wrapper.length === 0) {
              this._wrapper = $$$1('<div class="pane-wrapper"></div>');
              $$$1(this._config.container).append(this._wrapper);
            }
          }

          return this._wrapper;
        }
      }]);

      return PaneManager;
    }();
    /**
     * Pane
     */


    var Pane =
    /*#__PURE__*/
    function () {
      function Pane(paneManager) {
        _classCallCheck(this, Pane);

        this._manager = paneManager;
        this._jqXHR = null;
        this._isTransitioning = false;
        this._element = null;
        this._href = null;
        this._element = $$$1('<div role="complementary" class="pane"></div>');

        this._element.data('pane', this);

        this._events();
      } // Public


      _createClass(Pane, [{
        key: "open",
        value: function open(className) {
          if (this._isTransitioning) {
            return;
          } // Debug


          if (this._manager.config('debug')) {
            console.debug('Pane opened');
          }

          var pane = this; // Size?

          if (typeof className === 'string') {
            pane._element.addClass(className);
          }

          this._isTransitioning = true;

          this._manager.wrapper.prepend(this._element);

          this._manager.refresh(); // Event trigger


          pane._element.trigger(Event.SHOW); // Animation


          setTimeout(function () {
            pane._element.addClass('is-visible'); // Event trigger


            pane._element.trigger(Event.SHOWN);

            pane._isTransitioning = false;
          }, 50);
        }
      }, {
        key: "load",
        value: function load(href) {
          // Debug
          if (this._manager.config('debug')) {
            console.debug('Pane loaded');
          }

          if (typeof href !== 'string') {
            throw new TypeError('Pane::load() method need href in first argument');
          }

          this._ajax({
            url: href
          });

          this._href = href;
        }
      }, {
        key: "close",
        value: function close() {
          if (this._isTransitioning) {
            return;
          }

          var pane = this,
              manager = this._manager; // Event trigger

          var eventClose = $$$1.Event(Event.HIDE, {
            pane: pane._element
          });

          pane._element.trigger(eventClose);

          if (!eventClose.isPropagationStopped()) {
            // Animation
            this._isTransitioning = true;

            pane._element.removeClass('is-visible'); // After animation


            setTimeout(function () {
              pane._element.remove();

              manager.refresh(); // Event trigger

              pane._element.trigger(Event.HIDDEN);

              pane._isTransitioning = false;
            }, 400);
          }
        } // Private

      }, {
        key: "_events",
        value: function _events() {
          var pane = this;

          this._element // Dismiss
          .off(Event.CLICK_DISMISS, Selector.DATA_DISMISS).on(Event.CLICK_DISMISS, Selector.DATA_DISMISS, function (event) {
            event.preventDefault();
            pane.close();
          }) // Submit buttons
          .off(Event.CLICK_DATA_API, Selector.SUBMIT).on(Event.CLICK_DATA_API, Selector.SUBMIT, function (event) {
            event.preventDefault();
            $$$1(this).parents('form').trigger('submit', {
              'name': $$$1(this).attr('name'),
              'value': $$$1(this).val()
            });
          }) // Submit form
          .off(Event.SUBMIT_DATA_API, Selector.FORM).on(Event.SUBMIT_DATA_API, Selector.FORM, function (event, button) {
            event.preventDefault();
            var $form = $$$1(this);

            if (typeof $form.get(0).checkValidity !== 'function' || $form.get(0).checkValidity()) {
              // Get data of form
              var formData = $form.serializeArray(); // Add button

              if ($$$1.isPlainObject(button)) {
                formData.push(button);
              } // Form submission


              pane._ajax({
                url: $$$1(this).attr('action') || pane._href,
                method: $$$1(this).attr('method') || 'get',
                data: formData,
                dataType: 'json'
              });
            }
          });
        }
      }, {
        key: "_loader",
        value: function _loader(toggle) {
          toggle = typeof toggle === 'boolean' ? toggle : true;

          if (toggle) {
            var $loader = $$$1(Selector.LOADER, this._element);

            if ($loader.length === 0) {
              $loader = $$$1('<div class="pane-loader"></div>');
              $loader.append(this._manager.config('loader'));
              $$$1(this._element).prepend($loader);
            }
          } else {
            $$$1(Selector.LOADER, this._element).remove();
          }
        }
      }, {
        key: "_ajax",
        value: function _ajax(options) {
          if (this._jqXHR) {
            return;
          }

          var pane = this; // Event trigger

          pane._element.trigger(Event.LOADING);

          pane._loader(true); // Ajax options


          options = _objectSpread({
            method: 'get'
          }, options, {
            success: function success(data, textStatus, jqXHR) {
              var eventLoaded = $$$1.Event(Event.LOADED, {
                pane: pane._element,
                paneAjax: {
                  data: data,
                  textStatus: textStatus,
                  jqXHR: jqXHR
                }
              }); // Event trigger

              pane._element.trigger(eventLoaded);

              if (!eventLoaded.isPropagationStopped()) {
                pane._element.html(jqXHR.responseText);

                pane._element.trigger(Event.PRINTED, pane._element);
              }
            },
            error: function error(jqXHR, textStatus, errorThrown) {
              var eventLoadingError = $$$1.Event(Event.LOADING_ERROR, {
                pane: pane._element,
                paneAjax: {
                  textStatus: textStatus,
                  jqXHR: jqXHR,
                  errorThrown: errorThrown
                }
              }); // Event trigger

              pane._element.trigger(eventLoadingError);

              if (!eventLoadingError.isPropagationStopped()) {
                pane.close();
              }
            },
            complete: function complete() {
              pane._jqXHR = null;

              pane._loader(false);
            } // Ajax

          });
          this._jqXHR = $$$1.ajax(options);
        }
      }]);

      return Pane;
    }();

    return function (config) {
      return new PaneManager(config);
    };
  }($);

  return PaneManager;

})));
//# sourceMappingURL=jquery-pane.js.map
