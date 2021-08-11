import {
  computed,
  defineComponent,
  nextTick,
  onMounted,
  reactive,
  ref,
  watch,
} from "vue";
import { DOMUtils, DragEventOptions } from "@aesoper/normal-utils";

const bg =
  "-webkit-linear-gradient(left, rgb(255, 0, 0) 0%, rgb(255, 255, 0) 16.66%, rgb(0, 255, 0) 33.33%, rgb(0, 255, 255) 50%, rgb(0, 0, 255) 66.66%, rgb(255, 0, 255) 83.33%, rgb(255, 0, 0) 100%)";

export default defineComponent({
  name: "Hue",
  props: {
    hue: {
      type: Number,
      default: 0,
      validator: (value: number) => {
        return value >= 0 && value <= 360;
      },
    },
  },
  emits: ["update:hue", "change"],
  setup(props, { emit }) {
    const containerEle = ref<HTMLElement | null>(null);
    const pointerEle = ref<HTMLElement | null>(null);

    const pointerPosition = reactive({ top: 0, left: 0 });
    const currentHue = ref(props.hue);

    const linearGradient = computed(() => {
      return {
        background: bg,
      };
    });

    const getBarLeftPosition = () => {
      if (containerEle.value && pointerEle.value) {
        const rect = containerEle.value?.getBoundingClientRect();

        if (currentHue.value === 360) {
          return rect.width - pointerEle.value.offsetWidth / 2;
        }

        return (
          ((currentHue.value % 360) *
            (rect.width - pointerEle.value.offsetWidth)) /
            360 +
          pointerEle.value.offsetWidth / 2
        );
      }

      return 7;
    };

    const updatePosition = () => {
      pointerPosition.left = getBarLeftPosition();
    };

    const handleDrag = (event: MouseEvent) => {
      if (containerEle.value && pointerEle.value) {
        const rect = containerEle.value?.getBoundingClientRect();

        let left = event.clientX - rect.left;
        left = Math.min(left, rect.width - pointerEle.value.offsetWidth / 2);
        left = Math.max(pointerEle.value.offsetWidth / 2, left);

        currentHue.value = Math.round(
          ((left - pointerEle.value.offsetWidth / 2) /
            (rect.width - pointerEle.value.offsetWidth)) *
            360
        );

        emit("update:hue", currentHue.value);
        emit("change", currentHue.value);
      }
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target;

      if (target !== pointerEle.value) {
        handleDrag(event);
      }
    };

    watch(
      () => props.hue,
      (hue: number) => {
        currentHue.value = hue;
      }
    );

    watch(
      () => currentHue.value,
      () => {
        updatePosition();
      }
    );

    onMounted(() => {
      nextTick(() => {
        const dragConfig: DragEventOptions = {
          drag: (event: Event) => {
            handleDrag(event as MouseEvent);
          },
          end: (event: Event) => {
            handleDrag(event as MouseEvent);
          },
        };

        if (containerEle.value && pointerEle.value) {
          DOMUtils.triggerDragEvent(containerEle.value, dragConfig);
          DOMUtils.triggerDragEvent(pointerEle.value, dragConfig);
        }
      }).then(() => {
        updatePosition();
      });
    });

    return () => {
      return (
        <div class="vc-hue vc-transparent">
          <div
            class="vc-hue-container"
            ref={containerEle}
            style={linearGradient.value}
            onClick={onClick}
          >
            <div
              class="vc-hue-pointer"
              ref={pointerEle}
              style={{
                top: pointerPosition.top + "px",
                left: pointerPosition.left + "px",
              }}
            >
              <div class="vc-hue-picker" />
            </div>
          </div>
        </div>
      );
    };
  },
});
