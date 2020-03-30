<?php
    include( dirname(__FILE__, 2) . DIRECTORY_SEPARATOR . "loader.php" );

    $app = emuWAN\API\API::getInstance();
    try{
        $app->execute();
    } catch (\Exception $e) {
        $app->getResponse()->setSuccess(FALSE);
        $app->getResponse()->add(['FatalError' => TRUE, 'Message' => $e->getMessage()]);
    }

    $app->getResponse()->send();    
?>