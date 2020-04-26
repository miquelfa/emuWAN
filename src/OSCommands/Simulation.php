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
        private $interface = null;
        private $delay = null;
        private $delayVariation = null;
        private $loss = null;
        private $lossCorrelation = null;
        private $reorder = null;
        private $reorderCorrelation = null;

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

        private function setDelayVariation($delayVariation)
        {
            if (is_null($this->delay)) {
                throw new \Exception("Delay variation cannot be set without a valid delay value");
            }
            $this->delayVariation = $delayVariation;
        }

        private function setLossCorrelation($lossCorrelation)
        {
            if (is_null($this->loss)) {
                throw new \Exception("Loss correlation cannot be set without a valid delay loss");
            }
            $this->lossCorrelation = $lossCorrelation;
        }

        private function setReorderCorrelation($reorderCorrelation)
        {
            if (is_null($this->reorder)) {
                throw new \Exception("Reorder correlation cannot be set without a valid reorder value");
            }
            $this->reorderCorrelation = $reorderCorrelation;
        }

        private function getSimulation()
        {
            $status = !is_null($this->delay) || !is_null($this->loss) || !is_null($this->reorder);
            return [
                'id' => $this->interface,
                'status' => $status,
                'delay' => $this->delay,
                'delayVariation' => $this->delayVariation,
                'loss' => $this->loss,
                'lossCorrelation' => $this->lossCorrelation,
                'reorder' => $this->reorder,
                'reorderCorrelation' => $this->reorderCorrelation
            ];
        }

        private function _get()
        {
            try {
                $command = sprintf("%s qdisc show dev %s", BIN_TC, $this->interface);
                $out = shell_exec($command);
                if (preg_match('/delay\ *([0-9\.]*)ms/', $out, $delay)) {
                    $this->delay = (float) $delay[1];
                }
                if (preg_match('/delay\ *[0-9\.]*ms\ *([0-9\.]*)ms/', $out, $delayVariation)) {
                    $this->delayVariation = (float) $delayVariation[1];
                }
                if (preg_match('/loss\ *([0-9\.]*)\%/', $out, $loss)) {
                    $this->loss = (float) $loss[1];
                }
                if (preg_match('/loss\ *[0-9\.]*\%\ *([0-9\.]*)\%/', $out, $lossCorrelation)) {
                    $this->lossCorrelation = (float) $lossCorrelation[1];
                }
                if (preg_match('/reorder\ *([0-9\.]*)\%/', $out, $reorder)) {
                    $this->reorder = (float) $reorder[1];
                }
                if (preg_match('/reorder\ *[0-9\.]*\%\ *([0-9\.]*)\%/', $out, $reorderCorrelation)) {
                    $this->reorderCorrelation = (float) $reorderCorrelation[1];
                }
            } catch(\Exception $e) {
                return false;
            }

            return $this->getSimulation();
        }

        private function _reset()
        {
            try {
                $command = sprintf("sudo %s qdisc del dev %s root", BIN_TC, $this->interface);
                shell_exec($command);
                return true;
            } catch (\Exception $e) {
                return false;
            }
        }

        private function buildCommand()
        {
            $command = sprintf("sudo %s qdisc add dev %s root netem", BIN_TC, $this->interface);

            if (!is_null($this->delay)) {
                $command .= sprintf(" delay %dms", $this->delay);
                if (!is_null($this->delayVariation)) {
                    $command .= sprintf(" %dms distribution normal", $this->delayVariation);
                }
            }
            if (!is_null($this->reorder)) {
                if (!is_null($this->delay)) {
                    $command .= sprintf(" reorder %d%%", $this->reorder);
                } else {
                    $command .= sprintf(" delay 10ms reorder %d%%", $this->reorder);
                }
                if (!is_null($this->reorderCorrelation)) {
                    $command .= sprintf(" %d%%", $this->reorderCorrelation);
                }
            }
            if (!is_null($this->loss)) {
                $command .= sprintf(" loss %d%%", $this->loss);
                if (!is_null($this->lossCorrelation)) {
                    $command .= sprintf(" %d%%", $this->lossCorrelation);
                }
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
            if (strlen($params['delayVariation']) && is_numeric($params['delayVariation'])) {
                $simulation->setDelayVariation((int) $params['delayVariation']);
            }
            if (strlen($params['lossCorrelation']) && is_numeric($params['lossCorrelation'])) {
                $simulation->setLossCorrelation((float) $params['lossCorrelation']);
            }
            if (strlen($params['reorderCorrelation']) && is_numeric($params['reorderCorrelation'])) {
                $simulation->setReorderCorrelation((float) $params['reorderCorrelation']);
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