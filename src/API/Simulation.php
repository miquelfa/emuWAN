<?php
    /**
     * API Simulation class
     *
     * @author     Miquel Ferrer Amer <miquel@miquelfa.com>
     * @link       http://miquelfa.com
     */
    namespace emuWAN\API;

    class Simulation extends BaseAPI
    {
        function __construct()
        {
            parent::__construct();
            $this->checkInterface();
        }

        public function get()
        {
            $result = \emuWAN\OSCommands\Simulation::get($this->interface);

            if (!$result) {
                $app->getResponse()->setSuccess(FALSE);
                return;
            }
            
            $this->app->getResponse()->setSuccess(TRUE);
            $this->app->getResponse()->set($result);
        }

        public function post()
        {
            $params['delay'] = $this->getParam('delay');
            $params['delayVariation'] = $this->getParam('delayVariation');
            $params['loss'] = $this->getParam('loss');
            $params['lossCorrelation'] = $this->getParam('lossCorrelation');
            $params['reorder'] = $this->getParam('reorder');
            $params['reorderCorrelation'] = $this->getParam('reorderCorrelation');

            if (strlen($params['delay']) && (!is_numeric($params['delay']) || $params['delay'] < 1)) {
                $this->app->getResponse()->addError('delay', 'Invalid delay value');
            }
            if (strlen($params['delayVariation']) && (!is_numeric($params['delayVariation']) || $params['delayVariation'] < 1)) {
                $this->app->getResponse()->addError('delayVariation', 'Invalid delay value');
            }
            if (strlen($params['loss']) && (!is_numeric($params['loss']) || $params['loss'] < 0.5 || $params['loss'] > 100)) {
                $this->app->getResponse()->addError('loss', 'Invalid loss value');
            }
            if (strlen($params['lossCorrelation']) && (!is_numeric($params['lossCorrelation']) || $params['lossCorrelation'] < 0.5 || $params['lossCorrelation'] > 100)) {
                $this->app->getResponse()->addError('lossCorrelation', 'Invalid loss value');
            }
            if (strlen($params['reorder']) && (!is_numeric($params['reorder']) || $params['reorder'] < 0.5 || $params['reorder'] > 100)) {
                $this->app->getResponse()->addError('reorder', 'Invalid reorder value');
            }
            if (strlen($params['reorderCorrelation']) && (!is_numeric($params['reorderCorrelation']) || $params['reorderCorrelation'] < 0.5 || $params['reorderCorrelation'] > 100)) {
                $this->app->getResponse()->addError('reorderCorrelation', 'Invalid reorder value');
            }
            if (strlen($params['delayVariation']) && !strlen($params['delay'])) {
                $this->app->getResponse()->addError('delay', 'Delay variation requires a valid delay');
            }
            if (strlen($params['lossCorrelation']) && !strlen($params['loss'])) {
                $this->app->getResponse()->addError('loss', 'Loss correlation requires a valid loss');
            }
            if (strlen($params['reorderCorrelation']) && !strlen($params['reorder'])) {
                $this->app->getResponse()->addError('reorder', 'Reorder correlation requires a valid reorder');
            }

            if ($this->app->getResponse()->hasErrors()) {
                $this->app->getResponse()->setSuccess(false);
                $this->app->getResponse()->send();
            }

            try {
                $res = \emuWAN\OSCommands\Simulation::setSimulation($this->interface, $params);
                if (!$res) {
                    $app->getResponse()->setSuccess(FALSE);
                    return;
                }
                $result = \emuWAN\OSCommands\Simulation::get($this->interface);
                if (!$result) {
                    $app->getResponse()->setSuccess(FALSE);
                    return;
                }
    
                $this->app->getResponse()->setSuccess($res);
                $this->app->getResponse()->set($result);
            } catch (\Exception $e) {
                $this->app->getResponse()->setSuccess(false);
                $this->app->getResponse()->addError('', $e->getMessage());
            }
            
        }

        public function post_reset()
        {
            $res = \emuWAN\OSCommands\Simulation::reset($this->interface);
            if (!$res) {
                $app->getResponse()->setSuccess(FALSE);
                return;
            }

            $result = \emuWAN\OSCommands\Simulation::get($this->interface);
            if (!$result) {
                $app->getResponse()->setSuccess(FALSE);
                return;
            }

            $this->app->getResponse()->setSuccess($res);
            $this->app->getResponse()->set($result);
        }
    }
?>