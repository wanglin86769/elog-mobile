const multer  = require('multer');
const upload = multer();
const axios = require('axios');
const cheerio = require('cheerio');
const FormData = require('form-data');
const HTMLParser = require('node-html-parser');
const elogConfig = require('../config/logbook.js');


// Check if the text is integer
function isInteger(value) {
    return /^\d+$/.test(value);
}


// Extract log data from the log text
function parseRawLog(rawLog, logbook) {
    /** 
     *  Metadata
     *  \n========================================\n
     *  Log text
     */
    let attributeAndContent = rawLog.split('\n========================================\n');
    let attributesStr = attributeAndContent[0].replace('mailto:', '');
    let attributes = attributesStr.split('\n');
    let content = attributeAndContent[1];

    let log = {};

    // Process metadata
    for(let attribute of attributes) {
        let key_value = attribute.split(/:(.+)/);
        let key = key_value[0].trim();
        let value = key_value[1].trim();
        log[key] = value;
    }

    // Process attachments
    let attachments = [];
    if(log.Attachment) {
        let attachmentStrs = log.Attachment.split(',');
        for(let a of attachmentStrs) {
            // Split the attachment item with the number_number_filename format
            let number_number_filename = a.split('_');
            let number = `${number_number_filename[0]}_${number_number_filename[1]}`;
            // Recover the filename that may be split
            let filename = number_number_filename.slice(2).join('_');
            let url = `${elogConfig.url}/${logbook}/${number}/${filename}`;
            attachments.push(url);
        }
    }

    log['Attachment'] = attachments;
    log['Content'] = content;

    return log;
}


// Extract logbooks information from the home page HTML
exports.findLogbooks = async (req, res, next) => {	
    try {
        let url = elogConfig.url;
        let response = await axios.get(url);
        if(!response || !response.data) {
            return res.status(500).json({message: 'No logbook HTML raw data is obtained from the elog server'});
        }

        let root = HTMLParser.parse(response.data);

        /**
         * Logbook group has class "selgroup"
         * Logbook has class "sellogbook"
         * Both entry number and last submission have class "selentries"
         */
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


// Extract all log IDs for a logbook from the logbook all-logs-displayed-in-one-page HTML
exports.findMessageIds = async (req, res, next) => {
    try {
        let logbook = req.params.logbook;
        if(!logbook) return res.status(400).json({message: 'Logbook is not specified'});

        let url = `${elogConfig.url}/${logbook}/page`;

        let response = await axios.get(url);
        if(!response || !response.data) {
            return res.status(500).json({message: 'No MessageIds HTML raw data is obtained from the elog server'});
        }

        let root = HTMLParser.parse(response.data);
        // Each log has list1 or list2 class with different styles
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


// Get logs by lazy loading, i.e. loading one page at a time to reduce the response time.
exports.findLogs = async (req, res, next) => {	
    let logbook = req.params.logbook;
    if(!logbook) return res.status(400).json({message: 'Logbook is not specified'});
    logbook = logbook.replace(' ', '+');

    let first = req.query.first;
    let rows = req.query.rows;

    if(isNaN(first) || isNaN(rows)) {
        return res.status(401).json({ message: 'Starting data and number are not specified' });
    }
    first = parseInt(first);
    rows = parseInt(rows);
    if(rows > 25) {
        rows = 25;
    }

    try {
        let page = first / rows + 1;
        let url = `${elogConfig.url}/${logbook}/page${page}?npp=${rows}`;

        let response = await axios.get(url);
        if(!response || !response.data) {
            return res.status(500).json({message: 'Logs HTML raw data is not obtained from the elog server'});
        }
        const html = response.data;

        // Extract total entries
        const entryMatch = html.match(/<b>\s*(\d+)\s+Entries\s*<\/b>/i);
        const count = entryMatch ? parseInt(entryMatch[1], 10) : 0;

        // Obtain logs HTML raw data
        let root = HTMLParser.parse(html);
        let values = root.querySelectorAll('.list1 > a, .list2 > a, .listdraft > a');
        const ids = new Set();
        for(let value of values) {
            if(value.rawAttrs.includes('mailto'))  continue;
            let tempArray = value.rawAttrs.replace(/["]+/g, '').split('/');
            let id = tempArray[tempArray.length -1];
            
            ids.add(id); 
        }

        let idArray = Array.from(ids);

        let promiseArray = [];
        for(let id of idArray) {
            url = `${elogConfig.url}/${logbook}/${id}?cmd=download`;
            promiseArray.push(axios.get(url));
        }
        
        // Obtain the text raw data for each log
        response = await Promise.all(promiseArray);
        if(!response) {
            return res.status(500).json({message: 'Log text data is not obtained from the elog server'});
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


// Extract single log data from the log text
exports.findSingleLog = async (req, res, next) => {	
    let logbook = req.params.logbook;
    if(!logbook) return res.status(400).json({message: 'Logbook is not specified'});
    logbook = logbook.replace(' ', '+');

    let id = req.params.id;
    if(!id) return res.status(400).json({message: 'Log ID is not specified'});

    try {
        let url = `${elogConfig.url}/${logbook}/${id}?cmd=download`;

        let response = await axios.get(url);
        if(!response || !response.data) {
            return res.status(500).json({message: 'No log text raw data is obtained from the elog server'});
        }

        let rawLog = response.data;
        let log = parseRawLog(rawLog, logbook);

        res.status(200).send(log);
    } catch(error) {
        console.log(error);
        return res.status(500).json({message: error.message});
    }
    
};


exports.submitLogFormData = [upload.array('attachments', 20), async (req, res, next) => {
    let logbook = req.params.logbook;

    const formData = new FormData();
    for (const [key, value] of Object.entries(req.body)) {
        if(Array.isArray(value)) {
            for(let item of value) {
                formData.append(key, item);
            }
        } else {
            formData.append(key, value);
        }
    }

    if(Array.isArray(req.files) && req.files.length) {
        // for(let file of req.files) {
        //     attachments.push({
        //         'name': file.originalname,
        //         'size': file.size,
        //         'contentType': file.mimetype,
        //         'content': file.buffer,
        //     });
        // }
        for(let i=0; i<req.files.length; i++) {
            let file = req.files[i];
            /* 
             * By default, 
             * if all chars are latin1, then re-decoding
             */
            if (!/[^\u0000-\u00ff]/.test(file.originalname)) {
                file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8')
            }
            formData.append(`attfile${i}`, file.buffer, file.originalname);
        }
    }

    try {
        let url = `${elogConfig.url}/${logbook}`;
        let response = await axios.post(url, formData, {
            maxRedirects: 0, // Disable HTTP 302 redirection
            validateStatus: function (status) {
                return status >= 200 && status < 303; // Resolve only if the status code is less than 303
            },
        });
        if(!response || !response.data) {
            return res.status(500).json({message: 'No response received when submitting a new log'});
        }

        let successPattern = /<h1 align="center">You successfully submitted a message<\/h1>/;
        let redirectPattern = /<html>redir<\/html>/;
        let data = response.data;
        let status = response.status;

        if((status === 302 && redirectPattern.test(data)) || successPattern.test(data)) {
            res.json({ message: 'You successfully submitted a message operation' });
        } else {
            res.status(500).json({ message: 'Unknown HTML format is received from Elog server when a log operation is submitted' });
        }  
    } catch(error) {
        console.log(error);
        res.status(500).json({message: error.message});
    }
}];


