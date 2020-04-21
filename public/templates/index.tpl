<!DOCTYPE html>
<html lang="en">
    <head>
        <title>emuWAN</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="/vendor/bootstrap/css/bootstrap.min.css">

        <link rel="stylesheet" href="/css/style.css">

        <script src="/vendor/jQuery/jquery-3.4.1.min.js"></script>
        <script src="/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
        <script src="/vendor/handlebars/handlebars.min-v4.7.6.js"></script>
        <script defer src="/vendor/fontawesome/all.min.js"></script>
    </head>
    <body>
        <div class="container-fluid" style="margin-top: 20px" id="main-panel">
            <div class="row justify-content-center">
                <div class="col-sm-6">
                    <h1>Interfaces</h1>
                </div>
                <div class="col-sm-2 text-right">
                    <div class="btn-group" role="group">
                        <button id="btnGroupDrop1" type="button" class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i class="fas fa-cog"></i>
                        </button>
                        <div class="dropdown-menu" aria-labelledby="btnGroupDrop1">
                            <a class="dropdown-item" data-action="add-bridge" title="Add new bridge interface" href="#"><i class="fas fa-plus"></i>&nbsp;Add bridge</a>
                            <a class="dropdown-item" data-action="refresh" title="Refresh information"href="#"><i class="fas fa-sync"></i>&nbsp;Refresh</a>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row justify-content-center" id="interface-cards">

            </div>

            <div class="row">
                <div class="col-sm-6">
                    <div id="bridges-container">
                        <div class="text-center" style="margin-top: 10vh;">
                            <div class="spinner-grow text-primary" style="width: 3rem; height: 3rem;" role="status">
                                <span class="sr-only">Loading...</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-sm-6">
                </div>
            </div>
        </div>

        <div id="emuWAN-modal" class="modal fade bd-example-modal-lg" data-backdrop="static" tabindex="-1" role="dialog">
            <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
                <div id="emuWAN-modal-content" class="modal-content">
                    
                </div>
            </div>
        </div>

        <div id="loader" class="loading">
            <div class="container text-center">
                <div class="col" style="margin-top: 30vh;">
                    <div class="spinner-grow text-primary" style="width: 3rem; height: 3rem;" role="status">
                        <span class="sr-only">Loading...</span>
                    </div>
                </div>
                <div class="col text-primary">
                    <h2>emuWAN</h2>
                </div>
            </div>
        </div>
    </body>

    <script src="/js/emuWAN_entities.js"></script>
    <script src="/js/emuWAN.js"></script>
</html>
