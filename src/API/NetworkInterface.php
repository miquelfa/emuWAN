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
            if (is_null($this->interface)) {
                $response = $this->getAllInterfaces();
                if ($response === false) {
                    $this->app->getResponse()->setSuccess(false);
                    $this->app->getResponse()->addError('interfaces', 'No interfaces found');
                    return;
                }
                $this->app->getResponse()->setSuccess(true);
                $this->app->getResponse()->set($response);
                return true;
            }
            
            $response = $this->getInterface();
            if ($response === false) {
                $this->app->getResponse()->setSuccess(false);
            } else {
                $this->app->getResponse()->setSuccess(true);
                $this->app->getResponse()->set($response);
            }
        }

        public function post()
        {
            $this->checkInterface();

            $params['CIDR'] = strlen($cidr = $this->getParam('CIDR')) ? $cidr : false;
            $params['DHCP'] = \emuWAN\Tools::toBool($this->getParam('DHCP'));

            if (strlen($params['CIDR']) && !\emuWAN\Tools::isValidCIDR($params['CIDR'])) {
                $this->app->getResponse()->addError('CIDR', 'Invalid CIDR');
            }
            if ($params['CIDR'] !== false && $params['DHCP'] == true) {
                $this->app->getResponse()->addError('CIDR', 'If DHCP is active, CIDR must be empty');
            }

            if ($this->app->getResponse()->hasErrors()) {
                $this->app->getResponse()->setSuccess(false);
                return;
            }

            $result = \emuWAN\OSCommands\NetworkInterface::setParams($this->interface, $params);
            if (!$result) {
                $this->app->getResponse()->setSuccess(false);
                // TODO add errors
            }

            if (!$response = $this->getInterface()) {
                $this->app->getResponse()->setSuccess(true);
                return;
            }

            $this->app->getResponse()->setSuccess(true);
            $this->app->getResponse()->set($response);
        }

        public function post_status()
        {
            $this->checkInterface();
            $status = $this->getParam('status');

            if ($status != "up" && $status != "down") {
                $this->app->getResponse()->setSuccess(false);
                return;
            }

            if (!\emuWAN\OSCommands\NetworkInterface::interfaceStatus($this->interface, $status)) {
                $app->getResponse()->setSuccess(false);
                return;
            }

            if (!$response = $this->getInterface()) {
                $this->app->getResponse()->setSuccess(true);
                return;
            }

            $this->app->getResponse()->setSuccess(true);
            $this->app->getResponse()->set($response);
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
