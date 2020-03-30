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
        <script src="/vendor/kj/kj.js"></script>
    </head>
    <body>
        <div class="container-fluid d-none" style="margin-top: 20px">
            <div class="row justify-content-center">
                <div class="col-sm-6">
                    <h1>Interfaces</h1>
                </div>
                <div class="col-sm-2 my-auto">
                    <button type="button" class="btn btn-secondary float-right">Refresh</button>
                </div>
            </div>
            
            <div class="row justify-content-center">

            </div>
        </div>

        <div class="loading d-block">
            <div class="container text-center">
                <div class="col" style="margin-top: 30vh;">
                    <div class="spinner-grow" style="width: 3rem; height: 3rem;" role="status">
                        <span class="sr-only">Loading...</span>
                    </div>
                </div>
                <div class="col">
                    <h2>emuWAN</h2>
                </div>
            </div>
        </div>
    </body>

    <script src="/js/emuWAN.js"></script>

    <script type="text/javascript">
    $(function () {
        $('[data-toggle="tooltip"]').tooltip();
    });
    </script>
</html>
