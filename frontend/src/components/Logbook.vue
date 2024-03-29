<template>
	<div>
		<DataView :value="logs" layout="list" :paginator="true" :rows="10"
					paginatorPosition="both" :pageLinkSize="3" ref="dt"
					paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink" :rowsPerPageOptions="[5,10,25,50,100]"
					:lazy="true" :totalRecords="totalRecords" @page="onPage($event)"
					v-model:first="currentPageFirstIndex">
			<!-- <template #header>
				<div style="text-align: center; color: RGB(33, 150, 243)">{{ logbook.replace('+', ' ') }}</div>
			</template> -->
			<template #header>
				<div class="flex flex-wrap align-items-center justify-content-between gap-2">
					<span style="font-size: large; color: RGB(33, 150, 243)">{{ logbook.replace('+', ' ') }}</span>
					<Button v-if="userInfo" label="New" icon="pi pi-plus" rounded raised size="small" @click="onLogCreateClick()" />
				</div>
			</template>

			<template #list="slotProps">
				<div class="col-12" @click="onLogClick(slotProps.data)">
					<div style="padding: 1rem;">
						<div class="grid border shadow-2">
							<div class="col-6 border-right" :style="{ 'background-color': logHeaderColor(slotProps.index, isDraft(slotProps.data)) }">
								<!-- # {{currentPageFirstIndex + slotProps.index + 1}} -->
								<span v-if="isDraft(slotProps.data)">Draft</span>
								<span v-else># {{ slotProps.data['$@MID@$'] }}</span>
							</div>
							<div class="col-6" :style="{ 'background-color': logHeaderColor(slotProps.index, !slotProps.data['Date']) }">
								<span v-if="!slotProps.data['Date']">N/A</span>
								<span v-else>{{ showDateTime(slotProps.data['Date']) }}</span>
							</div>
							<div class="col-6 border-top border-right" :style="{ 'background-color': logHeaderColor(slotProps.index, !slotProps.data['Date']) }">
								{{ slotProps.data['Author'] }}
							</div>
							<div class="col-6 border-top" :style="{ 'background-color': logHeaderColor(slotProps.index, !slotProps.data['Date']) }">
								<span style="word-wrap: break-word;">{{ slotProps.data['Author Email'] }}</span>
							</div>
							<div class="col-12 border-top" :style="{ 'color': 'RGB(33, 150, 243)', 'background-color': logHeaderColor(slotProps.index, !slotProps.data['Date']) }">
								{{ slotProps.data['Subject'] }}
								&nbsp;&nbsp;
								<i v-if="slotProps.data['Attachment'].length" class="pi pi-paperclip p-text-secondary">{{ slotProps.data['Attachment'].length }}</i>
							</div>
							<div class="col-12 border-top" :style="{ 'background-color': logHeaderColor(slotProps.index, !slotProps.data['Date']) }">
								<div class="max-lines" v-html="slotProps.data['Content']"></div>
							</div>
						</div>
					</div>
				</div>
			</template>

			<template #empty>
				<div style="color: orange; padding: 10px;">No records found.</div>
			</template>
		</DataView>
	</div>
</template>

<script>
import dateFormat from 'dateformat';
import LogbookService from '../service/LogbookService';

export default {
	data() {
        return {
            logbook: null,
			first: null,
			rows: null,
			logs: [],
			totalRecords: 0,
			currentPageFirstIndex: 0,
        }
    },
	LogbookService: null,

	created() {
		this.logbookService = new LogbookService();
		this.logbook = this.$route.params.logbook;
	},

	mounted() {
		this.resetLazyParams();
		this.loadLazyData();
	},

	activated() {
		// console.log('activated');
    },

    deactivated () {
		// console.log('deactivated');
    },

	methods: {
		loadLazyData() {
			let loader = this.$loading.show();
			this.logbookService.findLogs(this.logbook, this.first, this.rows)
			.then(data => {
				this.logs = data.entries;
				this.totalRecords = data.count;
			}).catch(error => {
				if(error.response) {
					this.$toast.add({ severity: 'error', summary: 'logs loading failure', detail: error.response.data.message });
				} else {
					this.$toast.add({ severity: 'error', summary: 'logs loading failure', detail: error.message });
				}
			}).finally(() => {
				loader.hide();
			});
		},
		onPage(event) {
            this.first = event.first;
			this.rows = event.rows;
            this.loadLazyData();
        },
		resetLazyParams() {
			this.first = 0;
			this.rows = this.$refs.dt.rows;
		},
		onLogClick(log) {
			this.$router.push({ name: 'log', params: { logbook: this.logbook, id: log[['$@MID@$']] }});
		},
		onLogCreateClick() {
			// let name = this.logbook.replace(' ', '+');
			this.$router.push({name: 'logedit', params: { logbook: this.logbook, log: 'new' }});
		},
		logHeaderColor(index, draft) {
			if(draft) {
				return 'RGB(255, 176, 176)';
			} else {
				return index % 2 ? 'RGB(255, 255, 176)' : 'RGB(221, 238, 187)';
			}
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
    }

}
</script>

<style scoped>
.content {
	border: 1px solid RGBA(33, 150, 243, 0.2);
	padding: .5em;
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

.max-lines {
  display: block;/* or inline-block */
  word-wrap: break-word;
  overflow-y: hidden;
  max-height: 4.8em;
  line-height: 1.8em;
}

</style>
