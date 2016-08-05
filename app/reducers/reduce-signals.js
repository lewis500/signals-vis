//@flow
import { ROAD_LENGTH, NUM_SIGNALS, CYCLE, GREEN, GAP, K0, UPDATE_FREQUENCY, FRO, BRO } from "../constants/constants.js";
import { map, sum, range, forEach, zip, isEqual, lt, gte } from 'lodash';
import { Signal } from '../constants/types';
import type { Signals, Cars, Time } from '../constants/types';


const doubleMod = (a, b) => (a % b + b) % b;

function retimeSignals(signals: Signals, densities: Array < number > , time: Time): void {
  if (time % UPDATE_FREQUENCY == 0) {

    //now calculate preliminary relative offsets
    const ROs = map(densities, l => l > K0 ? BRO : FRO);

    //now get the total extra
    const extra = Math.round((sum(ROs) % CYCLE) / NUM_SIGNALS);

    //calculate corrected ROs
    const ROsCorrected = map(ROs, d => d - extra);

    //now make the absolute offsets
    let oA = 0;
    forEach(signals, (s, i, k) => {
      oA = doubleMod(oA + ROsCorrected[i], CYCLE);
      k[i].oA = oA;
    });
    // let toLog = [];
    // // for(var)
    // forEach(signals, (d, i) => {
    //   toLog.push({ index: d.index, oA: d.oA, k: densities[i], rOC: ROsCorrected[i], rOO: ROs[i] });
    // });
    // console.table(toLog);

  }
}

export default function(signals: Signals, densities: Array < number > , time: Time): Signals {
      retimeSignals(signals, densities, time);
      for (var s of signals) s.tick(time);
      return signals;
};

export const SIGNALS_INITIAL: Signals = range(NUM_SIGNALS)
  .map(index => {
    let oA = Math.round(doubleMod(FRO * index, CYCLE)),
      x = Math.round(index / NUM_SIGNALS * ROAD_LENGTH);
    return new Signal(index, oA, x);
  });

forEach(SIGNALS_INITIAL, function(signal, i, k): void {
  let next = i < (k.length - 1) ? k[i + 1] : k[0];
  signal.setNext(next);
});
