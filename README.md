# Hsync - sync disk with http/https

## Server

Install

```
npm i @sigodenjs/hsync-server -g
```

Config

```json
{
  "connection": {
    "host": "localhost",
    "port": 4444,
    "ssl": {
      "ca": "ssl/ca.crt",
      "cert": "ssl/server.crt",
      "key": "ssl/server.key"
    }
  },
  "targets": {
    "diskA": {
      "target": "/tmp/diskA"
    },
    "diskB": {
      "target": "/tmp/diskB",
      "ignored": ["node_modules/**"]
    }
  }
}
```

Run
```
hsyncd --config config.json
```

## Client

Install

```
npm i @sigodenjs/hsync-client -g
```

Config

```json
{
  "connection": {
    "host": "localhost",
    "port": 4444,
    "ssl": {
      "cert": "ssl/client.crt",
      "key": "ssl/client.key"
    }
  },
  "targets": {
    "diskA": {
      "target": "/tmp/mydisk/diskA"
    },
    "diskB": {
      "target": "/tmp/mydisk/diskB"
    }
  }
}
```

Run
```
hsync --config config.json
```

## Licese

Copyright (c) 2018 sigoden

Licensed under the MIT license.
