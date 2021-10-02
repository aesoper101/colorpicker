<script setup lang="ts">
  // This starter template is using Vue 3 <script setup> SFCs
  // Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup

  import {
    ColorPicker,
    ColorPickerChangeEvent,
    GradientColorPickerProps,
    SingleColorPickerProps,
  } from "../packages";
  import "../packages/styles/index.scss";
  import { ref } from "vue";

  const onChange = (evt: ColorPickerChangeEvent) => {
    console.log(evt);
  };

  const single = ref<SingleColorPickerProps>({ opacity: 0 });
  const g = ref<GradientColorPickerProps>({});
</script>

<template>
  <img alt="Vue logo" src="./assets/logo.png" />
  <ColorPicker
    :single="single"
    :gradient="g"
    @change="onChange"
    :useAsPopup="true"
    use-style="both"
  />
</template>

<style>
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
  }
</style>
