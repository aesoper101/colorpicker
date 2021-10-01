import { SingleColorPickerProps } from "./components/SingleColorPicker";
import { GradientColorPickerProps } from "./components/GradientColorPicker";

export interface ColorPickerChangeEvent {
  isGradient: boolean;
  single?: SingleColorPickerProps;
  gradient?: GradientColorPickerProps;
}

export type ColorPickerStyle = "single" | "gradient" | "both";

export type ColorPickerType = "single" | "gradient";

export type PopupShape = "round" | "square";
