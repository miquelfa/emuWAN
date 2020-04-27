<?php
    /**
     * NetworkInterface managing relation to OS
     *
     * @author     Miquel Ferrer Amer <miquel@miquelfa.com>
     * @link       http://miquelfa.com
     */
    namespace emuWAN\OSCommands;

    class NetworkInterface extends Base
    {
        const STATUS_UP = 'up';
        const STATUS_DOWN = 'down';

        private $interface = null;
        private $status = null;
        private $MTU = null;
        private $MAC = null;
        private $IP4 = null;
        private $bridge = null;
        private $speed = null;

        private $commandShow = null;
        private $commandBridge = null;

        function __construct($interface = null)
        {
            $this->setInterface($interface);
        }

        public function setInterface($interface)
        {
            $this->interface = $interface;
        }

        private function _down()
        {
            try {
                $args = sprintf('link set dev %s down', $this->interface);
                $out = $this->execute(parent::IP, $args, true);
                if (strlen($out))
                    return false;
            } catch (\Exception $e) {
                return false;
            }
            return true;
        }

        private function _up()
        {
            try {
                $args = sprintf('link set dev %s up', $this->interface);
                $out = $this->execute(parent::IP, $args, true);
                if (strlen($out)) 
                    return false;
            } catch (\Exception $e) {
                return false;
            }
            return true;
        }

        private function _flushAddresses()
        {
            try {
                $args = sprintf('addr flush dev %s', $this->interface);
                $out = $this->execute(parent::IP, $args, true);
                if (strlen($out))
                    return false;
            } catch (\Exception $e) {
                return false;
            }
            return true;
        }

        private function _setAddress($address)
        {
            try {
                $args = sprintf('addr add %s dev %s brd +', $address, $this->interface);
                $out = $this->execute(parent::IP, $args, true);
                if (strlen($out))
                    return false;
            } catch (\Exception $e) {
                return false;
            }
            return true;
        }

        private function getCommandShow()
        {
            if (!is_null($this->commandShow)) {
                return $this->commandShow;
            }
            $args = sprintf('a show %s', $this->interface);
            $this->commandShow = $this->execute(parent::IP, $args);
            return $this->commandShow;
        }

        private function getCommandBridge()
        {
            if (!is_null($this->commandBridge)) {
                return $this->commandBridge;
            }
            $this->commandBridge = $this->execute(parent::BRCTL, 'show');
            return $this->commandBridge;
        }

        private function getStatus()
        {
            if (!is_null($this->status)) {
                return $this->status;
            }
            if (preg_match('/state\ ([A-Z]*)/', $this->getCommandShow(), $state)) {
                $this->status = \emuWAN\Tools::toBool($state[1]);
            }
            return $this->status;
        }

        private function getMTU()
        {
            if (!is_null($this->MTU)) {
                return $this->MTU;
            }
            if (preg_match('/mtu\ ([0-9]*)/', $this->getCommandShow(), $mtu)) {
                $this->MTU = $mtu[1];
            }
            return $this->MTU;
        }

        private function getMAC()
        {
            if (!is_null($this->MAC)) {
                return $this->MAC;
            }
            if (preg_match('/link\/ether\ (([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2}))/', $this->getCommandShow(), $mac)) {
                $this->MAC = $mac[1];
            }
            return $this->MAC;
        }

        private function getSpeed()
        {
            if (!is_null($this->speed)) {
                return $this->speed;
            }
            $out = $this->execute(parent::ETHTOOL, $this->interface, true);
            if (preg_match('/Speed\:\ ([0-9]*)/', $out, $speed)) {
                $this->speed = $speed[1];
            }
            return $this->speed;
        }

        private function getIP4()
        {
            if(!is_null($this->IP4)) {
                return $this->IP4;
            }
            if (preg_match('/inet\ (([0-9]{1,3}\.){3}([0-9]{1,3}){1}\/[0-9]{1,2})/', $this->getCommandShow(), $ip4cidr)) {
                $exploded = explode('/', $ip4cidr[1]);
                $this->IP4['status'] = true;
                $this->IP4['CIDR'] = $ip4cidr[1];
                $this->IP4['address'] = $exploded[0];
                $this->IP4['mask'] = $exploded[1];
            }
            if (preg_match('/brd\ (([0-9]{1,3}\.){3}([0-9]{1,3}){1})/', $this->getCommandShow(), $broadcast)) {
                $this->IP4['broadcast'] = $broadcast[1];
            }
            if (!is_null($this->IP4['CIDR'])) {
                if (preg_match('/inet ' . preg_quote($this->IP4['CIDR'], "/") . ' .+ dynamic/', $this->getCommandShow())) {
                    $this->IP4['dynamic'] = true;
                } else {
                    $this->IP4['dynamic'] = false;
                }
            }
            return $this->IP4;
        }

        private function getBridge()
        {
            if (!is_null($this->bridge)) {
                return $this->bridge;
            }
            if (preg_match(sprintf('/^%s/m', $this->interface), $this->getCommandBridge())) {
                $this->bridge['status'] = true;
                $this->bridge['isbridge'] = true;
            }
            if (preg_match(sprintf('/%s$/m', $this->interface), $this->getCommandBridge())) {
                $this->bridge['status'] = true;
                $this->bridge['inbridge'] = true;
            }
            return $this->bridge;
        }

        private function getAllInterfaces()
        {
            $out = $this->execute(parent::IP, 'link show');
            if (!preg_match_all('/^[0-9]*\:\ ([a-z0-9]*)\:\ /m', $out, $interfaces)) {
                throw new \Exception("No interfaces found"); // TODO Handle this
            }

            return $interfaces[1];
        }

        /**
         * Retrieves a list of present interfaces
         * @return      array   The list of interfaces with its detailed information.
         */
        public static function getDeviceInterfaceList()
        {
            $networkInterface = new self();
            return $networkInterface->getAllInterfaces();
        }

        /**
         * Gets all the details of a specific interface
         * @param   string $interface   The interface name to be checked.
         * @return  array               The array populated with interface details.
         */
        public static function getInterfaceDetails($interface)
        {
            $networkInterface = new self($interface);

            $details = [
                'id' => $interface,
                'status' => $networkInterface->getStatus(),
                'mtu' => $networkInterface->getMTU(),
                'MAC' => $networkInterface->getMAC(),
                'speed' => $networkInterface->getSpeed(),
                'IP4' => $networkInterface->getIP4(),
                'bridge' => $networkInterface->getBridge()
            ];

            return $details;
        }

        /**
         * Sets the IP of a specific interface
         * @param   string $interface   The target interface name
         * @param   array[mixed]        Options
         * @return  bool                Wether everything worked or not.
         */
        public static function setParams($interface, $params) 
        {
            $networkInterface = new self($interface);

            if (\emuWAN\Tools::isValidCIDR($params['CIDR']) || $params['CIDR'] === false) {
                if (!$networkInterface->_flushAddresses()) {
                    return false;
                }
            }

            if (\emuWAN\Tools::isValidCIDR($params['CIDR'])) {
                if (!$networkInterface->_setAddress($params['CIDR'])) {
                    return false;
                }
            }

            if ($params['DHCP']) {
                if (!$networkInterface->_down() || !$networkInterface->_up()) {
                    return false;
                }
                sleep(DHCP_DELAY); // To ensure DHCP request is fullfiled
            }

            return true;
        }

        /**
         * Changes the status of the target interface
         * @param   string $interface   The target interface name
         * @param   string $status      The desired status
         * @return  bool                Whether success or not
         */
        public static function interfaceStatus($interface, $status)
        {
            $networkInterface = new self($interface);
            if ($status == self::STATUS_UP) {
                if ($res = $networkInterface->_up()) {
                    sleep(DHCP_DELAY);
                }
                return $res;
            }
            if ($status == self::STATUS_DOWN) {
                return $networkInterface->_down();
            }
            return false;
        }
    }
?>