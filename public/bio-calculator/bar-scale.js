// Fixed bar scale: RDA at 35%, 2×RDA at 70% (linear, so 1.4×RDA lands at 49%), then logarithmic up to the UL at 95%,
// and UL→1.25×UL fills 95–100%. Without a UL the log segment ends at 4×RDA (95%). Owner-specified layout.
export const P_RDA=35,P_LIN=70,P_UL=95;
export function barScale(rda,ul){
  if(!(rda>0))return null;
  const lin=2*rda,top=ul!=null&&ul>lin?ul:Math.max(4*rda,ul??0,lin*1.01);
  return v=>{v=Math.max(0,v??0);
    if(v<=lin)return v/lin*P_LIN;
    if(v<=top)return P_LIN+Math.log(v/lin)/Math.log(top/lin)*(P_UL-P_LIN);
    return Math.min(100,P_UL+(v-top)/(top*0.25)*(100-P_UL));};
}
