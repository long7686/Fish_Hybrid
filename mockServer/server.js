const express = require('express');
const fs = require('fs');
const app = express();
const port = 3333;
let index5999 = -1;
let index9999 = -1;
let index9991 = -1;
let index9998 = -1;
let index9996 = -1;



app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


app.get('/mockSpinData', (req, res) => {
    const {gameId, format} = req.query;
    let defaultJson;
    if (format) {
        defaultJson = format;
    }
    
    if (gameId === '9991') {
        if (!defaultJson) {
            defaultJson = 'spinFreeSpinOptions';
        }
        if(format == 'random'){
            fs.readdir('./json/tulinh/', (err, files) => {
                if (files) {
                    index9998 = ( index9991 + 1 )%files.length;
                    return res.send(require('./json/tulinh/' + files[index9991]));
                }
            });
        }else{
            console.log('req.query',req.query)
            return res.send(require('./json/tulinh/' + defaultJson+'.json'));
        }
    } else 
    if (gameId === '9988') {
        if (!defaultJson) {
            defaultJson = 'spinWinBonus';
        }
        // if(format == 'random'){
        //     fs.readdir('./json/achb/', (err, files) => {
        //         if (files) {
        //             index9998 = ( index9991 + 1 )%files.length;
        //             return res.send(require('./json/achb/' + files[index9991]));
        //         }
        //     });
        // }else{
        //     console.log('req.query',req.query)
            
        // }
        return res.send(require('./json/achb/' + defaultJson+'.json'));
    } else 
    if (gameId === '9998') {
        if (!defaultJson) {
            defaultJson = 'spinFreeSpinOptions';
        }
        if(format == 'random'){
            fs.readdir('./json/aktv/', (err, files) => {
                if (files) {
                    index9998 = ( index9998 + 1 )%files.length;
                    return res.send(require('./json/aktv/' + files[index9998]));
                }
            });
        }else{
            return res.send(require('./json/aktv/' + defaultJson+'.json'));
        }
    } else if (gameId === '9996') {
        if (!defaultJson) {
            defaultJson = 'spinFreeSpinOptions';
        }
        if(format == 'random'){
            fs.readdir('./json/bdmn/', (err, files) => {
                if (files) {
                    index9996 = ( index9996 + 1 )%files.length;
                    return res.send(require('./json/bdmn/' + files[index9996]));
                }
            });
        }else{
            return res.send(require('./json/bdmn/' + defaultJson+'.json'));
        }
    } else if (gameId === '9999') {
        if (!defaultJson) {
            defaultJson = 'spinFreeSpin';
        }
        if(format == 'random'){
            fs.readdir('./json/sttt/', (err, files) => {
                if (files) {
                    index9999 = ( index9999 + 1 )%files.length;
                    return res.send(require('./json/sttt/' + files[index9999]));
                }
            });
        }else{
            return res.send(require('./json/sttt/' + defaultJson+'.json'));
        }
    } else if (gameId === '5999') {
        if (!defaultJson) {
            defaultJson = 'spinWin';
        }
        if(format == 'random'){
            fs.readdir('./json/plt/', (err, files) => {
                if (files) {
                    index5999 = ( index5999 + 1 )%files.length;
                    return res.send(require('./json/plt/' + files[index5999]));
                }
            });
        }else{
            return res.send(require('./json/plt/' + defaultJson+'.json'));
        }
    } else if (gameId === '9997') {
        if (!defaultJson) {
            defaultJson = 'spinFreeSpin';
        }
        if(format == 'random'){
            fs.readdir('./json/tbqm/', (err, files) => {
                if (files) {
                    index9999 = ( index9999 + 1 )%files.length;
                    return res.send(require('./json/tbqm/' + files[index9999]));
                }
            });
        }else{
            return res.send(require('./json/tbqm/' + defaultJson+'.json'));
        }
    } else  if (gameId === '9993') {
        if (!defaultJson) {
            defaultJson = 'spinFreeSpin';
        }
        if(format == 'random'){
            fs.readdir('./json/ttbb/', (err, files) => {
                if (files) {
                    index9999 = ( index9999 + 1 )%files.length;
                    return res.send(require('./json/ttbb/' + files[index9999]));
                }
            });
        }else{
            return res.send(require('./json/ttbb/' + defaultJson+'.json'));
        }
    } else if (gameId === '9995') {
        if (!defaultJson) {
            defaultJson = 'spinFreeSpin';
        }
        if(format == 'random'){
            fs.readdir('./json/tdtk/', (err, files) => {
                if (files) {
                    index9999 = ( index9999 + 1 )%files.length;
                    return res.send(require('./json/tdtk/' + files[index9999]));
                }
            });
        }else{
            return res.send(require('./json/tdtk/' + defaultJson+'.json'));
        }
    } else {
        if (typeof defaultJson === 'undefined' || defaultJson === 'undefined') {
            defaultJson = 'spinWin';
        }
        console.log(typeof defaultJson);
        return res.send(require('./json/' + gameId + '/' + defaultJson+'.json'));
    }
});


app.get('/mockFreeSpinOption', (req, res) => {
    const {gameId, format} = req.query;
    if (gameId === '9998') {
        return res.send(require('./json/aktv/spinOptionResult.json'))
    }
    if (gameId === '9991') {
        return res.send(require('./json/tulinh/spinOptionResult.json'))
    }
    
});
app.get('/mockFreeSpinData', (req, res) => {
    const {gameId, format} = req.query;
    if (gameId === '9999') {
        return res.send(require('./json/sttt/spinResultFreeSpin.json'))
    }
    if (gameId === '9991') {
        return res.send(require('./json/tulinh/spinResultFreeSpin.json'))
    }
    if (gameId === '9998') {
        return res.send(require('./json/aktv/spinResultFreeSpin.json'))
    }
    if (gameId === '9996') {
        return res.send(require('./json/bdmn/spinResultFreeSpinHaveScatter.json'))
    }
    
});

app.get('/mockMiniGame', (req, res) => {
    const {gameId, format} = req.query;
    if (gameId === '9999') {
        return res.send(require('./json/sttt/MiniGameMock.json'));
    }
    if (gameId === '9998') {
        return res.send(require('./json/aktv/MiniGameMock.json'));
    }
    if (gameId === '9996') {
        return res.send(require('./json/bdmn/MiniGameMock.json'));
    }
    if (gameId === '9991') {
        return res.send(require('./json/tulinh/MiniGameMock.json'));
    }
}); 

app.get('/mockMiniGameFinal', (req, res) => {
    const {gameId, format} = req.query;
    if (gameId === '9999') {
        return res.send(require('./json/sttt/MiniGameMockFinal.json'));
    }
    if (gameId === '9998') {
        return res.send(require('./json/aktv/MiniGameMockFinal.json'));
    }
    if (gameId === '9996') {
        return res.send(require('./json/bdmn/MiniGameMockFinal.json'));
    }
    if (gameId === '9991') {
        return res.send(require('./json/tulinh/MiniGameMockFinal.json'));
    }
    if (gameId === '9988') {
        return res.send(require('./json/achb/spinBonus1.json'));
    }
}); 

app.post('/login', (req, res) => res.send({
    data: {
        token: '0fig10mnfygtgslfbatk4la2hltee6f0w80mj2t5ftzxeticpmhvbxzp5oon6w6dk1eqsas185d1h7u4ia7cnki4821rgal9hprzb47f3wh96h9bpdlxwzxccsa6edxm',
        privateChannel: 'private-c56fde20-366b-49d5-b918-ca516e1ef033'
    }
}));

app.post('/loginError', (req, res) => res.send({
    error: [4001]
}));
app.get('/mockUserBaccarat', (req, res) => res.send(require('./json/baccarat/userBaccarat.json')));

app.get('/mockBaccaratPlate', (req, res) => res.send(require('./json/baccarat/baccaratPlate.json')));

app.get('/mockJoinGame', (req, res) => {
    const {gameId} = req.query;
    const data = {"serviceId":gameId,"groupId":gameId,"groupChannelName":"presence-" + gameId,"jackpot":{},

    "extendData": {
        "metaDataUser": {
          "userDisplayName": "User No.31",
          "currentWalletAmount": 100000000
        }
      }
    }
    res.send(data)
});
app.get('/mockJoinTable', (req, res) => res.send(require('./json/baccarat/baccaratJoinTable.json')));
app.get('/mockBet', (req, res) => res.send(require('./json/baccarat/baccaratBet.json')));
app.get('/mockOutTable', (req, res) => res.send(require('./json/baccarat/baccaratOutTable.json')));
app.get('/mockBaccaratBetting', (req, res) => res.send(require('./json/baccarat/baccaratBetting.json')));
app.get('/mockJackpotHistory', (req, res) => {
    const jackpotData = require('./json/jackpot/jackpotData');
    let {gameId, from: fromIndex, quantity} = req.query;
    let result = {}
        result.totalRec = jackpotData.length;

    let pageRec = parseInt(quantity);
        result.data  = [];
        for (let i = 0; i < pageRec; i++)
        {
            let index = parseInt(fromIndex) + i;
            if (jackpotData[index])
            {
                result.data.push(jackpotData[index]);
            }
        }
    res.send(result);
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
