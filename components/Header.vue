<template>
  <section>
    <Spinner v-if="isLoading"></Spinner>
    <div class="head">
      <div class="header-admin">
        <!--<div>-->
        <!--<img src="~/assets/operation.png" class="mobile_btn">-->
        <!--</div>-->
        <span>Operations Admin</span>
      </div>
      <div v-if="!isAuthenticated">
        <a @click="login" class="login-style">Login</a>
      </div>
      <div class="header-projects">{{currentclient}}</div>
      <div v-if="isAuthenticated">
        <a v-if="changeSystem" @click="goToSystemPick" class="login-style cursor-pointer">Change system</a>
        <span v-if="changeSystem" class="mx-2">|</span>
        <a @click="logout" class="login-style cursor-pointer">Logout</a>
      </div>
    </div>
    <div class="menu-wrap" v-if="!sidebarOff">
      <template>
        <Slide noOverlay width="190">
          <div v-for="(item) in clients" v-bind:key="item.client_name" class="popup-menu-item">
            <span class="cursor-pointer" @click="goToClient(item.client_id)">{{item.client_name}}</span>
          </div>
          <div style="position: absolute; bottom: 8%">
            <span style="font-size: 14px">Version: {{appVersion}}</span>
          </div>
        </Slide>
      </template>
    </div>
  </section>
</template>

<script>
  import {Slide} from 'vue-burger-menu'
  import {restService} from '../plugins/axios';
  import {authService} from '../services/auth-service';
  import {tableService} from '../services/table-service';
  import Spinner from '../components/Spinner'
  import * as packageJson from '../package.json';

  export default {
    name: 'clientheader',
    props: {clientid: String, sidebarOff: Boolean, changeSystem: true},
    data: function () {
      return {
        isLoading: false,
        clients: [],
        currentclient: '',
        isAuthenticated: false,
        appVersion: '',
      }
    },
    created() {
      this.appVersion = packageJson.version;
      authService.loading.subscribe(val => this.isLoading = val);
      authService.authenticated.subscribe(val => this.isAuthenticated = val);
    },
    watch: {
      clientid: function () {
        this.currentclientname()
      }
    },
    methods: {
      login() {
        this.$auth.login()
      },
      logout() {
        this.$auth.logOut()
      },
      goToSystemPick() {
        this.$router.push('/system-pick');
      },
      goToClient(clientId) {
        tableService.clearEventSearch();
        this.$router.push('/admin/clients/' + clientId);
      },
      fetchClients: function () {
        const url = '/api/v3/clients/';

        restService.get(url)
          .then(response => {
            this.clients = response.data;
            this.currentclientname();
          })
          .catch(err => {
            this.$toast.error(`Error fetching clients: ${err}`);
          })
      },
      currentclientname: function () {
        let filteredclient;
        if (this.clientid == undefined || this.clients == []) {
          this.currentclient = ''
        } else {
          filteredclient = this.clients.filter(
            client => client.client_id === this.clientid
          );
          if (filteredclient[0] === undefined) return
          this.currentclient = filteredclient[0].client_name
        }
      }
    },
    components: {
      Slide,
      Spinner
    },
    mounted: function () {
      this.fetchClients()
    }
  }
</script>
<style scoped>
  .header-admin {
    margin-left: 50px;
    display: flex;
    align-items: center;
  }

  .header-projects {
    text-transform: uppercase;
  }
</style>
