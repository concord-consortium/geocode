interface VEIIndexInfo {
  description: string;
  columnHeight: number;
}

export const kVEIIndexInfo: { [index: number]: VEIIndexInfo } = {
  1: {
    description: "Gentle",
    columnHeight: .1 * 1000,
  },
  2: {
    description: "Explosive",
    columnHeight: 1 * 1000,
  },
  3: {
    description: "Catastrophic",
    columnHeight: 5 * 1000,
  },
  4: {
    description: "Cataclysmic",
    columnHeight: 10 * 1000,
  },
  5: {
    description: "Disastrous",
    columnHeight: 15 * 1000,
  },
  6: {
    description: "Colossal",
    columnHeight: 20 * 1000,
  },
  7: {
    description: "Super-Colossal",
    columnHeight: 25 * 1000,
  },
  8: {
    description: "Mega-Colossal",
    columnHeight: 25 * 1000,
  }
};
