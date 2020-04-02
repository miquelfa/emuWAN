<?php
    /**
     * App class manager
     *
     * @author     Miquel Ferrer Amer <miquel@miquelfa.com>
     * @link       http://miquelfa.com
     */
    namespace emuWAN\API;
    
    class API
    {
        private $response = null;
        private $method = null;
        private $endpoint = null;
        private $action = null;

        private static $instance = null;

        const METHOD_POST = 'POST';
        const METHOD_GET = 'GET';
        const ENDPOINTS = [
            'networkinterface' => 'NetworkInterface',
            'simulation'       => 'Simulation'
        ];

        /**
         * Class constructor. Locates, validates and executes request method
         */
        function __construct($isAPI = false)
        {
            $this->response = new \emuWAN\APIResponse();
        }

        /**
         * Sends headers and response payload
         */
        public function getResponse()
        {
            return $this->response;
        }

        public function execute()
        {
            $this->validateHTTPMethod();
            $this->validateEndpoint();
            $this->validateAction();

            $action = '' . $this->action;
            $this->endpoint->$action();
        }

        /**
         * Validates HTTP method or stops execution
         */
        private function validateHTTPMethod()
        {
            if (!in_array($method = $_SERVER['REQUEST_METHOD'], self::getValidHTTPMethods())) {
                throw new \Exception("Method is invalid"); // TODO: should send response HTTP error code
            }
            $this->method = $method;
        }

        /**
         * Validates API endpoint or stops execution
         */
        private function validateEndpoint()
        {
            $requestedendpoint = \emuWAN\Tools::getArrayValue($_GET, 'endpoint');
            $endpoint = \emuWAN\Tools::getArrayValue(self::ENDPOINTS, $requestedendpoint);
            if (is_null($endpoint)) {
                throw new \Exception("Endpoint is invalid"); // TODO: should send response HTTP error code
            }
            $endpoint = "\\emuWAN\API\\" . $endpoint;
            $this->endpoint = new $endpoint();
        }

        /**
         * Validates API action
         */
        private function validateAction()
        {
            $requestedaction = \emuWAN\Tools::getArrayValue($_GET, 'action');
            $action = strlen($requestedaction) ? $this->method . '_' . $requestedaction : $this->method;
            if (!method_exists($this->endpoint, $action)) {
                throw new \Exception("Action is invalid"); // TODO: should send response HTTP error code
            }
            $this->action = $action;
        }

        public static function getInstance()
        {
            if (is_null(self::$instance)) {
                self::$instance = new API();
            }
            return self::$instance;
        }

        /**
         * Returns all valid HTTP Methods
         */
        public static function getValidHTTPMethods()
        {
            return [
                self::METHOD_POST,
                self::METHOD_GET
            ];
        }
    }
?>