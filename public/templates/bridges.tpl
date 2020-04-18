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
        {{#this}}
        <tr>
            <th scope="row">1</th>
            <td>{{id}}</td>
            <td>{{#each interfaces}}{{this}}<br/>{{/each}}</td>
            <td>button</td>
        </tr>
        {{/this}}
    </tbody>
</table>