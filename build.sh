clear

sh config.sh

echo ======================= Config ======================
ALTOOL_PATH=/Applications/Xcode.app/Contents/Applications/Application\Loader.app/Contents/Frameworks/ITunesSoftwareService.framework/Support/altool
COCOS_PATH=/Applications/CocosCreator.app/Contents/MacOS/CocosCreator
CURRENT_DIR=$(pwd)
PROJECT_VERSION=$1
PROJECT_BUILD=$2

BUILD_CONFIG=$CURRENT_DIR/settings/builder.json
PROJECT_IOS_DIR=$CURRENT_DIR/build/jsb-default/frameworks/runtime-src/proj.ios_mac 
PROJECT_IOS=$CURRENT_DIR/build/jsb-default/frameworks/runtime-src/proj.ios_mac/cc-all-in-one.xcodeproj
IOS_ARCHIVE_PATH=$CURRENT_DIR/build/jsb-default/archive
IOS_PUBLISH_PATH=$CURRENT_DIR/build/jsb-default/publish/iOS-build.ipa
VERSION_FILE=$CURRENT_DIR/assets/cc-common/cc-lobby-0999/script/version.txt

echo ================== Git Update ==================
git submodule foreach git pull

echo ================= Update Version Code ==========

VERSION_STRING=$(<$VERSION_FILE)
VERSION_ARRAY=($(echo $VERSION_STRING | tr "|" "\n"))
DATE_WITH_TIME=`date "+%Y/%m/%d %H:%M:%S"`
echo $PROJECT_VERSION"|"${VERSION_ARRAY[1]}"|"$DATE_WITH_TIME > $VERSION_FILE

echo ================== Build =======================
$COCOS_PATH --path $CURRENT_DIR --configPath $BUILD_CONFIG --build "platform=android;template=default;debug=false;autoCompile=false"
sh versionData.sh 1.0.0
$COCOS_PATH --path $CURRENT_DIR --configPath $BUILD_CONFIG --build "platform=android;template=default;debug=false;autoCompile=false"

echo ================== Compile Android ==============
$COCOS_PATH --path $CURRENT_DIR --configPath $BUILD_CONFIG --compile "platform=android;template=default;debug=false;"

echo ================== Compile iOS ==============
cd $PROJECT_IOS_DIR
agvtool new-marketing-version $PROJECT_VERSION
agvtool new-version -all $PROJECT_BUILD
cd $CURRENT_DIR

$COCOS_PATH --path $CURRENT_DIR --configPath $BUILD_CONFIG --compile "platform=ios;template=default;debug=false;"
xcodebuild archive -project $PROJECT_IOS -scheme cc-all-in-one-mobile -archivePath $IOS_ARCHIVE_PATH/iOS-build.xcarchive
xcodebuild -exportArchive -archivePath $IOS_ARCHIVE_PATH/iOS-build.xcarchive -exportPath $IOS_PUBLISH_PATH -exportOptionsPlist $IOS_ARCHIVE_PATH/ExportOptions.plist

echo ================== Finished Version $PROJECT_VERSION $PROJECT_BUILD ==============