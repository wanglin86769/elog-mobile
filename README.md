# Mobile web client for PSI Elog

PSI Elog mobile web pages developed and deployed at CSNS (China Spallation Neutron Source), it is a mobile web application which provides functions for user login, reading logs, creating logs, editing logs and deleting logs.

The official website for PSI Elog is as follows,

https://elog.psi.ch/elog/

https://github.com/paulscherrerinstitute/py_elog

## Screenshots

### Read logs on mobile phones

![Alt text](frontend/screenshots/elog-demo-csns.png?raw=true "Title")

### Login on mobile phones

![Alt text](frontend/screenshots/elog-login.png?raw=true "Title")

### Create and delete logs on mobile phones

![Alt text](frontend/screenshots/elog-create-log.png?raw=true "Title")

## Project structure

* Frontend: provides mobile web pages using Vue.js
* Backend: accesses elog server, parses HTML data and provides a REST API using Node.js

The reasons for implementing a backend besides frontend are as follows,

1. Browsers' CORS (Cross-Origin Resource Sharing) mechanism prevents the frontend JavaScript from retrieving data from the Elog server.
2. Parsing HTML data within mobile backend can get better performance than within mobile frontend.

The communication mechanism of PSI Elog server is analysed using browser's F12 development tool, Postman, Wireshark and Elog python API.

### Architecture of elog-mobile

![Alt text](frontend/screenshots/architecture.png?raw=true "Title")

### Steps for user login in elog-mobile

![Alt text](frontend/screenshots/user-login-step.png?raw=true "Title")

## Development environment

The development environment is as follows,

* PrimeVue
* Vue.js
* Node.js

A recent version Node.js is required, it has been tested with the following Node.js version,

* Node.js 18.13.0

* Node.js 17.9.1

* Node.js 16.19.0

## Project setup

### Configuration

Edit the following files if needed.
```
frondend/src/config/configuraion.js
backend/config/logbook.js
```

### Compiles and hot-reloads for development

Go to frontend directory
```
npm install
npm run serve
```

Go to backend directory
```
npm install
npm run dev
```

### Deployment

For deployment, it is recommended to use "npm ci" instead of "npm install" to avoid the potential incompatible issue caused by npm packages update.

Go to frontend directory
```
npm ci
npm run serve
```

Go to backend directory
```
npm ci
npm run dev
```

### Visit web pages

```
http://localhost:8080/
```

### Note

Please note that the elog-mobile is developed for CSNS deployment of Elog, it may not work for the Elog deployment with different configurations at other sites.

### Elog home page at CSNS

![Alt text](frontend/screenshots/elog-home-pc.png?raw=true "Title")

### Elog logbook page at CSNS

![Alt text](frontend/screenshots/elog-logbook-pc.png?raw=true "Title")

### Elog logbook creating page at CSNS

![Alt text](frontend/screenshots/elog-log-pc.png?raw=true "Title")