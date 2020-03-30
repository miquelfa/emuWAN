<?php
    /**
     * Response API class
     *
     * @author     Miquel Ferrer Amer <miquel@miquelfa.com>
     * @link       http://miquelfa.com
     */
    namespace emuWAN;

    class APIResponse extends Response
    {
        private $success = NULL;
        private $errors = [];
        private $response = [];

        function __construct()
        {
            parent::__construct();
            $this->setType(parent::TYPE_PLAIN);
        }

        public function setSuccess($success)
        {
            $this->success = (bool) $success;
        }

        public function add($array)
        {
            $this->response[] = $array;
        }

        public function set($array)
        {
            $this->response = $array;
        }

        public function addError($array)
        {
            $this->errors[] = $array;
        }

        public function send()
        {
            $response = [
                'success' => $this->success
            ];

            if (!$this->success) {
                $response['errors'] = $this->errors;
            } else {
                $response['response'] = $this->response;
            }

            parent::set(json_encode($response));

            parent::send();
        }
    }
?>