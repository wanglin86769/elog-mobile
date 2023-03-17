<template>
	<div class="layout-wrapper" >
        <Toast position="top-center" />
        <div class="above-footer-wrapper">
            <Menubar :model="menu">
                <template #start>
                    <img alt="logo" src="@/assets/elog_logo.png" style="vertical-align: middle" height="30" class="mr-2">
                    <span class="logo">Elog</span>
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
	</div>
</template>

<script>

export default {
    data() {
        return {
			showAccountDialogDisplay: false,

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
        }
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
</style>
