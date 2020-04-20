{{#if bridges}}
<h1>Bridges</h1>
<table class="table shadow" style="background-color: #FFF; ">
    <thead>
        <tr>
            <th scope="col">#</th>
            <th scope="col">Bridge name</th>
            <th scope="col">Interfaces</th>
            <th></th>
        </tr>
    </thead>
    <tbody>
        {{#each bridges}}
        <tr>
            <th scope="row">1</th>
            <td>{{id}}</td>
            <td>{{#each interfaces}}{{this}}<br/>{{/each}}</td>
            <td class="align-middle">
                <button type="button" class="btn btn-danger btn-sm" title="Delete bridge" data-action="delete-bridge" data-bridgeid="{{id}}"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
        {{/each}}
    </tbody>
</table>
{{/if}}