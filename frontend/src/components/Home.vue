<template>
	<div>
		<Panel v-for="(item, index) of logbooks" :key="index" :header="item.group" :toggleable="true">
			<div v-for="(logbook, index) of item.logbooks" :key="index">
				<div class="p-col-12">
					<div class="card p-shadow-2" @click="onLogbookClick(logbook.name)">
							<div class="p-grid">
								<div class="p-col-9" style="color: RGB(33, 150, 243)">
									<i class="fa fa-book"></i>
									<span style="margin-left: .5em;">{{logbook.name}}</span>
								</div>
								<div class="p-col-3">
									{{logbook.number}}
								</div>
								<div class="p-col-12">
									{{logbook.last}}
								</div>
							</div>
					</div>
				</div>
			</div>
        </Panel>

		<Panel header="Official Demo" :toggleable="true">
			<div class="p-col-12">
				<div class="card p-shadow-2" @click="onLogbookClick('Linux Demo')">
					<div class="p-grid">
						<div class="p-col-9" style="color: RGB(33, 150, 243)">
							<i class="fa fa-book"></i>
							<span style="margin-left: .5em;">Linux Demo</span>
						</div>
						<div class="p-col-3">
							N/A
						</div>
						<div class="p-col-12">
							N/A
						</div>
					</div>
				</div>
			</div>
        </Panel>
	</div>
</template>

<script>
import LogbookService from '../service/LogbookService';

export default {
	data() {
        return {
            logbooks: [],
        }
    },
	LogbookService: null,

	created() {
		this.logbookService = new LogbookService();
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
			this.logbookService.findLogbooks()
			.then(data => {
				this.logbooks = data;
			}).catch(error => {
				if(error.response) {
					this.$toast.add({ severity: 'warn', summary: 'Logbooks loading failure, will show demo logbook only', detail: error.response.data.message });
				} else {
					this.$toast.add({ severity: 'warn', summary: 'Logbooks loading failure, will show demo logbook only', detail: error.message });
				}
			})
		},
		onLogbookClick(name) {
			name = name.replace(' ', '+');
			this.$router.push({name: 'logbook', params: { logbook: name }});
		}
	},

	computed: {
		
    }

}
</script>

<style scoped>
::v-deep(.p-panel-header) {
	background-color: RGB(204, 204, 255);
}

::v-deep(.p-panel-content) {
	background-color: RGB(247, 247, 247);
}


</style>
