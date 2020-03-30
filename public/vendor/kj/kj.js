(function () {
    'use strict';

    /**
     * @namespace
     * @const {Object} module_options Opciones de configuración del módulo
     * 
     * @property {boolean} show_debug=false Imprime mensajes de debug
     * @property {boolean} show_warnings=false Imprime mensajes de advertencia
     * @property {boolean} show_errors=false Imprime mensajes de error
     * @property {boolean} use_dom_observer=false Instancia DomObserver para descubrir cambios en el DOM de la página.
     * Es importante tener en cuenta que esta opción es crítica en cuanto a rendimiento y la inserción de
     * elementos en la página es mucho más lenta cuando está activa.
     * @property {string} templates_url=/js/templates/ URL al directorio de plantillas
     * @property {string} templates_query Query string para la peticion Ej: "?name="
     * Se insertara automaticamente el id de plantilla al final de la cadena
     * @property {string} templates_ext=.tpl Extensión para los archivos de plantilla
     * @property {string} templates_id_prefix=template- Prefijo para IDs de plantilla que se encuentran en la página
     * @property {string} storage_template_prefix=templates. Prefijo para los nombres de plantilla en el localStorage
     * @property {boolean} element_auto_initialize=true Inicializa el Element al construir la instancia
     * @property {boolean} element_enable_observer=false Bindea los eventos generados por el DomObserver para
     * descubrir cuando se ha conectado o desconectado el Element
     * @property {boolean} element_add_kjid=false Añade el atributo data-kjid con id único a cada nodo
     */
    const module_options = {
        // console
        show_debug: false,
        show_warnings: false,
        show_errors: false,

        // dom mutation
        use_dom_observer: false,

        // templates
        templates_url: '/js/templates/',
        templates_query: '',
        templates_ext: '.tpl',
        templates_id_prefix: 'template-',

        // storage
        storage_template_prefix: 'templates.',

        // element
        element_auto_initialize: true,
        element_enable_observer: false,
        element_add_kjid: false,
 
        // custom tools
        bind_dom_event: null,//(target, event_name, callback) => $( target ).on( event_name, callback )
    }

    const plug = {};
    const runningElements = [];

    /**
     * @classdesc
     * Gestión de eventos 
     */
    class Events {
        constructor() {
            this.clear();
        }

        /**
         * Limpia la lista de eventos
         * @return {this}
         */
        clear() {
            this.events = {};

            return this;
        }

        /**
         * Suscribe un evento
         * @param {string} event_reference Nombre del evento
         * @param {Function} fn Funcion que se ejecutura
         * @param {boolean} [once=false] Solo se tiene que ejecutar una vez
         * @return {this}
         */
        on(event_reference, fn, once = false) {
            let name = this.getEventName(event_reference);
            this.events[name] = this.events[name] || [];
            this.events[name].push({ reference: event_reference, fn: fn, once: once });

            return this;
        }

        /**
         * Suscribe un evento para una única ejecución
         * @param {string} event_reference Nombre del evento
         * @param {Function} fn Funcion que se ejecutura
         * @return {this}
         */
        once(event_reference, fn) {
            return this.on(event_reference, fn, true);
        }

        /**
         * Desuscribe un evento
         * @param {string} event_reference	Nombre del evento
         * @return {this}
         */
        off(event_reference) {
            if (!event_reference) {
                return;
            }

            if (event_reference in this.events) {
                this.events[event_reference] = [];
            }

            let event_name = this.getEventName(event_reference);
            this.events[event_name] = (this.events[event_name] || []).filter(
                item => !item.reference.endsWith(event_reference)
            );

            return this;
        }

        /**
         * Dispara un evento y ejecuta todas las acciones suscritas al
         * evento disparado
         * @param {string} event_name Nombre del evento
         * @param {*} data Cualquier dato extra que necesite el evento
         * @return {this}
         */
        trigger(event_name, ...data) {
            if (!event_name) {
                return;
            }

            event_name = this.getEventName(event_name);
            this.events[event_name] = (this.events[event_name] || []).filter(item => {
                if (fn.isFunction(item.fn)) {
                    item.fn(...data);
                }

                return !item.once;
            });

            return this;
        }

        /**
         * Nombre del evento dado un string con nombre y namespace         
         * @param {string} full_name
         * @return {string}
         * 
         * @private
         */
        getEventName(full_name) {
            return full_name.replace(/\..*$/, '');
        }
    }

    /**
     * @classdesc
     * Controla los cambios en el DOM para notificarlo a los objetos
     * que se hayan suscrito al servicio
     * 
     * @private
     */
    class DomObserver {
        constructor() {
            document.addEventListener('DOMContentLoaded', this.run.bind(this));
        }

        /**
         * Incia el registro de cambios
         * @return {void}
         */
        run() {
            const target = document;
            const domObserver = new MutationObserver(mutations => {
                if (!module_options.use_dom_observer) {
                    domObserver.disconnect();
                    return;
                };

                mutations.forEach(record => {
                    if (record.addedNodes && record.addedNodes.length) {
                        target.dispatchEvent(new CustomEvent('domobserver:addednodes', { detail: record.addedNodes }));
                    }
                    if (record.removedNodes && record.removedNodes.length) {
                        target.dispatchEvent(new CustomEvent('domobserver:removednodes', { detail: record.removedNodes }));
                    }
                });
            });

            domObserver.observe(target, { childList: true, subtree: true });
        }
    }

    /**
     * @classdesc
     * Herramienta para cargar las plantillas desde el DOM o el servidor al localStorage
     * 
     * @example
     * // Carga de una plantilla
     * await kj.templateLoader.loadBuffer('plantilla_1');
     * // Carga de una libreria de plantillas
     * await kj.templateLoader.loadLibrary('libreria_1.lib');
     */
    class TemplateLoader {
        constructor() {
        }

        /**
         * Obtiene el buffer de una o más plantillas.
         * Comprueba que no estén ya cargadas, las busca en el DOM actual o las carga desde el servidor
         * y las deja en el localStorage
         * @param {string} args Ids de plantilla
         * @return {Promise|Array.<boolean>}
         * 
         * @async
         */
        async loadBuffer(...args) {
            return await Promise.all(
                args.map(template_id => this.requestBuffer(template_id))
            );
        }

        /**
         * Recupera el buffer de la plnatilla indicada
         * @param {string} template_id 
         * @return {Promise|boolean}
         * 
         * @async
         * @private
         */
        async requestBuffer(template_id) {
            this.checkDocument();

            // load from storage
            let buffer = localStorage.getItem(`${module_options.storage_template_prefix}${template_id}`);
            if (!fn.isNull(buffer)) {
                return true;
            }

            // load from DOM
            buffer = dm(`#${module_options.templates_id_prefix}${template_id}`).item(0);
            if (buffer && buffer.innerText.length) {
                localStorage.setItem(`${module_options.storage_template_prefix}${template_id}`, buffer.innerText);
                return true;
            }

            // load from server
            const url = `${module_options.templates_url}${module_options.templates_query}${template_id}${module_options.templates_ext}`;
            try {
                const response = await fetch(url, { credentials: 'same-origin' });
                if ( !response.ok ) {
                    throw response.statusText;
                }
                const buffer = await response.text();
                localStorage.setItem(`${module_options.storage_template_prefix}${template_id}`, buffer);
                
                return true;
            } catch (exception) {
                fn.logError(exception);
                return false;
            }
        }

        /**
         * Carga una libreria de plantillas
         * @param {string} library_id Identificador de la librería
         * @return {Promise|boolean}
         * 
         * @async
         */
        async loadLibrary(library_id) {
            if (this.existsLoadedLibraryName(library_id)) {
                return true;
            }

            const url = `${module_options.templates_url}${module_options.templates_query}${library_id}${module_options.templates_ext}`;
            try {
                const response = await fetch(url, { credentials: 'same-origin' });
                if ( !response.ok ) {
                    throw response.statusText;
                }
                
                const section = document.createElement("section");
                section.innerHTML = await response.text();
                dm(section.getElementsByTagName('script')).forEach(scriptObject => {
                    const template_id = scriptObject.id.replace(new RegExp(`^${fn.escapeRegExp(module_options.templates_id_prefix)}`), '');
                    const buffer = scriptObject.innerHTML;
                    localStorage.setItem(`${module_options.storage_template_prefix}${template_id}`, buffer);
                });
                this.addLoadedLibraryName(library_id);

                return true;
            } catch (exception) {
                fn.logError(exception);
                return false;
            }
        }

        /**
         * Comprueba que el documento se ha cargado,
         * Lanza un warning si no es así
         * @return {void}
         * 
         * @private
         */
        checkDocument() {
            if (document.readyState !== 'complete' && document.readyState !== 'interactive') {
                fn.logWarning(`Estás intentando obtener plantillas antes de que la página esté cargada, puede que falten recursos necesarios`);
            }
        }

        /**
         * Añade una libreria a la lista de disponibles
         * @param {string} name Nombre de librería
         * @return {void}
         * 
         * @private
         */
        addLoadedLibraryName(name) {
            const loadedLibraries = JSON.parse(localStorage.getItem('session.loadedTemplateLibraries') || '[]');
            loadedLibraries.push(name);
            localStorage.setItem('session.loadedTemplateLibraries', JSON.stringify(loadedLibraries));
        }

        /**
         * Elimina una librería de la lista de disponibles
         * @param {string} name Nombre de lbrería
         * @return {void}
         * 
         * @private
         */
        removeLoadedLibraryName(name) {
            const loadedLibraries = JSON.parse(localStorage.getItem('session.loadedTemplateLibraries') || '[]');
            loadedLibraries.splice(loadedLibraries.indexOf(name), 1);
            localStorage.setItem('session.loadedTemplateLibraries', JSON.stringify(loadedLibraries));
        }

        /**
         * Retorna true si la libreria esta disponible
         * @param {string} name Nombre de librería
         * @return {boolean}
         * 
         * @private
         */
        existsLoadedLibraryName(name) {
            const loadedLibraries = JSON.parse(localStorage.getItem('session.loadedTemplateLibraries') || '[]');
            return loadedLibraries.indexOf(name) !== -1;
        }
    }

    /**
     * @classdesc
     * Herramienta para el manejo de plantillas. Recupera el buffer de una plantilla previamente cargada
     * en el localStorage. Provee además de herramientas para compilarla, asignar contextos y registrar parciales.
     * 
     * @example
     * // Carga el buffer de una plantilla desde el localStorage
     * const buffer = kj.templateManager.getBuffer('template_id');
     * // Compila una plantilla y la deja lista para usar
     * const handler = kj.templateManager.compile(buffer);
     * // Asigna contexto al handler creado previamente y genera el buffer final
     * const html_string = kj.templateManager.assignContext(handler, {example: 'example'});
     */
    class TemplateManager {
        /**
         * > Todos los procedimientos de la clase son estáticos. No necesitas instanciar la clase para nada
         */
        constructor() {
        }

        /**
         * Compila una plantilla
         *
         * @param {string} buffer Buffer con la plantilla
         * @return {function} Plantilla compilada
         * 
         * @static
         */
        static compile(buffer) {
            return Handlebars.compile(buffer);
        }

        /**
         * Retorna el buffer de la plantilla, el buffer debe estar en el localStorage
         * @param {string} template_id 
         * @return {string|null}
         * 
         * @static
         */
        static getBuffer(template_id) {
            return localStorage.getItem(`${module_options.storage_template_prefix}${template_id}`);
        }

        /**
         * Registra la plantilla como parcial
         * @param {string} template_id 
         * @return {string}
         * 
         * @static
         */
        static registerPartial(template_id) {
            let buffer = TemplateManager.getBuffer(template_id);
            if (fn.isNull(buffer)) {
                fn.logError('El buffer de la plantilla parcial no está listo o no se ha podido encontrar');
                buffer = '';
            }

            return TemplateManager.registerBuffer(template_id, buffer);
        }

        /**
         * Registra el buffer como parcial
         * @param {string} name 
         * @param {string} buffer 
         * @return {string}
         * 
         * @static
         */
        static registerBuffer(name, buffer) {
            Handlebars.registerPartial(name, TemplateManager.compile(buffer));
            return buffer;
        }

        /**
         * Asigna contexto a una plantilla y retorna el resultado
         * @param {function} template Plantilla compilada
         * @param {Object} data Contexto
         * @return {string|null}
         * 
         * @static
         */
        static assignContext(template, data) {
            if (!fn.isFunction(template)) {
                return null;
            }

            return template(data);
        }
    }

    /**
     * @classdesc
     * Generación de contenido HTML a partir de una plantilla y un contexto.  
     * 
     * @description
     * Para personalizar el comportamiento del Element se pueden sobreescribir
     * los siguientes métodos, que por defecto no hacen nada:
     * - beforeInitialize
     * - beforeBuild  
     * - afterBuild
     * - afterInitialize
     * - onTerminate
     * - onConnect
     * - onDisconnect
     * 
     * @example
     * todo = new kj.Element('ul', `
     *   {{#todoList}}
     *       <li>{{.}}</li>
     *   {{/todoList}}`, {
     *       todoList: [
     *           'Primera cosa de la lista',
     *           'Segunda cosa de la lista'
     *       ]
     *   });
     * 
     * //  Genera:
     * //  <ul>
     * //    <li>Primera cosa de la lista</li>
     * //    <li>Segunda cosa de la lista</li>
     * //  </ul>
     */
    class Element {
        /**
         * @param {string|Node} tag_name Tag del Nodo principal, o el propio nodo si ya existe
         * @param {string|Function} template=null Buffer de plantilla o plantilla compilada
         * @param {Object|Function} data=null Datos usados como contexto o callback que retorne los datos
         * @param {Object} options={} Opciones de configuración
         * 
         * @param {boolean}     options.auto_initialize=true Ejecuta el procedimiento de incialización al instanciar
         * @param {boolean}     options.enable_observer=false Habilita la funcionalidad del DomObserver
         * @param {boolean}     options.add_kjid=false Añade el atributo data-kjid con id único
         * @param {Object}      options.attr={} Atributos para le nodo principal
         * @param {Object}      options.prop={} Propiedades para le nodo principal
         * @param {Object}      options.bind={} Se extiende la instancia recien creada con lo que haya en este campo
         * @param {Function}    options.on_initialized Se ejecuta una vez inicializado el Element
         * @param {Function}    options.on_built Se ejecuta cada vez que se genera e inserta nuevo contenido
         * @param {Function}    options.on_disconnected Se ejecuta cuando se desconecta el Nodo de la página
         * @param {Function}    options.on_connected Se ejecuta cuando se conecta el Nodo a la página
         * @param {Function}    options.on_terminated Se ejecuta cuando el element se ha finalizado
         */
        constructor(tag_name, template = null, data = null, options = {}) {
            this.options = Object.assign({
                on_initialized: null,
                on_built: null,
                on_disconnected: null,
                on_connected: null,
                on_terminated: null,
                attr: {},
                prop: {},
                bind: {},
                add_kjid: module_options.element_add_kjid,
                auto_initialize: module_options.element_auto_initialize,
                enable_observer: module_options.element_enable_observer
            }, options);

            runningElements.push(this);

            this.events = new Events();

            this.data = data;
            this.tagName = tag_name;

            this.onInitialized = this.options.on_initialized;
            this.onTerminated = this.options.on_terminated;
            this.onBuilt = this.options.on_built;
            this.onDisconnected = this.options.on_disconnected;
            this.onConnected = this.options.on_connected;
            this.enableObserver = this.options.enable_observer && module_options.use_dom_observer;
            this.node = null;
            this.parentNode = null;
            this.subscriptions = [];
            this.uniqueId = fn.getUniqueId();

            this.setTemplateBuffer(template);

            if (fn.isObject(this.options.bind)) {
                Object.assign(this, this.options.bind);
            }

            if (this.options.auto_initialize) {
                this.initialize();
            }
        }

        /**
         * Inicializa el element
         * @return {void}
         * 
         * @fires beforeInitialize Antes de inicializar el Element
         * @fires beforeBuild Una vez creado el Nodo principal y antes de insertarle en contenido
         * @fires afterBuild Inmediatamente después de insertar el contenido y registrar los binding definidos en la plantilla
         * @fires onBuilt Callback definido en las opciones del constructor
         * @fires afterInitialize Una vez inicializado el Element
         * @fires onInitialized Callback definido en las opciones del constructor
         */
        initialize() {
            if (fn.isNull(this.templateBuffer) && fn.isNull(this.templateHandler)) {
                return;
            }

            this.beforeInitialize();
            this.checkDocument();
            this.registerObserver();
            this.initializeNode();
            this.build();
            this.afterInitialize();
            if (fn.isFunction(this.onInitialized)) {
                this.onInitialized(this);
            }
        }

        /**
         * Realiza tareas de finalización y limpieza, elimina el HTML de la página
         * @return {void}
         * 
         * @fires onTerminate Una vez finalizado el Element
         * @fires onTerminated Callback definido en las opciones
         * @fires onDisconnect Inmediatamente después de haberse desconectado (condicional)
         * @fires onDisconnected Callback definido en las opciones (condicional)
         */
        terminate() {
            this.onTerminate();
            if (fn.isFunction(this.onTerminated)) {
                this.onTerminated(this);
            }

            this.removeSubscriptions();
            this.unregisterObserver();

            if (!fn.isNull(this.node)) {
                const connected = this.node.isConnected;

                this.node.remove();
                this.setInnerHTML('');
                this.node = null;

                if (connected && this.enableObserver) {
                    this.setConnected(false);
                }
            }

            this.events.clear();

            const index = runningElements.indexOf(this);
            if (index != -1) {
                runningElements.splice(index, 1);
            }
        }

        /**
         * Callback que se ejecuta antes de insertar nuevo contenido en el Nodo principal.  
         * Se ejecuta en el procedimiento `build`
         * @return {void}
         * 
         * @abstract
         * @ignore
         */
        beforeBuild() { }

        /**
         * Callback que se ejecuta después de insertar nuevo contenido en el Nodo principal.  
         * Se ejecuta en el procedimiento `build`
         * @return {void}
         * 
         * @abstract
         * @ignore
         */
        afterBuild() { }

        /**
         * Callback que se ejecuta cuando se conecta el Nodo.  
         * Solo se dispara si se está haciendo uso del DomObserver
         * @return {void}
         * 
         * @abstract
         * @ignore
         */
        onConnect() { }

        /**
         * Callback que se ejecuta cuando se desconecta el Nodo.  
         * Solo se dispara si se está haciendo uso del DomObserver
         * @return {void}
         * 
         * @abstract
         * @ignore
         */
        onDisconnect() { }

        /**
         * Callback que se ejecuta al finalizar el element.  
         * Se ejecuta en el procedimiento `terminate`
         * @return {void}
         * 
         * @abstract
         * @ignore
         */
        onTerminate() { }

        /**
         * Callback que se ejecuta antes inicializar el element.  
         * Se ejecuta en el procedimiento `intialize`
         * @return {void}
         * 
         * @abstract
         * @ignore
         */
        beforeInitialize() { }

        /**
         * Callback que se ejecuta después de inicializar el element.  
         * Se ejecuta en el procedimiento `intialize`
         * @return {void}
         * 
         * @abstract
         * @ignore
         */
        afterInitialize() { }

        /**
         * Retorna el Node generado
         * @return {Node}
         */
        getNode() {
            return this.node;
        }

        /**
         * Asigna buffer de plantilla
         * @param {string|Function} templateBuffer Buffer de la plantilla
         * @return {void}
         */
        setTemplateBuffer(templateBuffer) {
            if (fn.isFunction(templateBuffer)) {
                this.templateHandler = templateBuffer;
                this.templateBuffer = null;
            } else {
                this.templateHandler = null;
                this.templateBuffer = templateBuffer;
            }
        }

        /**
         * Retorna el buffer de la plantilla
         * @return {string}
         */
        getTemplateBuffer() {
            return this.templateBuffer;
        }

        /**
         * Asigna contexto a la plantilla
         * @param {Object|Function} data Mapeado de valores para el contexto
         * @return {void}
         */
        setData(data) {
            this.data = data;
            this.build();
        }

        /**
         * Retorna el contexto de la plantilla
         * @return {Object|Function}
         */
        getData() {
            return this.data;
        }

        /**
         * Crea el contenido del Nodo.  
         * @return {void}
         * 
         * @fires beforeBuild Una vez creado el Nodo principal y antes de insertarle el contenido
         * @fires afterBuild Inmediatamente después de insertar el contenido y registrar los binding definidos en la plantilla
         * @fires onBuilt Callback definido en las opciones del constructor
         */
        build() {
            if (fn.isNull(this.node)) {
                fn.logError(this, `El element no está inicializado o ya se ha finalizado`);
                return;
            }

            this.initializeTemplate();

            this.beforeBuild();
            this.setInnerHTML(TemplateManager.assignContext(this.templateHandler, this.buildTemplateContext()));
            this.registerBindings();
            this.afterBuild();
            if (fn.isFunction(this.onBuilt)) {
                this.onBuilt(this);
            }
        }

        /**
         * Añade una suscripción.  
         * Cuando se dispare el evento se ejecutará el procedimiento `build` que reconstruirá el html
         * @param {Object} event_object Cualquier objeto al que se pueda bindear un evento usando `on` o `addEventListener`
         * @param {string} event_name Nombre del evento
         * @returns {void}
         */
        addSubscription(event_object, event_name) {
            this.subscriptions.push([event_object, event_name]);
            this.unregisterSubscription(event_object, event_name);
            this.registerSubscription(event_object, event_name);
        }

        /**
         * Construye el contexto.  
         * Retorna la estructura de datos asignada a `data` o lo ejecuta si es un callback y retorna el resultado.
         * @return {Object}
         * 
         * @private
         */
        buildTemplateContext() {
            if (fn.isFunction(this.data)) {
                return this.data();
            }

            return this.data;
        }

        /**
         * Comprueba que el documento se ha cargado,
         * lanza un warning si no es así
         * @return {void}
         * 
         * @private
         */
        checkDocument() {
            if (document.readyState !== 'complete' && document.readyState !== 'interactive') {
                fn.logWarning(this, `Estás inicializando el Element antes de que la página esté cargada, puede que falten recursos necesarios`);
            }
        }

        /**
         * Incializa el Nodo principal
         * @return {void}
         * 
         * @private
         */
        initializeNode() {
            if (fn.isNull(this.node)) {
                this.node = fn.createElement(this.tagName, '', this.options.attr, this.options.prop);
            }

            if (fn.isFunction(this.node.setAttribute) && this.options.add_kjid) {
                this.node.setAttribute('data-kjid', this.uniqueId);
            }
        }

        /**
         * Inicializa la plantilla.  
         * Compila la plantilla si aún o lo está.
         * @return {void}
         * 
         * @private
         */
        initializeTemplate() {
            if (fn.isNull(this.templateHandler)) {
                this.templateHandler = TemplateManager.compile(this.templateBuffer);
            }
        }

        /**
         * Registra inline bindings  
         * @returns {void}
         * 
         * @private
         */
        registerBindings() {
            if (this.node.nodeType == Node.TEXT_NODE) {
                return;
            }

            dm('[data-bind]', this.node, item => fn.registerBinding(item, this));
            fn.registerBinding(this.node, this);
        }

        /**
         * Bindea los eventos del DomObserver para controlar cuando se conecta y desconecta el element
         * @returns {void}
         * 
         * @private
         */
        registerObserver() {
            if (!this.enableObserver) {
                return;
            }

            this.observer_callback = this.observer_callback || {
                disconnection: ['domobserver:removednodes', this.checkDisconnection.bind(this)],
                connection: ['domobserver:addednodes', this.checkConnection.bind(this)]
            };

            this.unregisterObserver();
            document.addEventListener(...this.observer_callback.disconnection);
            document.addEventListener(...this.observer_callback.connection);
        }

        /**
         * Desbindea eventos del DomObserver
         * @returns {void}
         * 
         * @private
         */
        unregisterObserver() {
            if (!this.enableObserver) {
                return;
            }
            if (!this.observer_callback) {
                return;
            }

            document.removeEventListener(...this.observer_callback.disconnection);
            document.removeEventListener(...this.observer_callback.connection);
        }

        /**
         * Comprueba si el element se ha conectado
         * @param {Event} e Evento lanzado por el DomObserver
         * @returns {void}
         * 
         * @fires onConnect Inmediatamente después de haberse conectado (condicional)
         * @fires onConnected Callback definido en las opciones (condicional)
         * 
         * @private
         */
        checkConnection(e) {
            this.updateConnectionStatus(true);
        }

        /**
         * Comprueba si el element se ha desconectado
         * @param {Event} e Evento lanzado por el DomObserver
         * @returns {void}
         * 
         * @fires onDisconnect Inmediatamente después de haberse desconectado (condicional)
         * @fires onDisconnected Callback definido en las opciones (condicional)
         * 
         * @private
         */
        checkDisconnection(e) {
            this.updateConnectionStatus(false);
        }

        /**
         * Modifica el estado de conexión del elemento
         * @param {Event} e Evento lanzado por el DomObserver
         * @param {bool} status Nuevo estado si se cumple la condición
         * @returns {void}
         * 
         * @fires onDisconnect Inmediatamente después de haberse desconectado (condicional)
         * @fires onDisconnected Callback definido en las opciones (condicional)
         * 
         * @private
         */
        updateConnectionStatus(e, status) {
            dm(e.detail, node => {
                if (node == this.node) {
                    this.setConnected(status);
                }
            });
        }

        /**
         * Asigna el estado de conexión del Nodo
         * @param {boolean} connected 
         * @returns {void}
         * 
         * @fires onConnect (condicional)
         * @fires onConnected (condicional)
         * @fires onDisconnect (condicional)
         * @fires onDisconnected (condicional)
         * 
         * @private
         */
        setConnected(connected = null) {
            if (fn.isNull(connected)) {
                connected = this.node.isConnected;
            }
            if (connected) {
                fn.logDebug(this, `El nodo se ha conectado`);
                this.parentNode = this.node.parentNode;
                this.onConnect();
                if (fn.isFunction(this.onConnected)) {
                    this.onConnected(this);
                }
            } else {
                fn.logDebug(this, `El nodo se ha desconectado`);
                this.onDisconnect();
                if (fn.isFunction(this.onDisconnected)) {
                    this.onDisconnected(this);
                }
            }
        }

        /**
         * Suscribe la reconstrucción del Nodo y su contenido al evento especificado
         * @param {Object} event_object Cualquier objeto al que se pueda bindear un evento usando 'on' o 'addEventListener'
         * @param {string} event_name Nombre del evento
         * @returns {void}
         * 
         * @private
         */
        registerSubscription(event_object, event_name) {
            this.subscription_callback = this.subscription_callback || this.build.bind(this);

            if (fn.isFunction(event_object.on)) {
                event_object.on(`${event_name}.control.${this.internalId}`, this.subscription_callback);
            }
            if (fn.isFunction(event_object.addEventListener)) {
                event_object.addEventListener(event_name, this.subscription_callback);
            }
        }

        /**
         * Desubscribe evento de reconstrucción
         * @param {Object} eventOject Cualquier objeto al que se pueda desbindear un evento usando 'off' o 'removeEventListener'
         * @param {string} event_name Nombre del evento
         * @returns {void}
         * 
         * @private
         */
        unregisterSubscription(event_object, event_name) {
            if (!this.subscription_callback) {
                return;
            }

            if (fn.isFunction(event_object.off)) {
                event_object.off(`${event_name}.control.${this.internalId}`);
            }
            if (fn.isFunction(event_object.removeEventListener)) {
                event_object.removeEventListener(event_name, this.subscription_callback);
            }
        }

        /**
         * Elimina todas las suscripciones a eventos de reconstrucción
         * @returns {void}
         * 
         * @private
         */
        removeSubscriptions() {
            this.subscriptions.forEach(subscription => {
                if (fn.isArray(subscription) && subscription.length == 2) {
                    this.unregisterSubscription(subscription[0], subscription[1]);
                }
            });
            this.subscriptions = [];
        }

        /**
         * Asigna contenido al elemento
         * @param {string} content 
         * @returns {void}
         * 
         * @private
         */
        setInnerHTML(content) {
            if (this.node.nodeType == Node.TEXT_NODE) {
                this.node.textContent = content;
            } else {
                this.node.innerHTML = content;
            }
        }

        /**
         * String representando el elemento
         * @return {string}
         */
        toString() {
            if (fn.isNull(this.node)) {
                return '';
            }

            if (this.node.nodeType == Node.TEXT_NODE) {
                return this.node.textContent;
            }

            return this.node.outerHTML;
        }
    }

    /**
     * @classdesc
     * Librería de helpers
     */
    class fn {
        /**
         * > Todos los procedimientos de la clase son estáticos. No necesitas instanciar la clase para nada
         */
        constructor() { }

        /**
         * Log de debug
         * @param {*} args Datos de debug
         * @returns {void}
         * 
         * @static
         */
        static logDebug(...args) {
            if (!module_options.show_debug) {
                return;
            }

            args.unshift('DEBUG');
            console.log(...args);
        }

        /**
         * Log de warning
         * @param {*} warning_object Warning
         * @returns {void}
         * 
         * @static
         */
        static logWarning(...warning_object) {
            if (!module_options.show_warnings) {
                return;
            }

            warning_object.unshift('WARNING');
            console.log(...warning_object);
        }

        /**
         * Log de error
         * @param {*} error_object Error
         * @param {boolean} throw_exception Lanza excepción
         * @returns {void}
         * 
         * @static
         */
        static logError(...error_object) {
            if (!module_options.show_errors) {
                return;
            }
            
            error_object.unshift('ERROR');
            console.log(...error_object);
        }

        /**
         * Retorna true si data es una función
         * @param {*} data Dato
         * @returns {boolean}
         * 
         * @static
         */
        static isFunction(data) {
            return data instanceof Function;
        }

        /**
         * Retorna true si data es un array
         * @param {*} data Dato
         * @returns {boolean}
         * 
         * @static
         */
        static isArray(data) {
            return Array.isArray(data);
        }

        /**
         * Retorna true si data es un string
         * @param {*} data Dato
         * @returns {boolean}
         * 
         * @static
         */
        static isString(data) {
            return typeof data == 'string' || data instanceof String;
        }

        /**
         * Retorna true si data es un objeto
         * @param {*} data Dato
         * @returns {boolean}
         * 
         * @static
         */
        static isObject(data) {
            return typeof data === 'object' && !fn.isArray(data) && !fn.isNull(data);
        }

        /**
         * Retorna true si data es null
         * @param {*} data Dato
         * @returns {boolean}
         * 
         * @static
         */
        static isNull(data) {
            return Object.is(data, null);
        }

        /**
         * Retorna una cadena para usar como id único de un objeto o elemento
         * @return {string}
         * 
         * @static
         */
        static getUniqueId() {
            return (new Date().getTime().toString()) + fn.generateToken(5);
        }

        /**
         * Generador de palabras aleatorias de longitud específica
         * @param {int} [len=12] Longitud de la cadena generada
         * @return {string}
         * 
         * @static
         */
        static generateToken(len) {
            if (!len) {
                len = 12;
            }

            let token = "";
            for (let i = 0; i < len; i++) {
                token += "abcdefhjmnpqrstuvwxyz23456789ABCDEFGHJKLMNPQRSTUVWYXZ".charAt(Math.floor(Math.random() * 53));
            }

            return token;
        }

        /**
         * Escapa la cadena para que pueda insertarse en una expresión regular
         * @param {string} string 
         */
        static escapeRegExp(string) {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
        }

        /**
         * Crea un nuevo elemento HTML
         * @param {string|Node} tag_name 
         * @param {string} inner_html 
         * @param {Object} attributes Attributos del nuevo elemento
         * @param {Object} properties Propiedades que extienden el nuevo elemento
         */
        static createElement(tag_name, inner_html = '', attributes = {}, properties = {}) {
            let node;

            if (tag_name instanceof Node) {
                node = tag_name;
                if (node.nodeType == Node.TEXT_NODE) {
                    node.textContent = inner_html;
                } else {
                    node.innerHTML = inner_html;
                }
            } else {
                tag_name = tag_name.toLowerCase();
                if (tag_name == 'text') {
                    node = document.createTextNode(inner_html);
                } else {
                    node = document.createElement(tag_name);
                    node.innerHTML = inner_html;
                }
            }

            Object.keys(properties).forEach(prop => {
                if (prop in node && typeof node[prop] == 'object') {
                    Object.assign(node[prop], properties[prop]);
                } else {
                    node[prop] = properties[prop];
                }
            });

            if (fn.isFunction(node.setAttribute)) {
                Object.keys(attributes).forEach(attr => {
                    if (fn.isArray(attributes[attr])) {
                        node.setAttribute(attr, attributes[attr].join(', '));
                    } else if (fn.isObject(attributes[attr])) {
                        node.setAttribute(attr, Object.keys(attributes[attr]).map(
                            key => `${key}: ${attributes[attr][key].toString()}`).join('; ')
                        );
                    } else {
                        node.setAttribute(attr, attributes[attr]);
                    }
                });
            }

            return node;
        }

        /**
         * Registra inline bindings  
         * 
         * Bindea de forma automágica eventos en objetos DOM contenidos en la plantilla del control.  
         * 
         * La sintaxis es:  
         * data-bind="evento1 eventoN: callback", donde evento1 y eventoN son los nombres de los eventos
         * por ejemplo 'click','change',submit', etc y callback es el procedimiento que se ejecuta
         * al disparase alguno de los eventos indicados, el callback tiene que ser un procedimiento del
         * objeto pasado con recipient, si no, no se ejecutará.  
         * 
         * Se pueden indicar todos los calbacks que sean necesarios separando frases por ";" tal que:  
         * data-bind="event1: callback1; event2: callback2"  
         * @param {Node} item Elemento HTML
         * @param {*} recipient Objeto con los callbacks que se ejecutan al dispararse
         * los diferentes eventos bindeados
         * @returns {void}
         * 
         * @example
         * <a href="#" data-bind="click: onMyButtonClick">Button</a>
         * // Al hacer click en el anchor se intentará ejecutar el procedimiento `onMyButtonClick` de recipient
         */
        static registerBinding(item, recipient) {
            if (!fn.isFunction(item.getAttribute)) {
                return;
            }

            const binding = item.getAttribute('data-bind');
            if (!binding) {
                return;
            }

            const unbinded = [];

            binding.split(/;/).map((str) => str.match(/^\s*([^\:]+)\s*:\s*(.+)$/)).forEach((sentence) => {
                if (fn.isArray(sentence)) {
                    const [, key, value] = sentence.map(s => s.trim());
                    key.split(/\s+/).forEach((event_name) => {
                        if (fn.isFunction(recipient[value])) {
                            if (fn.isFunction(module_options.bind_dom_event)) {
                                module_options.bind_dom_event(item, event_name, recipient[value].bind(recipient));
                            } else {
                                item.addEventListener(event_name, recipient[value].bind(recipient));
                            }
                        } else {
                            unbinded.push(`${event_name}: ${value}`);
                            fn.logWarning(recipient, `Es necesario implementar "${value}"`);
                        }
                    });
                }
            });

            // elimina los items bindeados con éxito y deja el resto
            if (unbinded.length) {
                item.setAttribute('data-bind', unbinded.join(';'));
            } else {
                item.removeAttribute('data-bind');
            }
        }
    }

    /**
     * Herramienta para manipular el DOM y trabajar con nodos, retorna un array de Nodes.  
     * Esto no es jQuery ni lo pretende, todo lo contrario, se trata de trabajar con simple vanilla sin ofuscar.
     * @param {*} match Selección de nodos con los que se quiere operar
     * @param {Function|Node|string} [] map_callback|node wraper|query selector
     * @param {Function} [map_callback]
     * 
     * `map_callback`   Es Callback que se ejecuta con cada uno de los elementos
     * `node wrapper`   Es un nodo HTML para acotar la búsqueda de otros nodos
     * `query selector` Es un string para localizar un nodo HTML para acotar la búsqueda
     * 
     * @returns {Array.<Node>}
     */
    function dm(match, ...args) {
        let [element, wrapper, map_callback] = parse_args(match, ...args);
        if (fn.isString(element)) {
            element = element.startsWith('#')
                ? document.getElementById(element.substring(1))
                : (wrapper || document).querySelectorAll(element);
        }

        element = to_array(element);

        if (fn.isFunction(map_callback)) {
            return element.map(map_callback);
        }

        const resultHandler = {
            get: (target, prop) => {
                if (prop in target) {
                    // es una propiedad de target
                    if (fn.isFunction(target[prop]) && 'bind' in target[prop]) {
                        return target[prop].bind(target);
                    }
                    return target[prop];
                }

                if (prop in plug && fn.isFunction(plug[prop])) {
                    // es un plugin
                    return function (...args) {
                        return plug[prop].apply(to_array(target), args);
                    }
                }

                return;
            }
        }

        return new Proxy(element, resultHandler);

        function to_array(element) {
            if (element instanceof Element) {
                element = element.getNode();
            }
            if (element instanceof Node) {
                return [element];
            }
            if (element instanceof HTMLCollection) {
                return Array.from(element);
            }
            if (element instanceof NodeList) {
                return Array.from(element);
            }
            if (fn.isArray(element)) {
                return element.filter(item => item instanceof Node);
            }

            return [];
        }

        function parse_args(element, ...args) {
            let wrapper = null;
            let map_callback = null;
            args.forEach(arg => {
                if (arg instanceof Node) {
                    wrapper = arg;
                }
                if (fn.isFunction(arg)) {
                    map_callback = arg;
                }
                if (fn.isString(arg)) {
                    wrapper = arg.startsWith('#')
                        ? document.getElementById(arg.substring(1))
                        : document.querySelector(arg);
                }
            });

            return [element, wrapper, map_callback];
        }
    }

    /**
     * @namespace
     * @const {Object} kj Interface público del módulo
     * 
     * @property {Object} options Opciones del módulo ({@link module_options})
     * @property {TemplateLoader} templateLoader Instancia de TemplateLoader
     * @property {TemplateManager} templateManager Herramienta TemplateManager
     * @property {Element} Element Constructor para Element
     * @property {Events} Events Constructor para Events
     * @property {fn} fn Librería de helpers
     * @property {Object} status Estado del módulo
     * @property {Array.<Element>} status.runningElements Elements en ejecución
     */
    const kj = {
        options: module_options,
        templateLoader: new TemplateLoader,
        templateManager: TemplateManager,
        Element: Element,
        Events: Events,
        fn: fn,
        status: {
            runningElements: runningElements
        },
        plug: plug,
        dm: dm
    }

    /**
     * Proxy para objeto exportado kj
     */
    const kjHandler = {
        /**
         * kj.DIV(...args) equivale a: new kj.Element('div', ...args);
         */
        get: (target, prop) => {
            if (prop in kj) {
                return kj[prop];
            }

            if (prop.match(/^[A-Z0-9]+$/g)) {
                return (...args) => {
                    args.unshift(prop);
                    return new Element(...args);
                }
            }
        },
        /**
         * kj(...args) equivale a: kj.dm(..args);
         */
        apply: (target, this_arg, arguments_list) => {
            return dm(...arguments_list);
        }
    }

    // Inicializacion
    new DomObserver();

    // plugins integrados para dm
    (function () {
        /**
         * Retorna el array de nodos seleccionados
         */
        plug.toArray = function () {
            return this;
        }

        /**
         * Selecciona el nodo con el índice indicado
         * @param {int} index
         * @param {Function} [callback] Se ejecuta la función sobre el item seleccionado
         */
        plug.item = function (index, callback = null) {
            if (fn.isFunction(callback) && this[index]) {
                return callback(this[index]);
            }
            return this[index];
        }
    })();

    // Export
    window.kj = new Proxy(function () { }, kjHandler);
    return window.kj;
})();
