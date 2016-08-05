//@flow
import {
  assign,
  random, takeRight,
  isEqual,
  lt,gte
} from 'lodash';
import {
  ROAD_LENGTH,
  NUM_CARS,
  SPACE,
  VF,
  RUSH_LENGTH,
  MEMORY_LENGTH,
  CYCLE,
  GREEN,
  TRIP_LENGTH
} from "./constants.js";

export type Time = number;
export type Loc = number;
export type Cell = number;
export type Measurement = {
  q: number;
  k: number;
  q_temp: number;
  n_temp: number;
};

export type Signals = Array < Signal > ;

export type Cells = Array<Cell>;

export type RootState = {
  time: Time;
  signals: Signals;
  traffic: TrafficState;
  mfd: MFD;
  n: number;
};

export type TrafficState = {
  population: Cars;
  waiting: Cars;
  queueing: Cars;
  history: History;
  moving: Cars;
  exited: Cars;
  cells: Cells;
  measurement: Measurement;
  densities: Array<number>;
};

export type HistoryDatum = {
  a: number;
  e: number;
  t: Time;
};

export type History = Array < HistoryDatum > ;

export type Cars = Array < Car > ;

export type Action = Object;

export class Car {
  x: Loc;
  id: number;
  moved: number;
  tA: number;
  tE: number;
  constructor(x: number, tA: number, id: number): void {
    assign(this, {
      x,
      id,
      moved: 0,
      tA
    });
  }
  move(x: Loc): void {
    this.x = x;
    this.moved++;
  }
  exit(time:number): void{
    this.tE = time;
  }
}

export class MFDEntry {
  k: number;
  q: number;
  v: number;
  constructor(k: number, q: number, v: number): void {
    assign(this, {
      k,
      q,
      v
    });
  }
};

export type MFD = Array < MFDEntry > ;

type MemoryDatum = {
  green: number;
  red: number;
  index: number;
}


export class Signal {
  green: bool;
  next: Signal;
  x: Loc;
  index: number;
  oA: number;
  memory: Array<MemoryDatum>;
  constructor(index: number, oA: number, x: number): void {
    assign(this, {
      x,
      index,
      oA,
      memory: [{index, green: 0, red:0}],
    });
  };
  setNext(signal: Signal): void {
    this.next = signal;
  };
  testForGreen(time: number):bool{
    let relTime = time%CYCLE;
    if(this.oA < (this.oA + GREEN)%CYCLE){
      return (relTime < (this.oA + GREEN)%CYCLE) && (relTime >= this.oA);
    } else {
      return (relTime < (this.oA + GREEN)%CYCLE) || (relTime >= this.oA);
    }
  };
  tick(time:number):void{
    let oldGreen = this.green,
      newGreen = this.testForGreen(time);
    if(newGreen) {
      this.green = true;
      if(!oldGreen) this.memory = takeRight(this.memory,4)
          .concat({green: time, red: time, index: this.index});
      else this.memory[this.memory.length-1].red = time;
    }else{ //if red
      this.green = false;
    }
  };
};
