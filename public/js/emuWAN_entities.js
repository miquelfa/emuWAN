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
        this.bridge = json.bridge;

        if (triggerChangeEvent) {
            emuWAN.log('NetworkInterface trigger change: ' + this.id);
            $(this).trigger('change')
        }
    }

    getSimulation() {
        var _self = this;
        return $.get(Simulation.API + _self.id + '/', function(response) {
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

        return AjaxWrapper.post(NetworkInterface.API + _self.id + '/', params)
            .then((response) => {
                _self.set(response.response);
                emuWAN.log('Interface edited: ' + _self.id);
            });
    }

    setStatus (status) {
        var _self = this;

        var params = {"status": status};

        return AjaxWrapper.post(NetworkInterface.API + _self.id + '/status/', params)
            .then((response) => {
                _self.set(response.response);
                emuWAN.log('Interface status changed: ' + _self.id);
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

        return AjaxWrapper.post(Simulation.API + _self.id + '/', params)
            .then((response) => {
                _self.set(response.response);
                emuWAN.log('Simulation edited: ' + _self.id);
            });
    }

    reset () {
        var _self = this;

        return AjaxWrapper.post(Simulation.API + _self.id + '/reset/')
            .then((response) => {
                _self.set(response.response);
                emuWAN.log('Simulation stopped: ' + _self.id);
            });
    }
}

class AjaxWrapper {
    static request (method, url, params = undefined) {
        return new Promise((resolve, reject) => {
            var data = (typeof params === 'object') ? JSON.stringify(params) : params;
            $.ajax({
                method: method,
                url: url,
                dataType: "json",
                data: data,
                success: (response) => {
                    if (response.success) {
                        resolve(response);
                    }
                    reject(response);
                },
                error: () => {
                    reject(false);
                }
            });
        });
    }

    static get (url, params = undefined) {
        return AjaxWrapper.request("GET", url, params);
    }

    static post (url, params = undefined) {
        return AjaxWrapper.request("POST", url, params);
    }
}