<template>
	<div>
		<div class="col-12">
			<h3 style="color: RGB(33, 150, 243); text-align: center; margin-bottom: .5em;">{{ logbook.replace('+', ' ') }}</h3>
			<div style="padding-left: 1rem; padding-right: 1rem;" class="flex flex-wrap align-items-center justify-content-between gap-2">
				<!-- <span style="font-size: large; color: RGB(33, 150, 243)">{{ logbook.replace('+', ' ') }}</span> -->
				<Button v-if="canEdit" label="Edit" icon="fa fa-pencil" severity="warning" rounded raised size="small" @click="onEditClick()" />
				<Button v-if="canEdit" label="Delete" icon="fa fa-trash" severity="danger" rounded raised size="small" @click="onDeleteClick()" />
			</div>
		</div>
		<div class="col-12">
			<div style="padding-bottom: 1rem; padding-left: 1rem; padding-right: 1rem;">
				<div class="grid border">
					<div v-if="isDraft(log)" class="col-12" style="background-color: RGB(255, 176, 176)">
						<div style="text-align: center">This is a draft message</div>
					</div>
					<div class="col-12 border-top" style="background-color: RGB(224, 224, 160)">
						Message ID: {{ log['$@MID@$'] }}
					</div>
					<div class="col-12" style="background-color: RGB(224, 224, 160)">
						Entry time: 
						<span v-if="!log['Date']">N/A</span>
						<span v-else>{{ showDateTime(log['Date']) }}</span>
					</div>
					<div class="col-4 border-top border-right" style="background-color: RGBA(204, 204, 255)">
						Author:
					</div>
					<div class="col-8 border-top" style="background-color: RGBA(221, 238, 187)">
						{{ log['Author'] }}
					</div>
					<div class="col-4 border-top border-right" style="background-color: RGBA(204, 204, 255)">
						Author Email:
					</div>
					<div class="col-8 border-top" style="background-color: RGBA(221, 238, 187)">
						{{ log['Author Email'] }}
					</div>
					<div class="col-4 border-top border-right" style="background-color: RGBA(204, 204, 255)">
						Category:
					</div>
					<div class="col-8 border-top" style="background-color: RGBA(221, 238, 187)">
						{{ log['Category'] }}
					</div>
					<div class="col-4 border-top border-right" style="background-color: RGBA(204, 204, 255)">
						System:
					</div>
					<div class="col-8 border-top" style="background-color: RGBA(221, 238, 187)">
						{{ log['System'] }}
					</div>
					<div class="col-4 border-top border-right" style="background-color: RGBA(204, 204, 255)">
						Subject:
					</div>
					<div class="col-8 border-top" style="background-color: RGBA(221, 238, 187)">
						{{ log['Subject'] }}
					</div>
					<!-- <div class="col-12"> -->
						<div v-html="log['Content']" class="content" style="white-space: pre-wrap;"></div>
					<!-- </div> -->

					<div v-for="(item, index) of log.Attachment" :key="index" class="col-12" style="padding-bottom: 0">
						<div class="grid">
							<div class="col-4 border-top border-right" style="background-color: RGBA(204, 204, 255)">
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

				</div>
			</div>
		</div>

		<Dialog header="Message confirmation" v-model:visible="logDeleteConfirmDisplay" :style="{ width: '100vw' }" :modal="true">
            <div>
                <i class="fa fa-exclamation-circle fa-2x" style="vertical-align: middle; color: orange"></i>
                <span class="p-text-center ml-2" style="vertical-align: middle">Really delete this entry?</span>
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" @click="logDeleteConfirmDisplay=false" class="p-button-text"/>
                <Button label="OK" icon="pi pi-check" @click="deleteLog" />
            </template>
        </Dialog>
	</div>
</template>

<script>
import dateFormat from 'dateformat';
import LogbookService from '../service/LogbookService';

export default {
	data() {
        return {
            logbook: null,
			log: {},
			logId: null,
			logDeleteConfirmDisplay: false,
        }
    },
	LogbookService: null,

	created() {
		this.logbookService = new LogbookService();

		this.logbook = this.$route.params.logbook;
		this.logId = this.$route.params.id;		
	},

	mounted() {
		this.loadData();
	},

	activated() {
    },

    deactivated () {
    },

	methods: {
		loadData() {
			let loader = this.$loading.show();
			this.logbookService.findSingleLog(this.logbook, this.logId)
			.then(data => {
				this.log = data;
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
		onEditClick() {
			this.$router.push({name: 'logedit', params: { logbook: this.logbook, log: this.logId }});
		},
		onDeleteClick() {
			this.logDeleteConfirmDisplay = true;
		},
		deleteLog() {
			let loader = this.$loading.show();

			let messageId = this.log['$@MID@$'];
			let formData = new FormData();
			formData.append('edit_id', messageId);
            // formData.append('Author', this.log['Author']);
			// formData.append('Author_Email', this.log['Author Email']);
			// formData.append('Category', this.log['Category']);
			// formData.append('System', this.log['System']);
			// formData.append('Subject', this.log['Subject']);
			// formData.append('Text', this.log['Content']);
			formData.append('jcmd', 'XDelete');
			formData.append('cmd', 'Delete');
			formData.append('unm', this.userInfo.username);
			formData.append('upwd', this.userInfo.pwHash);

            this.logbookService.submitLogFormData(this.logbook, formData)
			.then(() => {
				this.logDeleteConfirmDisplay = false;
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
		isImageFile(url) {
			let imageExtensions = ['JPG', 'jpg', 'JPEG', 'jpeg', 'PNG', 'png', 'GIF', 'gif', 'BMP', 'bmp'];
			let ext = url.split('.').pop();
			return imageExtensions.includes(ext) ? true : false;
		},
		isDraft(log) {
			// If 'Date' is empty or 'Draft' is not empty
			return !log['Date'] || log['Draft'];
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
		canEdit() {
			return this.userInfo && this.log && this.userInfo.email === this.log['Author Email'];
		},
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
