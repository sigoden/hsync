#!/bin/bash
set -e -u

if [[ "$#" -ne 2 ]]; then
    echo 'Usage: mkcert <FQDN> <output>'
    exit
fi

FQDN=$1
ROOT=$(realpath $2)
mkdir -p $ROOT

# Create your very own Root Certificate Authority
openssl genrsa \
  -out $ROOT/ca.key \
  2048

# Self-sign your Root Certificate Authority
# Since this is private, the details can be as bogus as you like
openssl req \
  -x509 \
  -new \
  -nodes \
  -key $ROOT/ca.key \
  -days 3652 \
  -out $ROOT/ca.crt \
  -subj "/C=US/ST=Utah/L=Provo/O=ACME Signing Authority Inc/CN=${FQDN}"



# Create a Device Certificate for each domain,
# such as example.com, *.example.com, awesome.example.com
# NOTE: You MUST match CN to the domain name or ip address you want to use
openssl genrsa \
  -out $ROOT/server.key \
  2048

# Create a request from your Device, which your Root CA will sign
openssl req -new \
  -key $ROOT/server.key \
  -out $ROOT/server.csr \
  -subj "/C=US/ST=Utah/L=Provo/O=ACME Service/CN=${FQDN}"

openssl x509 \
  -req -in $ROOT/server.csr \
  -CA $ROOT/ca.crt \
  -CAkey $ROOT/ca.key \
  -CAcreateserial \
  -out $ROOT/server.crt \
  -days 1095

openssl genrsa \
  -out $ROOT/client.key \
  2048

# Create a trusted client cert
openssl req -new \
  -key $ROOT/client.key \
  -out $ROOT/client.csr \
  -subj "/C=US/ST=Utah/L=Provo/O=ACME App Client/CN=${FQDN}"

# Sign the request from Trusted Client with your Root CA
openssl x509 \
  -req -in $ROOT/client.csr \
  -CA $ROOT/ca.crt \
  -CAkey $ROOT/ca.key \
  -CAcreateserial \
  -out $ROOT/client.crt \
  -days 1095

# Needed for Safari, Chrome, and other Apps in OS X Keychain Access
echo ""
echo ""
echo "You must create a p12 passphrase. Consider using 'secret' for testing and demo purposes."
openssl pkcs12 -export \
  -in $ROOT/client.crt \
  -inkey $ROOT/client.key \
  -out $ROOT/client.p12
echo ""
echo ""
