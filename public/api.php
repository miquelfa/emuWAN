<?php
    include( dirname(__FILE__, 2) . DIRECTORY_SEPARATOR . "loader.php" );

    $app = emuWAN\API\API::getInstance();
    try{
        $app->execute();
    } catch (\Exception $e) {
        $app->getResponse()->send404();
    }

    $app->getResponse()->send();    
?>