const express = require('express');
const router = express.Router();
const axios = require('axios');
const HTMLParser = require('node-html-parser');
const cheerio = require('cheerio');
const FormData = require('form-data');
const elogConfig = require('../config/logbook.js');
const unixcrypt = require("./unixcrypt");


router.post('/', async function(req, res, next) {
    let username = req.body.username;
    let password = req.body.password;
    let logbook = req.body.logbook;

    if (!username || !password) {
        return res.status(401).send({ auth: false, user: null, options: null, message: "Username or password is incorrect." });
    }
    if (!logbook) {
        return res.status(401).send({ auth: false, user: null, options: null, message: "Logbook cannot be empty." });
    }

    logbook = logbook.replace(' ', '+');

    try {
        let url = `${elogConfig.url}/${logbook}`;

        const formData = new FormData();
        
        // The elog server accepts uname and upassword parameters with multipart/form-data format for user login
        formData.append('uname', username);
        formData.append('upassword', password);

        let response = await axios.post(url, formData, {
            // headers: {'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`}
            maxRedirects: 0, // Disable HTTP 302 redirection
            validateStatus: function (status) {
                return status >= 200 && status < 303; // Resolve only if the status code is less than 303
            },
        });
        
        if(!response || !response.data || !response.status) {
            return res.status(500).json({ auth: false, user: null, options: null, message: 'Login response is not obtained from the elog server' });
        }
        let data = response.data;
        let status = response.status;
        let headers = response.headers;

        let successPattern = /<html>redir<\/html>/;
        let failurePattern = /<td class="dlgerror">Invalid user name or password!<\/td>/;
        if(status !== 302 || !successPattern.test(data)) {    
            if(status === 200 && failurePattern.test(data)) {
                console.log('Invalid user name or password!');
                return res.status(401).send({ auth: false, user: null, options: null, message: "Invalid user name or password!" });
            } else {
                console.log('Unknown response HTML format and status code from elog server');
                return res.status(401).send({ auth: false, user: null, options: null, message: "Unknown response HTML format and status code from elog server" });
            }
        }

        /** 
         * if(status === 302 && successPattern.test(data)) is true, then continue.
         */

        /**
         *  Cookie format from elog server is as follows,
         *  'set-cookie': [
         *      'sid=2FDC6A98174BCDBE; path=/; expires=Thursday, 23-Mar-23 06:28:23 GMT;',
         *      'ufnm=%E7%8E%8B%E6%9E%97; path=/; expires=Thursday, 23-Mar-23 06:28:23 GMT;',
         *      'urem=0; path=/; expires=Thursday, 21-Mar-24 06:28:23 GMT;'
         *   ],
         */
        let cookies = headers["set-cookie"];
        let session;
        let sessionPattern = /sid=\w+;/;
        for(let item of cookies) {
            let result = sessionPattern.exec(item);
            if(result) {
                session = result[0];
                break;
            }
        }
        if(!session) {
            return res.status(401).send({ auth: false, user: null, options: null, message: "Session is not obtained from elog server" });
        }

        // Access the logbook page one time to check whether login is really successful
        response = await axios.get(url, {
            headers: {
                Cookie: session
            }
        });
        if(!response || !response.data || !response.status) {
            return res.status(500).json({ auth: false, user: null, options: null, message: 'Logbook page is not obtained from the elog server' });
        }
        data = response.data;
        loggedInPattern = /<td class="title2">Logged in as .+<\/td>/;
        if(!loggedInPattern.test(data)) {
            return res.status(500).json({ auth: false, user: null, options: null, message: 'Logbook page is not displayed as a logged-in user' });
        }

        // Access the log creation page to extract user information and attribute options
        url = `${elogConfig.url}/${logbook}/?cmd=New`;
        response = await axios.get(url, {
            headers: {
                Cookie: session
            }
        });
        if(!response || !response.data || !response.status) {
            return res.status(500).json({ auth: false, user: null, options: null, message: 'Log creation page is not obtained from the elog server' });
        }
        data = response.data;
        if(!loggedInPattern.test(data)) {
            return res.status(500).json({ auth: false, user: null, options: null, message: 'Log creation page is not displayed as a logged-in user' });
        }

        let author;
        let authorEmail;
        let optionCategory = [];
        let optionSystem = [];
        const $ = cheerio.load(data);
        $('.attribname').each(function(i, elem) {
            let text = $(elem).text();
            if(/Author\*{0,1}:/.test(text)) {
                // console.log($(elem).next().text());
                author = $(elem).next().text().trim();
                // author = $(elem).next().children('input').attr('name').length;
            } else if(/Author Email\*{0,1}:/.test(text)) {
                // console.log($(elem).next().text());
                authorEmail = $(elem).next().text().trim();
            } else if(/Category\*{0,1}:/.test(text)) {
                let options = $(elem).next().find('option');
                for(let option of options) {
                    // console.log($(option).attr('value'));
                    let value = $(option).attr('value');
                    if(value) {
                        optionCategory.push(value);
                    }
                }
            } else if(/System\*{0,1}:/.test(text)) {
                let systems = $(elem).next().find('input[type=radio]');
                for(let system of systems) {
                    // console.log($(system).attr('value'));
                    optionSystem.push($(system).attr('value'));
                }
            }
        });

        /** 
         * $5 means sha256
         * round is 5000
         * $ means salt is ''
         */
        let pwHash = unixcrypt.encrypt(password, "$5$rounds=5000$").replace('$5$rounds=5000$$', '');

        let user = {
            username: username,
            pwHash: pwHash,
            email: authorEmail,
            displayName: author,
        }

        let options = {
            categories: optionCategory,
            systems: optionSystem,
        }
        
        res.status(200).send({ auth: true, user: user, options: options, message: "Login successfully" });
    } catch(error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }

});


module.exports = router;