# Elog mobile

Elog mobile web pages developed and deployed at CSNS (China Spallation Neutron Source), it is a lightweight web application which provides read-only function without authentication or post module.

## Screenshots

### Test pages for demo logs at Elog official website

![Alt text](frontend/screenshots/elog-demo.png?raw=true "Title")

## Project structure

* Frontend: provides mobile web pages using Vue.js
* Backend: accesses elog server, parses data and provides a REST API using Node.js

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

### Visit web pages

```
http://localhost:8080/
```
