import {
  computed,
  defineComponent,
  nextTick,
  onMounted,
  reactive,
  ref,
  ExtractPropTypes,
  toRaw,
  watch,
} from "vue";
import Compact from "./basic/Compact";
import Saturation from "./basic/Saturation";
import Hue from "./basic/Hue";
import Opacity from "./basic/Opacity";
import Display from "./basic/Display";
import tinycolor from "tinycolor2";

import { Angle } from "vue3-angle";
import "vue3-angle/style/bundle.css";
import { DOMUtils } from "@aesoper/normal-utils";

const gradientColorPickerProps = {
  startColor: {
    type: String,
    default: "#ffffff",
  },
  startColorOpacity: {
    type: Number,
    default: 100,
    validator: (value: number) => {
      return value >= 0 && value <= 100;
    },
  },
  endColor: {
    type: String,
    default: "#000000",
  },
  endColorOpacity: {
    type: Number,
    default: 100,
    validator: (value: number) => {
      return value >= 0 && value <= 100;
    },
  },
  degree: {
    type: Number,
    default: 90,
  },
  isStartColorActive: {
    type: Boolean,
    default: true,
  },
  startColorLeft: {
    type: Number,
    default: 0,
  },
  endColorLeft: {
    type: Number,
    default: 100,
  },
  opacityDisabled: Boolean,
};

export type GradientColorPickerProps = Partial<
  ExtractPropTypes<typeof gradientColorPickerProps>
>;

export default defineComponent({
  name: "GradientColorPicker",
  props: gradientColorPickerProps,
  emits: ["change", "modeChange"],
  setup(props, { emit }) {
    const colorData = reactive({
      startColorLeft: props.startColorLeft,
      endColorLeft: props.endColorLeft,
      startColor: props.startColor,
      startColorOpacity: props.startColorOpacity,
      endColor: props.endColor,
      endColorOpacity: props.endColorOpacity,
      degree: props.degree,
      isStartColorActive: props.isStartColorActive,
    });

    const isAdvanceMode = ref(false);

    const modeChange = () => {
      emit("modeChange", isAdvanceMode.value);
    };

    const doChange = () => {
      emit("change", toRaw(colorData));
    };

    const updateColor = (color: string) => {
      if (colorData.isStartColorActive) {
        colorData.startColor = color;
      } else {
        colorData.endColor = color;
      }
      doChange();
    };

    const updateOpacity = (opacity: number) => {
      if (colorData.isStartColorActive) {
        colorData.startColorOpacity = opacity;
      } else {
        colorData.endColorOpacity = opacity;
      }
      doChange();
    };

    const onCompactChange = (color: string) => {
      isAdvanceMode.value = color === "advance";
      if (!isAdvanceMode.value) {
        updateColor(color);
        updateOpacity(tinycolor(color).getAlpha() * 100);
      }
      modeChange();
    };

    const onGoBack = () => {
      isAdvanceMode.value = false;
      modeChange();
    };

    const startGradientRef = ref<HTMLElement>();
    const stopGradientRef = ref<HTMLElement>();
    const colorRangeRef = ref<HTMLElement>();

    const gradientBg = computed(() => {
      const startColor = tinycolor(colorData.startColor)
        .setAlpha(colorData.startColorOpacity / 100)
        .toRgbString();
      const endColor = tinycolor(colorData.endColor)
        .setAlpha(colorData.endColorOpacity / 100)
        .toRgbString();
      return {
        backgroundImage: `linear-gradient(${colorData.degree}deg, ${startColor} ${colorData.startColorLeft}%, ${endColor} ${colorData.endColorLeft}%,  rgb(0, 0, 0) 100%)`,
      };
    });

    const startColorStyle = computed(() => {
      return {
        left: `calc(${colorData.startColorLeft}% - 8px)`,
      };
    });

    const endColorStyle = computed(() => {
      return {
        left: `calc(${colorData.endColorLeft}% - 8px)`,
      };
    });

    const onDegreeBlur = (evt: FocusEvent) => {
      const target = evt.target as HTMLInputElement;
      const degree = parseInt(target.value.replace("°", ""));
      if (!isNaN(degree)) {
        colorData.degree = degree % 360;
      }
      doChange();
    };

    const onUpdateOpacity = (opacity: number) => {
      updateOpacity(opacity);
    };

    const onHueChange = (hue: number) => {
      const hsv = tinycolor(getColor.value).toHsv();
      hsv.h = hue;
      hsv.s = getSaturation.value / 100 || 1;
      hsv.v = getBright.value / 100 || 1;
      updateColor(tinycolor(hsv).toHexString());
    };

    const onSaturationChange = (saturation: number, bright: number) => {
      const hsv = {
        h: getHue.value,
        s: saturation,
        v: bright,
      };
      const color = tinycolor(hsv).toHexString();
      updateColor(color);
    };

    const onDegreeChange = (angle: number) => {
      colorData.degree = angle;
      doChange();
    };

    const getColor = computed(() => {
      return colorData.isStartColorActive
        ? colorData.startColor
        : colorData.endColor;
    });

    const getOpacity = computed(() => {
      return colorData.isStartColorActive
        ? colorData.startColorOpacity
        : colorData.endColorOpacity;
    });

    const getHue = computed(() => {
      return tinycolor(getColor.value).toHsv().h;
    });

    const getSaturation = computed(() => {
      return tinycolor(getColor.value).toHsv().s * 100;
    });

    const getBright = computed(() => {
      return tinycolor(getColor.value).toHsv().v * 100;
    });

    const dragStartRange = (evt: MouseEvent) => {
      colorData.isStartColorActive = true;
      if (colorRangeRef.value && startGradientRef.value) {
        const rect = colorRangeRef.value?.getBoundingClientRect();

        let left = evt.clientX - rect.left;
        left = Math.max(startGradientRef.value.offsetWidth / 2, left);
        left = Math.min(
          left,
          rect.width - startGradientRef.value.offsetWidth / 2
        );

        colorData.startColorLeft = Math.round(
          ((left - startGradientRef.value.offsetWidth / 2) /
            (rect.width - startGradientRef.value.offsetWidth)) *
            100
        );

        doChange();
      }
    };

    const dragEndRange = (evt: MouseEvent) => {
      colorData.isStartColorActive = false;

      if (colorRangeRef.value && stopGradientRef.value) {
        const rect = colorRangeRef.value?.getBoundingClientRect();

        let left = evt.clientX - rect.left;
        left = Math.max(stopGradientRef.value.offsetWidth / 2, left);
        left = Math.min(
          left,
          rect.width - stopGradientRef.value.offsetWidth / 2
        );

        colorData.endColorLeft = Math.round(
          ((left - stopGradientRef.value.offsetWidth / 2) /
            (rect.width - stopGradientRef.value.offsetWidth)) *
            100
        );

        doChange();
      }
    };
    watch(
      () => props.startColorLeft,
      (startColorLeft) => {
        colorData.startColorLeft = startColorLeft;
      }
    );

    watch(
      () => props.endColorLeft,
      (endColorLeft) => {
        colorData.endColorLeft = endColorLeft;
      }
    );

    watch(
      () => props.startColor,
      (startColor) => {
        colorData.startColor = startColor;
      }
    );

    watch(
      () => props.startColorOpacity,
      (startColorOpacity) => {
        colorData.startColorOpacity = startColorOpacity;
      }
    );

    watch(
      () => props.endColor,
      (endColor) => {
        colorData.endColor = endColor;
      }
    );

    watch(
      () => props.endColorOpacity,
      (endColorOpacity) => {
        colorData.endColorOpacity = endColorOpacity;
      }
    );

    watch(
      () => props.degree,
      (degree) => {
        colorData.degree = degree;
      }
    );

    watch(
      () => props.isStartColorActive,
      (isStartColorActive) => {
        colorData.isStartColorActive = isStartColorActive;
      }
    );

    onMounted(() => {
      nextTick(() => {
        if (stopGradientRef.value && startGradientRef.value) {
          DOMUtils.triggerDragEvent(stopGradientRef.value, {
            drag: (event: Event) => {
              dragEndRange(event as MouseEvent);
            },
            end: (event: Event) => {
              dragEndRange(event as MouseEvent);
            },
          });
          DOMUtils.triggerDragEvent(startGradientRef.value, {
            drag: (event: Event) => {
              dragStartRange(event as MouseEvent);
            },
            end: (event: Event) => {
              dragStartRange(event as MouseEvent);
            },
          });
        }
      }).then();
    });

    const renderGradient = () => {
      return (
        <div class="vc-gradient-picker__body">
          <div class="vc-color-range" ref={colorRangeRef}>
            <div class="vc-color-range__container">
              <div class="vc-background" style={gradientBg.value}></div>
              <div class="vc-gradient__stop__container">
                <div
                  class={[
                    "vc-gradient__stop",
                    {
                      "vc-gradient__stop--current":
                        colorData.isStartColorActive,
                    },
                  ]}
                  ref={startGradientRef}
                  style={startColorStyle.value}
                >
                  <span class="vc-gradient__stop--inner"></span>
                </div>
                <div
                  class={[
                    "vc-gradient__stop",
                    {
                      "vc-gradient__stop--current": !colorData.isStartColorActive,
                    },
                  ]}
                  ref={stopGradientRef}
                  style={endColorStyle.value}
                >
                  <span class="vc-gradient__stop--inner"></span>
                </div>
              </div>
            </div>
          </div>
          <div class="vc-picker-degree-input vc-degree-input">
            <div class="vc-degree-input__control">
              <input
                value={colorData.degree + "°"}
                onBlur={(v) => onDegreeBlur(v)}
              />
            </div>
            <div class="vc-degree-input__panel">
              <div class="vc-degree-input__disk">
                <Angle
                  angle={colorData.degree}
                  size={40}
                  onChange={onDegreeChange}
                />
              </div>
            </div>
          </div>
        </div>
      );
    };

    return () => {
      return (
        <div class="vc-gradient-picker">
          <div class="vc-gradient-picker__header" v-show={isAdvanceMode.value}>
            <span style="cursor: pointer;" onClick={onGoBack}>
              <div class="back"></div>
              <span>返回</span>
            </span>
          </div>
          {renderGradient()}
          <Compact onChange={onCompactChange} v-show={!isAdvanceMode.value} />
          {isAdvanceMode.value && (
            <Saturation
              hue={getHue.value}
              saturation={getSaturation.value}
              value={getBright.value}
              onChange={onSaturationChange}
            />
          )}
          <Hue hue={getHue.value} onChange={onHueChange} />

          {!props.opacityDisabled && (
            <Opacity
              opacity={getOpacity.value}
              color={getColor.value}
              onChange={onUpdateOpacity}
            />
          )}
          <Display
            opacityDisabled={props.opacityDisabled}
            color={getColor.value}
            opacity={getOpacity.value}
            onColorChange={(color) => updateColor(color)}
            onOpacityChange={(opacity) => onUpdateOpacity(opacity)}
          />
        </div>
      );
    };
  },
});
