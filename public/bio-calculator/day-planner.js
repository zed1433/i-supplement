// "Perfect day" search: finds a random set of foods and portions whose absorbed and bioactive amounts land in each
// nutrient's optimal range at a chosen calorie amount. The caller supplies evaluate(items) -> {kcal, rows:[{key,
// name, absorbed, bioactive, lo, hi, bioLo, bioHi}]}; this file only searches. Runs in small async chunks so the page
// stays responsive.
const PORTION={min:20,max:400};
export function dayScore(ev,kcal){let s=0;const miss=[];
  for(const r of ev.rows){const d=(v,lo,hi)=>lo==null||!(lo>0)?0:v<lo?(lo-v)/lo:hi!=null&&v>hi?Math.min(3,(v-hi)/hi):0;
    const e=Math.max(d(r.absorbed,r.lo,r.hi),d(r.bioactive,r.bioLo,r.bioHi));if(e>0)miss.push(r);s+=e*e}
  const ce=Math.abs(ev.kcal-kcal)/kcal;s+=ce>.05?(ce*10)**2:0;return{score:s,miss}}
const rand=(r,n)=>Math.floor(r()*n);
// Scale portions so the day hits the calorie amount.
function scaleTo(items,kcalOf,kcal){const now=items.reduce((a,x)=>a+kcalOf(x.food)*x.grams/100,0);if(!(now>0))return items;const k=kcal/now;return items.map(x=>({...x,grams:Math.round(Math.min(PORTION.max,Math.max(PORTION.min,x.grams*k)))}))}
export async function planDay({pool,evaluate,kcal,iterations=500,rng=Math.random,size=9,onProgress,suggest}){
  const kcalOf=f=>f.nutrients?.energy??0,pick=()=>pool[rand(rng,pool.length)];
  let cur=[];const used=new Set();while(cur.length<Math.min(size,pool.length)){const f=pick();if(used.has(f.id))continue;used.add(f.id);cur.push({food:f,grams:50+rand(rng,150)})}
  cur=scaleTo(cur,kcalOf,kcal);let curS=dayScore(evaluate(cur),kcal),best=cur,bestS=curS;
  for(let i=0;i<iterations;i++){
    const next=cur.map(x=>({...x})),m=rng();
    const short=curS.miss.filter(r=>r.absorbed<r.lo||(r.bioLo>0&&r.bioactive<r.bioLo));
    if(suggest&&short.length&&m<.3){const f=suggest(short[rand(rng,short.length)].key);if(f&&!next.some(x=>x.food.id===f.id)){if(next.length<14)next.push({food:f,grams:80});else next[rand(rng,next.length)]={food:f,grams:80}}}
    else if(m<.5&&next.length){const j=rand(rng,next.length),f=pick();if(!next.some(x=>x.food.id===f.id))next[j]={food:f,grams:next[j].grams}}
    else if(m<.75&&next.length){const j=rand(rng,next.length);next[j].grams=Math.round(Math.min(PORTION.max,Math.max(PORTION.min,next[j].grams*(.6+rng()*.8))))}
    else if(m<.88&&next.length<14){const f=pick();if(!next.some(x=>x.food.id===f.id))next.push({food:f,grams:80})}
    else if(next.length>4)next.splice(rand(rng,next.length),1);
    const cand=scaleTo(next,kcalOf,kcal),s=dayScore(evaluate(cand),kcal),T=.05*(1-i/iterations);
    if(s.score<curS.score||rng()<Math.exp(-(s.score-curS.score)/Math.max(T,1e-6))){cur=cand;curS=s}
    if(curS.score<bestS.score){best=cur;bestS=curS}
    if(bestS.score===0)break;
    if(i%25===0){onProgress?.(i/iterations);await new Promise(r=>setTimeout(r,0))}}
  const ev=evaluate(best);return{items:best,kcal:ev.kcal,miss:dayScore(ev,kcal).miss,rows:ev.rows}}
