<?php
    /**
     * API Bridge class
     *
     * @author     Miquel Ferrer Amer <miquel@miquelfa.com>
     * @link       http://miquelfa.com
     */
    namespace emuWAN\API;

    class Bridge extends BaseAPI
    {
        function __construct()
        {
            parent::__construct();
        }

        public function get()
        {
            if (is_null($this->interface)) {
                $res = $this->getList();
                if ($res === false) {    
                    $this->app->getResponse()->setSuccess(false);
                    $this->app->getResponse()->addError('bridges', 'No bridges found');
                    return;
                }
                $this->app->getResponse()->setSuccess(true);
                $this->app->getResponse()->set($res);
            }
        }

        // TODO: Is not validating if bridge already exists or interfaces exist.
        public function put()
        {
            $name = $this->getParam('name');
            $interfaces = $this->getParam('interfaces', []);

            if (!strlen($name)) {
                $this->app->getResponse()->addError('name', 'Name shall not be empty');
            }
            if (!count($interfaces) || count($interfaces) < 2) {
                $this->app->getResponse()->addError('interfaces', 'The bridge needs at least two interfaces');
            }

            if ($this->app->getResponse()->hasErrors()) {
                $this->app->getResponse()->setSuccess(false);
                return;
            }

            try {
                $bridge = \emuWAN\OSCommands\Bridge::newBridge($name, $interfaces);

                $this->app->getResponse()->setSuccess(true);
                $this->app->getResponse()->set($bridge);
            } catch(\Exception $e) {
                $this->app->getResponse()->setSuccess(false);
                $this->app->getResponse()->addError('bridge', 'Bridge creation failure');
            }
        }

        public function delete()
        {
            try {
                $bridge = \emuWAN\OSCommands\Bridge::deleteBridge($this->interface);
                $this->app->getResponse()->setSuccess(true);
            } catch(\Exception $e) {
                $this->app->getResponse()->setSuccess(false);
                $this->app->getResponse()->addError('bridge', 'Bridge deletion failure');
            }
        }

        private function getList()
        {
            try {
                $bridges = \emuWAN\OSCommands\Bridge::getList();
                if (!count($bridges)) {
                    return false;
                }
            
                foreach ($bridges as $k => $bridge) {
                    $bridges[$k] = \emuWAN\OSCommands\Bridge::get($bridge);
                    if ($bridges[$k] === false) {
                        return false;
                    }
                }

                return $bridges;
            } catch (\Exception $e) {
                return false;
            }
        }
    }
?>