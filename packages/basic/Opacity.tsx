import {
  defineComponent,
  ref,
  reactive,
  watch,
  nextTick,
  onMounted,
  computed,
} from "vue";
import { DOMUtils, DragEventOptions } from "@aesoper/normal-utils";
import tinycolor from "tinycolor2";

export default defineComponent({
  name: "Opacity",
  props: {
    color: {
      type: String,
      default: "#000000",
    },
    opacity: {
      type: Number,
      default: 0,
      validator: (value: number) => {
        return value >= 0 && value <= 100;
      },
    },
  },
  emits: ["update:opacity", "change"],
  setup(props, { emit }) {
    const containerEle = ref<HTMLElement | null>(null);
    const pointerEle = ref<HTMLElement | null>(null);

    const pointerPosition = reactive({ top: 0, left: 0 });
    const currentOpacity = ref(props.opacity);

    const gradientColor = computed(() => {
      const rgb = tinycolor(props.color).setAlpha(1).toRgbString();
      const alphaGgb = tinycolor(props.color).setAlpha(0).toRgbString();

      const deg = "right";

      return {
        background: `linear-gradient(to ${deg}, ${alphaGgb}, ${rgb}`,
      };
    });

    const getCursorLeft = () => {
      if (containerEle.value && pointerEle.value) {
        const alpha = currentOpacity.value;
        const rect = containerEle.value?.getBoundingClientRect();

        return Math.round(
          (alpha / 100) * (rect.width - pointerEle.value?.offsetWidth) +
            pointerEle.value?.offsetWidth / 2
        );
      }

      return 7;
    };

    const updatePosition = () => {
      pointerPosition.left = getCursorLeft();
    };

    const onDrag = (event: MouseEvent) => {
      event.stopPropagation();
      if (containerEle.value && pointerEle.value) {
        const rect = containerEle.value?.getBoundingClientRect();

        let left = event.clientX - rect.left;
        left = Math.max(pointerEle.value.offsetWidth / 2, left);
        left = Math.min(left, rect.width - pointerEle.value.offsetWidth / 2);

        currentOpacity.value = Math.round(
          ((left - pointerEle.value.offsetWidth / 2) /
            (rect.width - pointerEle.value.offsetWidth)) *
            100
        );

        emit("update:opacity", currentOpacity.value);
        emit("change", currentOpacity.value);
      }
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target;

      if (target !== containerEle.value) {
        onDrag(event);
      }
    };

    watch(
      () => props.opacity,
      () => {
        currentOpacity.value = props.opacity;
      }
    );

    watch(
      () => currentOpacity.value,
      () => {
        updatePosition();
      }
    );

    onMounted(() => {
      nextTick(() => {
        const dragConfig: DragEventOptions = {
          drag: (event: Event) => {
            onDrag(event as MouseEvent);
          },
          end: (event: Event) => {
            onDrag(event as MouseEvent);
          },
        };

        if (containerEle.value && pointerEle.value) {
          DOMUtils.triggerDragEvent(containerEle.value, dragConfig);
          DOMUtils.triggerDragEvent(pointerEle.value, dragConfig);
        }
        updatePosition();
      }).then();
    });

    return () => {
      return (
        <div class="vc-alpha vc-transparent">
          <div
            class="vc-alpha-container"
            ref={containerEle}
            style={gradientColor.value}
          >
            <div
              class="vc-alpha-pointer"
              ref={pointerEle}
              onClick={onClick}
              style={{
                top: pointerPosition.top + "px",
                left: pointerPosition.left + "px",
              }}
            >
              <div class="vc-alpha-picker" />
            </div>
          </div>
        </div>
      );
    };
  },
});
