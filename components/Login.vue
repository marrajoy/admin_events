<template>
  <div class="c-container">
    <div class="c-flex-center-center flex-column">
      <h1 class="mb-3">New Admin System</h1>
      <div v-if="mode === 'signup'">
        <h5 class="mb-3">Please sign in to continue</h5>
      </div>
      <!--<b-button type="is-primary" outlined inverted @click="logIn" v-if="mode === 'signup'">-->
      <!--SIGN IN-->
      <!--</b-button>-->
      <button class="temporary-button cstm" @click="logIn" v-if="mode === 'signup'">
        SIGN IN
      </button>
      <h3 v-if="mode !== 'signup'">Loading...</h3>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'login-component',
    props: ['mode'],
    methods: {
      logIn() {
        this.$auth.login();
      }
    }
  }
</script>

<style scoped lang="scss">
  @import "../css/variables";

  h1, h3, h5 {
    text-transform: lowercase;
    color: aliceblue;
  }

  h1 {
    font-size: 32px;
  }

  button {
    height: auto;
  }
</style>
