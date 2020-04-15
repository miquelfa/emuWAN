class NetworkInterface {
    static API = '/api/networkinterface/';

    constructor (json) {
        this.set(json, false);
    }

    set (json, triggerChangeEvent = true) {
        this.id = json.id;
        this.status = json.status;
        this.mtu = json.mtu;
        this.MAC = json.MAC;
        this.speed = json.speed;
        this.IP4 = json.IP4;

        if (triggerChangeEvent) {
            emuWAN.log('NetworkInterface trigger change: ' + this.id);
            $(this).trigger('change')
        }
    }

    getSimulation() {
        var _self = this;
        return $.get(Simulation.API + '/' + _self.id + '/', function(response) {
            response = JSON.parse(response);
            if (!response.success) {
                reject("Something went wrong");
            }
            _self.simulation = new Simulation(response.response);
            $(_self.simulation).bind('change', () => $(_self).trigger('change'));
            emuWAN.log('Simulation loaded: ' + _self.id);
        });
    }

    edit (params) {
        var _self = this;

        params.CIDR = ("CIDR" in params) ? params.CIDR : "";
        params.DHCP = ("DHCP" in params);

        return $.post({
            url: NetworkInterface.API + '/' + _self.id + '/',
            data: JSON.stringify(params),
            dataType: "json",
            success: function(response) {
                if (!response.success) {
                    // TODO: handle error
                }
                _self.set(response.response);
            },
            error: function(){
                // TODO: handle error
            }
        });
    }
}

class Simulation {
    static API = '/api/simulation/';
    
    constructor (json) {
        this.set(json, false);
    }

    set (json, triggerChangeEvent = true) {
        this.id = json.id;
        this.status = json.status;
        this.delay = json.delay;
        this.loss = json.loss;
        this.reorder = json.reorder;

        if (triggerChangeEvent) {
            emuWAN.log('Simulation trigger change: ' + this.id);
            $(this).trigger('change');
        }
    }

    edit (params) {
        var _self = this;

        return $.post({
            url: Simulation.API + '/' + _self.id + '/',
            data: JSON.stringify(params),   
            dataType: "json",
            success: function(response) {
                if (!response.success) {
                    // TODO: handle error
                }
                _self.set(response.response);
            },
            error: function(){

            }
        });
    }

    reset () {
        var _self = this;

        return $.post({
            url: Simulation.API + '/' + _self.id + '/reset/',
            dataType: "json",
            success: function(response) {
                if (!response.success) {
                    // TODO: handle error
                }
                _self.set(response.response);
            },
            error: function(){

            }
        });
    }
}