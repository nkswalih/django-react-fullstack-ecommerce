Place a plain-text PostgreSQL dump here, for example
`docker/postgres/init/10-local-dev.sql`.

Anything in this directory is mounted into `/docker-entrypoint-initdb.d` for the
development PostgreSQL container. The official PostgreSQL image executes these
files only when the Docker database volume is empty, so your local PostgreSQL
instance is never modified and existing Docker data is not overwritten.
