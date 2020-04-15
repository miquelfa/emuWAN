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
        protected $params = null;

        function __construct()
        {
            $this->app = \emuWAN\API\API::getInstance();
            $this->interface = \emuWAN\Tools::getArrayValue($_GET, 'id');
            $this->fillParams();
        }

        protected function checkInterface()
        {
            if (!is_null($this->interface)) {
                return;
            }

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

        private function fillParams()
        {
            $params = json_decode(file_get_contents('php://input'), true);
            $this->params = is_null($params) ? [] : $params;
        }

        protected function getParam($param, $default = null)
        {
            return \emuWAN\Tools::getArrayValue($this->params, $param, $default);
        }
    }
?>