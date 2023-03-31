<template>
	<div>
		<div class="col-12">
			<!-- <h3 style="color: RGB(33, 150, 243); text-align: center; margin-bottom: .5em;">{{ logbook.replace('+', ' ') }}</h3> -->
			<div style="padding-left: 1rem; padding-right: 1rem;" class="flex flex-wrap align-items-center justify-content-between gap-2">
				<span style="font-size: large; color: RGB(33, 150, 243)">{{ logbook.replace('+', ' ') }}</span>
				<Button v-if="userInfo" label="Submit" icon="fa fa-paper-plane" rounded raised size="small" @click="submitLog()" />
			</div>
		</div>
		
		<div class="col-12">
			<div style="padding-bottom: 0rem; padding-left: 1rem; padding-right: 1rem;">
				<div class="grid border">
					<div class="col-12 border-top" style="background-color: RGB(224, 224, 160)">
						Fields marked with <span style="color: red">*</span> are required
					</div>
					<div class="col-4 border-top border-right" style="background-color: RGBA(204, 204, 255)">
						Entry time:
					</div>
					<div class="col-8 border-top" style="background-color: RGBA(221, 238, 187)">
						{{ entryTime ? showDateTime(entryTime) : 'N/A' }}
					</div>
					<div class="col-4 border-top border-right" style="background-color: RGBA(204, 204, 255)">
						Author:
					</div>
					<div class="col-8 border-top" style="background-color: RGBA(221, 238, 187)">
						{{ author }}
					</div>
					<div class="col-4 border-top border-right" style="background-color: RGBA(204, 204, 255)">
						Author Email:
					</div>
					<div class="col-8 border-top" style="background-color: RGBA(221, 238, 187)">
						{{ authorEmail }}
					</div>
					<div class="col-4 border-top border-right" style="background-color: RGBA(204, 204, 255)">
						Category<span style="color: red">*</span>:
					</div>
					<div class="col-8 border-top" style="background-color: RGBA(221, 238, 187)">
						<Dropdown style="width: 100%" class="p-inputtext-sm" placeholder="- please select -" v-model="category" :options="logOptions.categories" :showClear="true"></Dropdown>
					</div>
					<div class="col-4 border-top border-right" style="background-color: RGBA(204, 204, 255)">
						System<span style="color: red">*</span>:
					</div>
					<div class="col-8 border-top" style="background-color: RGBA(221, 238, 187)">
						<Dropdown style="width: 100%" class="p-inputtext-sm" placeholder="- please select -" v-model="system" :options="logOptions.systems" :showClear="true"></Dropdown>
					</div>
					<div class="col-4 border-top border-right" style="background-color: RGBA(204, 204, 255)">
						Subject<span style="color: red">*</span>:
					</div>
					<div class="col-8 border-top" style="background-color: RGBA(221, 238, 187)">
						<InputText v-model.trim="subject" style="width: 100%" class="p-inputtext-sm" />
					</div>
					<Textarea v-model="text" placeholder="Please enter your message here" :autoResize="true" rows="5" style="width: 100%;" />

					<div v-for="(item, index) of attachments" :key="index" class="col-12" style="padding-bottom: 0">
						<div class="grid">
							<div class="col-4 border-top border-right" style="background-color: RGBA(204, 204, 255)">
								<i style="color: red; margin-right: .1em; cursor: pointer;" class="fa fa-close fa-lg" @click="onDeleteAttachment(index)"></i>
								Attachment {{ index + 1 }}:
							</div>
							<div class="col-8 border-top" style="background-color: RGBA(221, 238, 187); word-wrap: break-word;">
								<a :href="item">{{ item.substring(item.lastIndexOf("/") + 1) }}</a>
							</div>
							<div class="col-12">
								<Image v-if="isImageFile(item)" :src="item" alt="Image" width="250" preview />
								<a v-else :href="item"><img src="@/assets/file-icon.png" alt="File" width="100"/></a>
							</div>
						</div>
					</div>

					<Panel header="Attachments" :toggleable="true" style="width: 100%;">
						<div>
							<input type="file" id="file" ref="file" multiple v-on:change="handleFileUpload()"/>
						</div>
					</Panel>

				</div>
			</div>
		</div>
		<div class="col-12">
			<div style="padding-left: 1rem; padding-right: 1rem;" class="flex flex-wrap align-items-center justify-content-between gap-2">
				<span></span>
				<Button v-if="userInfo" label="Submit" icon="fa fa-paper-plane" rounded raised size="small" @click="submitLog()" />
			</div>
		</div>
	</div>
</template>

<script>
import dateFormat from 'dateformat';
import LogbookService from '../service/LogbookService';

export default {
	data() {
        return {
            logbook: null,
			logId: null,
			log: {},
			messageId: null,
			entryTime: null,
			author: null,
			authorEmail: null,
			category: null,
			system: null,
			subject: null,
			text: null,
			attachments: [],
			submittingAttachments: [],
        }
    },
	LogbookService: null,

	created() {
		this.logbookService = new LogbookService();

		this.logbook = this.$route.params.logbook;
		this.logId = this.$route.params.log;
	},

	mounted() {
		console.log(this.logId);
		if(this.logId === 'new') {
			this.initLog();
		} else {
			this.loadLog();
		}
	},

	activated() {
    },

    deactivated () {
    },

	methods: {
		initLog() {
			this.entryTime = new Date();
			this.author = this.userInfo.displayName;
			this.authorEmail = this.userInfo.email;
		},
		loadLog() {
			let loader = this.$loading.show();
			this.logbookService.findSingleLog(this.logbook, this.logId)
			.then(data => {
				this.messageId = data['$@MID@$'];
				this.entryTime = data['Date'] || new Date();
				this.author = data['Author'];
				this.authorEmail = data['Author Email'];
				this.category = data['Category'];
				this.system = data['System'];
				this.subject = data['Subject'];
				this.text = data['Content'];
				this.attachments = data['Attachment'];
			}).catch(error => {
				if(error.response) {
					this.$toast.add({ severity: 'error', summary: 'log loading failure', detail: error.response.data.message });
				} else {
					this.$toast.add({ severity: 'error', summary: 'log loading failure', detail: error.message });
				}
			}).finally(() => {
				loader.hide();
			});
		},
		submitLog() {
			let loader = this.$loading.show();

			let formData = new FormData();
			if(this.messageId) { // Editing log
				formData.append('edit_id', this.messageId);
				// formData.append('entry_date', this.entryTime);
			}
            formData.append('Author', this.author);
			formData.append('Author_Email', this.authorEmail);
			formData.append('Category', this.category);
			formData.append('System', this.system);
			formData.append('Subject', this.subject);
			formData.append('Text', this.text);
			formData.append('cmd', 'Submit');
			formData.append('unm', this.userInfo.username);
			formData.append('upwd', this.userInfo.pwHash);

			// Existing attachments, some of which may have been deleted
			// Attachment item example: http://elog.csns.ihep.ac.cn/Control+System/230331_071736/QQimage20230109094245.png
			for(let i=0; i<this.attachments.length; i++) {
				let length = this.attachments[i].split('/').length;
				let part1 = this.attachments[i].split('/')[length - 2];
				let part2 = this.attachments[i].split('/')[length - 1];
                formData.append(`attachment${i}`, `${part1}_${part2}`);
            }

			// New attachments
			for(let i=0; i<this.submittingAttachments.length; i++) {
                formData.append('attachments', this.submittingAttachments[i]);
            }

            this.logbookService.submitLogFormData(this.logbook, formData)
			.then(() => {
                this.$router.push({name: 'logbook', params: { logbook: this.logbook }, query: { randomId: new Date().getTime() }});
            }).catch((error) => {
                if(error.response) {
					this.$toast.add({ severity: 'error', summary: 'Failure', detail: error.response.data.message });
				} else {
					this.$toast.add({ severity: 'error', summary: 'Failure', detail: error.message });
				}
            }).finally(() => {
				loader.hide();
			});
		},
		onDeleteAttachment(index) {
			this.attachments.splice(index, 1);
		},
		handleFileUpload(){
            this.submittingAttachments = this.$refs.file.files;
        },
		isImageFile(url) {
			let imageExtensions = ['JPG', 'jpg', 'JPEG', 'jpeg', 'PNG', 'png', 'GIF', 'gif', 'BMP', 'bmp'];
			let ext = url.split('.').pop();
			return imageExtensions.includes(ext) ? true : false;
		},
		showDate(value) {
            return dateFormat(value, "yyyy-mm-dd");
        },
        showTime(value) {
            return dateFormat(value, "HH:MM");
        },
        showDateTime(value) {
            return dateFormat(value, "yyyy-mm-dd HH:MM");
        },
	},

	computed: {
		userInfo() {
            return this.$store.state.authentication.user;
        },
		logOptions() {
			return this.$store.state.authentication.options;
		}
    }

}
</script>

<style scoped>
.content {
	border-top: 1px solid RGBA(33, 150, 243, 0.8);
	padding: .5em;
	width: 100%;
	overflow: auto;
}

.border {
	border: 1px solid RGBA(33, 150, 243, 0.8);
}

.border-top {
	border-top: 1px solid RGBA(33, 150, 243, 0.8);
}

.border-bottom {
	border-bottom: 1px solid RGBA(33, 150, 243, 0.8);
}

.border-left {
	border-left: 1px solid RGBA(33, 150, 243, 0.8);
}

.border-right {
	border-right: 1px solid RGBA(33, 150, 243, 0.8);
}

</style>
