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
        <script src="/vendor/mustache/mustache.min.js"></script>
    </head>
    <body>
        <div class="container-fluid" style="margin-top: 20px" id="main-panel">
            <div class="row justify-content-center">
                <div class="col-sm-6">
                    <h1>Interfaces</h1>
                </div>
                <div class="col-sm-2 my-auto">
                    <!-- <button type="button" class="btn btn-primary float-right">Refresh</button> -->
                </div>
            </div>
            
            <div class="row justify-content-center" id="interface-cards">

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

    <script src="/js/emuWAN.js"></script>
</html>
