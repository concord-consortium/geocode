import gridTephraCalc from "./tephra2";
import { SimDatumType } from "./stores/simulation-store";

const rand = (max: number) => Math.random() * max - (max / 2);

const RunCalculation = (numRows: number, numColumns: number) => {
  const result: SimDatumType[] = [];
  const volcX = Math.floor(numRows / 2);
  const volcY = Math.floor(numColumns / 2);
  for (let x = 0; x < numColumns; x++) {
    for (let y = 0; y < numRows; y++) {
      result.push( { thickness: rand(5) } );
    }
  }
  return result;
};

export default RunCalculation;
