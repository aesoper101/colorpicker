<template>
  <div class="home">
    <ColorPicker
      v-model:single="state.single"
      v-model:gradient="state.gradient"
      use-as-popup
      popup-shape="round"
      placement="right"
      @change="onChange"
    />
    <div>single:{{ state.single }}</div>
    <div>gradient:{{ state.gradient }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import "vue3-colorpicker-pro/styles/index.scss";
import { ColorPicker } from "vue3-colorpicker-pro";
import { ColorPickerChangeEvent } from "vue3-colorpicker-pro/packages/ColorPicker";

export default defineComponent({
  name: "Home",
  components: { ColorPicker },
  setup() {
    const state = reactive({
      single: { color: "red" },
      gradient: {},
    });

    const onChange = (data: ColorPickerChangeEvent) => {
      console.log(data);
    };

    return { state, onChange };
  },
});
</script>
