#!/bin/bash

set -e

echo "==== Updating system packages ===="
sudo apt update && sudo apt upgrade -y

echo "==== Installing essential packages ===="
sudo apt install -y nginx curl git ufw build-essential

echo "==== Installing Node.js (LTS 20) ===="
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

echo "==== Installing PM2 globally ===="
sudo npm install -g pm2

echo "==== Installing Redis ===="
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
sudo sed -i "s/^bind .*/bind 127.0.0.1 -::1/" /etc/redis/redis.conf
sudo systemctl restart redis-server

echo "==== Setting up Nginx reverse proxy ===="
sudo tee /etc/nginx/sites-available/dashboard > /dev/null <<EOL
server {
    listen 80;
    server_name staging-dashboard.inrext.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOL

sudo rm -f /etc/nginx/sites-enabled/default

sudo ln -sf /etc/nginx/sites-available/dashboard /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx

echo "==== Installing Certbot and enabling HTTPS ===="
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d staging-dashboard.inrext.com --non-interactive --agree-tos -m tech.inrext@gmail.com

echo "==== Enabling UFW Firewall ===="
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

echo "==== Deployment complete! Visit https://staging-dashboard.inrext.com ===="
