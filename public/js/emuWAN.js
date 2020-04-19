window.emuWAN = {
    debug: true,
    interfaces: [],
    bridge: null,
    templates: null,
    modal: null,
    startApp: function() {
        emuWAN.templates = new Templates_Module();
        emuWAN.modal = new Modal_Module();
        $.when(
            emuWAN.templates.loadEssential(),
            emuWAN.loadInitialData()
        ).then(function(){
            emuWAN.interfaces.forEach((interface) => {
                emuWAN_Interfaces.render(interface);
                $(interface).bind('change', (e) => emuWAN_Interfaces.render(e.target) );
            });
            emuWAN.log('Loading success');
            setTimeout(emuWAN.disableLoader, 50);

            emuWAN.bridge = new Bridges_Module();
            $('[data-action="add-bridge"]').on('click', (e) => {emuWAN.bridge.formCreateBridge()});
        }, function(){
            emuWAN.log('Loading fail');
            emuWAN.appFailure();
        });
    },
    loadInitialData: function() {
        var promise = new Promise(function(resolve, reject){
            $.get(NetworkInterface.API, function(response){
                response = JSON.parse(response);
                if (!response.success) {
                    reject("Something went wrong");
                }
                response.response.forEach(function(interface){
                    var obj = new NetworkInterface(interface);
                    emuWAN.interfaces.push(obj);
                });
                emuWAN.log('Interfaces loaded');
            }).then(function(){
                // Get all simulations
                var promises = [];
                emuWAN.interfaces.forEach(function(interface){
                    promises.push(interface.getSimulation());
                });

                $.when.apply($, promises)
                .then(function(){
                    resolve("Success!");
                }, function() {
                    reject("Something went wrong");
                });
            });
        });
        return promise;
    },
    disableLoader: function() {
        $('#loader').fadeTo(300, 0,() => {
            $('#loader').addClass('d-none').removeClass('d-block');
        });
    },
    log: function(message) {
        if (this.debug) {
            console.log(message);
        }
    },
    appFailure: function() {
        $('#loader').css('opacity', 1).addClass('d-block').removeClass('d-none');
        setTimeout(() => alert("Something went wrong! Please refresh the page"), 100);
    }
}

emuWAN_Tools = {
    getFormJSON: function(formSelector) {
        var array = formSelector.serializeArray();
        var json = {};
        array.forEach((field) => {
            var match = field.name.match(/([a-z]+)\[\]/);
            if (match) {
                (json[match[1]] = json[match[1]] || []).push(field.value);
                return;
            }

            json[field.name] = field.value;
        });
        return json;
    }
}

emuWAN_Interfaces = {
    render: function(interface) {
        var cardSelector = '[data-interfaceId="'+interface.id+'"]';
        var template = emuWAN.templates.getTemplate('interfacecard');
        var card = template(interface);

        var existingCard = $('#interface-cards').find(cardSelector);
        if (existingCard.length) {
            $(cardSelector).replaceWith(card);
        } else {
            $('#interface-cards').append(card);
        }

        $('[data-toggle="tooltip"]').tooltip();
        emuWAN_Interfaces.addCardEvents(interface.id);
    },
    addCardEvents: function(interfaceId) {
        var editInterfaceButton = $('[data-interfaceId="'+interfaceId+'"]').find('[data-action="edit-interface"]');
        editInterfaceButton.on('click', (e) => {
            var interface = emuWAN.interfaces.find(interface => interface.id === interfaceId);
            emuWAN_Interfaces.formEditInterface(interface);
        });
        var editInterfaceButton = $('[data-interfaceId="'+interfaceId+'"]').find('[data-action="toggle-interface"]');
        editInterfaceButton.on('click', (e) => {
            var interface = emuWAN.interfaces.find(interface => interface.id === interfaceId);
            $(e.currentTarget).prop('disabled', true).html('<span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>');
            interface.setStatus($(e.currentTarget).data('status'));
        });
        var editSimulationButton = $('[data-interfaceId="'+interfaceId+'"]').find('[data-action="edit-simulation"]');
        editSimulationButton.on('click', (e) => {
            var interface = emuWAN.interfaces.find(interface => interface.id === interfaceId);
            emuWAN_Interfaces.formEditSimulation(interface);
        });
        var stopButton = $('[data-interfaceId="'+interfaceId+'"]').find('[data-action="stop-simulation"]');
        stopButton.on('click', (e) => {
            var interface = emuWAN.interfaces.find(interface => interface.id === interfaceId);
            interface.simulation.reset();
        });
    },
    formEditSimulation: function(interface) {
        var params = {
            editsimulation: true,
            title: "Edit simulation " + interface.id,
            interface: interface,
        }
        
        emuWAN.modal.render(params);
        $(emuWAN.modal).bind('save', function(e, formData){
            interface.simulation.edit(formData).then(() => emuWAN.modal.hide(), (result) => {
                if (result === false) {
                    emuWAN.appFailure();
                }
                emuWAN.modal.processFormErrors(result.errors);
            });
        });
    },
    formEditInterface: function(interface) {
        var params = {
            editinterface: true,
            title: "Edit interface " + interface.id,
            interface: interface,
        }
        
        emuWAN.modal.render(params);
        emuWAN.modal.selector.find('input#DHCP').on('change', function(e) {
            if($(e.target).prop("checked")) {
                emuWAN.modal.selector.find('input#CIDR').prop("disabled", true);
            } else {
                emuWAN.modal.selector.find('input#CIDR').prop("disabled", false);
            }
        });
        $(emuWAN.modal).bind('save', function(e, formData){
            interface.edit(formData).then(() => emuWAN.modal.hide(), (result) => {
                if (result === false) {
                    emuWAN.appFailure();
                }
                emuWAN.modal.processFormErrors(result.errors);
            });
        });
    }
}

class Templates_Module {
    templates = [];
    essential = ['interfacecard', 'modal', 'bridges'];
    paths = {
        interfacecard: '/templates/interfacecard.tpl',
        modal: '/templates/modal.tpl',
        bridges: '/templates/bridges.tpl'
    }

    loadEssential () {
        var _self = this;
        return new Promise(function(resolve, reject){
            $.when(
                _self.essential.forEach(function(name){
                    _self.loadTemplate(name);
                })
            ).then(() => resolve('Success!'), () => reject('Failure'));
        });
    }

    loadTemplate (name) {
        var _self = this;
        return new Promise((resolve) => {
            fetch(_self.paths[name]).then((result) => 
                result.text()
            ).then((template) => {
                _self.templates[name] = Handlebars.compile(template);
                emuWAN.log('Template loaded: ' + name);
                resolve(_self.templates[name]);
            });
        });
    }

    getTemplate (name) {
        if (name in this.templates) {
            return this.templates[name];
        }
        emuWAN.appFailure();
        /*
        return new Promise((resolve) => {
            if (name in this.templates) {
                resolve(this.templates[name]);
                return;
            }
            this.loadTemplate(name).then((template) => resolve(template));
        });
        */
    }
}

class Bridges_Module {
    bridges = [];

    constructor () {
        $(this).bind('render', (e) => this.render);
        this.loadBridges();
    }

    setBridges (bridges) {
        this.bridges = bridges;
        $(this).trigger('render');
    }

    loadBridges () {
        var _self = this;
        Bridge.getAll().then(function(response){
            _self.setBridges(response);
        }, function(response) {
            if ("success" in response) {
                return;
            }
            emuWAN.appFailure();
        });
    }

    render () {
        var template = emuWAN.templates.getTemplate('bridges')
        var rendered = template(this.bridges);
        $('#bridges-container').html(rendered);
    }

    formCreateBridge () {
        var params = {
            createbridge: true,
            title: "Create new bridge",
            interfaces: emuWAN.interfaces
        }
        emuWAN.modal.render(params);
        $(emuWAN.modal).bind('save', (e, data) => {
            this.actionCreateBridge(data);
        });
    }

    actionCreateBridge (data) {
        var _self = this;
        Bridge.create(data).then((bridge) => {
            _self.bridges.push(bridge);
            $(_self).trigger('render');
            emuWAN.modal.hide();
        }, (response) => {
            emuWAN.modal.processFormErrors(response.errors);
        });
    }
}

class Modal_Module {
    selector = $('#emuWAN-modal');

    render (params) {
        var _self = this;
        var template = emuWAN.templates.getTemplate('modal');
        var rendered = template(params);
        _self.selector.find('#emuWAN-modal-content').html(rendered);
        _self.selector.modal();
        _self.selector.on('hidden.bs.modal', () => _self.dispose());
        _self.selector.find('[data-save="modal"]').on('click', (e) => {
            _self.processSave();
        });
    }

    dispose () {
        this.selector.find('#emuWAN-modal-content').html('');
        this.selector.modal('dispose');
        emuWAN.log('Modal disposed');
        $(this).unbind();
    }

    startLoading () {
        this.selector.find('[data-save="modal"]').addClass('d-none');
        this.selector.find('[data-loading="modal"]').removeClass('d-none');
        this.selector.find('button, input').attr('disabled', true);
    }

    stopLoading () {
        this.selector.find('[data-save="modal"]').removeClass('d-none');
        this.selector.find('[data-loading="modal"]').addClass('d-none');
        this.selector.find('button, input').attr('disabled', false);
    }

    processSave () {
        this.clearFormErrors();
        var json = emuWAN_Tools.getFormJSON(this.selector.find('[data-form="modal"]'));
        $(this).trigger('save', json);
        this.startLoading();
    }

    hide () {
        this.stopLoading();
        this.selector.modal('hide');
    }

    clearFormErrors () {
        var form = this.selector.find('[data-form="modal"]');
        form.find('.is-invalid').removeClass('is-invalid');
        form.find('.invalid-feedback').html('');
        this.selector.find('.alert').addClass('d-none').html('');
    }

    processFormErrors (errors) {
        var _self = this;
        var form = _self.selector.find('[data-form="modal"]');
        errors.forEach((error) => {
            var input = form.find('[name="'+error.key+'"]');
            var errorfield = form.find('[data-inputname="'+error.key+'"]');
            if (input.length && errorfield.length) {
                errorfield.html(error.error);
                input.addClass('is-invalid');
            } else {
                var alerts = _self.selector.find('.alert');
                alerts.append(error.error + '<br/>');
                alerts.removeClass('d-none');
            }
        });
        _self.stopLoading();
    }
}

$(function(){
    emuWAN.startApp();
});
