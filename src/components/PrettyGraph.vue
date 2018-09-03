<template>
  <div>
    テスト
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class PrettyGraph extends Vue {
  @Prop() private msg!: string;
}
</script>
