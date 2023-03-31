<template>
	<div class="layout-wrapper" >
        <Toast position="top-center" />
        <div class="above-footer-wrapper">
            <Menubar :model="menu">
                <template #start>
                    <img alt="logo" src="@/assets/elog_logo.png" style="vertical-align: middle" height="30" class="mr-2">
                    <span class="logo">Elog</span>
                </template>
                <template #end v-if="$route.params && $route.params.logbook">
                    <SplitButton v-if="userInfo" :label="userInfo.username" class="p-button-sm" icon="pi pi-user" outlined :model="buttonItems"></SplitButton>
                    <Button v-else label="Login" class="p-button-primary p-button-sm" style="width: 100px" @click="onLoginClick" />
                </template>
            </Menubar>

            <div style="overflow-x: hidden">
                <router-view v-slot="{ Component }">
                    <keep-alive>
                        <component :is="Component" :key="$route.fullPath" v-if="$route.meta.keepAlive"></component>
                    </keep-alive>
                    <component :is="Component" :key="$route.fullPath" v-if="!$route.meta.keepAlive"></component>
                </router-view>
            </div>
        </div>

        <div class="layout-footer" style="text-align: center">
            <span class="footer-text">Copyright © 2023 China Spallation Neutron Source（CSNS）</span>
        </div>

        <Dialog id="login_dialog" v-model:visible="loginDialogDisplay" header="Login" :style="{ width: '100vw' }" :modal="true">
            <div class="field">
                <label>Username</label>
                <input type="text" v-model="username" class="text-base text-color surface-overlay p-2 border-1 border-solid surface-border border-round appearance-none outline-none focus:border-primary w-full" autofocus @keyup.enter="login" >
            </div>
            <div class="field">
                <label>Password</label>
                <input type="password" v-model="password" class="text-base text-color surface-overlay p-2 border-1 border-solid surface-border border-round appearance-none outline-none focus:border-primary w-full" @keyup.enter="login" >
            </div>
            <template #footer>
                <Button label="Cancel" icon="pi pi-times" @click="loginDialogDisplay = false" text />
                <Button label="OK" icon="pi pi-check" @click="login()" />
            </template>
        </Dialog>

        <Dialog header="User info" v-model:visible="userInfoDialogDisplay" :style="{ width: '100vw' }" :modal="true">
            <div class="grid">
                <div class="col-6">
                    <span style="font-weight: bold">username: </span>
                </div>
                <div class="col-6">
                    <span style="color: RGB(33, 150, 243)">{{ userInfo.username }}</span>
                </div>
                <div class="col-6">
                    <span style="font-weight: bold">displayName: </span>
                </div>
                <div class="col-6">
                    <span style="color: RGB(33, 150, 243)">{{ userInfo.displayName }}</span>
                </div>
                <div class="col-6">
                    <span style="font-weight: bold">email: </span>
                </div>
                <div class="col-6">
                    <span style="color: RGB(33, 150, 243)">{{ userInfo.email }}</span>
                </div>
            </div>

            <template #footer>
                <Button label="Close" icon="pi pi-times" @click="userInfoDialogDisplay=false" class="p-button-text"/>
            </template>
        </Dialog>

        <Dialog header="Logout" v-model:visible="logoutDialogDisplay" :style="{ width: '100vw' }" :modal="true">
            <div>
                <i class="fa fa-exclamation-circle fa-2x" style="vertical-align: middle; color: orange"></i>
                <span class="p-text-center ml-2" style="vertical-align: middle">Are you sure you want to log out?</span>
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" @click="logoutDialogDisplay=false" class="p-button-text"/>
                <Button label="OK" icon="pi pi-check" @click="logout" />
            </template>
        </Dialog>
	</div>
</template>

<script>

export default {
    data() {
        return {
            loginDialogDisplay: false,
            userInfoDialogDisplay: false,
            logoutDialogDisplay: false,

            username: '',
            password: '',

			menu: [
                {
                   label:'Home',
                   icon:'pi pi-fw pi-home',
                   to: '/'
                },
                {
                   label:'About',
                   icon:'pi pi-fw pi-info-circle',
                   to: '/about'
                },
            ],

            buttonItems: [
                {
                    label: 'User info',
                    icon: 'pi pi-user',
                    command: () => {
                        this.onUserInfoClick();
                    }
                },
                {
                    label: 'Logout',
                    icon: 'pi pi-power-off',
                    command: () => {
                        this.onLogoutClick();
                    }
                },
            ]
        }
    },
    methods: {
        onLoginClick() {
            this.loginDialogDisplay = true;
        },
        onUserInfoClick() {
            this.userInfoDialogDisplay = true;
        },
        onLogoutClick() {
            this.logoutDialogDisplay = true;
        },
        login() {
            if(!this.username) {
                this.$toast.add({ severity: 'error', summary: 'Failure', detail: 'username is required' });
                return;
            }
            if(!this.password) {
                this.$toast.add({ severity: 'error', summary: 'Failure', detail: 'password is required' });
                return;
            }

            let logbook = this.$route.params.logbook.replace('+', ' ');

            let loader = this.$loading.show();
            this.$store.dispatch('authentication/login', { username: this.username, password: this.password, logbook: logbook })
            .then(() => {
                this.loginDialogDisplay = false;
                this.$toast.add({ severity: 'info', summary: 'Success', detail: 'Logged in', life: 5000 });
            })
            .catch((error) => {
                if(error.response) {
                    this.$toast.add({ severity: 'error', summary: 'Failure', detail: error.response.data.message });
                } else {
                    this.$toast.add({ severity: 'error', summary: 'Failure', detail: error.message });
                }
            }).finally(() => {
				loader.hide();
			});
        },
        logout() {
            this.$store.dispatch('authentication/logout')
            .then(() => {
                this.logoutDialogDisplay = false;
                this.$toast.add({ severity: 'info', summary: 'Success', detail: 'Logged out', life: 5000 });
            })
        },
    },
    computed: {
        userInfo() {
            return this.$store.state.authentication.user;
        },
    },
	
}
</script>

<style lang="scss">
@import './App.scss';

.logo {
	vertical-align: middle; 
	color: RGB(33,158,243); 
	font-weight: bold; 
	font-size: 1.2em;
}

#login_dialog .p-dialog-title {
    color: RGB(33, 150, 243);
}
</style>
