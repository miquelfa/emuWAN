<?php
    /**
     * Set of tools and utils
     *
     * @author     Miquel Ferrer Amer <miquel@miquelfa.com>
     * @link       http://miquelfa.com
     */
    namespace emuWAN;

    class Tools
    {
        public static function getArrayValue($array, $key, $default = NULL)
        {
            if (!array_key_exists($key, $array)) {
                return $default;
            }
            return $array[$key];
        }

        public static function toBool($value)
        {
            $trues = [1, 'up', 'true', 'yes', 'y', '1'];
            if (in_array(strtolower(trim($value)), $trues)) {
                return TRUE;
            }
            return FALSE;
        }

        public static function isValidCIDR($cidr)
        {
            $parts = explode('/', $cidr);
            if(count($parts) != 2) {
                return false;
            }

            $ip = $parts[0];
            $netmask = intval($parts[1]);

            if($netmask < 0) {
                return false;
            }

            if(filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
                return $netmask <= 32;
            }

            return false;
        }
    }
?>