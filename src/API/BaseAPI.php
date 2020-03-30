<?php
    /**
     * API Simulation class
     *
     * @author     Miquel Ferrer Amer <miquel@miquelfa.com>
     * @link       http://miquelfa.com
     */
    namespace emuWAN\API;

    class BaseAPI
    {
        protected $app = null;
        protected $interface = null;

        function __construct()
        {
            $this->app = \emuWAN\API\API::getInstance();
            $this->interface = \emuWAN\Tools::getArrayValue($_GET, 'id');
        }

        protected function checkInterface()
        {
            if (!$this->isValidInterface()) {
                $app = \emuWAN\API\API::getInstance();
                $app->getResponse()->setSuccess(false);
                $app->getResponse()->addError(['invalid_interface' => 'Invalid target interface']);
                $app->getResponse()->send();
            }
        }

        protected function isValidInterface()
        {
            // Check that the given interface is valid
            if (!in_array($this->interface, \emuWAN\OSCommands\NetworkInterface::getDeviceInterfaceList())) {
                return false;
            }
            return true;
        }
    }
?>