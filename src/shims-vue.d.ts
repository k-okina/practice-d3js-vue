declare module '*.vue' {
  import Vue from 'vue';
  export default Vue;
}

declare type Step = { y: number };
declare type Hazard = boolean;
declare type DataStructure = {
  steps: Step[];
  hazard: Hazard[];
  hazardDescriptionn: string;
  startDate: Date;
};
