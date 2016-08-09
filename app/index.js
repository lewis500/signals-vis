//@flow
import {runSim} from './reducers/root';
import {downloadCSV} from './utils';

type Entry = {
  m: number;
  n: number;
}


function main(){
  let results:Array<Entry> = [];
  for(var n=0; n<=5; n++){
    results.push({
      m: runSim(n),
      n
    });
  }
  // downloadCSV(results);
  console.table(results);
  // return results;
}
main();
