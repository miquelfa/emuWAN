<?php
    /**
     * Simulation managing relation to OS
     *
     * @author     Miquel Ferrer Amer <miquel@miquelfa.com>
     * @link       http://miquelfa.com
     */
    namespace emuWAN\OSCommands;

    class Simulation
    {
        private $interface = NULL;
        private $delay = NULL;
        private $loss = NULL;
        private $reorder = NULL;

        function __construct($interface)
        {
            $this->setInterface($interface);
        }

        private function setInterface($interface)
        {
            $this->interface = $interface;
        }

        private function setDelay($delay)
        {
            $this->delay = $delay;
        }

        private function setLoss($loss)
        {
            $this->loss = $loss;
        }

        private function setReorder($reorder)
        {
            $this->reorder = $reorder;
        }

        private function getSimulation()
        {
            $status = !is_null($this->delay) || !is_null($this->loss) || !is_null($this->reorder);
            return [
                'id' => $this->interface,
                'status' => $status,
                'delay' => $this->delay,
                'loss' => $this->loss,
                'reorder' => $this->reorder
            ];
        }

        private function _get()
        {
            try {
                $command = sprintf("tc qdisc show dev %s", $this->interface);
                $out = shell_exec($command);
                if (preg_match('/delay\ ([0-9\.]*)ms/', $out, $delay)) {
                    $this->delay = (float) $delay[1];
                }
                if (preg_match('/loss\ ([0-9\.]*)\%/', $out, $loss)) {
                    $this->loss = (float) $loss[1];
                }
                if (preg_match('/reorder\ ([0-9\.]*)\%/', $out, $reorder)) {
                    $this->reorder = (float) $reorder[1];
                }
            } catch(\Exception $e) {
                return false;
            }

            return $this->getSimulation();
        }

        private function _reset()
        {
            try {
                $command = sprintf("sudo tc qdisc del dev %s root", $this->interface);
                shell_exec($command);
                return true;
            } catch (\Exception $e) {
                return false;
            }
        }

        private function buildCommand()
        {
            $command = sprintf("sudo tc qdisc add dev %s root netem", $this->interface);

            if (!is_null($this->delay)) {
                $command .= sprintf(" delay %sms", $this->delay);
            }
            if (!is_null($this->reorder) && !is_null($this->delay)) {
                $command .= sprintf(" reorder %s%%", $this->reorder);
            } elseif (!is_null($this->reorder) && is_null($this->delay)) {
                $command .= sprintf(" delay 10ms reorder %s%%", $this->reorder);
            }
            if (!is_null($this->loss)) {
                $command .= sprintf(" loss %s%%", $this->loss);
            }

            return $command;
        }

        private function execute()
        {
            try {
                $command = $this->buildCommand();
                $this->_reset();
                shell_exec($command);
                return true;
            } catch (\Exception $e) {
                return false;
            }
        }

        /**
         * Retrieves all the information of a running simulation
         * @param   string $interface   The target interface
         */
        public static function get($interface)
        {
            $simulation = new self($interface);
            return $simulation->_get();
        }

        /**
         * Sets all the parameters of a simulation
         * @param   string $interface       The target interface
         * @param   array[mixed] $params    The simulation parameters
         * @return  bool                    Whether command successful or not
         */
        public static function setSimulation($interface, $params)
        {
            $simulation = new self($interface);
            if (strlen($params['delay']) && is_numeric($params['delay'])) {
                $simulation->setDelay((int) $params['delay']);
            }
            if (strlen($params['loss']) && is_numeric($params['loss'])) {
                $simulation->setLoss((float) $params['loss']);
            }
            if (strlen($params['reorder']) && is_numeric($params['reorder'])) {
                $simulation->setReorder((float) $params['reorder']);
            }
            return $simulation->execute();
        }

        /**
         * Resets all simulation params in a interface
         * @param   string $interface   The target interface
         * @return  bool                Whether command successful or not
         */
        public static function reset($interface)
        {
            $simulation = new self($interface);
            return $simulation->_reset();
        }
    }
?>