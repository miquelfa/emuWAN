<?php
    /**
     * App configuration parameters
     *
     * @author     Miquel Ferrer Amer <miquel@miquelfa.com>
     * @link       http://miquelfa.com
     */

    // App debug mode
    define("DEBUG", false);

    // DHCP response time delay (in seconds)
    define("DHCP_DELAY", 5);

    // Bin files for required packets
    define("BIN_BRCTL", '/sbin/brctl');
    define("BIN_TC", '/sbin/tc');
    define("BIN_IP", '/bin/ip');
    define("BIN_ETHTOOL", '/sbin/ethtool');
?>