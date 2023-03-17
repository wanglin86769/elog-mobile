<template>
	<div>
		<div class="col-12">
			<h3 style="color: RGB(33, 150, 243); text-align: center; margin-bottom: .5em;">{{ logbook.replace('+', ' ') }}</h3>
		</div>
		<div class="col-12">
			<div style="padding-bottom: 1rem; padding-left: 1rem; padding-right: 1rem;">
				<div class="grid border">
					<div v-if="!log['Date']" class="col-12" style="background-color: RGB(255, 176, 176)">
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
						<div v-html="log['Content']" class="content"></div>
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
