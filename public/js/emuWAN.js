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
        var editButton = $('[data-interfaceId="'+interfaceId+'"]').find('[data-action="edit-simulation"]');
        editButton.on('click', (e) => {
            var id = $(e.target).attr('data-interfaceId');
            var interface = emuWAN.interfaces.find(interface => interface.id === interfaceId);
            emuWAN_Interfaces.formEdit(interface);
        });
        var stopButton = $('[data-interfaceId="'+interfaceId+'"]').find('[data-action="stop-simulation"]');
        stopButton.on('click', (e) => {
            var interface = emuWAN.interfaces.find(interface => interface.id === interfaceId);
            interface.simulation.reset();
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
            var json = emuWAN_Tools.getFormJSON(emuWAN_Modal.selector.find('[data-form="modal"]'));
            emuWAN_Modal.startLoading();
            interface.simulation.edit(json).then(() => emuWAN_Modal.hide());
        });
    },
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
    hide: function() {
        emuWAN_Modal.selector.modal('hide');
    }
}

$(function(){
    emuWAN.startApp();
});
