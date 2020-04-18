<?php
    /**
     * Response main class
     *
     * @author     Miquel Ferrer Amer <miquel@miquelfa.com>
     * @link       http://miquelfa.com
     */
    namespace emuWAN;

    class Response
    {
        private $type = "HTML";
        private $response = "";

        const TYPE_HTML = "HTML";
        const TYPE_PLAIN = "PLAIN";

        function __construct()
        {
            
        }

        public function setType($type)
        {
            $this->type = $type;
        }

        public function set($response)
        {
            $this->response = $response;
        }

        public function add($response)
        {
            $this->response .= $response;
        }

        public function send()
        {
            if ($this->type == self::TYPE_PLAIN) {
                header("Content-Type: text/plain");
            }

            $this->sendResponse();
            die;
        }

        public function send404()
        {
            if ($this->type == self::TYPE_PLAIN) {
                http_response_code(404);
                die;
            }
        }

        private function sendResponse()
        {
            echo $this->response;
        }
    }
?>