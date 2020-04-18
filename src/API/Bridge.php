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

        public function put()
        {
            $id = $this->getParam('id');
            $interfaces = $this->getParam('interfaces');

            try {
                $bridge = \emuWAN\OSCommands\Bridge::newBridge($id, $interfaces);

                $this->app->getResponse()->setSuccess(true);
                $this->app->getResponse()->set($bridge);
            } catch(\Exception $e) {
                $this->app->getResponse()->setSuccess(false);
                $this->app->getResponse()->addError('bridge', 'Bridge creation failure');
            }
        }

        public function post()
        {

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