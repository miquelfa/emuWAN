<?php
    /**
     * Base class managing relation to OS
     *
     * @author     Miquel Ferrer Amer <miquel@miquelfa.com>
     * @link       http://miquelfa.com
     */
    namespace emuWAN\OSCommands;

    class Base
    {
        const IP = BIN_IP;
        const TC = BIN_TC;
        const ETHTOOL = BIN_ETHTOOL;
        const BRCTL = BIN_BRCTL;
        const COMMAND = 'command';
        const CAT = 'cat';

        public function checkAllBinaries()
        {
            try {
                foreach ($this->getAllBinaries() as $binary) {
                    $arg = sprintf("-v %s", $binary);
                    $out = $this->execute(self::COMMAND, $arg);
                    if (!strlen($out)) {
                        return false;
                    }
                }
            } catch (\Exception $e) {
                return false;
            }
            return true;
        }

        /**
         * Executes an OS command
         * @param string    $binary     The program to be executed
         * @param string    $arguments  The arguments to be passed
         * @param bool      $sudo       Whether execution must be in superuser
         * @return string               The full output
         */
        public function execute($binary, $arguments, $sudo = false)
        {
            if (!in_array($binary, $this->getAllBinaries())) {
                throw new \Exception("Invalid binary");
            }

            $command = $sudo ? 'sudo ' : '';
            $command .= $binary . ' ' . $arguments;
            return shell_exec($command);
        }

        /**
         * Returns an array of binaries
         * @return array[string]        The array of binaries
         */
        public function getAllBinaries()
        {
            return [
                self::BRCTL,
                self::TC,
                self::IP,
                self::ETHTOOL,
                self::COMMAND,
                self::CAT
            ];
        }
    }
?>