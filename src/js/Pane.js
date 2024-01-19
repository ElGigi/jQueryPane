/*
 * This file is part of jQuery Pane.
 *
 * @license   https://opensource.org/licenses/MIT MIT License
 * @copyright 2018
 * @author Cassie ROUSSEAU <https://github.com/K6-front>
 * @author Ronan GIRON <https://github.com/ElGigi>
 * @author Yohann LORANT <https://github.com/ylorant>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code, to the root.
 */

import $ from 'jquery';

const PaneManager = (($) => {
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
        let sAgent = window.navigator.userAgent;
        let Idx = sAgent.indexOf("MSIE");

        // If IE, return version number.
        if (Idx > 0) {
            return parseInt(sAgent.substring(Idx + 5, sAgent.indexOf(".", Idx)))
        }
        // If IE 11 then look for Updated user agent string.
        else if (!!navigator.userAgent.match(/Trident\/7\./)) {
            return 11
        } else {
            return 0 //It is not IE
        }
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
    };

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
        RELOAD: 'reload.content.pane',
        LOADING: 'loading.content.pane',
        LOADED: 'loaded.content.pane',
        LOADING_ERROR: 'error.content.pane',
        PRINTED: 'printed.content.pane',
        SUBMIT: 'submit.content.pane',
        // Selectors
        CLICK_DISMISS: 'click.dismiss.pane',
        CLICK_DATA_API: 'click.pane',
        SUBMIT_DATA_API: 'submit.pane',
    };

    /**
     * SELECTORS
     */

    const Selector = {
        WRAPPER: '.pane-wrapper:first',
        LOADER: '.pane-loader',
        PANE: '.pane',
        PANE_NOT_STATIC: '.pane:not(.pane-static)',
        FORM: 'form:not([target])',
        SUBMIT: 'form:not([target]) :submit[name]',
        DATA_TOGGLE: '[data-toggle="pane"]',
        DATA_DISMISS: '[data-dismiss="pane"]',
    };

    /**
     * PaneManager
     */
    class PaneManager {
        constructor(config) {
            this._config = this._getConfig(config);
            this._wrapper = null;
            this._events();

            // Debug
            if (this.config('debug')) {
                console.debug('PaneManager initialized')
            }
        }

        // Getters

        get wrapper() {
            if (!this._wrapper) {
                this._wrapper = $(Selector.WRAPPER);

                if (this._wrapper.length === 0) {
                    this._wrapper = $('<div class="pane-wrapper"></div>');
                    $(this._config.container).append(this._wrapper)
                }

                // Internet explorer
                this._wrapper.toggleClass('pane-ie', GetIEVersion() > 0)
            }

            return this._wrapper
        }

        // Public

        refresh() {
            this._wrapper.toggleClass('is-open', $(Selector.PANE_NOT_STATIC, this._wrapper).length > 0)
        }

        config(key) {
            if (!typeof this._config[key]) {
                throw new TypeError('Undefined option name "' + key + '"')
            }

            return this._config[key]
        }

        new() {
            return new Pane(this)
        }

        // Private

        _events() {
            let manager = this;

            $(document)
                .off(Event.CLICK_DATA_API, Selector.DATA_TOGGLE)
                .on(Event.CLICK_DATA_API,
                    Selector.DATA_TOGGLE,
                    function (event) {
                        event.preventDefault();
                        event.stopPropagation();

                        // Debug
                        if (manager.config('debug')) {
                            console.debug('Selector', Selector.DATA_TOGGLE, 'has been clicked')
                        }

                        manager._pane(this)
                    })
        }

        _pane(relatedTarget) {
            let pane = null,
                href = $(relatedTarget).data('href') || $(relatedTarget).attr('href'),
                target = $(relatedTarget).data('paneTarget') || '';

            if (!href) {
                console.error('Pane has no href to load content');
                return
            }

            // Target self?
            if (target === 'self') {
                pane = $(relatedTarget).parents(Selector.PANE).data('pane')
            }

            // Need to create pane?
            if (!pane) {
                pane = this.new()
            }
            pane.relatedTarget = relatedTarget;
            pane.open();
            pane.load(href, $(relatedTarget).data('paneLoadOptions'));

            return pane
        }

        _getConfig(config) {
            config = {
                ...Default,
                ...config
            };

            return config
        }
    }

    /**
     * Pane
     */
    class Pane {
        constructor(paneManager) {
            this._manager = paneManager;
            this._jqXHR = null;
            this._isTransitioning = false;
            this._isStatic = false;
            this._relatedTarget = null;
            this._href = null;
            this._loadOptions = {};
        }

        // Getters

        get relatedTarget() {
            return this._relatedTarget
        }

        get element() {
            if (!this._element) {
                // Default element
                this._element = $('<div role="complementary" class="pane"></div>');
                this._element.data('pane', this);
                this._events()
            }

            return this._element
        }

        get static() {
            return this._isStatic
        }

        get location() {
            return new URL(this._href, document.location.toString())
        }

        // Setters

        set relatedTarget(relatedTarget) {
            this._relatedTarget = relatedTarget
        }

        set element(element) {
            this._element = element;
            this._isStatic = true;
            this._element.data('pane', this);
            this._events()
        }

        set static(isStatic) {
            this._isStatic = isStatic === true
        }

        set location(location) {
            this._href = location.toString()
        }

        // Public

        open() {
            if (this._isStatic) {
                return
            }

            if (this._isTransitioning) {
                return
            }

            // Already opened?
            if (this._manager.wrapper.find(this.element).length > 0) {
                return
            }

            let pane = this;
            this._isTransitioning = true;
            this._manager.wrapper.prepend(this.element);

            // Event trigger
            let eventShow = $.Event(Event.SHOW, {pane: pane});
            pane.element.trigger(eventShow);
            if (pane._manager.config('debug')) {
                console.debug('Triggered event:', Event.SHOW);
            }

            if (!eventShow.isDefaultPrevented()) {
                this._manager.refresh();

                // Animation
                setTimeout(
                    function () {
                        pane.element.addClass('is-visible');

                        pane._isTransitioning = false;

                        // Event trigger
                        pane.element.trigger(Event.SHOWN);
                        if (pane._manager.config('debug')) {
                            console.debug('Triggered event:', Event.SHOWN)
                        }
                    },
                    50
                )
            }
        }

        reload(fragments) {
            let pane = this;

            // Event trigger
            let eventReload = $.Event(Event.RELOAD, {pane: pane, url: this._href});
            pane.element.trigger(eventReload);
            if (pane._manager.config('debug')) {
                console.debug('Triggered event:', Event.RELOAD);
            }

            if (!eventReload.isDefaultPrevented()) {
                this.load(this._href, null, fragments)
            }
        }

        load(href, loadOptions, fragments) {
            if (typeof href !== 'string') {
                throw new TypeError('Pane::load() method need href in first argument')
            }

            // Set to private properties
            this._href = href.toString();
            if (typeof loadOptions === 'object') {
                this._loadOptions = loadOptions
            }

            // Load content with AJAX
            this._ajax(
                {
                    url: this._href,
                    ...this._loadOptions,
                },
                fragments
            )
        }

        close() {
            if (this._isStatic) {
                return
            }

            if (this._isTransitioning) {
                return
            }

            let pane = this,
                manager = this._manager;

            // Event trigger
            let eventClose = $.Event(Event.HIDE, {pane: pane.element});
            pane.element.trigger(eventClose);
            if (pane._manager.config('debug')) {
                console.debug('Triggered event:', Event.HIDE)
            }

            if (!eventClose.isDefaultPrevented()) {
                // Animation
                this._isTransitioning = true;
                pane.element.removeClass('is-visible');

                // After animation
                setTimeout(
                    function () {
                        // Event trigger
                        pane.element.trigger(Event.HIDDEN);
                        if (pane._manager.config('debug')) {
                            console.debug('Triggered event:', Event.HIDDEN)
                        }

                        pane._isTransitioning = false;
                        pane.element.remove();
                        manager.refresh()
                    },
                    400
                )
            }
        }

        loader(toggle) {
            toggle = typeof toggle === 'boolean' ? toggle : true;

            if (toggle) {
                let $loader = $(Selector.LOADER, this.element);

                if ($loader.length === 0) {
                    $loader = $('<div class="pane-loader"></div>');
                    $loader.append(this._manager.config('loader'));
                    $(this.element).prepend($loader)
                }
            } else {
                $(Selector.LOADER, this.element).remove()
            }
        }

        // Private

        _events() {
            let pane = this;

            this.element
                // Dismiss
                .off(Event.CLICK_DISMISS, Selector.DATA_DISMISS)
                .on(Event.CLICK_DISMISS,
                    Selector.DATA_DISMISS,
                    function (event) {
                        event.preventDefault();

                        pane.close()
                    })
                // Submit buttons
                .off(Event.CLICK_DATA_API, Selector.SUBMIT)
                .on(Event.CLICK_DATA_API,
                    Selector.SUBMIT,
                    function () {
                        let $form = $(this).parents('form');

                        $form.data('submitButton',
                            {
                                'name': $(this).attr('name'),
                                'value': $(this).val(),
                                'novalidate': ($(this).attr('formnovalidate') !== undefined)
                            })
                    })
                // Submit form
                .off(Event.SUBMIT_DATA_API, Selector.FORM)
                .on(Event.SUBMIT_DATA_API,
                    Selector.FORM,
                    function (event) {
                        event.preventDefault();

                        let $form = $(this);

                        // Submit button
                        let submitButton = null;
                        if ($.isPlainObject($form.data('submitButton'))) {
                            submitButton = $form.data('submitButton')
                        }

                        if ((submitButton && submitButton.novalidate) ||
                            typeof $form.get(0).checkValidity !== 'function' ||
                            $form.get(0).checkValidity()) {
                            // Get data of form
                            let bodyHttpRequest = $.inArray(($(this).attr('method') || 'get').toLowerCase(), ['post', 'put', 'connect', 'patch']) !== -1;
                            let formData = new FormData($form[0]);

                            // Add button to form data
                            if (submitButton) {
                                formData.append(submitButton.name, submitButton.value)
                            }

                            // Convert to JSON if no body request
                            if (!bodyHttpRequest) {
                                let formDataTmp = [];
                                formData.forEach((value, name) => {
                                    formDataTmp.push({name: name, value: value})
                                });
                                formData = formDataTmp
                            }

                            // Form submission
                            pane._ajax({
                                url: $(this).attr('action') || pane._href,
                                method: $(this).attr('method') || 'get',
                                processData: !bodyHttpRequest,
                                contentType: bodyHttpRequest ? false : 'text/plain',
                                data: formData,
                                dataType: 'json'
                            });

                            // Remove submit button reference
                            $form.removeData('submitButton')
                        }
                    })
        }

        _ajax(options, fragments) {
            if (this._jqXHR) {
                return
            }

            let pane = this;

            // Ajax options
            options = {
                method: 'get',
                ...this._manager.config('ajax'),
                ...options,
                success: function (data, textStatus, jqXHR) {
                    pane._jqXHR = null;
                    pane.loader(false);

                    let eventLoaded = $.Event(Event.LOADED,
                        {
                            pane: pane,
                            url: options.url,
                            paneAjax: {
                                data: data,
                                textStatus: textStatus,
                                jqXHR: jqXHR,
                                fragments: fragments || null,
                            }
                        });

                    // Event trigger
                    pane.element.trigger(eventLoaded);
                    if (pane._manager.config('debug')) {
                        console.debug('Triggered event:', Event.LOADED)
                    }

                    if (!eventLoaded.isDefaultPrevented()) {
                        if (fragments) {
                            $(fragments, pane.element).first().html($(jqXHR.responseText).find(fragments).html())
                        } else {
                            pane.element.html(jqXHR.responseText)
                        }

                        pane.element.trigger(Event.PRINTED, pane.element);
                        if (pane._manager.config('debug')) {
                            console.debug('Triggered event:', Event.PRINTED)
                        }
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    pane._jqXHR = null;
                    pane.loader(false);

                    let eventLoadingError = $.Event(Event.LOADING_ERROR,
                        {
                            pane: pane,
                            paneAjax: {
                                textStatus: textStatus,
                                jqXHR: jqXHR,
                                errorThrown: errorThrown,
                            }
                        });

                    // Event trigger
                    pane.element.trigger(eventLoadingError);
                    if (pane._manager.config('debug')) {
                        console.debug('Triggered event:', Event.LOADING_ERROR)
                    }

                    if (!eventLoadingError.isDefaultPrevented()) {
                        pane.close()
                    }
                }
            };

            // Event trigger
            pane.element.trigger($.Event(Event.LOADING, {pane: pane, url: options.url}));
            if (pane._manager.config('debug')) {
                console.debug('Triggered event:', Event.LOADING)
            }

            // Loader
            pane.loader(true);

            // Ajax
            this._jqXHR = $.ajax(options)
        }

        static _jQueryInterface(action, arg1, arg2) {
            return this.each(function () {
                if (!(typeof $(this).data('pane') === 'object' && $(this).data('pane') instanceof Pane)) {
                    throw new Error('Not a pane')
                }

                if (typeof action === 'string') {
                    let pane = $(this).data('pane');

                    switch (action) {
                        case 'close':
                        case 'load':
                        case 'reload':
                        case 'loader':
                            pane[action](arg1, arg2);
                            break;
                        default:
                            throw new TypeError(`No method named "${action}"`)
                    }
                }
            })
        }
    }

    // jQuery
    $.fn['pane'] = Pane._jQueryInterface;
    $.fn['pane'].noConflict = function () {
        return Pane._jQueryInterface
    };

    return function (config) {
        return new PaneManager(config)
    }
})($);

export default PaneManager
