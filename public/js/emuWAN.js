window.emuWAN = {
    debug: true,
    interfaces: [],
    startApp: function() {
        $.when(
            emuWAN_Template.loadEssentialTemplates(),
            emuWAN.loadInitialData()
        ).then(function(){
            emuWAN.interfaces.forEach((interface) => {
                emuWAN_Interfaces.render(interface);
                $(interface).bind('change', (e) => emuWAN_Interfaces.render(e.target) );
            });
            emuWAN.log('Loading success');
            setTimeout(emuWAN.disableLoader, 50);
        }, function(){
            emuWAN.log('Loading fail');
            // TODO implement failure
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
                    $(obj).bind('event', function() {
                        console.log('Change');
                    });
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
            json[field.name] = field.value;
        });
        return json;
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
    render: function(interface) {
        var cardSelector = '[data-interfaceId="'+interface.id+'"]';
        var card = Mustache.render(emuWAN_Template.templates.interfacecard, interface);

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
        
        var modal = emuWAN_Modal.render(params);
        modal.find('[data-save="modal"]').on('click', function(e){
            var json = emuWAN_Tools.getFormJSON(emuWAN_Modal.selector.find('[data-form="modal"]'));
            emuWAN_Modal.startLoading();
            interface.simulation.edit(json).then(() => emuWAN_Modal.hide(), (result) => {
                if (result === false) {
                    emuWAN.appFailure();
                }
                emuWAN_Modal.processFormErrors(result.errors);
            });
        });
    },
    formEditInterface: function(interface) {
        var params = {
            editinterface: true,
            title: "Edit interface " + interface.id,
            interface: interface,
        }
        
        var modal = emuWAN_Modal.render(params);
        modal.find('input#DHCP').on('change', function(e){
            if($(e.target).prop("checked")) {
                modal.find('input#CIDR').prop("disabled", true);
            } else {
                modal.find('input#CIDR').prop("disabled", false);
            }
        });
        modal.find('[data-save="modal"]').on('click', function(e){
            var json = emuWAN_Tools.getFormJSON(emuWAN_Modal.selector.find('[data-form="modal"]'));
            emuWAN_Modal.startLoading();
            interface.edit(json).then(() => emuWAN_Modal.hide(), (result) => {
                if (result === false) {
                    emuWAN.appFailure();
                }
                emuWAN_Modal.processFormErrors(result.errors);
            });
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
    },
    stopLoading: function() {
        emuWAN_Modal.selector.find('[data-save="modal"]').removeClass('d-none');
        emuWAN_Modal.selector.find('[data-loading="modal"]').addClass('d-none');
        emuWAN_Modal.selector.find('button, input').attr('disabled', false);
    },
    hide: function() {
        emuWAN_Modal.selector.modal('hide');
    },
    processFormErrors: function(errors) {
        var form = emuWAN_Modal.selector.find('[data-form="modal"]');
        errors.forEach((error) => {
            var input = form.find('[name="'+error.key+'"]');
            var errorfield = form.find('[data-inputname="'+error.key+'"]');
            if (input.length && errorfield.length) {
                errorfield.html(error.error);
                input.addClass('is-invalid');
            }
        });
        emuWAN_Modal.stopLoading();
    }
}

$(function(){
    emuWAN.startApp();
});
