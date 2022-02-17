clear

echo ======================= Config ======================
COCOS_PATH=/Applications/CocosCreator.app/Contents/MacOS/CocosCreator
CURRENT_DIR=$(pwd)
UPDATE_VERSION=$1
VERSION_FILE=$CURRENT_DIR/assets/cc-common/cc-lobby-0999/script/version.txt

VERSION_STRING=$(<$VERSION_FILE)
VERSION_ARRAY=($(echo $VERSION_STRING | tr "|" "\n"))

echo ================== Git Update ==================
git submodule foreach git pull

echo ====================== Update Version Code ===========
DATE_WITH_TIME=`date "+%Y/%m/%d %H:%M:%S"`
echo ${VERSION_ARRAY[0]}"|"$UPDATE_VERSION"|"$DATE_WITH_TIME > $VERSION_FILE

echo ================== Build =======================
$COCOS_PATH --path $CURRENT_DIR --configPath $BUILD_CONFIG --build "platform=android;template=default;debug=false;autoCompile=true"
sh versionData.sh $UPDATE_VERSION

echo ================== Finished HotUpdate $UPDATE_VERSION ==============