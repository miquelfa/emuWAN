<div class="col-lg-4 col-md-6 p-2" data-interfaceId="{{id}}">
    <div class="card shadow box-interface">
        <div class="card-header">
            <div class="row justify-content-between">
                <div class="col-sm-8 align-middle">
                    <h2>
                        <b>{{id}}</b>&nbsp;
                        {{#status}}
                        <span class="dot dot-success" data-toggle="tooltip" data-placement="top" title="Interface is up"></span>
                        {{/status}}
                        {{^status}}
                        <span class="dot dot-danger" data-toggle="tooltip" data-placement="top" title="Interface is down"></span>
                        {{/status}}
                    </h2>
                </div>
                <div class="col-sm-4 text-right align-middle">
                    <div class="btn-group btn-group-toggle" data-toggle="buttons">
                        {{#bridge.inbridge}}
                        <button title="Bridged interface" type="button" class="btn btn-sm btn-secondary float-right" disabled>br</button>
                        {{/bridge.inbridge}}
                        {{^bridge.inbridge}}
                        <button data-action="edit-interface" title="Edit interface" type="button" class="btn btn-sm btn-primary float-right"><i class="fas fa-edit"></i></button>
                        {{/bridge.inbridge}}
                        {{#status}}
                        <button data-action="toggle-interface" title="Set nterface DOWN" data-status="down" type="button" class="btn btn-sm btn-danger float-right"><i class="fas fa-unlink"></i></button>
                        {{/status}}
                        {{^status}}
                        <button data-action="toggle-interface" title="Set nterface UP" data-status="up" type="button" class="btn btn-sm btn-success float-right"><i class="fas fa-link"></i></button>
                        {{/status}}
                    </div>
                </div>
            </div>
        </div>
        <div class="card-body">
            <span class="font-weight-bold">MAC Address: </span> {{MAC}}<br/>
            <span class="font-weight-bold">Link speed: </span> {{speed}} Mbps<br/>
            <span class="font-weight-bold">MTU: </span> {{mtu}}<br/>
            {{#IP4.status}}
            <hr class="sm">
            <span class="font-weight-bold">IPv4 Address: </span> {{IP4.CIDR}}<br/>
            <span class="font-weight-bold">Broadcast: </span> {{IP4.broadcast}}<br/>
            <span class="font-weight-bold">DHCP: </span> <span class="dot dot-sm {{#IP4.dynamic}}dot-success{{/IP4.dynamic}}{{^IP4.dynamic}}dot-danger{{/IP4.dynamic}}"></span><br/>
            {{/IP4.status}}
            {{^bridge.isbridge}}
            <hr>
            <div class="row">
                <div class="col-sm-8">
                    <h2>Simulation</h2>
                </div>
                <div class="col-sm-4 text-right">
                    <div class="btn-group btn-group-toggle" data-toggle="buttons">
                        <button data-action="edit-simulation" title="Edit simulation" type="button" class="btn btn-sm btn-primary float-right"><i class="fas fa-edit"></i></button>
                        {{#simulation.status}}
                        <button data-action="stop-simulation" title="Stop simulation" type="button" class="btn btn-sm btn-danger float-right"><i class="fas fa-stop"></i></button>
                        {{/simulation.status}}
                        {{^simulation.status}}
                        <button data-action="stop-simulation" title="Stop simulation" type="button" class="btn btn-sm btn-danger float-right" disabled><i class="fas fa-stop"></i></button>
                        {{/simulation.status}}
                    </div>
                </div>
            </div>
            <div class="mt-1">
                {{#simulation.status}}
                {{#simulation.delay}}<span class="font-weight-bold">Delay: </span> {{this}} ms<br/>{{/simulation.delay}}
                {{#simulation.loss}}<span class="font-weight-bold">Packet loss: </span> {{this}} %<br/>{{/simulation.loss}}
                {{#simulation.reorder}}<span class="font-weight-bold">Packet reordering: </span> {{this}} %<br/>{{/simulation.reorder}}
                {{/simulation.status}}
                {{^simulation.status}}
                No running simulation
                {{/simulation.status}}
            </div>
            {{/bridge.isbridge}}
        </div>
    </div>
</div>