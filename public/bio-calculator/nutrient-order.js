// Display order: vitamins A, B1…B12, C, D, E, K; minerals A–Z; then everything else A–Z.
export const VITAMIN_ORDER=['vitamin_a','thiamine','riboflavin','niacin','pantothenic_acid','vitamin_b6','biotin','folate','vitamin_b12','vitamin_c','vitamin_d','vitamin_e','vitamin_k'];
export const MINERAL_ORDER=['calcium','chloride','chromium','copper','fluoride','iodine','iron','magnesium','manganese','molybdenum','phosphorus','potassium','selenium','sodium','zinc'];
const ORDER=[...VITAMIN_ORDER,...MINERAL_ORDER];
export const orderIndex=k=>{const i=ORDER.indexOf(k);return i<0?ORDER.length:i};
export const byNutrientOrder=(a,b)=>orderIndex(a)-orderIndex(b)||String(a).localeCompare(String(b));
