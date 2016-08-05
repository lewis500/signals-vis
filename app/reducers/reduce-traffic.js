//@flow
import { ROAD_LENGTH, NUM_CARS, SPACE, GAP, RUSH_LENGTH,NUM_SIGNALS, MEMORY_LENGTH, TRIP_LENGTH } from "../constants/constants.js";
import { range, filter, isEqual, forEach, random, sum, map, partition, sortBy, mean } from 'lodash';
import { Car} from '../constants/types';
import type { HistoryDatum, Loc, History, Time, Signal, Cars, Signals, Cell, TrafficState, Measurement } from '../constants/types';

let population: Cars = range(NUM_CARS)
	.map(i => {
		const x: Loc = random(0, ROAD_LENGTH - 1);
		const tA: Time = RUSH_LENGTH * i / NUM_CARS;
		return new Car(x, tA, i);
	});

export const EMPTY_LINKS: Array < number > = map(range(NUM_SIGNALS), i => 0);

export const makeTrafficInitial = ():TrafficState=>{
	let population: Cars = range(NUM_CARS)
		.map(i => {
			const x: Loc = random(0, ROAD_LENGTH - 1);
			const tA: Time = RUSH_LENGTH * i / NUM_CARS;
			return new Car(x, tA, i);
		});
	return {
		population,
		waiting: population,
		moving: [],
		queueing: [],
		history: [],
		exited: [],
		cells: range(ROAD_LENGTH).map(x => -SPACE),
		measurement: { q: 0, k: 0, q_temp: 0, n_temp: 0 },
		densities: EMPTY_LINKS
	};
}

export const TRAFFIC_INITIAL:TrafficState = {
	population,
	waiting: population,
	moving: [],
	queueing: [],
	history: [],
	exited: [],
	cells: range(ROAD_LENGTH).map(x => -SPACE),
	measurement: { q: 0, k: 0, q_temp: 0, n_temp: 0 },
	densities: EMPTY_LINKS
};

function calcDensities(moving:Cars, g:number):Array<number>{
	//count the densities
	const densities = EMPTY_LINKS.slice();
	const result = EMPTY_LINKS.slice();
	const NUM_SLICES = Math.pow(2,g);
	const	NUM_PER_SLICE = NUM_SIGNALS/NUM_SLICES;

	for (var car of moving) densities[Math.floor(car.x / GAP)]+=1/GAP;

	range(NUM_SLICES).forEach(i=>{
		const a = i*NUM_PER_SLICE;
		const b = (i+1)*NUM_PER_SLICE;
		const slices = densities.slice(a,b);
		const k = mean(slices);
		for(var j of range(a,b) ) result[j] = k;
	});

	return result;
}

function reduceTraffic(traffic: TrafficState, signals: Signals, time: Time, n:number): TrafficState {
		let movingNew = sortBy(traffic.moving, 'x'),
			taken = Array(ROAD_LENGTH),
			{ waiting, cells, queueing, measurement, history } = traffic,
			{ q_temp, n_temp, q, k } = traffic.measurement,
			queueingNew: Cars = [];

		//take care of the signals
		for(let s of signals) taken[s.x] = !s.green;

		function processCar(car: Car): void {
			if(!taken[car.x]) {
				taken[car.x] = true; //it's taken
				movingNew.push(car);
			} else queueingNew.push(car);
		}

		//get waiting and new entering
		let [arriving, waitingNew] = partition(waiting, car => car.tA <= time);

		//let queueing traffic get in first priority
		forEach(queueing, processCar);
		forEach(arriving, processCar);

		//process the moving traffic
		for(var car of movingNew) {
			let nextSpace = (car.x + 1) % ROAD_LENGTH;
			if(!taken[nextSpace] && ((time - cells[nextSpace]) > SPACE)) {
				car.move(nextSpace);
				q_temp++;
			}
			cells[car.x] = time;
		}

		n_temp += movingNew.length;

		if(isEqual(time % MEMORY_LENGTH, 0)) {
			k = n_temp / ROAD_LENGTH / MEMORY_LENGTH;
			q = q_temp / ROAD_LENGTH / MEMORY_LENGTH;
			n_temp = 0;
			q_temp = 0;
		}

		history.push({
				a: NUM_CARS - waitingNew.length - queueingNew.length,
				e: NUM_CARS - waitingNew.length - movingNew.length - queueingNew.length,
				t: time
			});

		//take care of the time stuff
		for(var c of movingNew) cells[c.x] = time;

		//get rid of the exited people
		let exitedNew:Array<Car>;
		[movingNew,exitedNew] = partition(movingNew, d => d.moved <= TRIP_LENGTH);

		for(var c of exitedNew) c.exit(time);

		const densities = calcDensities(movingNew, n);

		return {
			...traffic,
			moving: movingNew,
			queueing: queueingNew,
			waiting: waitingNew,
			exited: traffic.exited.concat(exitedNew),
			measurement: {
				q,
				k,
				q_temp,
				n_temp
			},
			densities
		};

};

export default reduceTraffic
