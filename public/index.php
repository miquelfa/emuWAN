<?php
    include( dirname(__FILE__, 2) . DIRECTORY_SEPARATOR . "loader.php" );

    echo file_get_contents(TEMPLATES . DIRECTORY_SEPARATOR . 'index.tpl');
?>