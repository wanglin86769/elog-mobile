import axios from 'axios';
import config from '../config/configuration.js';


export default class LogbookService {

	findLogbooks() {
		let url = `${config.serverPath}/api/elog/logbooks`;
		return axios.get(url).then(res => res.data);
	}

	findMessageIds(logbook) {
		let url = `${config.serverPath}/api/elog/messageids/${logbook}`;
		return axios.get(url).then(res => res.data);
	}

	findLogs(logbook, first, rows) {
		let url = `${config.serverPath}/api/elog/logs/${logbook}?first=${first}&rows=${rows}`;
		return axios.get(url).then(res => res.data);
	}

	findSingleLog(logbook, id) {
		let url = `${config.serverPath}/api/elog/log/${logbook}/${id}`;
		return axios.get(url).then(res => res.data);
	}

	// Including creating log, editing log and deleting log
	submitLogFormData(logbook, formData) {
		let url = `${config.serverPath}/api/elog/log/${logbook}`;
		return axios.post(url, formData, {
			headers:  {
				'Content-Type': 'multipart/form-data',
			}
		}).then(res => res.data);
	}

}