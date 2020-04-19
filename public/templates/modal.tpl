<div class="modal-header">
    <h5 class="modal-title" id="exampleModalCenterTitle">{{title}}</h5>
    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
        <span aria-hidden="true">&times;</span>
    </button>
</div>
<div class="modal-body">
    {{#editsimulation}}
    <form data-form="modal">
        <div class="form-row">
            <div class="form-group col-sm-4">
                <label for="delay">Delay</label>
                <div class="input-group mb-3">
                    <input id="delay" name="delay" type="number" class="form-control" {{#interface.simulation.status}}value="{{interface.simulation.delay}}"{{/interface.simulation.status}}>
                    <div class="input-group-append">
                        <span class="input-group-text">ms</span>
                    </div>
                    <div data-inputname="delay" class="invalid-feedback"></div>
                </div>
            </div>
            <div class="form-group col-sm-4">
                <label for="reorder">Packet reordering</label>
                <div class="input-group">
                    <input id="reorder" name="reorder" type="number" class="form-control" {{#interface.simulation.status}}value="{{interface.simulation.reorder}}"{{/interface.simulation.status}}>
                    <div class="input-group-append">
                        <span class="input-group-text">%</span>
                    </div>
                    <div data-inputname="reorder" class="invalid-feedback"></div>
                </div>
            </div>
            <div class="form-group col-sm-4">
                <label for="loss">Packet loss</label>
                <div class="input-group mb-3">
                    <input id="loss" name="loss" type="number" class="form-control" {{#interface.simulation.status}}value="{{interface.simulation.loss}}"{{/interface.simulation.status}}>
                    <div class="input-group-append">
                        <span class="input-group-text">%</span>
                    </div>
                     
                </div>
            </div>
        </div>
    </form>
    {{/editsimulation}}
    {{#editinterface}}
    <form data-form="modal">
        <div class="form-row justify-content-around">
            <div class="form-group col-sm-5">
                <label for="CIDR">Address</label>
                <input id="CIDR" name="CIDR" type="text" class="form-control" {{#interface.IP4.CIDR}}value="{{interface.IP4.CIDR}}"{{/interface.IP4.CIDR}} {{#interface.IP4.dynamic}}disabled{{/interface.IP4.dynamic}}>
                <div data-inputname="CIDR" class="invalid-feedback"></div>
                <small id="CIDRhelp" class="form-text text-muted">CIDR format: address/mask</small>
            </div>
            <div class="form-group col-sm-5">
                <label for="DHCP">DHCP</label><br/>
                <label class="switch">
                    <input id="DHCP" name="DHCP" type="checkbox" {{#interface.IP4.dynamic}}checked{{/interface.IP4.dynamic}}>
                    <span class="slider"></span>
                </label>
            </div>
        </div>
    </form>
    {{/editinterface}}
    {{#createbridge}}
    <form data-form="modal">
        <div class="form-row justify-content-around">
            <div class="form-group col-sm-3">
                <label for="name">Bridge name</label>
                <input id="name" name="name" type="text" class="form-control">
                <div data-inputname="name" class="invalid-feedback"></div>
            </div>
            <div class="form-group col-sm-9">
                <div class="row justify-content-around">
                    {{#each interfaces}}
                    <div class="col-sm-2">
                        <label for="interface[{{id}}]">{{id}}</label><br/>
                        <label class="switch">
                            <input id="interfaces[{{id}}]" name="interfaces[]" value="{{id}}" type="checkbox">
                            <span class="slider"></span>
                        </label>
                    </div>
                    {{/each}}
                </div>
            </div>
        </div>
    </form>
    {{/createbridge}}
    <div class="alert alert-danger d-none" role="alert"></div>
</div>
<div class="modal-footer">
    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
    <button type="button" class="btn btn-primary" data-save="modal">Save changes</button>
    <button type="button" class="btn btn-primary d-none" data-loading="modal">
        <span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
        Loading...
    </button>
</div>
