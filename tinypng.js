const STATE = {
    IDLE : 0,
    RUNNING: 1,
    PRE_UPDATE_KEY: 2,
    UPDATE_KEY: 3,
}
var currentState = STATE.IDLE;

const MAX_ITEM_PER_ACCOUNT = 500;
const MAX_ITEM_PER_TIME = 10;
const TIME_CHECK_INTERVAL = 3 * 1000;
const API_KEY = [
    '69Z24j0Uy3CHvJWmkc7685cz3AzpHsHv',
    'bZj0RPzpvJpVVxwCFKR12VYkVQyK9glr',
    'L0ZQrLX17vDjCnNqtRFsM1p2HVw4x8wf',
    'ZrJLgKcXsFJFqGDxfPKR9kdK07qQkjLY',
    '3cgNjSPtlZH3LhmYHVZdgKVqGKY1bqq7',
    'X1hv4vJ7xzYr5swPKpzrQ7wMxbB7VT8M',
    '8qKDGMy4PZtQbTzYlpNy4VdWBCvtcLLx',
    's0CsftrHpFc2MbyQ7R8rd9Zy4gCvWNHy',
    'lhKJ65JnSKL229Tt81ymCY5MwP4SQPN2',
    'BtSHXTdhHdWF21GMtNCT0vp46gRh744g',
    'D1YS7M4ccH0j1W7vxmdbGgMxsvGmxnxP',
    'TCPf28VwRPMlrgfzvMhYXj06tTLLg0Q9',
    'zD43DFlnSbjXv5zrBrjfwlxGWxjCX7LM'
]
const { readdirSync, statSync } = require('fs')

var API_KEY_START_INDEX = 0;
const tinify = require("tinify");
      tinify.key = API_KEY[API_KEY_START_INDEX];

if (process.argv.length > 2)
{
    params = process.argv.slice(2)
}
else
{
    console.log('Folder path must be provided')
    process.exit(1)
}

const assetPath = params[0];
const imageList = [];

var findingKey = false;

const getActiveAPI = function()
{
    currentState = STATE.UPDATE_KEY;

    if (API_KEY_START_INDEX == API_KEY.length - 1)
    {
        console.log('All keys is limited, try next month...:(');
        process.exit(1);
    }
    else
    {
        API_KEY_START_INDEX++;
        tinify.key = API_KEY[API_KEY_START_INDEX];
        console.log('Set API key ' + API_KEY[API_KEY_START_INDEX]);
    }
    tinify.validate(function(err) {
        console.log('Validated key ' + API_KEY[API_KEY_START_INDEX]);
        if (err || tinify.compressionCount == MAX_ITEM_PER_ACCOUNT){

            console.log('Key ' + API_KEY[API_KEY_START_INDEX] + ' invalid : ' + err);
            getActiveAPI();
        }
        else
        {
            console.log('Key ' + API_KEY[API_KEY_START_INDEX] + ' is valid');
            currentState = STATE.RUNNING;
        }
    })      
}

const searchImages = function(path)
{
    readdirSync(path).forEach(function(item) {
        let stat = statSync('' + path + '/' + item);
        if (stat.isDirectory())
        {
            return searchImages('' + path + '/' + item);
        }
        else if (item.split('.').pop() === 'jpg' || item.split('.').pop() === 'png' || item.split('.').pop() === 'jpeg')
        {
            return imageList.push({path: '' + path + '/' + item, status: 'raw'});
        }
    });
};

const tinyImages = function()
{
    currentState = STATE.RUNNING;

    var totalFiles = imageList.length;
    var tiniedFiles = 0;
    var freeJobs = MAX_ITEM_PER_TIME;
    var doJobs = setInterval(()=>{
        if (currentState == STATE.UPDATE_KEY)
        {
            console.log('Finding active API key')
        }
        else
        {
            console.log('Checking image list...');
            for (let i=0; i<imageList.length; i++)
            {
                if (freeJobs > 0 && imageList[i].status == 'raw')
                {
                    freeJobs--;

                    let image = imageList[i];
                        image.status = 'process';

                    tinify.fromFile(image.path).toFile(image.path, function(err){

                        freeJobs++;
                        if (!err)
                        {
                            tiniedFiles += 1;
                            console.log('(' + tiniedFiles + '/' + totalFiles + ')' + image.path);
                            image.status = 'tinied';
                        }
                        else
                        {
                            image.status = 'raw';
                            if (err instanceof tinify.AccountError) 
                            {
                                if (currentState == STATE.RUNNING)
                                {
                                    currentState = STATE.PRE_UPDATE_KEY;
                                    console.log('API error, trying to switch API');
                                }

                                if (currentState != STATE.UPDATE_KEY && freeJobs == MAX_ITEM_PER_TIME)
                                    getActiveAPI();
                            } 
                            else if (err instanceof tinify.ClientError) 
                            {
                                console.log('There is error with this image ' + image.path);
                            } 
                            else if (err instanceof tinify.ServerError) 
                            {
                                console.log('Server is down, trying later');
                            } 
                            else if (err instanceof tinify.ConnectionError) 
                            {
                                console.log('Connection is lost, check your connection');
                            } 
                            else 
                            {
                                console.log('Unexpected error ' + err);
                            }
                        }

                    });
                }
            }
        }

        if (tiniedFiles == totalFiles)
        {
            console.log('Done All')
            clearInterval(doJobs);
        }
    }, TIME_CHECK_INTERVAL);
}

searchImages(assetPath);
tinyImages();