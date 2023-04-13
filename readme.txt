required node js 14 or higher
git clone realmarketplace_backend repo

sudo apt install ufw
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443


sudo nano /etc/systemd/system/realmarketplace.service      

[Unit]
Description=RealMarketPlace backend deamon
After=network.target
StartLimitIntervalSec=0
[Service]
Type=simple
Restart=always
RestartSec=2
WorkingDirectory=/home/admin/realmarketplace_backend/src/
ExecStart=/usr/bin/node /home/admin/realmarketplace_backend/src/server.js
KillMode=process
[Install]
WantedBy=multi-user.target

sudo systemctl daemon-reload
sudo systemctl enable realmarketplace
sudo systemctl start realmarketplace
sudo systemctl status realmarketplace


in nginx configuration:
server 80{
    ...
      server_name realmarketplace.shop www.realmarketplace.shop;

        location / {
                # First attempt to serve request as file, then
                # as directory, then fall back to displaying a 404.
                proxy_pass http://localhost:3000; #whatever port your app runs on
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;
        }
    ...
}

ssl certificate

sudo add-apt-repository ppa:certbot/certbot
sudo apt-get update
sudo apt-get install python3-certbot-nginx
sudo certbot --nginx -d realmarketplace.shop -d www.realmarketplace.shop
# Only valid for 90 days, test the renewal process with
certbot renew --dry-run

//source from https://www.youtube.com/watch?v=oykl1Ih9pMg&ab_channel=TraversyMedia