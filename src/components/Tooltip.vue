<template>
  <transition>
    <div class="popover__container">
      <div class="tooltip-popover">
        <slot/>
        <div ref="arrow" class="popper__arrow"></div>
      </div>
    </div>
  </transition>
</template>

<script>
import Vue from 'vue';

export default Vue.extend({
  updated() {
    this.adjustment();
  },
  mounted() {
    this.adjustment();
  },
  methods: {
    adjustment() {
      const center = this.$el.getBoundingClientRect().width / 2;
      this.$refs.arrow.style.left = `${center - 3}px`;
    },
  },
});
</script>

<style lang="scss" scoped>
.popover__container {
  position: absolute;
}

.tooltip-popover {
  background: #303133;
  color: #fff;
  position: relative;
  border-radius: 4px;
  padding: 10px;
  z-index: 2000;
  font-size: 12px;
  line-height: 1.2;
  min-width: 10px;
  white-space: nowrap;
}

.popper__arrow {
  border-width: 6px;
  position: absolute;
  bottom: 0;

  &::before {
    content: "";
    position: absolute;
    border: 6px solid transparent;
    border-top: 5px solid black;
    border-right: 5px solid transparent;
    border-left: 5px solid transparent;
  }
}

.v-enter-active, .v-leave-active {
  transition: opacity .3s;
}
.v-enter, .v-leave-to {
  opacity: 0;
}
</style>
