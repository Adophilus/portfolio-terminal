#! /usr/bin/env bash

_files=($(ls files))
_blobs=""
_databaseSource="$(cat scripts/database.source.json | tr --delete '\n')"

for _file in ${_files[@]};
do
	_blob="$(scripts/format.sh "files/$_file")"
	_blobs="$_blob,\"$_file\": \"$_blob\""
done


echo $_databaseSource | sed -E "s/\"files\":{}/\"files\":{$_blobs}/g" | jq