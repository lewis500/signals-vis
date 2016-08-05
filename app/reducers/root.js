//@flow
import type {RootState, Cars, Time, Action } from '../constants/types';
import signalsReduce, { SIGNALS_INITIAL } from './reduce-signals';
import { MFD_INITIAL } from './reduce-mfd';
import trafficReduce, { TRAFFIC_INITIAL } from './reduce-traffic';
import { RUSH_LENGTH } from '../constants/constants';

const ROOT_INITIAL:RootState = {
	time: -1,
	signals: SIGNALS_INITIAL,
	traffic: TRAFFIC_INITIAL,
	mfd: MFD_INITIAL,
	n: 0
};

function tick(state:RootState):RootState{
	const time = state.time+1;
	const signals = signalsReduce(state.signals, state.traffic.densities, time);
	const	traffic = trafficReduce(state.traffic, signals, time, state.n);
	return {...state, signals, traffic , time };
}

function rootReduce(state: RootState = ROOT_INITIAL): RootState {
	while(state.traffic.waiting.length>0 || state.traffic.moving.length>0) state = tick(state);
	return state;
}

export default rootReduce;
