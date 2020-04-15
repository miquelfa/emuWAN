<?php
    /**
     * NetworkInterface managing relation to OS
     *
     * @author     Miquel Ferrer Amer <miquel@miquelfa.com>
     * @link       http://miquelfa.com
     */
    namespace emuWAN\OSCommands;

    class NetworkInterface
    {
        private $interface = NULL;

        function __construct($interface)
        {
            $this->setInterface($interface);
        }

        private function setInterface($interface)
        {
            $this->interface = $interface;
        }

        private function _down()
        {
            try {
                $command = sprintf('sudo ip link set dev %s down', $this->interface);
                if (strlen(shell_exec($command))) {
                    return false;
                }
            } catch (\Exception $e) {
                return false;
            }
            return true;
        }

        private function _up()
        {
            try {
                $command = sprintf('sudo ip link set dev %s up', $this->interface);
                if (strlen(shell_exec($command))) {
                    return false;
                }
            } catch (\Exception $e) {
                return false;
            }
            return true;
        }

        private function _flushAddresses()
        {
            try {
                $command = sprintf('sudo ip addr flush dev %s', $this->interface);
                if (strlen(shell_exec($command))) {
                    return false;
                }
            } catch (\Exception $e) {
                return false;
            }
            return true;
        }

        private function _setAddress($address)
        {
            try {
                $command = sprintf('sudo ip addr add %s dev %s brd +', $address, $this->interface);
                if (strlen(shell_exec($command))) {
                    return false;
                }
            } catch (\Exception $e) {
                return false;
            }
            return true;
        }

        /**
         * Retrieves a list of present interfaces
         * @return      array   The list of interfaces with its detailed information.
         */
        public static function getDeviceInterfaceList()
        {
            $out = shell_exec('ip link show');
            if (!preg_match_all('/^[0-9]*\:\ ([a-z0-9]*)\:\ /m', $out, $interfaces)) {
                throw new \Exception("No interfaces found"); // TODO Handle this
            }

            return $interfaces[1];
        }

        /**
         * Gets all the details of a specific interface
         * @param   string $interface   The interface name to be checked.
         * @return  array               The array populated with interface details.
         */
        public static function getInterfaceDetails($interface)
        {
            $details = [
                'id' => $interface,
                'status' => null,
                'mtu' => null,
                'MAC' => null,
                'speed' => null,
                'IP4' => [
                    'status' => false,
                    'CIDR' => null,
                    'address' => null,
                    'mask' => null,
                    'broadcast' => null,
                    'dynamic' => null
                ]
            ];

            $out = shell_exec('ip a show ' . $interface);
            if (preg_match('/state\ ([A-Z]*)/', $out, $state)) {
                $details['status'] = \emuWAN\Tools::toBool($state[1]);
            }
            if (preg_match('/mtu\ ([0-9]*)/', $out, $mtu)) {
                $details['mtu'] = $mtu[1];
            }
            if (preg_match('/link\/ether\ (([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2}))/', $out, $mac)) {
                $details['MAC'] = $mac[1];
            }
            if (preg_match('/inet\ (([0-9]{1,3}\.){3}([0-9]{1,3}){1}\/[0-9]{1,2})/', $out, $ip4cidr)) {
                $exploded = explode('/', $ip4cidr[1]);
                $details['IP4']['status'] = true;
                $details['IP4']['CIDR'] = $ip4cidr[1];
                $details['IP4']['address'] = $exploded[0];
                $details['IP4']['mask'] = $exploded[1];
            }
            if (preg_match('/brd\ (([0-9]{1,3}\.){3}([0-9]{1,3}){1})/', $out, $broadcast)) {
                $details['IP4']['broadcast'] = $broadcast[1];
            }
            if (!is_null($details['IP4']['CIDR'])) {
                if (preg_match('/inet ' . preg_quote($details['IP4']['CIDR'], "/") . ' .+ dynamic/', $out)) {
                    $details['IP4']['dynamic'] = true;
                } else {
                    $details['IP4']['dynamic'] = false;
                }
            }
            $out = shell_exec("sudo ethtool " . $interface);
            if (preg_match('/Speed\:\ ([0-9]*)/', $out, $speed)) {
                $details['speed'] = $speed[1];
            }

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
            if ($status == "up") {
                return $networkInterface->_up();
            }
            if ($status == "down") {
                return $networkInterface->_down();
            }
            return false;
        }
    }
?>