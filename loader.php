<?php
    /**
     * App loader
     *
     * @author     Miquel Ferrer Amer <miquel@miquelfa.com>
     * @link       http://miquelfa.com
     */

    // Basic folders
    define("FOLDER", dirname(__FILE__));
    define("SRC", FOLDER . DIRECTORY_SEPARATOR . 'src');
    define("PUBLICACCESS", FOLDER . DIRECTORY_SEPARATOR . 'public');

    // Source folders
    define("API", SRC . DIRECTORY_SEPARATOR . 'API' . DIRECTORY_SEPARATOR);
    define("SCRIPTS", SRC . DIRECTORY_SEPARATOR . 'Scripts');
    define("OSCOMMANDS", SRC . DIRECTORY_SEPARATOR . 'OSCommands');

    // Public folders
    define("TEMPLATES", PUBLICACCESS . DIRECTORY_SEPARATOR . 'templates');

    // Include configuration parameters
    include(dirname(__FILE__) . "/config.php" );

    // Autoregister all classes and functions
    spl_autoload_register(function ($class) {
        $class = str_replace("emuWAN\\", "", $class);
        $class = str_replace("\\", DIRECTORY_SEPARATOR, $class);
        $filename = SRC . DIRECTORY_SEPARATOR . $class . ".php";
        include($filename);
    });
?>
