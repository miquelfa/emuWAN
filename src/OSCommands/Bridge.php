<?php
    /**
     * Bridge managing relation to OS
     *
     * @author     Miquel Ferrer Amer <miquel@miquelfa.com>
     * @link       http://miquelfa.com
     */
    namespace emuWAN\OSCommands;

    class Bridge extends Base
    {
        private $bridge = null;
        private $interfaces = null;

        function __construct($bridge = null)
        {
            $this->setBridge($bridge);
        }

        private function setBridge($bridge)
        {
            $this->bridge = $bridge;
        }

        private function setInterfaces($interfaces)
        {
            $this->interfaces = $interfaces;
        }

        private function toArray()
        {
            return [
                'id' => $this->bridge,
                'interfaces' => $this->interfaces
            ];
        }

        private function _get()
        {
            $args = sprintf("show %s", $this->bridge);
            $out = $this->execute(Base::BRCTL, $args);
            if (preg_match_all('/\s*([\S]+)$/m', $out, $matches)) {
                $matches = $matches[1];
                unset($matches[0]);
                $this->interfaces = $matches;
            }

            return $this->toArray();
        }

        private function _getList()
        {
            $out = $this->execute(Base::BRCTL, 'show', true);
            if (preg_match_all('/(?<=\n)^([^\s]+)/m', $out, $matches)) {
                return $matches[1];
            }
            return [];
        }

        private function createNew()
        {
            $argss[] = sprintf("addbr %s", $this->bridge);
            foreach($this->interfaces as $interface) {
                $argss[] = sprintf("addif %s %s", $this->bridge, $interface);
            }
            
            foreach ($argss as $args) {
                $this->execute(Base::BRCTL, $args, true);
            }

            if (!in_array($this->bridge, self::getList())) {
                throw new \Exception("Failed on bridge creation");
            }

            return $this->toArray();
        }

        private function delete()
        {
            \emuWAN\OSCommands\NetworkInterface::interfaceStatus($this->bridge, \emuWAN\OSCommands\NetworkInterface::STATUS_DOWN);
            
            $args = sprintf("delbr %s", $this->bridge);
            $out = $this->execute(Base::BRCTL, $args, true);
            $out = shell_exec($args);

            if (strlen($out) || in_array($this->bridge, self::getList())) {
                throw new \Exception("Failed on bridge deletion");
            }

            return true;
        }

        /**
         * Retrieves all the information of a bridge
         * @param   string $bridge      The target bridge
         * @return  array[string]       The bridge details
         */
        public static function get($bridge)
        {
            $simulation = new self($bridge);
            return $simulation->_get();
        }

        /**
         * Retrieves the list of bridges
         * @return  array[string]      The list of bridges
         */
        public static function getList()
        {
            $simulation = new self();
            return $simulation->_getList();
        }

        /**
         * Creates a new bridge
         * @param   string          The bridge name
         * @param   array[string]   The interfaces
         * @return  array[mixed]    The bridge details
         */
        public static function newBridge($bridgeName, $interfaces)
        {
            $bridge = new self($bridgeName);
            $bridge->setInterfaces($interfaces);

            return $bridge->createNew();
        }

        /**
         * Deletes an existing bridge
         * @param   string      The target bridge
         * @return  bool        If the bridge is deleted
         */
        public static function deleteBridge($bridgeName)
        {
            $bridge = new self($bridgeName);
            return $bridge->delete();
        }
    }
?>