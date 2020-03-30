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
            $this->app->getResponse()->set(['simulation' => $result]);
        }

        public function post()
        {
            $params['delay'] = \emuWAN\Tools::getArrayValue($_POST, 'delay');
            $params['loss'] = \emuWAN\Tools::getArrayValue($_POST, 'loss');
            $params['reorder'] = \emuWAN\Tools::getArrayValue($_POST, 'reorder');

            $fail = false;
            if (strlen($params['delay']) && (!is_numeric($params['delay']) || $params['delay'] < 1)) {
                $this->app->getResponse()->setSuccess(false);
                $this->app->getResponse()->addError(['delay' => 'Invalid delay value']);
                $fail = true;
            }
            if (strlen($params['loss']) && (!is_numeric($params['loss']) || $params['loss'] < 0.5 || $params['loss'] > 100)) {
                $this->app->getResponse()->setSuccess(false);
                $this->app->getResponse()->addError(['loss' => 'Invalid loss value']);
                $fail = true;
            }
            if (strlen($params['reorder']) && (!is_numeric($params['reorder']) || $params['reorder'] < 0.5 || $params['reorder'] > 100)) {
                $this->app->getResponse()->setSuccess(false);
                $this->app->getResponse()->addError(['reorder' => 'Invalid reorder value']);
                $fail = true;
            }

            if ($fail) {
                $this->app->getResponse()->send();
            }

            $res = \emuWAN\OSCommands\Simulation::setSimulation($this->interface, $params);
            $this->app->getResponse()->setSuccess($res);
        }

        public function post_reset()
        {
            $res = \emuWAN\OSCommands\Simulation::reset($this->interface);

            $this->app->getResponse()->setSuccess($res);
        }
    }
?>