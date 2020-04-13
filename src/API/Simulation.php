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
            $params['loss'] = $this->getParam('loss');
            $params['reorder'] = $this->getParam('reorder');

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