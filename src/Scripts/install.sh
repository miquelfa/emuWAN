



# Install and check all required packages
# ip -V
# ethtool --version
# dhclient -v
# brctl -V              // bridge utils

# Add permissions to visudo
#   Find binary of ethtool      |   Add line to file
#   which ethtool               |   {{user}}    ALL=NOPASSWD: {{bin}}
#   Find binary of ip           |   Add line to file
#   which ip                    |   {{user}}    ALL=NOPASSWD: {{bin}}
#   Find binary of tc           |   Add line to file
#   which tc                    |   {{user}}    ALL=NOPASSWD: {{bin}}
#   Find binary of whoami       |   Add line to file
#   which whoami                |   {{user}}    ALL=NOPASSWD: {{bin}}

/**********************NOOOOOOOOOOOO**************************/
#   Find binary of dhclient     |   Add line to file
#   which dhclient              |   {{user}}    ALL=NOPASSWD: {{bin}}
/**********************/NOOOOOOOOOOOO*************************/

# Enable packet forwarding:
# su -c "echo 1 > /proc/sys/net/ipv4/ip_forward"

# Be sure ufw is disabled