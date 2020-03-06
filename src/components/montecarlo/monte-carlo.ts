import { isNumber } from "util";
import { RiskLevelType } from "../../stores/samples-collections-store";

// TODO threshold and histogram min/max will need to be set elsewhere
export const kTephraThreshold = 201;
export const kTephraMin = 0;
export const kTephraMax = 400;

export interface ThresholdData {
  greaterThan: number;
  lessThanEqual: number;
  greaterThanPercent: number;
  lessThanEqualPercent: number;
}
export interface RiskLevel {
  type: RiskLevelType;
  iconColor: string;
  iconText: string;
  min: number | undefined;
  max: number | undefined;
}
export const RiskLevels: RiskLevel[] = [
  {
    type: "Undefined",
    iconColor: "#C4C4C4",
    iconText: "",
    min: undefined,
    max: undefined
  },
  {
    type: "Low",
    iconColor: "#63CC19",
    iconText: "",
    min: 0,
    max: 30
  },
  {
    type: "Medium",
    iconColor: "#ECA519",
    iconText: "!",
    min: 31,
    max: 79
  },
  {
    type: "High",
    iconColor: "#FF1919",
    iconText: "!",
    min: 80,
    max: 100
  },
];

export const calculateThresholdData = (data: any, threshold: number) => {
  const thresholdData: ThresholdData = { greaterThan: 0,
                                         lessThanEqual: 0,
                                         greaterThanPercent: 0,
                                         lessThanEqualPercent: 0
                                        };
  data && data.forEach((d: number) => {
    if (d > threshold) {
      thresholdData.greaterThan++;
    }
  });
  thresholdData.lessThanEqual = data ? data.length - thresholdData.greaterThan : 0;
  thresholdData.greaterThanPercent = data ? Math.round(thresholdData.greaterThan / data.length * 100) : 0;
  thresholdData.lessThanEqualPercent = data ? 100 - thresholdData.greaterThanPercent : 0;
  return thresholdData;
};

export const calculateRisk = (percentAbove: number) => {
  const intVal = Math.floor(percentAbove);
  const riskLevel: RiskLevel | undefined = RiskLevels.find((rl: RiskLevel) => {
    return ((isNumber(rl.min) && (rl.min <= intVal)) && (isNumber(rl.max) && (rl.max >= intVal)));
  });
  return riskLevel && riskLevel.type;
};
