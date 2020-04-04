window.emuWAN = {
    debug: true,
    interfaces: [],
    startApp: function() {
        $.when(
            emuWAN_Template.loadEssentialTemplates(),
            emuWAN.loadInitialData()
        ).then(function(){
            emuWAN_Interfaces.renderAll();
            emuWAN.log('Loading success');
            setTimeout(emuWAN.disableLoader, 50);
        }, function(){
            emuWAN.log('Loading fail');
            // TODO implement failure
        });
    },
    loadInitialData: function() {
        var promise = new Promise(function(resolve, reject){
            $.get(emuWAN_URL.interface(), function(response){
                response = JSON.parse(response);
                if (!response.success) {
                    reject("Something went wrong");
                }
                emuWAN.interfaces = response.response;
                emuWAN.log('Interfaces loaded');
            }).then(function(){
                // Get all simulations
                var promises = [];
                emuWAN.interfaces.forEach(function(interface, index){
                    promises.push($.get(emuWAN_URL.simulation(interface.id), function(response) {
                        response = JSON.parse(response);
                        if (!response.success) {
                            reject("Something went wrong");
                        }
                        emuWAN.interfaces[index].simulation = response.response;
                        emuWAN.log('Simulation loaded: ' + interface.id);
                    }));
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
    }
}

emuWAN_URL = {
    API: {
        interface: '/api/networkinterface/',
        simulation: '/api/simulation/'
    },
    interface: function(id) {
        if (id) {
            return this.API.interface + id + '/';
        }
        return this.API.interface;
    },
    simulation: function(id) {
        if (id) {
            return this.API.simulation + id + '/';
        }
        return this.API.simulation;
    }
}

emuWAN_Template = {
    templates: {
        interfacecard: '/templates/interfacecard.tpl',
        modal: '/templates/modal.tpl'
    },
    loadEssentialTemplates: function() {
        var promise = new Promise(function(resolve, reject){
            $.when(
                Object.keys(emuWAN_Template.templates).forEach(function(key){
                    fetch(emuWAN_Template.templates[key])
                        .then((result) => result.text())
                        .then((template) => {
                            emuWAN_Template.templates[key] = template;
                        });
                })
            ).then(function(){
                resolve("Success!");
            }, function(){
                reject("Something went wrong");
            });
        });
        return promise;
    }
}

emuWAN_Interfaces = {
    renderAll: function() {
        $('#interface-cards').html('');
        emuWAN.interfaces.forEach(function(interface){
            var rendered = Mustache.render(emuWAN_Template.templates.interfacecard, interface);
            $('#interface-cards').append(rendered);
            $('[data-toggle="tooltip"]').tooltip();
            emuWAN_Interfaces.addCardEvents(interface.id);
        });
    },
    render: function(interfaceId) {
        var interface = emuWAN.interfaces.find(interface => interface.id === interfaceId);
        var card = $(Mustache.render(emuWAN_Template.templates.interfacecard, interface));
        $('[data-interfaceId="'+interfaceId+'"]').replaceWith(card);
        emuWAN_Interfaces.addCardEvents(interface.id);
        emuWAN_Modal.selector.modal('hide');
    },
    addCardEvents: function(interfaceId) {
        var button = $('[data-interfaceId="'+interfaceId+'"]').find('[data-action="edit-simulation"]');
        button.on('click', (e) => {
            var id = $(e.target).attr('data-interfaceId');
            var interface = emuWAN.interfaces.find(interface => interface.id === id);
            emuWAN_Interfaces.formEdit(interface);
        });
    },
    formEdit: function(interface) {
        var params = {
            editinterface: true,
            title: "Edit interface " + interface.id,
            interface: interface,
        }
        var modal = emuWAN_Modal.render(params);
        modal.find('[data-save="modal"]').on('click', function(e){
            var array = emuWAN_Modal.selector.find('[data-form="modal"]').serializeArray();
            emuWAN_Modal.startLoading();
            var object = {};
            array.forEach((field) => {
                object[field.name] = field.value;
            });
            emuWAN_Interfaces.updateInterface(interface.id, object);
        });
    },
    updateInterface: function(interfaceId, params) {
        $.post(emuWAN_URL.simulation(interfaceId), JSON.stringify(params), function(response) {
            if (!response.success) {
                // TODO petar
            }
        }, "json").then(function(){
            $.get(emuWAN_URL.simulation(interfaceId), function(response){
                response = JSON.parse(response);
                if (!response.success) {
                    // TODO petar
                }
                var interface = emuWAN.interfaces.find(interface => interface.id === interfaceId);
                interface.simulation = response.response;
                emuWAN_Interfaces.render(interface.id);
            })
        });
    }
}

emuWAN_Modal = {
    selector: $('#emuWAN-modal'),
    render: function(params) {
        var rendered = Mustache.render(emuWAN_Template.templates.modal, params);
        emuWAN_Modal.selector.find('#emuWAN-modal-content').html(rendered);
        emuWAN_Modal.selector.modal();
        emuWAN_Modal.selector.on('hidden.bs.modal', () => emuWAN_Modal.dispose());
        return emuWAN_Modal.selector;
    },
    dispose: function() {
        emuWAN_Modal.selector.find('#emuWAN-modal-content').html('');
        emuWAN_Modal.selector.modal('dispose');
        emuWAN.log('Modal disposed');
    },
    startLoading: function() {
        emuWAN_Modal.selector.find('[data-save="modal"]').addClass('d-none');
        emuWAN_Modal.selector.find('[data-loading="modal"]').removeClass('d-none');
        emuWAN_Modal.selector.find('button, input').attr('disabled', true);
    }
}

$(function(){
    emuWAN.startApp();
});
