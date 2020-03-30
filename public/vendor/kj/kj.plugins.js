(function () {
    /**
     * Fade de un Element
     * @param {HTMLElement} element
     * @param {Number} from
     * @param {Number} to
     * @param {Number} duration
     * @param {Function} callback
     * @return {void}
     */
    const fade = function fade(element, from, to, duration, callback = null) {
        const start = window.performance.now();
        const step = timestamp => {
            const progress = timestamp - start;
            element.style.opacity = from + (progress / duration) * (to - from);

            if (progress < duration) {
                window.requestAnimationFrame(step);
                return;
            }

            if (element.style.opacity <= 0) {
                element.hidden = true;
            }

            if (callback) {
                callback.call(element)
            }
        }

        element.hidden = false;
        window.requestAnimationFrame(step);
    }

    /**
     * Muestra los nodos seleccionados
     */
    kj.plug.show = function () {
        this.forEach(i => i.hidden = false);
        return kj(this);
    }

    /**
     * Oculta los nodos seleccionados
     */
    kj.plug.hide = function () {
        this.forEach(i => i.hidden = true);
        return kj(this);
    }

    /**
     * Muestra estilósamente
     * @param {int} duration Duración de la animación
     * @param {callback} Se ejecuta al finalizar
     */
    kj.plug.fadeIn = function (duration, callback = null) {
        const default_duration = 500;
        this.forEach(item => {
            if (item.hidden) {
                fade(item, 0, 1, duration || default_duration, callback)
            }
        });
        return kj(this);
    }

    /**
     * Oculta, pero con estilo
     * @param {int} duration Duración de la animación
     * @param {callback} Se ejecuta al finalizar
     */
    kj.plug.fadeOut = function (duration, callback = null) {
        const default_duration = 500;
        this.forEach(item => {
            if (!item.hidden) {
                fade(item, 1, 0, duration || default_duration, callback)
            }
        });
        return kj(this);
    }

    /**
     * Añade clases a los nodos seleccionados
     * @param {string} class_name 
     */
    kj.plug.addClass = function (...class_name) {
        this.forEach(item => item.classList.add(...class_name));
        return kj(this);
    }

    /**
     * Quita clases de los nodos seleccionados
     * @param {string} class_name
     */
    kj.plug.removeClass = function (...class_name) {
        this.forEach(item => item.classList.remove(...class_name));
        return kj(this);
    }
    
    /**
     * Comprueba si cualquiera de los elementos seleccionados contiene la clase
     * @param {string} class_name
     */
    kj.plug.hasClass = function (class_name) {
        return this.reduce((acum, item) => item.classList.contains(class_name) || acum, false);
    }

    /**
     * Quita/Añade clases de los nodos seleccionados
     * @param {string} class_name
     */
    kj.plug.toggleClass = function (...class_name) {
        this.forEach(item => item.classList.toggle(...class_name));
        return kj(this);
    }

    /**
     * Inserta los elementos de la lista antes del nodo
     * @param {Node} node Elemento de referencia
     */
    kj.plug.insertBefore = function (node) {
        kj(node).first(item => this.reverse().forEach(sub => item.insertAdjacentElement('beforebegin', sub)));
        return kj(this);
    }

    /**
     * Inserta los elementos de la lista después del nodo
     * @param {Node} node Elemento de referencia
     */
    kj.plug.insertAfter = function (node) {
        kj(node).first(item => this.reverse().forEach(sub => item.insertAdjacentElement('afterend', sub)));
        return kj(this);
    }

    /**
     * Apendiza los elementos de la lista al nodo
     * @param {Node} node Elemento apendizado
     */
    kj.plug.appendTo = function (node) {
        this.forEach(item => kj(node).appendChild(item));
        return kj(this);
    }

    /**
     * Apendiza el nodo al primer elemeno de la lista actual
     * @param {Node} node Elemento apendizado
     */
    kj.plug.appendChild = function (node) {
        node = (node instanceof kj.Element) ? node.getNode() : node;
        kj(this).first(parent => parent.appendChild(node));
        return kj(this);
    }

    /**
     * Remplaza el primer elemento de la lista actual por el nodo
     * @param {Node} node utilizado para la sustitución
     */
    kj.plug.replaceWith = function (node) {
        node = (node instanceof kj.Element) ? node.getNode() : node;
        kj(this).first(current => current.replaceWith(node));
        return kj(this);
    }

    /**
     * Retorna el número de elementos seleccionados
     * @return {int}
     */
    kj.plug.count = function () {
        return this.length;
    }

    /**
     * Retorna el primer elemento seleccionado si
     * no se ha especificado callback, si hay callback
     * se ejecuta sobre el primer elemento y retorna el
     * resultado
     * @param {Function} callback
     * @return {*}
     */
    kj.plug.first = function (callback) {
        return kj(this).item(0, callback);
    }

    /**
     * Retorna el último elemento seleccionado si
     * no se ha especificado callback, si hay callback
     * se ejecuta sobre el último elemento y retorna el
     * resultado
     * @param {Function} callback
     * @return {*}
     */
    kj.plug.last = function (callback) {
        return kj(this).item(this.length - 1, callback);
    }
    
    /**
     * Retorna el próximo elemento al seleccionado que esté al
     * mismo nivel de la lista de hijos de su padre, o null si
     * el elemento especificado es el último, si hay callback
     * se ejecuta sobre el siguiente elemento y retorna el
     * resultado
     * @param {Function} callback
     * @return {*}
     */
    kj.plug.nextElement = function (callback) {
        if (kj.fn.isFunction(callback)) {
            return kj(kj(this).first(item => item.nextElementSibling)).first(callback);
        }
        return kj(this).first(item => item.nextElementSibling);
    }

    /**
     * Retorna el elemento anterior al seleccionado que esté al
     * mismo nivel de la lista de hijos de su padre, o null si
     * el elemento especificado es el primero, si hay callback
     * se ejecuta sobre el elemento antetior y retorna el
     * resultado
     * @param {Function} callback
     * @return {*}
     */
    kj.plug.previousElement = function (callback) {
        if (kj.fn.isFunction(callback)) {
            return kj(kj(this).first(item => item.previousElementSibling)).first(callback);
        }
        return kj(this).first(item => item.previousElementSibling);
    }
    
    /**
     * Modifica el html interno del elemento seleccionado
     * @param {string} html
     */
    kj.plug.setHtml = function (html) {
        kj(this).first(item => item.innerHTML = html);
        return kj(this);
    }

    /**
     * Retorna el html contenido en el elemento seleccionado
     * @return {string}
     */
    kj.plug.getHtml = function () {
        return kj(this).first(item => item.innerHTML);
    }

    /**
     * Modifica el texto contenido en el elemento seleccionado
     * param {string}
     */
    kj.plug.setText = function (text) {
        kj(this).first(item => item.textContent = text);
        return kj(this);
    }

    /**
     * Retorna el texto contenido en el elemento seleccionado
     * @return {string}
     */
    kj.plug.getText = function () {
        return kj(this).first(item => item.textContent);
    }
    
    /**
     * Modifica el atributo value del elemento, si se
     * ha seleccionado más de un elemento solo modifica el
     * primero
     * @param {string} value
     */
    kj.plug.setValue = function (value) {
        kj(this).first(item => item.value = value);
        return kj(this);
    }

    /**
     * Retorna el atributo value del elemento, si se
     * ha seleccionado más de un elemento retorna el correspondiente
     * al primero
     * @return {*}
     */
    kj.plug.getValue = function () {
        return kj(this).first(item => item.value);
    }
    
    /**
     * Modifica el atributo indicado del elemento, si se
     * ha seleccionado más de un elemento solo modifica el
     * primero
     * @param {string} attribute
     * @param {string} value
     */
    kj.plug.setAttribute = function (attribute, value) {
        kj(this).first(item => {
            if (kj.fn.isArray(value)) {
                value = value.join(', ');
            } else if (kj.fn.isObject(value)) {
                value = Object.keys(value).map(key => `${key}: ${value[key].toString()}`).join('; ');
            }

            item.setAttribute(attribute, value);
        });
        return kj(this);
    }

    /**
     * Retorna el valor del atributo indicado del elemento, si se
     * ha seleccionado más de un elemento retorna el correspondiente
     * al primero
     * @param {string} attribute
     * @return {string}
     */
    kj.plug.getAttribute = function (attribute) {
        return kj(this).first(item => item.getAttribute(attribute));
    }

    /**
     * Elimina el atributo indicado del elemento, si se ha seleccionado
     * más de un elemento elimina el correspondiente al primero
     * @param {string} attribute
     */
    kj.plug.removeAttribute = function (attribute) {
        kj(this).first(item => item.removeAttribute(attribute));
        return kj(this);
    }

    /**
     * Modifica propiedad indicada del elemento, si se
     * ha seleccionado más de un elemento solo modifica el
     * primero
     * @param {string} property
     * @param {*} value
     */
    kj.plug.setProperty = function (property, value) {
        kj(this).first(item => {
            if (property in item && typeof item[property] == 'object') {
                Object.assign(item[property], value);
            } else {
                item[property] = value;
            }
        });
        return kj(this);
    }

    /**
     * Retorna el valor de la propiedad indicada del elemento, si se
     * ha seleccionado más de un elemento retorna la correspondiente
     * al primero
     * @param {string} property
     * @return {*}
     */
    kj.plug.getProperty = function (property) {
        return kj(this).first(item => item[property]);
    }
    
    /**
     * Retorna el conjunto de valores seteados en la propiedad data
     * del elemento, si se ha seleccionado más de un elemento retorna
     * el correspondiente al primero
     * @return {DOMStringMap}
     */
    kj.plug.getDataset = function () {
        return kj(this).getProperty('dataset');
    }

    /**
     * Retorna el valor de la propiedad `data-${property}` indicada del elemento,
     * si se ha seleccionado más de un elemento retorna la correspondiente
     * al primero
     * @param {string} attribute
     * @return {*}
     */
    kj.plug.getDataValue = function ( property ) {
        return (kj(this).getProperty('dataset') || {})[property];
    }

    /**
     * Modifica propiedad `data-${property}` indicada del elemento, si se
     * ha seleccionado más de un elemento solo modifica el primero
     * @param {string} property
     * @param {*} value
     */
    kj.plug.setDataValue = function ( property, value ) {
        kj(this).setProperty('dataset', {[`${property}`]: value} );
        return kj(this);
    }
    
    /**
     * Actualiza la opción seleccionada en un grupo de radios
     * @param {string} checked Valor seleccionado
     */
    kj.plug.setChecked = function (checked) {
        kj(this, item => item.checked = item.value == checked);
        return kj(this);
    }

    /**
     * Retorna el valor seleccionado en un grupo de radios
     * @return {string}
     */
    kj.plug.getChecked = function () {
        return kj(this.filter(item => item.checked)).getValue();
    }

    /**
     * Desplaza el foco al alemento seleccionado
     */
    kj.plug.focus = function () {
        kj(this).first(item => item.focus());
        return kj(this);
    }
    
    kj.plug.registerBindings = function (recipient) {
        kj(this).forEach(item => {
            kj('[data-bind]', item, subitem => kj.fn.registerBinding(subitem, recipient));
            kj.fn.registerBinding(item, recipient);
        });
        return kj(this);
    }
})();
