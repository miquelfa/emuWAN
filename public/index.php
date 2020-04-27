<?php
    // Include loader and all required classes
    include( dirname(__FILE__, 2) . DIRECTORY_SEPARATOR . "loader.php" );

    // Check App Initialisation requirements
    $error = '';
    $command = new \emuWAN\OSCommands\Base();
    // Check if all binaries are found
    if (!$command->checkAllBinaries()) {
        $error = "<p class=\"card-text\">Not all binaries are present!!</p>";
    }
    // Check if routing is enabled
    if (CHECK_ROUTING) {
        $command->execute(\emuWAN\OSCommands\Base::CAT, '/proc/sys/net/ipv4/ip_forward', false, $out);
        if (!\emuWAN\Tools::toBool($out)) {
            $error = "<p class=\"card-text\">Routing is not enabled, try running the following command from a shell console:</p>";
            $error .= "<p class=\"card-text text-monospace\">su -c \"echo 1 > /proc/sys/net/ipv4/ip_forward\"</p>";
        }
    }
    // Process errors on Initialisation checks
    if (strlen($error)) {
        $html = file_get_contents(TEMPLATES . DIRECTORY_SEPARATOR . 'failure.tpl');
        $html = str_replace('<ERROR_MESSAGE>', $error, $html);
        echo $html;
        die;
    }

    // Initialize app
    echo file_get_contents(TEMPLATES . DIRECTORY_SEPARATOR . 'index.tpl');
?>