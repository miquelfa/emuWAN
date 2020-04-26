<div class="col-lg-4 col-md-6 p-2" data-interfaceId="{{id}}">
    <div class="card shadow box-interface">
        <div class="card-header">
            <div class="row justify-content-between">
                <div class="col-sm-8 align-middle">
                    <h2>
                        <b>{{id}}</b>&nbsp;
                        {{#if status}}
                        <span class="dot dot-success" data-toggle="tooltip" data-placement="top" title="Interface is up"></span>
                        {{else}}
                        <span class="dot dot-danger" data-toggle="tooltip" data-placement="top" title="Interface is down"></span>
                        {{/if}}
                    </h2>
                </div>
                <div class="col-sm-4 text-right align-middle">
                    <div class="btn-group btn-group-toggle" data-toggle="buttons">
                        {{#if bridge.inbridge}}
                        <button title="Bridged interface" type="button" class="btn btn-sm btn-secondary float-right" disabled>br</button>
                        {{else}}
                        {{#if status}}
                        <button data-action="edit-interface" title="Edit interface" type="button" class="btn btn-sm btn-primary float-right"><i class="fas fa-edit"></i></button>
                        {{else}}
                        <button data-action="edit-interface" title="Interface must be UP" type="button" class="btn btn-sm btn-primary float-right" disabled><i class="fas fa-edit"></i></button>
                        {{/if}}
                        {{/if}}
                        {{#if status}}
                        <button data-action="toggle-interface" title="Set nterface DOWN" data-status="down" type="button" class="btn btn-sm btn-danger float-right"><i class="fas fa-unlink"></i></button>
                        {{else}}
                        <button data-action="toggle-interface" title="Set nterface UP" data-status="up" type="button" class="btn btn-sm btn-success float-right"><i class="fas fa-link"></i></button>
                        {{/if}}
                    </div>
                </div>
            </div>
        </div>
        <div class="card-body">
            <span class="font-weight-bold">MAC Address: </span> {{MAC}}<br/>
            <span class="font-weight-bold">Link speed: </span> {{speed}} Mbps<br/>
            <span class="font-weight-bold">MTU: </span> {{mtu}}<br/>
            {{#if IP4.status}}
            <hr class="sm">
            <span class="font-weight-bold">IPv4 Address: </span> {{IP4.CIDR}}<br/>
            <span class="font-weight-bold">Broadcast: </span> {{IP4.broadcast}}<br/>
            <span class="font-weight-bold">DHCP: </span> <span class="dot dot-sm {{#IP4.dynamic}}dot-success{{/IP4.dynamic}}{{^IP4.dynamic}}dot-danger{{/IP4.dynamic}}"></span><br/>
            {{/if}}
            {{#unless bridge.isbridge}}
            <hr>
            <div class="row">
                <div class="col-sm-8">
                    <h2>Simulation</h2>
                </div>
                <div class="col-sm-4 text-right">
                    <div class="btn-group btn-group-toggle" data-toggle="buttons">
                        <button data-action="edit-simulation" title="Edit simulation" type="button" class="btn btn-sm btn-primary float-right"><i class="fas fa-edit"></i></button>
                        {{#if simulation.status}}
                        <button data-action="stop-simulation" title="Stop simulation" type="button" class="btn btn-sm btn-danger float-right"><i class="fas fa-stop"></i></button>
                        {{else}}
                        <button data-action="stop-simulation" title="Stop simulation" type="button" class="btn btn-sm btn-danger float-right" disabled><i class="fas fa-stop"></i></button>
                        {{/if}}
                    </div>
                </div>
            </div>
            <div class="mt-1">
                {{#if simulation.status}}
                {{#if simulation.delay}}<span class="font-weight-bold">Delay: </span> {{simulation.delay}} ms<br/>{{/if}}
                {{#if simulation.delayVariation}}<span class="font-weight-bold">Delay variation: </span> {{simulation.delayVariation}} ms<br/>{{/if}}
                {{#if simulation.loss}}<span class="font-weight-bold">Packet loss: </span> {{simulation.loss}} %<br/>{{/if}}
                {{#if simulation.lossCorrelation}}<span class="font-weight-bold">Loss correlation: </span> {{simulation.lossCorrelation}} %<br/>{{/if}}
                {{#if simulation.reorder}}<span class="font-weight-bold">Packet reordering: </span> {{simulation.reorder}} %<br/>{{/if}}
                {{#if simulation.reorderCorrelation}}<span class="font-weight-bold">Reordering correlation: </span> {{simulation.reorderCorrelation}} %<br/>{{/if}}
                {{else}}
                No running simulation
                {{/if}}
            </div>
            {{/unless}}
        </div>
    </div>
</div>