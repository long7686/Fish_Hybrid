DATA_VERSION=$1
NODE_PATH=/usr/local/bin/node
DEST_PATH=$(pwd)/native_data

if [ -d $DEST_PATH ]
then
	rm -rf ./native_data/*
else
	mkdir ./native_data
fi

cp -r ./build/jsb-default/res ./native_data
cp -r ./build/jsb-default/src ./native_data

$NODE_PATH version_generator.js -v $DATA_VERSION -u https://static.ktek.io/dev-remote-assets/ -s native_data -d assets/cc-common/cc-lobby-0999/
cp ./assets/cc-common/cc-lobby-0999/project.manifest ./native_data
cp ./assets/cc-common/cc-lobby-0999/version.manifest ./native_data

echo =========== Done ===========