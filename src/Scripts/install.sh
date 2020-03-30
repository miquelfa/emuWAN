



# Install and check all required packages
# Check ip -v

# Check ethtool --version

# Add permissions to visudo
#   Find binary of ethtool      |   Add line to file
#   tail -a ethtool             |   {{user}}    ALL=NOPASSWD: {{bin}}
#   Find binary of ip           |   Add line to file
#   tail -a ip                  |   {{user}}    ALL=NOPASSWD: {{bin}}
#   Find binary of whomai       |   Add line to file
#   tail -a whoami              |   {{user}}    ALL=NOPASSWD: {{bin}}

# Enable packet forwarding:
# su -c "echo 1 > /proc/sys/net/ipv4/ip_forward"