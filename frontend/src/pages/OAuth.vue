<template>
    <div style="text-align: center; border: 3px darkcyan ridge; width: 80%; background: lightcyan; padding: 20px; margin: 0 auto; margin-top: 100px">
        <div style="margin-top: 40px; margin-bottom: 100px">
            <!-- <img alt="logo" src="@/assets/blue_computer_icon.png" style="vertical-align: middle" height="35" class="p-mr-0"> -->
            <h1 class="p-text-center p-ml-2" style="vertical-align: middle; color: #007bff">数据库应用手机版</h1>
        </div>

        <div v-if="alert && alert.message" style="color: orange">
            <div>
                <i class="fa fa-exclamation-triangle fa-3x" style="vertical-align: middle"></i>
                <span class="p-text-center p-ml-2" style="font-size: 1.8em; vertical-align: middle">登录失败</span>
            </div>
            <h2 class="p-text-center" style="margin-top: 10px">{{ alert.message }}</h2>
            <Button label="重新登录" style="margin-top: 30px" @click="logoutAndLogin" />
        </div>

        <div v-else style="color: #007bff">
            <h2 class="p-text-center" style="margin-top: 10px">登录中。。。</h2>
            <i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
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
        console.log("OAuth created()");
        console.log(this.$route.path);
        console.log(this.$route.query.code);

        this.authenticationService = new AuthenticationService();

        this.$store.dispatch('alert/clear');

        this.$store.dispatch('authentication/login', this.$route.query.code)
            .then(() => {
                console.log('login Success');

            })
            .catch((error) => {
                console.log('login Failed');
                console.log(error);
            });
            
    },

    methods: {
        logoutAndLogin() {
            // console.log("test!!!");
            this.$store.dispatch('authentication/logout')
            .then(() => {
                console.log("logout done");
                // window.location.href = "https://login.csns.ihep.ac.cn/logout?WebServerURL=http://localhost:8080";
                // window.location.href = this.authenticationService.logoutFullUrl();
                window.location.href = this.authenticationService.reloginFullUrl();
            })
            // this.$router.push({name: 'Home'});
        }
    },

    computed: {
        loggedIn() {
            return this.$store.state.authentication.status.loggedIn;
        },
        userInfo() {
            return this.$store.state.authentication.user;
        },
        alert() {
            return this.$store.state.alert;
        }
    }

}
</script>

<style scoped>

</style>

