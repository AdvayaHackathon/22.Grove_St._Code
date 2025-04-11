NETWORK_NAME="payanaNet"
POSTGRES_DATA_DIR="/home/rexdy/pf/advaya-practice/db_dir/db/"
DB_INIT_SCRIPT_DIR="/home/rexdy/pf/advaya-practice/db_dir/"
GO_SRC_DIR="/home/rexdy/pf/advaya-practice"
POSTGRES_USER="appUser"
POSTGRES_PASSWORD="payanaAdvaya"
POSTGRES_DB="mainPayana"
DOCKER_NETWORK_SUBNET="172.19.0.0/16"

docker network inspect $NETWORK_NAME >/dev/null 2>&1 || docker network create $NETWORK_NAME

docker run -d --rm\
  --name psql \
  --network $NETWORK_NAME \
  -e POSTGRES_USER=$POSTGRES_USER \
  -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
  -e POSTGRES_DB=$POSTGRES_DB \
  -v $POSTGRES_DATA_DIR:/var/lib/postgresql/data \
  postgres

sleep 5

docker cp "$DB_INIT_SCRIPT_DIR/db_init.sql" psql:/docker-entrypoint-initdb.d/

docker exec -u postgres psql bash -c "echo 'host $POSTGRES_DB $POSTGRES_USER $DOCKER_NETWORK_SUBNET md5' >> /var/lib/postgresql/data/pg_hba.conf"

docker exec -u postgres psql pg_ctl reload -D /var/lib/postgresql/data/

# Start the Go application in detached mode
docker run -d --rm \
  --name goserve \
  --network $NETWORK_NAME \
  -v $GO_SRC_DIR:/app \
  -w /app \
  -p 8080:62452 \
  golang:latest \
  ./com.Payana

# Wait for a moment to ensure the container is fully up
sleep 5

# Enter the terminal of the goserve container
docker exec -it goserve /bin/bash
