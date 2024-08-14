#!/usr/bin/env bash

if [[ -e "dist.zip" ]]; then
  rm dist.zip
fi

if [[ -d "dist" ]]; then
  rm -r dist
fi

mkdir -p dist

node_modules/.bin/tsc 

cp -r icons dist/icons

jq 'del(."$schema")' manifest.json > dist/manifest.json

cp src/popup/popup.html dist/popup/popup.html
cp src/options/options.html dist/options/options.html

cd dist && zip -r ../dist.zip .
