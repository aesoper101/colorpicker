import { Plugin } from "vue";
import ColorPicker from "./ColorPicker";

const ColorPickerPlugin: Plugin = {
  install: (app) => {
    app.component(ColorPicker.name, ColorPicker);
  },
};

export { ColorPicker };
export default ColorPickerPlugin;
