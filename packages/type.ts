import { SingleColorPickerProps } from "./components/SingleColorPicker";
import { GradientColorPickerProps } from "./components/GradientColorPicker";

export interface ColorPickerChangeEvent {
  isGradient: boolean;
  single?: Omit<SingleColorPickerProps, "opacityDisabled">;
  gradient?: Omit<GradientColorPickerProps, "opacityDisabled">;
}

export type ColorPickerStyle = "single" | "gradient" | "both";

export type ColorPickerType = "single" | "gradient";

export type PopupShape = "round" | "square";
