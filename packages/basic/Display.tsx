import { computed, defineComponent, reactive, watch } from "vue";
import tinycolor from "tinycolor2";

export default defineComponent({
  name: "Display",
  props: {
    color: {
      type: String,
      default: "#000000",
    },
    opacity: {
      type: Number,
      default: 0,
    },
    opacityDisabled: Boolean,
  },
  emits: ["update:color", "update:opacity", "opacityChange", "colorChange"],
  setup(props, { emit }) {
    const currentData = reactive({
      color: props.color,
      opacity: props.opacity,
    });

    const currentColorStyle = computed(() => {
      return {
        background: tinycolor(currentData.color)
          .setAlpha(currentData.opacity / 100)
          .toRgbString(),
      };
    });

    const onUpdateColor = () => {
      emit("update:color", currentData.color);
      emit("colorChange", currentData.color);
    };

    const onUpdateAlpha = () => {
      emit("update:opacity", currentData.opacity);
      emit("opacityChange", currentData.opacity);
    };

    const currentColorHex = computed(() => {
      return tinycolor(currentData.color)
        .setAlpha((100 - currentData.opacity) / 100)
        .toHexString()
        .toUpperCase();
    });

    const onHexBlur = (evt: FocusEvent) => {
      const target = evt.target as HTMLInputElement;
      const tiny = tinycolor(target.value);
      if (tiny.isValid()) {
        currentData.color = tiny.toHexString().toUpperCase();
        currentData.opacity = Math.round(tiny.getAlpha() * 100);

        onUpdateColor();
        onUpdateAlpha();
      }
    };

    const onAlphaBlur = (evt: FocusEvent) => {
      const target = evt.target as HTMLInputElement;
      const opacity = parseInt(target.value.replace("%", ""));
      if (!isNaN(opacity)) {
        currentData.opacity = opacity;
        onUpdateAlpha();
      }
    };

    watch(
      () => props.color,
      (color) => {
        currentData.color = color;
      }
    );

    watch(
      () => props.opacity,
      (opacity) => {
        currentData.opacity = opacity;
      }
    );

    return () => {
      return (
        <div class="vc-display">
          <div class="vc-current-color vc-transparent">
            <div class="color-cube" style={currentColorStyle.value} />
          </div>
          <div class="vc-color-input">
            <input value={currentColorHex.value} onBlur={(v) => onHexBlur(v)} />
          </div>

          {!props.opacityDisabled && (
            <div class="vc-alpha-input">
              <input
                class="vc-alpha-input__inner"
                value={currentData.opacity + "%"}
                onBlur={(v) => onAlphaBlur(v)}
              />
            </div>
          )}
        </div>
      );
    };
  },
});
