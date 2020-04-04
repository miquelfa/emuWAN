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
                if ($response === false) {
                    $app->getResponse()->setSuccess(false);
                    $app->getResponse()->addError(['interfaces' => 'No interfaces found']);
                    return;
                }
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

            try {
                $interfaces = \emuWAN\OSCommands\NetworkInterface::getDeviceInterfaceList();
            } catch (\Exception $e) {
                return false;
            }

            foreach ($interfaces as $interface) {
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