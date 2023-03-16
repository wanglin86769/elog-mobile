# Mobile web client for PSI Elog

PSI Elog mobile web pages developed and deployed at CSNS (China Spallation Neutron Source), it is a lightweight web application which provides read-only function without authentication or post module.

The official website for PSI Elog is as follows,

https://elog.psi.ch/elog/

## Screenshots

### Test pages for demo logs at PSI Elog official website

![Alt text](frontend/screenshots/elog-demo.png?raw=true "Title")

## Project structure

* Frontend: provides mobile web pages using Vue.js
* Backend: accesses elog server, parses HTML data and provides a REST API using Node.js

The reasons for implementing a backend besides frontend are as follows,

1. Browsers' CORS (Cross-Origin Resource Sharing) mechanism prevents the frontend JavaScript from retrieving data from the Elog server.
2. Parsing HTML data within backend can get better performance than within mobile frontend.

![Alt text](frontend/screenshots/architecture.png?raw=true "Title")

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
