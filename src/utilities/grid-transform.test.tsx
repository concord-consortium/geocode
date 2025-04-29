import { rotateGridPoints, rotateGridPoint } from "./grid-transform";

const data = [
  {x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0},
  {x: 0, y: 1}, {x: 1, y: 1}, {x: 2, y: 1},
  {x: 0, y: 2}, {x: 1, y: 2}, {x: 2, y: 2}
];

const rotated = [
  {x: 2, y: 2}, {x: 1, y: 2}, {x: 0, y: 2},
  {x: 2, y: 1}, {x: 1, y: 1}, {x: 0, y: 1},
  {x: 2, y: 0}, {x: 1, y: 0}, {x: 0, y: 0}
];

const angle = 180;
const center = {x: 1, y: 1};

describe("rotateGridPoint", () => {
  it("returns a rotated index", () => {
    data.forEach( (point, index) => {
      const result = rotateGridPoint(point, angle, center);
      expect(result.x).toBeCloseTo(rotated[index].x);
      expect(result.y).toBeCloseTo(rotated[index].y);
    });
  });
});

describe("rotateGridPoints", () => {
  it("returns rotated indexes", () => {
    const result = rotateGridPoints(data, angle, center);
    result.forEach( (element, index) => {
      expect(element.x).toBeCloseTo(rotated[index].x, 5);
      expect(element.y).toBeCloseTo(rotated[index].y, 5);
    });
  });
});
