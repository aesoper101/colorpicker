import {
  computed,
  defineComponent,
  h,
  PropType,
  reactive,
  ref,
  Teleport,
  watch,
} from "vue";

import SingleColorPicker, { SingleColorPickerProps } from "./SingleColorPicker";
import GradientColorPicker, {
  GradientColorPickerProps,
} from "./GradientColorPicker";
import tinycolor from "tinycolor2";
import { createPopper, Instance } from "@popperjs/core";

import { ClickOutsideDirective } from "vue3-normal-directive";
import { Placement } from "@popperjs/core/lib/enums";

export interface ColorPickerChangeEvent {
  isGradient: boolean;
  single?: SingleColorPickerProps;
  gradient?: GradientColorPickerProps;
}

export type ColorPickerStyle = "single" | "gradient" | "both";

export type ColorPickerType = "single" | "gradient";

export type PopupShape = "round" | "square";

export default defineComponent({
  name: "ColorPicker",
  directives: { customClickAway: ClickOutsideDirective },
  props: {
    disabled: Boolean,
    activeType: String as PropType<ColorPickerType>,
    useGradient: {
      type: Boolean,
      default: true,
    },
    useStyle: {
      type: String as PropType<ColorPickerStyle>,
      default: "both",
    },
    useAsPopup: Boolean,
    popupShape: {
      type: String as PropType<PopupShape>,
      default: "square",
    },
    single: {
      type: Object as PropType<SingleColorPickerProps>,
      default: () => {
        return { color: "#000000", opacity: 100 };
      },
    },
    gradient: {
      type: Object as PropType<GradientColorPickerProps>,
      default: () => {
        return {
          startColorLeft: 0,
          endColorLeft: 100,
          startColor: "#ffffff",
          startColorOpacity: 100,
          endColor: "#000000",
          endColorOpacity: 100,
          degree: 90,
          isStartColorActive: false,
        };
      },
    },
    placement: {
      type: String as PropType<Placement>,
      default: "auto",
    },
    zIndex: {
      type: Number,
      default: 10000,
    },
    opacityDisabled: Boolean,
  },
  emits: ["update:single", "update:gradient", "change"],
  setup(props, { emit }) {
    const isGradientActive = ref(
      props.useStyle === "gradient" ||
        (props.useStyle !== "single" && props.activeType === "gradient")
    );
    const isAdvanceMode = ref(false);

    const colorData = reactive<{
      single: SingleColorPickerProps;
      gradient: GradientColorPickerProps;
    }>({
      single: props.single,
      gradient: props.gradient,
    });

    const onModeChange = (advanceMode: boolean) => {
      isAdvanceMode.value = advanceMode;
    };

    const onGradientPickerChange = (data: GradientColorPickerProps) => {
      colorData.gradient = data;
      emit("update:gradient", data);
      emit("change", {
        isGradient: true,
        gradient: data,
      });
    };

    const onSinglePickerChange = (data: SingleColorPickerProps) => {
      colorData.single = data;
      emit("update:single", data);
      emit("change", {
        isGradient: false,
        single: data,
      });
    };

    const getBgColor = computed(() => {
      const gradientData = colorData.gradient;
      const singleData = colorData.single;
      if (isGradientActive.value) {
        const startColor = tinycolor(gradientData.startColor)
          .setAlpha((gradientData.startColorOpacity || 100) / 100)
          .toRgbString();
        const endColor = tinycolor(gradientData.endColor)
          .setAlpha((gradientData.endColorOpacity || 100) / 100)
          .toRgbString();
        return {
          backgroundImage: `linear-gradient(${gradientData.degree}deg, ${startColor} ${gradientData.startColorLeft}%, ${endColor} ${gradientData.endColorLeft}%,  rgb(0, 0, 0) 100%)`,
        };
      }

      const opacity =
        singleData && singleData.opacity
          ? singleData.opacity / 100
          : singleData.opacity;
      return {
        background: singleData.color,
        opacity: opacity,
      };
    });

    watch(
      () => props.single,
      (data) => {
        colorData.single = data;
      }
    );

    watch(
      () => props.gradient,
      (data) => {
        colorData.gradient = data;
      }
    );

    watch(
      () => props.activeType,
      (value) => {
        isGradientActive.value =
          props.useStyle !== "single" && props.activeType === "gradient";
      }
    );

    const onClick = (opName: string) => {
      isGradientActive.value = opName === "Gradient";
      if (isGradientActive.value) {
        emit("change", {
          isGradient: true,
          gradient: colorData.gradient,
        });
      } else {
        emit("change", {
          isGradient: false,
          single: colorData.single,
        });
      }
    };

    // 开关
    const renderTab = () => {
      if (props.useStyle === "both" && !isAdvanceMode.value)
        return (
          <div class="vc-colorpicker--tabs">
            <div class="vc-colorpicker--tabs__inner">
              <div
                class={[
                  "vc-colorpicker--tabs__btn",
                  {
                    "vc-btn-active": !isGradientActive.value,
                  },
                ]}
                onClick={() => onClick("single")}
              >
                <button>
                  <div class="vc-btn__content">纯色</div>
                </button>
              </div>
              <div
                class={[
                  "vc-colorpicker--tabs__btn",
                  {
                    "vc-btn-active": isGradientActive.value,
                  },
                ]}
                onClick={() => onClick("Gradient")}
              >
                <button>
                  <div class="vc-btn__content">渐变</div>
                </button>
              </div>
              <div
                class="vc-colorpicker--tabs__bg"
                style={{
                  width: `50%`,
                  left: `calc(${isGradientActive.value ? 50 : 0}%)`,
                }}
              ></div>
            </div>
          </div>
        );
    };

    // 渐变色选择
    const renderGradientPicker = () => {
      if (props.useStyle !== "single") {
        return (
          <GradientColorPicker
            opacityDisabled={props.opacityDisabled}
            onModeChange={onModeChange}
            onChange={onGradientPickerChange}
            {...colorData.gradient}
          />
        );
      }
    };

    const renderSinglePicker = () => {
      if (props.useStyle !== "gradient") {
        return (
          <SingleColorPicker
            opacityDisabled={props.opacityDisabled}
            onModeChange={onModeChange}
            onChange={onSinglePickerChange}
            {...colorData.single}
          />
        );
      }
    };

    const renderPicker = () => {
      return (
        <div class="vc-colorpicker">
          <div class="vc-colorpicker--container">
            {renderTab()}
            {isGradientActive.value && renderGradientPicker()}
            {!isGradientActive.value && renderSinglePicker()}
          </div>
        </div>
      );
    };

    const pickerRef = ref<HTMLElement>();
    const pickerPopupRef = ref<HTMLElement>();

    const showPopup = ref(false);

    let instance: Instance | null = null;

    const onHidePopup = () => {
      showPopup.value = false;
      if (instance) {
        instance.destroy();
        instance = null;
      }
    };

    const onShowPopup = () => {
      showPopup.value = true;
      if (pickerPopupRef.value && pickerRef.value) {
        instance = createPopper(pickerRef.value, pickerPopupRef.value, {
          strategy: "fixed",
          placement: props.placement,
          modifiers: [
            {
              name: "eventListeners",
              options: {
                scroll: true,
                resize: true,
              },
            },
            {
              name: "flip",
              options: {
                flipVariations: false,
                altBoundary: true,
                fallbackPlacements: [
                  "right",
                  "left",
                  "bottom-start",
                  "bottom-end",
                  "bottom",
                  "top-start",
                  "top-end",
                  "right",
                ],
              },
            },
          ],
        });
      }
    };

    const renderTeleport = () => {
      const teleportBody = (
        <div
          class="vc-popup"
          style={{ zIndex: props.zIndex }}
          ref={pickerPopupRef}
          v-custom-click-away={onHidePopup}
        >
          {showPopup.value && renderPicker()}
        </div>
      );

      return h(Teleport, { to: "body" }, [teleportBody]);
    };

    const renderPopup = () => {
      return (
        <>
          <div
            ref={pickerRef}
            class={[
              "vc-current-color",
              "vc-transparent",
              {
                round: props.popupShape === "round",
              },
            ]}
            onClick={onShowPopup}
          >
            <div class="vc-current-color__inner" style={getBgColor.value}></div>
          </div>

          {renderTeleport()}
        </>
      );
    };

    return () => {
      return props.useAsPopup ? renderPopup() : renderPicker();
    };
  },
});
