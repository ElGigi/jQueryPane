/*!
  * jQuery Pane v1.0.0-alpha.4 (https://github.com/ElGigi/jQueryPane#readme)
  * Copyright 2018 jQuery Pane Authors (https://github.com/ElGigi/jQueryPane/graphs/contributors)
  * Licensed under MIT (https://github.com/ElGigi/jQueryPane/blob/master/LICENSE)
  */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('jquery')) :
  typeof define === 'function' && define.amd ? define(['jquery'], factory) :
  (global = global || self, global.Pane = factory(global.jQuery));
}(this, (function ($) { 'use strict';

  $ = $ && Object.prototype.hasOwnProperty.call($, 'default') ? $['default'] : $;

  function _typeof(obj) {
    "@babel/helpers - typeof";

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

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  var PaneManager = function ($) {
    // Check jQuery requirements
    if (typeof $ === 'undefined') {
      throw new TypeError('jQuery Pane requires jQuery. jQuery must be included before.');
    }
    /**
     * Get Internet Explorer version.
     *
     * @return {number}
     */


    function GetIEVersion() {
      var sAgent = window.navigator.userAgent;
      var Idx = sAgent.indexOf("MSIE"); // If IE, return version number.

      if (Idx > 0) {
        return parseInt(sAgent.substring(Idx + 5, sAgent.indexOf(".", Idx)));
      } // If IE 11 then look for Updated user agent string.
      else if (!!navigator.userAgent.match(/Trident\/7\./)) {
          return 11;
        } else {
          return 0; //It is not IE
        }
    }
    /**
     * Defaults
     */


    var Default = {
      debug: false,
      container: 'body',
      loader: '',
      transitionInTime: 50,
      transitionOutTime: 400,
      ajax: {}
    };
    /**
     * Events
     */

    var Event = {
      // Pane
      SHOW: 'show.pane',
      SHOWN: 'shown.pane',
      HIDE: 'hide.pane',
      HIDDEN: 'hidden.pane',
      // Pane content
      RELOAD: 'reload.content.pane',
      LOADING: 'loading.content.pane',
      LOADED: 'loaded.content.pane',
      LOADING_ERROR: 'error.content.pane',
      PRINTED: 'printed.content.pane',
      SUBMIT: 'submit.content.pane',
      // Selectors
      CLICK_DISMISS: 'click.dismiss.pane',
      CLICK_DATA_API: 'click.pane',
      SUBMIT_DATA_API: 'submit.pane'
    };
    /**
     * SELECTORS
     */

    var Selector = {
      WRAPPER: '.pane-wrapper:first',
      LOADER: '.pane-loader',
      PANE: '.pane',
      PANE_NOT_STATIC: '.pane:not(.pane-static)',
      FORM: 'form:not([target])',
      SUBMIT: 'form:not([target]) :submit[name]',
      DATA_TOGGLE: '[data-toggle="pane"]',
      DATA_DISMISS: '[data-dismiss="pane"]'
    };
    /**
     * PaneManager
     */

    var PaneManager = /*#__PURE__*/function () {
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
          this._wrapper.toggleClass('is-open', $(Selector.PANE_NOT_STATIC, this._wrapper).length > 0);
        }
      }, {
        key: "config",
        value: function config(key) {
          if (!_typeof(this._config[key])) {
            throw new TypeError('Undefined option name "' + key + '"');
          }

          return this._config[key];
        }
      }, {
        key: "new",
        value: function _new() {
          return new Pane(this);
        } // Private

      }, {
        key: "_events",
        value: function _events() {
          var manager = this;
          $(document).off(Event.CLICK_DATA_API, Selector.DATA_TOGGLE).on(Event.CLICK_DATA_API, Selector.DATA_TOGGLE, function (event) {
            event.preventDefault();
            event.stopPropagation(); // Debug

            if (manager.config('debug')) {
              console.debug('Selector', Selector.DATA_TOGGLE, 'has been clicked');
            }

            manager._pane(this);
          });
        }
      }, {
        key: "_pane",
        value: function _pane(relatedTarget) {
          var pane = null,
              href = $(relatedTarget).data('href') || $(relatedTarget).attr('href'),
              target = $(relatedTarget).data('paneTarget') || '';

          if (!href) {
            console.error('Pane has no href to load content');
            return;
          } // Target self?


          if (target === 'self') {
            pane = $(relatedTarget).parents(Selector.PANE).data('pane');
          } // Need to create pane?


          if (!pane) {
            pane = this["new"]();
          }

          pane.relatedTarget = relatedTarget;
          pane.open();
          pane.load(href, $(relatedTarget).data('paneLoadOptions'));
          return pane;
        }
      }, {
        key: "_getConfig",
        value: function _getConfig(config) {
          config = _objectSpread2(_objectSpread2({}, Default), config);
          return config;
        }
      }, {
        key: "wrapper",
        get: function get() {
          if (!this._wrapper) {
            this._wrapper = $(Selector.WRAPPER);

            if (this._wrapper.length === 0) {
              this._wrapper = $('<div class="pane-wrapper"></div>');
              $(this._config.container).append(this._wrapper);
            } // Internet explorer


            this._wrapper.toggleClass('pane-ie', GetIEVersion() > 0);
          }

          return this._wrapper;
        }
      }]);

      return PaneManager;
    }();
    /**
     * Pane
     */


    var Pane = /*#__PURE__*/function () {
      function Pane(paneManager) {
        _classCallCheck(this, Pane);

        this._manager = paneManager;
        this._jqXHR = null;
        this._isTransitioning = false;
        this._isStatic = false;
        this._relatedTarget = null;
        this._href = null;
        this._loadOptions = {};
      } // Getters


      _createClass(Pane, [{
        key: "open",
        // Public
        value: function open() {
          if (this._isStatic) {
            return;
          }

          if (this._isTransitioning) {
            return;
          } // Already opened?


          if (this._manager.wrapper.find(this.element).length > 0) {
            return;
          }

          var pane = this;
          this._isTransitioning = true;

          this._manager.wrapper.prepend(this.element); // Event trigger


          var eventShow = $.Event(Event.SHOW, {
            pane: pane
          });
          pane.element.trigger(eventShow);

          if (pane._manager.config('debug')) {
            console.debug('Triggered event:', Event.SHOW);
          }

          if (!eventShow.isDefaultPrevented()) {
            this._manager.refresh(); // Animation


            setTimeout(function () {
              pane.element.addClass('is-visible');
              pane._isTransitioning = false; // Event trigger

              pane.element.trigger(Event.SHOWN);

              if (pane._manager.config('debug')) {
                console.debug('Triggered event:', Event.SHOWN);
              }
            }, 50);
          }
        }
      }, {
        key: "reload",
        value: function reload(fragments) {
          var pane = this; // Event trigger

          var eventReload = $.Event(Event.RELOAD, {
            pane: pane,
            url: this._href
          });
          pane.element.trigger(eventReload);

          if (pane._manager.config('debug')) {
            console.debug('Triggered event:', Event.RELOAD);
          }

          if (!eventReload.isDefaultPrevented()) {
            this.load(this._href, null, fragments);
          }
        }
      }, {
        key: "load",
        value: function load(href, loadOptions, fragments) {
          if (typeof href !== 'string') {
            throw new TypeError('Pane::load() method need href in first argument');
          } // Set to private properties


          this._href = href.toString();

          if (_typeof(loadOptions) === 'object') {
            this._loadOptions = loadOptions;
          } // Load content with AJAX


          this._ajax(_objectSpread2({
            url: this._href
          }, this._loadOptions), fragments);
        }
      }, {
        key: "close",
        value: function close() {
          if (this._isStatic) {
            return;
          }

          if (this._isTransitioning) {
            return;
          }

          var pane = this,
              manager = this._manager; // Event trigger

          var eventClose = $.Event(Event.HIDE, {
            pane: pane.element
          });
          pane.element.trigger(eventClose);

          if (pane._manager.config('debug')) {
            console.debug('Triggered event:', Event.HIDE);
          }

          if (!eventClose.isDefaultPrevented()) {
            // Animation
            this._isTransitioning = true;
            pane.element.removeClass('is-visible'); // After animation

            setTimeout(function () {
              // Event trigger
              pane.element.trigger(Event.HIDDEN);

              if (pane._manager.config('debug')) {
                console.debug('Triggered event:', Event.HIDDEN);
              }

              pane._isTransitioning = false;
              pane.element.remove();
              manager.refresh();
            }, 400);
          }
        }
      }, {
        key: "loader",
        value: function loader(toggle) {
          toggle = typeof toggle === 'boolean' ? toggle : true;

          if (toggle) {
            var $loader = $(Selector.LOADER, this.element);

            if ($loader.length === 0) {
              $loader = $('<div class="pane-loader"></div>');
              $loader.append(this._manager.config('loader'));
              $(this.element).prepend($loader);
            }
          } else {
            $(Selector.LOADER, this.element).remove();
          }
        } // Private

      }, {
        key: "_events",
        value: function _events() {
          var pane = this;
          this.element // Dismiss
          .off(Event.CLICK_DISMISS, Selector.DATA_DISMISS).on(Event.CLICK_DISMISS, Selector.DATA_DISMISS, function (event) {
            event.preventDefault();
            pane.close();
          }) // Submit buttons
          .off(Event.CLICK_DATA_API, Selector.SUBMIT).on(Event.CLICK_DATA_API, Selector.SUBMIT, function () {
            var $form = $(this).parents('form');
            $form.data('submitButton', {
              'name': $(this).attr('name'),
              'value': $(this).val(),
              'novalidate': $(this).attr('formnovalidate') !== undefined
            });
          }) // Submit form
          .off(Event.SUBMIT_DATA_API, Selector.FORM).on(Event.SUBMIT_DATA_API, Selector.FORM, function (event) {
            event.preventDefault();
            var $form = $(this); // Submit button

            var submitButton = null;

            if ($.isPlainObject($form.data('submitButton'))) {
              submitButton = $form.data('submitButton');
            }

            if (submitButton && submitButton.novalidate || typeof $form.get(0).checkValidity !== 'function' || $form.get(0).checkValidity()) {
              // Get data of form
              var bodyHttpRequest = $.inArray(($(this).attr('method') || 'get').toLowerCase(), ['post', 'put', 'connect', 'patch']) !== -1;

              var formData = pane._serializeForm($form); // Add button to form data


              if (submitButton) {
                formData.append(submitButton.name, submitButton.value);
              } // Convert to JSON if no body request


              if (!bodyHttpRequest) {
                var formDataTmp = [];
                formData.forEach(function (value, name) {
                  formDataTmp.push({
                    name: name,
                    value: value
                  });
                });
                formData = formDataTmp;
              } // Form submission


              pane._ajax({
                url: $(this).attr('action') || pane._href,
                method: $(this).attr('method') || 'get',
                processData: !bodyHttpRequest,
                contentType: bodyHttpRequest ? false : 'text/plain',
                data: formData,
                dataType: 'json'
              }); // Remove submit button reference


              $form.removeData('submitButton');
            }
          });
        }
      }, {
        key: "_serializeForm",
        value: function _serializeForm(form) {
          var formData = new FormData(),
              formParams = form.serializeArray();
          $.each(form.find('input[type="file"]'), function (i, tag) {
            $.each($(tag)[0].files, function (i, file) {
              formData.append(tag.name, file);
            });
          });
          $.each(formParams, function (i, val) {
            formData.append(val.name, val.value);
          });
          return formData;
        }
      }, {
        key: "_ajax",
        value: function _ajax(options, fragments) {
          if (this._jqXHR) {
            return;
          }

          var pane = this; // Ajax options

          options = _objectSpread2(_objectSpread2(_objectSpread2({
            method: 'get'
          }, this._manager.config('ajax')), options), {}, {
            success: function success(data, textStatus, jqXHR) {
              pane._jqXHR = null;
              pane.loader(false);
              var eventLoaded = $.Event(Event.LOADED, {
                pane: pane,
                url: options.url,
                paneAjax: {
                  data: data,
                  textStatus: textStatus,
                  jqXHR: jqXHR,
                  fragments: fragments || null
                }
              }); // Event trigger

              pane.element.trigger(eventLoaded);

              if (pane._manager.config('debug')) {
                console.debug('Triggered event:', Event.LOADED);
              }

              if (!eventLoaded.isDefaultPrevented()) {
                if (fragments) {
                  $(fragments, pane.element).first().html($(jqXHR.responseText).find(fragments).html());
                } else {
                  pane.element.html(jqXHR.responseText);
                }

                pane.element.trigger(Event.PRINTED, pane.element);

                if (pane._manager.config('debug')) {
                  console.debug('Triggered event:', Event.PRINTED);
                }
              }
            },
            error: function error(jqXHR, textStatus, errorThrown) {
              pane._jqXHR = null;
              pane.loader(false);
              var eventLoadingError = $.Event(Event.LOADING_ERROR, {
                pane: pane,
                paneAjax: {
                  textStatus: textStatus,
                  jqXHR: jqXHR,
                  errorThrown: errorThrown
                }
              }); // Event trigger

              pane.element.trigger(eventLoadingError);

              if (pane._manager.config('debug')) {
                console.debug('Triggered event:', Event.LOADING_ERROR);
              }

              if (!eventLoadingError.isDefaultPrevented()) {
                pane.close();
              }
            }
          }); // Event trigger

          pane.element.trigger($.Event(Event.LOADING, {
            pane: pane,
            url: options.url
          }));

          if (pane._manager.config('debug')) {
            console.debug('Triggered event:', Event.LOADING);
          } // Loader


          pane.loader(true); // Ajax

          this._jqXHR = $.ajax(options);
        }
      }, {
        key: "relatedTarget",
        get: function get() {
          return this._relatedTarget;
        },
        // Setters
        set: function set(relatedTarget) {
          this._relatedTarget = relatedTarget;
        }
      }, {
        key: "element",
        get: function get() {
          if (!this._element) {
            // Default element
            this._element = $('<div role="complementary" class="pane"></div>');

            this._element.data('pane', this);

            this._events();
          }

          return this._element;
        },
        set: function set(element) {
          this._element = element;
          this._isStatic = true;

          this._element.data('pane', this);

          this._events();
        }
      }, {
        key: "static",
        get: function get() {
          return this._isStatic;
        },
        set: function set(isStatic) {
          this._isStatic = isStatic === true;
        }
      }, {
        key: "location",
        get: function get() {
          return new URL(this._href, document.location.toString());
        },
        set: function set(location) {
          this._href = location.toString();
        }
      }], [{
        key: "_jQueryInterface",
        value: function _jQueryInterface(action, arg1, arg2) {
          return this.each(function () {
            if (!(_typeof($(this).data('pane')) === 'object' && $(this).data('pane') instanceof Pane)) {
              throw new Error('Not a pane');
            }

            if (typeof action === 'string') {
              var pane = $(this).data('pane');

              switch (action) {
                case 'close':
                case 'load':
                case 'reload':
                case 'loader':
                  pane[action](arg1, arg2);
                  break;

                default:
                  throw new TypeError("No method named \"".concat(action, "\""));
              }
            }
          });
        }
      }]);

      return Pane;
    }(); // jQuery


    $.fn['pane'] = Pane._jQueryInterface;

    $.fn['pane'].noConflict = function () {
      return Pane._jQueryInterface;
    };

    return function (config) {
      return new PaneManager(config);
    };
  }($);

  return PaneManager;

})));
//# sourceMappingURL=jquery-pane.js.map
