#! /usr/bin/env bash

cat "$1" | sed -E "s/=\"(.*)?\"/=\\\\\"\\1\\\\\"/g" | tr --delete '\n'