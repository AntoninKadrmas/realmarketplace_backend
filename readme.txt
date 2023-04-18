To run you backend instance just clone realmarketplace_backend on your device from git.
!!required node js 14 or higher!!
- git clone realmarketplace_backend repo
and in the realmerketplace_backed folder run npm install to install all modules.
Modules:
- https://www.npmjs.com/package/mocha
- https://www.npmjs.com/package/chai
- https://www.npmjs.com/package/nyc
- https://www.npmjs.com/package/supertest
- https://www.npmjs.com/package/bcrypt
- https://www.npmjs.com/package/express
- https://www.npmjs.com/package/express-mongo-sanitize
- https://www.npmjs.com/package/multer
- https://www.npmjs.com/package/mongodb
- https://www.npmjs.com/package/urllib
- https://www.npmjs.com/package/uuid
- https://www.npmjs.com/package/typescript
- https://www.npmjs.com/package/body-parser
- https://www.npmjs.com/package/cors

Now to run backend:
- if you want to run backend just type = npm start
- if you want to run tests just type = npm test
Backend configuration file:
- is not included in the code so create one with name = .env (linux ... nano .env)

    #connection string use to connect to your mongo db atlas you can generate it in mongo db atlas web application
    MONGO_DB_CONNECTION="mongodb+srv://user_name:passowrd@mongo_connection/default_database?retryWrites=true&w=majority"
    #name of database that would be used
    MONGO_DB_NAME="db_name"
    #name of the user collection, place where would all user models be saved
    MONGO_USER_COLLECTION="users"
    #name of the token collection, place where would all token models be saved
    MONGO_TOKEN_COLLECTION="tokens"
    #name of the advert collection, place where would all advert models be saved
    MONGO_ADVERT_COLLECTION="adverts"
    #name of the favorite collection, place where would all favorite models be saved
    MONGO_FAVORITE_COLLECTION="favorites"

    #mongo project can be found in atlas db project information's
    MONGO_PROJECT_ID="project_id"
    #cluster name where would be your database with collection you define before
    MONGO_CLUSTER_NAME="cluster_name"
    #name of the search advert index used to search in adverts by advert title and author
    MONGO_SEARCH_INDEX_ADVERT_NAME="advert_search"
    #public api key to your mongo db
    MONGO_SEARCH_EDITOR_PUBLIC_KEY="public_api_key"
    #private api key to your mongo db
    MONGO_SEARCH_EDITOR_PRIVATE_KEY="private_api_key"

    #port on which would be server listening (default 3000)
    PORT=3000
    #token expiration time (default 1800000)
    TOKEN_EXPIRATION_TIME=1800000

    #name of the folder where would be saved all advert images (default public)
    FOLDER_IMAGE_PUBLIC = "public"
    #name of the folder where would be saved all user profile images (default profile)
    FOLDER_IMAGE_PROFILE = "profile"
    #name of folder where would be saved all logs (default debug)
    FOLDER_LOGS="debug"

    #number of adverts that would be returned when searching without query sample (default 4)
    NUMBER_IN_SAMPLE=4
    #number of adverts that would be returned when searching with query search (default 10)
    NUMBER_IN_SEARCH=10

    #number fo salt round when encrypting password (default 10)
    SALT_ROUNDS=10


If you want to run backend in cloud do these other steps on your virtual machine.
!!all these commands are executed on debian ec2 instance on aws!!

Download ufw firewall end enable 80, 443 ports
- sudo apt install ufw
- sudo ufw enable
- sudo ufw allow ssh
- sudo ufw allow 80
- sudo ufw allow 443

Create instance for realmarketplace backedn deamon:
- sudo nano /etc/systemd/system/realmarketplace.service
Add this configuration into realmarketplace.service:
[Unit]
Description=RealMarketPlace backend deamon
After=network.target
StartLimitIntervalSec=0
[Service]
Type=simple
Restart=always
RestartSec=2
#WorkingDirectory absolute path to realmarketplace_backend/src cloned folder from github
WorkingDirectory=/home/admin/realmarketplace_backend/src/
#ExecStart absolute path to npm and execute start function to start listing
ExecStart=/usr/bin/npm start
KillMode=process
[Install]
WantedBy=multi-user.target

After saving the configuration of the backend execute this commands to complete configuration of deamon service:
- sudo systemctl daemon-reload
- sudo systemctl enable realmarketplace
- sudo systemctl start realmarketplace
- sudo systemctl status realmarketplace

Install nginx:
- sudo apt install nginx
In nginx configuration file edit this information's:
server 80{
    ...
        #server domain name
      server_name realmarketplace.shop www.realmarketplace.shop;

        location / {
                #in default configuration will server run on port 3000
                proxy_pass http://localhost:3000; #whatever port your app runs on
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;
        }
    ...
}

To generate ssl certificate I will be use certbot that use Let’s Encrypt to generate it.
- sudo add-apt-repository ppa:certbot/certbot
- sudo apt-get update
- sudo apt-get install python3-certbot-nginx
- sudo certbot --nginx -d realmarketplace.shop -d www.realmarketplace.shop
# Only valid for 90 days, test the renewal process with
- certbot renew --dry-run