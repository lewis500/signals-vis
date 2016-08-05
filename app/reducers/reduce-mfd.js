//@flow
import { VF, Q0, KJ, W, GAP, CYCLE, ROAD_LENGTH, GREEN,FRO, NUM_SIGNALS } from '../constants/constants';
import { assign, map, flatMap, range, min } from 'lodash';
import { MFDEntry } from '../constants/types';
import type { MFD } from '../constants/types';

const doubleMod = (a: number, b: number):number => (a % b + b) % b;

class TableEntry {
  t: number;
  c: number;
  g: number;
  x: number;
  constructor(i:number, offset:number):void {
    const v = (i < 0 ? -W : VF),
      x = GAP * i,
      travel_time = x / v,
      e = doubleMod(travel_time - i * offset, CYCLE), //this might need to be a double mod like from livescript
      g = GREEN - e,
      green = Math.max(g, 0),
      t = travel_time + CYCLE - e,
      c = Q0 * green + Math.max(0, -x * KJ);
    assign(this, { t, c, g, x });
  }
}

const loopOverEntries = (direction, offset):Array<TableEntry> =>{
  let [g, i, res] = [999, 0, []];
  while ((g > 0) && (Math.abs(i) < 100)) { //MAKE SURE THAT G IS DECLINING?
    const entry = new TableEntry(i, offset);
    g = entry.g;
    res.push(entry);
    if (direction === 'forward') i++;
    else i--;
  }
  return res;
};

function findMin(k: number, table: Array < TableEntry > ): MFDEntry {
  const costs: Array < number > = map(table, entry => (entry.c + entry.x * k) / entry.t)
    .concat([VF * k, W * (KJ - k)]);
  const q: number = min(costs);
  const v: number = k > 0 ? q / k : 0;
  return new MFDEntry(k, q, v);
}

const createMFD = (offset: number):MFD => {
  const table = flatMap(['forward', 'backward'], direction => loopOverEntries(direction, offset));
  return range(.01, 1.01, .01).map(k => findMin(k, table));
};

export default createMFD;

export const MFD_INITIAL = createMFD(FRO);
