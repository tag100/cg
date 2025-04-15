#!/bin/bash

###########################
###		Miscellaneous    ##
###########################

##colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
  echo -e "${BLUE}[INFO]:  $1${NC}"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]:  $1${NC}"
}

log_warning() {
  echo -e "${YELLOW}[WARNING]:  $1${NC}"
}

log_error() {
  echo -e "${RED}[ERROR]:  $1${NC}"
}

##check ubuntu version
if ! [ -f /etc/os-release ]
then
	log_error "OS Release not found, Please run on an ubunru system"
	exit 1
else
	##load version info
	source /etc/os-release
fi


if [ ${NAME,,} != ubuntu ]
then
	log_error "This script supports ubuntu only"
	exit 1
fi

if [[ ! $VERSION_ID == 2*.* ]]
then
	log_error "This script runs on ubuntu 22 or upwards"
	exit 1
fi

## Check privileges
if [ "$EUID" -ne 0 ]; then
    log_error "Please run this script as root; run 'sudo su'; then run the script again"
    exit 1
fi

check_error() {
    if [ "$?" -ne 0 ]; then
        log_error "$1"
        exit 1
    fi
}

##ask for domain before run
uip=$(curl -4 ifconfig.me 2> /dev/null)

# log_info "Your vps ip is '$uip'"
# log_info "Please link this ip to your vps first to avoid issues"
log_success "Please enter the domain you want this admin to run on: "
# ##accept into domain variable
read -p "$: " domain

if [ -z "$domain" ]; then
	log_error "No domain was supplied"
	exit 1
else
	log_info "Installing admin panel on 'admin.$domain'"
fi

# updated=0

# while ! $updated; do
# 	##loop till it's updated
# 	curl 
# done


## Update first
log_info "Updating Please hold..."
apt update &> /dev/null

log_info "Update Succesfull"

###########################
###		Install Python   ##
###########################

## Check if python3.12 exists
if ! command -v python3.12 > /dev/null; then
    log_info "Python 3.12 is not installed. Installing...." 
	##add python repo
	add-apt-repository ppa:deadsnakes/ppa -y &> /dev/null
	apt update &> /dev/null
	apt install -y python3.12 &> /dev/null
	check_error "Error installing 'python3.12'"
fi
 
 ## Check if pip3.11 is installed
 if ! python3.12 -m pip &> /dev/null; then
     log_info "Installing pip for your pc version, please hold..."
     if ! apt install -y python3-pip &> /dev/null; then
         log_error "Error installing python3.12 pip"
         exit 1
     fi
     log_success "Successfully installed pip for your pc"
 fi


###########################
###	 Install memcached   ##
###########################

## Install memcached if missing
log_info "Installing dependencies..."

if ! command -v memcached > /dev/null; then
    apt install -y memcached &> /dev/null
    check_error "Error installing memcached. Please get an updated system and retry"
    log_success "Success mem install ..."

    apt install -y libmemcached-tools &> /dev/null
    check_error "Error installing memcached's tools"
    log_success "Success mem-tools installed ..."
else
    systemctl stop memcached
fi

log_info "Configuring mem ..."
## Configure memcached
memcached_config=/etc/memcached.conf

##carefully replace memcache's config
sed -i 's/^-m [0-9]\{1,\}/-m 512/' "$memcached_config"
sed -i 's/^-l .\{1,\}/-l 127.0.0.1/' "$memcached_config"
sed -i 's/^-p [0-9]\{1,\}/-p 11211/' "$memcached_config"


log_success "mem Configured..."

## Enable to start on boot
systemctl enable memcached &> /dev/null
## Start memcached
systemctl start memcached &> /dev/null
check_error "Error starting memcached"

log_info "mem started..."

## Clear up our port 80 against anyone using it
pid=$(lsof -i :80 | awk 'NR==2 {print $2}')

if [ -n "$pid" ]; then
	##ask to kill pid
	log_warning "'$pid' is using our needed port, killing it"

	if [ 1 -eq 1 ]; then
   	 	## If pid is not empty and we are told to kill it
   	 	## Kill the process since we are on root and we have the power
    	kill -9 $pid
    	check_error "Error freeing up our port 80, Please contact your administrator"
    	
    	log_success "kill process success"
    fi
fi


###########################
###	 Install firewall    ##
###########################

log_info "Configuring Firewall"
## Install ufw if missing
if ! command -v ufw > /dev/null; then
	log_warning "UFW Missing, installing"
    apt install -y ufw &> /dev/null
fi

log_info "ufw is installed"

## Here assumes ufw is installed
## Allow ssh
ufw allow ssh > /dev/null

## Allow our own port
ufw allow 80 > /dev/null
ufw allow 443 > /dev/null

if [ "$(ufw status | awk 'NR == 1 { print $2 }')" != "active" ]; then
    ## Enable ufw if not active in state
    echo y | ufw enable &> /dev/null
    log_info "UFW is now $(ufw status | awk 'NR == 1 { print $2 }')"
fi

log_success "UFW Configured..."

## Check if git is installed else install git
if ! command -v git > /dev/null; then
    log_info "Installing git, please be patient"
    apt install -y git &> /dev/null
fi


###########################
###	   Install nginx     ##
###########################
###install our master class nginx

# if ! command -v nginx &> /dev/null || ! command -v certbot &> /dev/null; then
# 	log_info "Ngninx is not installed, Installing"
	
# 	##install nginx along side certbot
# 	apt -y install certbot python3-certbot-nginx nginx &> /dev/null
# fi

# ##nginx & certbot is installed here

# log_warning "Please configure your domain's ssl below"

# ##configure ssl for cerbot
# certbot certonly \
#   --agree-tos \
#   --email someone@example.com \
#   --manual \
#   --preferred-challenges=dns \
#   -d "$domain"  \
#   -d "*.$domain" \
#   --server https://acme-v02.api.letsencrypt.org/directory

# check_error "Error configuring ssl, Please try again & make sure you wait till it works"

# log_success "Ssl successfully configured"

# log_info "Setting up nginx"

# ##override the default nginx config
# if ! [ -f "/etc/nginx/sites-available/default" ]; then
# 	log_error "Error finding defailt nginx conf, exiting"
# 	exit 1
# fi


# cat <<EOF > /etc/nginx/sites-available/default
# server { 
#  listen 80; 
#  listen [::]:80; 
#  server_name *.$domain $domain; 
#  return 301 https://\$host\$request_uri; 
# } 

# server { 
#  listen 443 ssl; 
#  server_name *.$domain $domain; 
#  ssl_certificate /etc/letsencrypt/live/$domain/fullchain.pem; 
#  ssl_certificate_key /etc/letsencrypt/live/$domain/privkey.pem; 
#  ssl_session_cache shared:le_nginx_SSL:10m;
#  ssl_session_timeout 1440m;
#  ssl_session_tickets off;

#  ssl_protocols TLSv1.2 TLSv1.3;
#  ssl_prefer_server_ciphers off;

#  ssl_ciphers "ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384";
#  location / {
# 		proxy_pass http://127.0.0.1:5000;
# 		proxy_set_header Host \$host;
# 		proxy_set_header X-Real-Ip \$remote_addr;
# 		proxy_pass_request_headers on;
#  }
# }
# EOF





###########################
###	   Install  git      ##
###########################

log_info "Git is installed"

## Here means git is installed

##go back to home folder for installation
cd ~ || exit 

check_error "Error switching to home folder"

if [ -d "public" ]; then
    ## Repo exists we just need to pull
    ## To get latest updates
    cd public/ && git pull --ff-only &> /dev/null
else
	##clone to home
    git clone https://gitea.com/trump-donald/public.git &> /dev/null

	check_error "Error cloning our public repo"

	cd public || exit
fi

###########################
###	Install requirements ##
###########################

## Ensure the file saved and truly exists
if ! [ -e "requirements.txt" ]; then
    log_error "Error couldn't find requirements file"
    exit 1
fi

## Run pip to install the requirements
log_info "Installing pip requirements ..."

##set the env to true
export PIP_BREAK_SYSTEM_PACKAGES=1

##prepare setuptools
python3.12 -m pip install --upgrade setuptools &> /dev/null
check_error "Error installing 'setuptools' dependency"

##prepare pkg_config
apt install -y pkg-config &> /dev/null
check_error "Error installing 'pkg_config'"

##install libxml
apt install -y libxml2 libxml2-dev &> /dev/null
check_error "Error installing libxml2"

pip_error=$(python3.12 -m pip install --force-reinstall --ignore-installed -r requirements.txt 2>&1 > /dev/null)
check_error "pip error ----> '$pip_error'"

## Check if setup.py exists
if ! [ -e "start.py" ]; then
    log_error "Can't find the setup script, please contact your administrator and try again"
    exit 1
fi


###########################
###		Start	         ##
###########################

## Run the setup script
##and then disconnect
python3.12 start.py > .log 2>&1 &


#disown the terminall to run independelty
# disown

if [ $? -eq 0 ]; then
	##final message
cat <<EOF
					++++ Admin installed successfully +++				

|-----------------------------------------------------------------------|
|Admin Panel Url	|	https://admin.$domain
|-----------------------------------------------------------------------|


|--------------------------------------------------|
[ .  Update these records into your cf domain      ]
|--------------------------------------------------|
| . Type  | . Name  | .   Value      | . proxied   |
|--------------------------------------------------|
| . A     |    @    |  $uip  | .   yes    |
|---------------------------------------------------|
| . A     |    *    |  $uip  | .   yes    |
|---------------------------------------------------|
|                                                   |
|    Success You can quit the ssh now               |
|                                                   |
|---------------------------------------------------|

Important:
1.) Make sure your 'I'm under attack' is not on
2.) Make sure Security -> Settings -> Security Level is anything below 'Im under attack'
EOF
else
    log_error "An error occurred starting your setup script"
fi




