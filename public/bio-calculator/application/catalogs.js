/** UI catalogs. Nutrient reference values remain generated from the canonical
 * SQL/data export; this module only describes selectable product forms. */
import {SUPPLEMENT_FORM_ROWS} from '../supplement-forms.js';
export const SUPPLEMENT_FORMS = SUPPLEMENT_FORM_ROWS;

const methodWords=['raw','boiled','steamed','roasted','baked','grilled','fried','pan-fried','broiled','microwaved','poached','cooked','canned','drained','braised','dry heat'];
export const preparationOf=food=>methodWords.find(x=>food.name.toLowerCase().includes(x))??(food.preparations?.[0]?.method||food.preparations?.[0]||'As listed');
export function commonFoodName(food){let n=food.name.split(',').slice(0,3).join(',').replace(/\b(broilers or fryers|meat only|cooked|raw|roasted|boiled|baked|braised|broiled|drained solids|dry heat)\b/gi,'').replace(/\s+,|,\s*,/g,',').replace(/[ ,]+$/,'').trim();return n||food.name}
export function foodEntities(foods){const groups=new Map;for(const food of foods){const name=commonFoodName(food),key=name.toLowerCase();if(!groups.has(key))groups.set(key,{id:key,name,category:food.category,variants:[]});groups.get(key).variants.push({...food,preparation:preparationOf(food)})}return [...groups.values()].sort((a,b)=>a.name.localeCompare(b.name))}

export class LabReportParser { async parse(){throw new Error('No document extraction provider is configured. Enter results manually or connect a LabReportParser provider.')} }
export class UnconfiguredLabReportParser extends LabReportParser {}
