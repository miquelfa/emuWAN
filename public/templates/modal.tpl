<div class="modal-header">
    <h5 class="modal-title" id="exampleModalCenterTitle">{{title}}</h5>
    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
        <span aria-hidden="true">&times;</span>
    </button>
</div>
<div class="modal-body">
    {{#editinterface}}
    <form data-form="modal">
        <div class="form-row">
            <div class="form-group col-sm-4">
                <label for="delay">Delay</label>
                <div class="input-group mb-3">
                    <input id="delay" name="delay" type="number" class="form-control" {{#interface.simulation.status}}value="{{interface.simulation.delay}}"{{/interface.simulation.status}}>
                    <div class="input-group-append">
                        <span class="input-group-text">ms</span>
                    </div>
                </div>
            </div>
            <div class="form-group col-sm-4">
                <label for="reorder">Packet reordering</label>
                <div class="input-group">
                    <input id="reorder" name="reorder" type="number" class="form-control" {{#interface.simulation.status}}value="{{interface.simulation.reorder}}"{{/interface.simulation.status}}>
                    <div class="input-group-append">
                        <span class="input-group-text">%</span>
                    </div>
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
    {{/editinterface}}
</div>
<div class="modal-footer">
    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
    <button type="button" class="btn btn-primary" data-save="modal">Save changes</button>
    <button type="button" class="btn btn-primary d-none" data-loading="modal">
        <span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
        Loading...
    </button>
</div>