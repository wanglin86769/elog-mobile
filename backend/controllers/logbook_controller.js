const axios = require('axios');
const HTMLParser = require('node-html-parser');
const elogConfig = require('../config/logbook.js');


function isInteger(value) {
    return /^\d+$/.test(value);
}


function parseRawLog(rawLog, logbook) {
    let attributeAndContent = rawLog.split('\n========================================\n');
    let attributesStr = attributeAndContent[0].replace('mailto:', '');
    let attributes = attributesStr.split('\n');
    let content = attributeAndContent[1];

    let log = {};

    for(let attribute of attributes) {
        let key_value = attribute.split(/:(.+)/);
        let key = key_value[0].trim();
        let value = key_value[1].trim();
        log[key] = value;
    }

    let attachments = [];
    if(log.Attachment) {
        let attachmentStrs = log.Attachment.split(',');
        for(let a of attachmentStrs) {
            let number_number_filename = a.split('_');
            let number = `${number_number_filename[0]}_${number_number_filename[1]}`;
            let filename = number_number_filename.slice(2).join('_');;
            let url = `${elogConfig.url}/${logbook}/${number}/${filename}`;
            attachments.push(url);
        }
    }

    log['Attachment'] = attachments;
    log['Content'] = content;

    return log;
}


// Get logbooks
exports.findLogbooks = async (req, res, next) => {	
    try {
        let url = elogConfig.url;
        let response = await axios.get(url);
        if(!response || !response.data) {
            return res.status(500).json({message: '未从elog服务器获取到数据'});
        }

        let root = HTMLParser.parse(response.data);

        let values = root.querySelectorAll('.selgroup, .sellogbook, .selentries');
        let indexGroup = -1;
        let indexLogbook = -1;
        let result = [];
        for(let value of values) {
            if(value.rawAttrs.includes('selgroup')) {
                result.push({ group: value.childNodes[0]._rawText, logbooks: [] });
                indexGroup++;
                indexLogbook = -1;
            } else if(value.rawAttrs.includes('sellogbook')) {
                result[indexGroup].logbooks.push({ name: value.childNodes[0].childNodes[0]._rawText });
                indexLogbook++;
            } else if(value.rawAttrs.includes('selentries')) {
                let text = value.childNodes[0]._rawText;
                if(isInteger(text)) {
                    result[indexGroup].logbooks[indexLogbook].number = text;
                } else {
                    result[indexGroup].logbooks[indexLogbook].last = text;
                }
            } else {
                console.log('Unknown value');
            }
        }

        res.status(200).send(result);
    } catch(error) {
        console.log(error);
        return res.status(500).json({message: error.message});
    }
    
};


// Get findMessageIds
exports.findMessageIds = async (req, res, next) => {	
    try {
        let logbook = req.params.logbook;
        if(!logbook) return res.status(400).json({message: '未指定logbook'});

        let url = `${elogConfig.url}/${logbook}/page`;

        let response = await axios.get(url);
        if(!response || !response.data) {
            return res.status(500).json({message: '未从elog服务器获取到数据'});
        }

        let root = HTMLParser.parse(response.data);
        let values = root.querySelectorAll('.list1 > a, .list2 > a');
        const ids = new Set();
        for(let value of values) {
            if(value.rawAttrs.includes('mailto'))  continue;
            let tempArray = value.rawAttrs.replace(/["]+/g, '').split('/');
            let id = tempArray[tempArray.length -1];
            
            ids.add(id); 
        }

        res.status(200).send({ids: Array.from(ids)});
    } catch(error) {
        console.log(error);
        return res.status(500).json({message: error.message});
    }
    
};


// Get logs by lazy loading
exports.findLogs = async (req, res, next) => {	
    let logbook = req.params.logbook;
    if(!logbook) return res.status(400).json({message: '未指定logbook'});
    logbook = logbook.replace(' ', '+');

    let first = req.query.first;
    let rows = req.query.rows;

    if(isNaN(first) || isNaN(rows)) {
        return res.status(401).json({ message: '未指定起始数据和数量' });
    }
    first = parseInt(first);
    rows = parseInt(rows);
    if(rows > 25) {
        rows = 25;
    }

    try {
        let url = `${elogConfig.url}/${logbook}/page`;

        let response = await axios.get(url);
        if(!response || !response.data) {
            return res.status(500).json({message: '未从elog服务器获取到HTML信息'});
        }

        let root = HTMLParser.parse(response.data);
        let values = root.querySelectorAll('.list1 > a, .list2 > a, .listdraft > a');
        const ids = new Set();
        for(let value of values) {
            if(value.rawAttrs.includes('mailto'))  continue;
            let tempArray = value.rawAttrs.replace(/["]+/g, '').split('/');
            let id = tempArray[tempArray.length -1];
            
            ids.add(id); 
        }

        let idArray = Array.from(ids);
        let count = idArray.length;
        let requestedIdArray = idArray.slice(first, first + rows);

        let promiseArray = [];
        for(let id of requestedIdArray) {
            url = `${elogConfig.url}/${logbook}/${id}?cmd=download`;
            promiseArray.push(axios.get(url));
        }
        
        response = await Promise.all(promiseArray);
        if(!response) {
            return res.status(500).json({message: '未从elog服务器获取到log数据'});
        }
        const rawLogs = response.map((res) => res.data);

        let logs = [];
        for(let rawLog of rawLogs) {
            logs.push(parseRawLog(rawLog, logbook));
        }

        res.status(200).send({ count: count, entries: logs });
    } catch(error) {
        console.log(error);
        return res.status(500).json({message: error.message});
    }
    
};


// Get single log
exports.findSingleLog = async (req, res, next) => {	
    let logbook = req.params.logbook;
    if(!logbook) return res.status(400).json({message: '未指定logbook'});
    logbook = logbook.replace(' ', '+');

    let id = req.params.id;
    if(!id) return res.status(400).json({message: '未指定log ID'});

    try {
        let url = `${elogConfig.url}/${logbook}/${id}?cmd=download`;

        let response = await axios.get(url);
        if(!response || !response.data) {
            return res.status(500).json({message: '未从elog服务器获取到HTML信息'});
        }

        let rawLog = response.data;
        let log = parseRawLog(rawLog, logbook);

        res.status(200).send(log);
    } catch(error) {
        console.log(error);
        return res.status(500).json({message: error.message});
    }
    
};

