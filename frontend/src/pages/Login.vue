<template>
	<div class="center-screen">
		<div class="card">
			<h3 style="color: RGB(22,105,196)">登录页面跳转中 。。。</h3>
			<i style="color: RGB(22,105,196)" class="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
		</div>
	</div>
</template>

<script>
import AuthenticationService from '../service/AuthenticationService';

export default {

	data() {
        return {
            authenticationService: null
		}
	},

	created() {
		this.authenticationService = new AuthenticationService();
		let url = this.authenticationService.oauthFullUrl();
		window.location.href = url;
	}

}
</script>

<style scoped>
.center-screen {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	text-align: center;
	min-height: 100vh;
}

</style>
