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
    transitionInTime: 50,
    transitionOutTime: 400
  }

  /**
   * Events
   */

  const Event = {
    LOADING: 'loading.content.pane',
    LOADED: 'loaded.content.pane',
    LOADING_ERROR: 'error.content.pane',
    PRINTED: 'printed.content.pane',
    SHOW: 'show.pane',
    SHOWN: 'shown.pane',
    HIDE: 'hide.pane',
    HIDDEN: 'hidden.pane',
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
        .off('click.pane', Selector.DATA_TOGGLE)
        .on('click.pane',
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
      pane.open($(relatedTarget).attr('paneClass') || '')
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
      // Debug
      if (this._manager.config('debug')) {
        console.debug('Pane opened')
      }

      let $pane = this._element

      // Size?
      if (typeof className === 'string') {
        $pane.addClass(className)
      }

      this._manager.wrapper.prepend(this._element)
      this._manager.refresh()

      // Event trigger
      $pane.trigger(Event.SHOW)

      // Animation
      setTimeout(
        function () {
          $pane.addClass('is-visible')

          // Event trigger
          $pane.trigger(Event.SHOWN)

          this._isTransitioning = false
        },
        50
      )
    }

    load(href) {
      // Debug
      if (this._manager.config('debug')) {
        console.debug('Pane loaded')
      }

      if (typeof href !== 'string') {
        throw new TypeError('Pane::load() method need href in first argument')
      }

      this._ajax({url: href})
    }

    close() {
      let $pane = this._element,
        manager = this._manager

      // Event trigger
      let event = $.Event(Event.HIDE, {pane: $pane})
      $pane.trigger(event)

      if (!event.isPropagationStopped()) {
        // Animation
        $pane.removeClass('is-visible')

        // After animation
        setTimeout(
          function () {
            $pane.remove()
            manager.refresh()

            // Event trigger
            $pane.trigger(Event.HIDDEN)
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
          .off('click.pane', Selector.DATA_DISMISS)
          .on('click.pane',
              Selector.DATA_DISMISS,
              function (event) {
                event.preventDefault()

                pane.close(event)
              })
          // Submit buttons
          .off('click.pane', Selector.SUBMIT)
          .on('click.pane',
              Selector.SUBMIT,
              function (event) {
                event.preventDefault()

                $(this).parents('form').trigger('submit', {'name': $(this).attr('name'), 'value': $(this).val()})
              })
          // Submit form
          .off('submit.pane', Selector.FORM)
          .on('submit.pane',
              Selector.FORM,
              function (event, button) {
                event.preventDefault()

                let $form = $(this)
                let $pane = $form.parents('.pane')

                if (typeof $form.get(0).checkValidity !== 'function' || $form.get(0).checkValidity()) {
                  // Get data of form
                  let formData = $form.serializeArray()

                  // Add button
                  if ($.isPlainObject(button)) {
                    formData.push(button)
                  }

                  pane._ajax({})

                  // Form submission
                  $.ajax($form.attr('action') || $pane.data('href') || '',
                         {
                           'method': $(this).attr('method') || 'get',
                           'data': formData,
                           'dataType': 'json',
                           'success': function (data, textStatus, jqXHR) {
                             // Event trigger
                             $pane.trigger('loaded.content.pane', data, textStatus, jqXHR)
                           },
                           'error': function (jqXHR, textStatus, errorThrown) {
                             // Event trigger
                             $pane.trigger('error.content.pane', jqXHR, textStatus, errorThrown)
                           }
                         })
                }

                return false
              })
    }

    _loader(toggle) {
      toggle = typeof toggle === 'boolean' ? toggle : true

      if (toggle) {
        let $loader = $(Selector.LOADER, this._element)

        if ($loader.length === 0) {
          $loader = $('<div class="pane-loader"></div>')
          $loader.append(this._manager.config('loader_content'))
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
      pane._loader(true)

      // Ajax options
      options = {
        method: 'get',
        ...options,
        success: function (data, textStatus, jqXHR) {
          let event = $.Event(Event.LOADED,
                              {
                                pane: pane._element,
                                paneAjax: {
                                  data: data,
                                  textStatus: textStatus,
                                  jqXHR: jqXHR
                                }
                              })

          // Event trigger
          pane._element.trigger(event)

          if (!event.isPropagationStopped()) {
            pane._element.html(jqXHR.responseText)

            pane._element.trigger(Event.PRINTED, pane._element)
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          // Event trigger
          pane._element.trigger(Event.LOADING_ERROR, pane._element, jqXHR, textStatus, errorThrown)
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