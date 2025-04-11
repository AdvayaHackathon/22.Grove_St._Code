CREATE DATABASE mainPayana;
CREATE USER appUser WITH PASSWORD 'payanaAdvaya';
GRANT ALL PRIVILEGES ON DATABASE mainPayana TO appUser;
\c mainPayana;

CREATE TABLE IF NOT EXISTS temples (
    place_name TEXT,
    kn JSON,
    en JSON
);

CREATE TABLE IF NOT EXISTS beaches (
    place_name TEXT,
    kn JSON,
    en JSON
);

CREATE TABLE IF NOT EXISTS dams (
    place_name TEXT,
    kn JSON,
    en JSON
);

CREATE TABLE IF NOT EXISTS wild (
    place_name TEXT,
    kn JSON,
    en JSON
);

CREATE TABLE IF NOT EXISTS waterFalls (
    place_name TEXT,
    kn JSON,
    en JSON
);

CREATE TABLE IF NOT EXISTS history (
    place_name TEXT,
    kn JSON,
    en JSON
);

CREATE TABLE IF NOT EXISTS trek (
    place_name TEXT,
    kn JSON,
    en JSON
);

CREATE TABLE IF NOT EXISTS college (
    place_name TEXT,
    kn JSON,
    en JSON
);
