import {
  computed,
  defineComponent,
  ExtractPropTypes,
  reactive,
  ref,
  toRaw,
} from "vue";
import Compact from "./basic/Compact";
import Saturation from "./basic/Saturation";
import Hue from "./basic/Hue";
import Display from "./basic/Display";
import Opacity from "./basic/Opacity";
import tinycolor from "tinycolor2";

const singleColorPickerProps = {
  color: String,
  opacity: {
    type: Number,
    default: 100,
  },
  opacityDisabled: Boolean,
};

export type SingleColorPickerProps = Partial<
  ExtractPropTypes<typeof singleColorPickerProps>
>;

export default defineComponent({
  name: "SingleColorPicker",
  props: singleColorPickerProps,
  emits: ["change", "modeChange"],
  setup(props, { emit }) {
    const colorData = reactive({
      color: props.color,
      opacity: props.opacity,
    });

    const isAdvanceMode = ref(false);

    const modeChange = () => {
      emit("modeChange", isAdvanceMode.value);
    };

    const doChange = () => {
      emit("change", toRaw(colorData));
    };

    const updateColor = (color: string) => {
      colorData.color = color;
      doChange();
    };

    const updateOpacity = (opacity: number) => {
      colorData.opacity = opacity;
      doChange();
    };

    const onCompactChange = (color: string) => {
      if (color !== "advance") {
        updateColor(color);
        updateOpacity(tinycolor(color).getAlpha() * 100);
      }
      isAdvanceMode.value = color === "advance";
      modeChange();
    };

    const onGoBack = () => {
      isAdvanceMode.value = false;
      modeChange();
    };

    const onHueChange = (hue: number) => {
      const hsv = tinycolor(colorData.color).toHsv();
      hsv.h = hue;
      hsv.s = getSaturation.value || 1;
      hsv.v = getBright.value || 1;
      updateColor(tinycolor(hsv).toHexString());
    };

    const getHue = computed(() => {
      return tinycolor(colorData.color).toHsv().h;
    });

    const getSaturation = computed(() => {
      return tinycolor(colorData.color).toHsv().s * 100;
    });

    const getBright = computed(() => {
      return tinycolor(colorData.color).toHsv().v * 100;
    });

    const onSaturationChange = (saturation: number, bright: number) => {
      const hsv = {
        h: getHue.value,
        s: saturation,
        v: bright,
      };
      const color = tinycolor(hsv).toHexString();
      updateColor(color);
    };

    return () => {
      return (
        <div class="vc-single-picker">
          <div class="vc-single-picker__header" v-show={isAdvanceMode.value}>
            <span style="cursor: pointer;" onClick={onGoBack}>
              <div class="back"></div>
              <span>返回</span>
            </span>
          </div>
          <Compact onChange={onCompactChange} v-show={!isAdvanceMode.value} />
          <Saturation
            v-show={isAdvanceMode.value}
            hue={getHue.value}
            saturation={getSaturation.value}
            value={getBright.value}
            onChange={onSaturationChange}
          />
          <Hue hue={getHue.value} onChange={onHueChange} />

          {!props.opacityDisabled && (
            <Opacity
              color={colorData.color}
              opacity={colorData.opacity}
              onChange={updateOpacity}
            />
          )}
          <Display
            opacityDisabled={props.opacityDisabled}
            color={colorData.color}
            opacity={colorData.opacity}
            onColorChange={updateColor}
            onOpacityChange={updateOpacity}
          />
        </div>
      );
    };
  },
});
