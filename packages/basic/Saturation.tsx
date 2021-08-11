import { defineComponent, onMounted, reactive, ref, watch } from "vue";
import { DOMUtils } from "@aesoper/normal-utils";

const clamp = (value: number, min: number, max: number) => {
  return min < max
    ? value < min
      ? min
      : value > max
      ? max
      : value
    : value < max
    ? max
    : value > min
    ? min
    : value;
};

export default defineComponent({
  name: "Saturation",
  props: {
    hue: {
      type: Number,
      default: 0,
      validator: (value: number) => {
        return value >= 0 && value <= 360;
      },
    },
    saturation: {
      type: Number,
      default: 0,
      validator: (value: number) => {
        return value >= 0 && value <= 100;
      },
    },
    value: {
      type: Number,
      default: 0,
      validator: (value: number) => {
        return value >= 0 && value <= 100;
      },
    },
  },
  emits: ["update:saturation", "update:value", "change"],
  setup(props, { emit }) {
    const containerEle = ref<HTMLElement | null>(null);
    const pointerEle = ref<HTMLElement | null>(null);

    const pointerPosition = reactive({ top: 0, left: 0 });

    const background = ref("hsl(" + props.hue + ", 100%, 50%)");

    const currentHsv = reactive({
      h: props.hue,
      s: props.saturation,
      v: props.value,
    });

    const updatePosition = () => {
      if (containerEle.value) {
        const el = containerEle.value;

        pointerPosition.left = (currentHsv.s / 100) * el?.clientWidth;
        pointerPosition.top = (1 - currentHsv.v / 100) * el?.clientHeight;
      }
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target;

      if (target !== pointerEle.value) {
        handleDrag(event);
      }
    };

    const handleDrag = (event: MouseEvent) => {
      if (containerEle.value) {
        const rect = containerEle.value?.getBoundingClientRect();

        let left = event.clientX - rect.left;
        let top = event.clientY - rect.top;

        left = clamp(left, 0, rect.width);
        top = clamp(top, 0, rect.height);

        const saturation = Math.round((left / rect.width) * 100);
        const bright = Math.round(clamp(-(top / rect.height) + 1, 0, 1) * 100);

        pointerPosition.left = left;
        pointerPosition.top = top;

        currentHsv.s = saturation;
        currentHsv.v = bright;

        emit("update:saturation", saturation);
        emit("update:value", bright);
        emit("change", saturation, bright);
      }
    };

    onMounted(() => {
      if (pointerEle.value) {
        DOMUtils.triggerDragEvent(pointerEle.value, {
          drag: (event: Event) => {
            handleDrag(event as MouseEvent);
          },
          end: (event) => {
            handleDrag(event as MouseEvent);
          },
        });

        updatePosition();
      }
    });

    // watch
    watch(
      () => props.hue,
      (hue: number) => {
        currentHsv.h = hue;
        background.value = "hsl(" + Math.round(currentHsv.h) + ", 100%, 50%)";
      }
    );

    watch(
      () => props.value,
      (value: number) => {
        currentHsv.v = value;

        updatePosition();
      }
    );

    watch(
      () => props.saturation,
      (saturation: number) => {
        currentHsv.s = saturation;

        updatePosition();
      }
    );

    return () => {
      return (
        <div class="vc-saturation">
          <div
            class="vc-saturation-container"
            ref={containerEle}
            style={{ backgroundColor: background.value }}
            onClick={onClick}
          >
            <div class="vc-saturation__white" />
            <div class="vc-saturation__black" />
            <div
              class="vc-saturation__pointer"
              ref={pointerEle}
              style={{
                top: pointerPosition.top + "px",
                left: pointerPosition.left + "px",
              }}
            >
              <div />
            </div>
          </div>
        </div>
      );
    };
  },
});
