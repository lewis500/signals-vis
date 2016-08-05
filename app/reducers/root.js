//@flow
import type {RootState, Cars, Time, Action } from '../constants/types';
import signalsReduce, { makeSignalsInitial } from './reduce-signals';
import { MFD_INITIAL } from './reduce-mfd';
import trafficReduce, { makeTrafficInitial } from './reduce-traffic';
import { RUSH_LENGTH } from '../constants/constants';
import {mean,cloneDeep} from 'lodash';

function makeRootState(n:number):RootState{
	return {
		time: -1,
		signals: makeSignalsInitial(),
		traffic: makeTrafficInitial(),
		mfd: MFD_INITIAL,
		n
	};
}

function tick(state:RootState):RootState{
	const time = state.time+1;
	const signals = signalsReduce(state.signals, state.traffic.densities, time);
	const	traffic = trafficReduce(state.traffic, signals, time, state.n);
	return {...state, signals, traffic , time };
}

export function oneDay(state: RootState): number {
	while(state.traffic.waiting.length>0 || state.traffic.moving.length>0) state = tick(state);
	return mean(state.traffic.exited.map(d=>d.tE-d.tA));
}

export function runSim(n:number):number{
	let state = makeRootState(n);
	return oneDay(state);
}
