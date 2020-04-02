<?php
    /**
     * API Interface class
     *
     * @author     Miquel Ferrer Amer <miquel@miquelfa.com>
     * @link       http://miquelfa.com
     */
    namespace emuWAN\API;

    class NetworkInterface extends BaseAPI
    {
        public function get()
        {
            $app = \emuWAN\API\API::getInstance();

            if (is_null($this->interface)) {
                $response = $this->getAllInterfaces();
                $app->getResponse()->setSuccess(true);
                $app->getResponse()->set($response);
                return true;
            }
            
            $response = $this->getInterface();
            if ($response === FALSE) {
                $app->getResponse()->setSuccess(false);
            } else {
                $app->getResponse()->setSuccess(true);
                $app->getResponse()->set($response);
            }
        }

        private function getAllInterfaces()
        {
            $response = [];

            foreach (\emuWAN\OSCommands\NetworkInterface::getDeviceInterfaceList() as $interface) {
                if ($interface == 'lo') continue;
                $response[] = \emuWAN\OSCommands\NetworkInterface::getInterfaceDetails($interface);
            }

            return $response;
        }

        private function getInterface()
        {
            $this->checkInterface();
            $response = [];

            $response = \emuWAN\OSCommands\NetworkInterface::getInterfaceDetails($this->interface);

            return $response;
        }
    }
?>