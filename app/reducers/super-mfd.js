//@flow
import {VF,K0,W,ROAD_LENGTH,CYCLE,GREEN, GAP, CYCLE, NUM_SIGNALS} from '../constants/constants';
import type{MFD} from '../constants/types';
import {map,range,lt,lte} from 'lodash';
import createMFD from './reduce-mfd';

const kRange = range(.01, 1.01, .01);

const evalOneK = (k,i)=>{
	let p:number;
	const kk = k/K0;
	const gc = GREEN/CYCLE;
	if(lt(kk, gc)) p = 1/VF;
	else if (lte(gc,kk) && lt(kk,1+VF/W*(1 - gc)) ){
		p = 1/ VF * (1 - kk) / (1 - gc);
	} else p = -1/W;
	const offset = p * GAP;
	const mfd = createMFD(offset);
	return mfd[i];
};

export default map(kRange,evalOneK);
