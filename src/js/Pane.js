/*
 * This file is part of jQuery Pane.
 *
 * @license   https://opensource.org/licenses/MIT MIT License
 * @copyright 2018
 * @author Cassie ROUSSEAU <https://github.com/K6-front>
 * @author Ronan GIRON <https://github.com/ElGigi>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code, to the root.
 */

import $ from 'jquery'

const PaneManager = (($) => {
  // Check jQuery requirements
  if (typeof $ === 'undefined') {
    throw new TypeError('jQuery Pane requires jQuery. jQuery must be included before.')
  }

  /**
   * Defaults
   */

  const Default = {
    debug: false,
    container: 'body',
    loader: '',
    transitionInTime: 50,
    transitionOutTime: 400,
    ajax: {},
  }

  /**
   * Events
   */

  const Event = {
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
    SUBMIT: 'submit.content.pane',
    // Selectors
    CLICK_DISMISS: 'click.dismiss.pane',
    CLICK_DATA_API: 'click.pane',
    SUBMIT_DATA_API: 'submit.pane',
  }

  /**
   * SELECTORS
   */

  const Selector = {
    WRAPPER: '.pane-wrapper:first',
    LOADER: '.pane-loader',
    PANE: '.pane',
    FORM: 'form:not([target])',
    SUBMIT: 'form:not([target]) :submit[name]',
    DATA_TOGGLE: '[data-toggle="pane"]',
    DATA_DISMISS: '[data-dismiss="pane"]',
  }

  /**
   * PaneManager
   */
  class PaneManager {
    constructor(config) {
      this._config = this._getConfig(config)
      this._wrapper = null
      this._events()

      // Debug
      if (this.config('debug')) {
        console.debug('PaneManager initialized')
      }
    }

    // Getters

    get wrapper() {
      if (!this._wrapper) {
        this._wrapper = $(Selector.WRAPPER)

        if (this._wrapper.length === 0) {
          this._wrapper = $('<div class="pane-wrapper"></div>')
          $(this._config.container).append(this._wrapper)
        }
      }

      return this._wrapper
    }

    // Public

    refresh() {
      this._wrapper.toggleClass('is-open', $(Selector.PANE, this._wrapper).length > 0)
    }

    config(key) {
      if (!typeof this._config[key]) {
        throw new TypeError('Undefined option name "' + key + '"')
      }

      return this._config[key]
    }

    // Private

    _events() {
      let manager = this

      $(document)
        .off(Event.CLICK_DATA_API, Selector.DATA_TOGGLE)
        .on(Event.CLICK_DATA_API,
            Selector.DATA_TOGGLE,
            function (event) {
              event.preventDefault()

              // Debug
              if (manager.config('debug')) {
                console.debug('Selector', Selector.DATA_TOGGLE, 'has been clicked')
              }

              manager._newPane(this)
            })
    }

    _newPane(relatedTarget) {
      let href = $(relatedTarget).data('href') || $(relatedTarget).attr('href')

      if (!href) {
        console.error('Pane has no href to load content')
        return
      }

      let pane = new Pane(this)
      pane.open($(relatedTarget).data('paneClass') || '')
      pane.load(href)

      return pane
    }

    _getConfig(config) {
      config = {
        ...Default,
        ...config
      }

      return config
    }
  }

  /**
   * Pane
   */
  class Pane {
    constructor(paneManager) {
      this._manager = paneManager
      this._jqXHR = null
      this._isTransitioning = false
      this._element = null
      this._href = null

      this._element = $('<div role="complementary" class="pane"></div>')
      this._element.data('pane', this)
      this._events()
    }

    // Public

    open(className) {
      if (this._isTransitioning) {
        return
      }

      let pane = this

      // Size?
      if (typeof className === 'string') {
        pane._element.addClass(className)
      }

      this._isTransitioning = true
      this._manager.wrapper.prepend(this._element)
      this._manager.refresh()

      // Event trigger
      pane._element.trigger(Event.SHOW)
      if (pane._manager.config('debug')) {
        console.debug('Triggered event:', Event.SHOW)
      }

      // Animation
      setTimeout(
        function () {
          pane._element.addClass('is-visible')

          // Event trigger
          pane._element.trigger(Event.SHOWN)
          if (pane._manager.config('debug')) {
            console.debug('Triggered event:', Event.SHOWN)
          }

          pane._isTransitioning = false
        },
        50
      )
    }

    load(href) {
      if (typeof href !== 'string') {
        throw new TypeError('Pane::load() method need href in first argument')
      }

      this._ajax({url: href})
      this._href = href
    }

    close() {
      if (this._isTransitioning) {
        return
      }

      let pane = this,
        manager = this._manager

      // Event trigger
      let eventClose = $.Event(Event.HIDE, {pane: pane._element})
      pane._element.trigger(eventClose)
      if (pane._manager.config('debug')) {
        console.debug('Triggered event:', Event.HIDE)
      }

      if (!eventClose.isPropagationStopped()) {
        // Animation
        this._isTransitioning = true
        pane._element.removeClass('is-visible')

        // After animation
        setTimeout(
          function () {
            pane._element.remove()
            manager.refresh()

            // Event trigger
            pane._element.trigger(Event.HIDDEN)
            if (pane._manager.config('debug')) {
              console.debug('Triggered event:', Event.HIDDEN)
            }

            pane._isTransitioning = false
          },
          400
        )
      }
    }

    // Private

    _events() {
      let pane = this

      this._element
          // Dismiss
          .off(Event.CLICK_DISMISS, Selector.DATA_DISMISS)
          .on(Event.CLICK_DISMISS,
              Selector.DATA_DISMISS,
              function (event) {
                event.preventDefault()

                pane.close()
              })
          // Submit buttons
          .off(Event.CLICK_DATA_API, Selector.SUBMIT)
          .on(Event.CLICK_DATA_API,
              Selector.SUBMIT,
              function () {
                let $form = $(this).parents('form')

                $form.data('submitButton', {'name': $(this).attr('name'), 'value': $(this).val()})
              })
          // Submit form
          .off(Event.SUBMIT_DATA_API, Selector.FORM)
          .on(Event.SUBMIT_DATA_API,
              Selector.FORM,
              function (event) {
                event.preventDefault()

                let $form = $(this)

                if (typeof $form.get(0).checkValidity !== 'function' || $form.get(0).checkValidity()) {
                  // Get data of form
                  let formData = $form.serializeArray()

                  // Add button
                  if ($.isPlainObject($form.data('submitButton'))) {
                    formData.push($form.data('submitButton'))
                  }

                  // Form submission
                  pane._ajax({
                               url: $(this).attr('action') || pane._href,
                               method: $(this).attr('method') || 'get',
                               data: formData,
                               dataType: 'json'
                             })

                  // Remove submit button reference
                  $form.removeData('submitButton')
                }
              })
    }

    _loader(toggle) {
      toggle = typeof toggle === 'boolean' ? toggle : true

      if (toggle) {
        let $loader = $(Selector.LOADER, this._element)

        if ($loader.length === 0) {
          $loader = $('<div class="pane-loader"></div>')
          $loader.append(this._manager.config('loader'))
          $(this._element).prepend($loader)
        }
      } else {
        $(Selector.LOADER, this._element).remove()
      }
    }

    _ajax(options) {
      if (this._jqXHR) {
        return
      }

      let pane = this

      // Event trigger
      pane._element.trigger(Event.LOADING)
      if (pane._manager.config('debug')) {
        console.debug('Triggered event:', Event.LOADING)
      }
      pane._loader(true)

      // Ajax options
      options = {
        method: 'get',
        ...this._manager.config('ajax'),
        ...options,
        success: function (data, textStatus, jqXHR) {
          let eventLoaded = $.Event(Event.LOADED,
                                    {
                                      pane: pane._element,
                                      paneAjax: {
                                        data: data,
                                        textStatus: textStatus,
                                        jqXHR: jqXHR,
                                      }
                                    })

          // Event trigger
          pane._element.trigger(eventLoaded)
          if (pane._manager.config('debug')) {
            console.debug('Triggered event:', Event.LOADED)
          }

          if (!eventLoaded.isPropagationStopped()) {
            pane._element.html(jqXHR.responseText)
            pane._element.trigger(Event.PRINTED, pane._element)
            if (pane._manager.config('debug')) {
              console.debug('Triggered event:', Event.PRINTED)
            }
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          let eventLoadingError = $.Event(Event.LOADING_ERROR,
                                          {
                                            pane: pane._element,
                                            paneAjax: {
                                              textStatus: textStatus,
                                              jqXHR: jqXHR,
                                              errorThrown: errorThrown,
                                            }
                                          })
          // Event trigger
          pane._element.trigger(eventLoadingError)
          if (pane._manager.config('debug')) {
            console.debug('Triggered event:', Event.LOADING_ERROR)
          }

          if (!eventLoadingError.isPropagationStopped()) {
            pane.close()
          }
        },
        complete: function () {
          pane._jqXHR = null
          pane._loader(false)
        }
      }

      // Ajax
      this._jqXHR = $.ajax(options)
    }
  }

  return function (config) {
    return new PaneManager(config)
  }
})($)

export default PaneManager