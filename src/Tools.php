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
            if (in_array(strtolower($value), $trues)) {
                return TRUE;
            }
            return FALSE;
        }
    }
?>