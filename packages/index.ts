import { App, Plugin } from "vue";
import ColorPicker from "./components/ColorPicker";
import "./styles/index.scss";

const ColorPickerPlugin: Plugin = {
  install: (app: App) => {
    app.component(ColorPicker.name, ColorPicker);
  },
};

export { ColorPicker };
export * from "./type";
export default ColorPickerPlugin;
