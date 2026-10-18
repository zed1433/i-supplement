// Supplement forms with form-specific bioavailability and conversion. Every number is cited; forms with no
// form-specific human data use the base nutrient rate and say so. Includes branded/patented ingredients whether or not
// the store sells them. Add rows freely: [nutrient, name, chemical form, category, unit, dose min, dose max, bio].
// bio: {abs:[min,max]} replaces the fractional absorption, {rel:x} multiplies the base supplement rate,
// {me:{phytate|tannin|calcium|vitC:[min,max] or 0}} replaces a meal effect for this form (0 = not affected); unlisted effects act as on the base nutrient.
// Every supplement still goes through the same meal, gut and biomarker effects as food.
// {phi:x} sets conversion to the active/counted form, {why} is the citation. A plain string = note only (base rate).
const WV='Water-soluble vitamins',FV='Fat-soluble vitamins',MM='Major minerals',TM='Trace minerals',OT='Other nutrients';
const NO='No form-specific human absorption data; base nutrient rate used.';
const R=[
// ---- Vitamin A ----
['vitamin_a','Retinyl palmitate','retinyl palmitate',FV,'µg',300,1500,{abs:[.7,.9],why:'Preformed retinol esters are 70–90% absorbed (IOM 2001).'}],
['vitamin_a','Retinyl acetate','retinyl acetate',FV,'µg',300,1500,{abs:[.7,.9],why:'Preformed retinol esters are 70–90% absorbed (IOM 2001).'}],
['vitamin_a','Beta-carotene in oil (µg RAE on label)','beta-carotene supplement',FV,'µg',300,1500,{abs:[.7,.9],phi:1,why:'Label RAE already applies the 2:1 conversion for supplemental β-carotene in oil (IOM 2001). Conversion falls as vitamin A status rises (no reliable number).'}],
['vitamin_a','Cod liver oil (vitamin A)','retinol cod liver oil',FV,'µg',300,1500,{abs:[.7,.9],why:'Preformed retinol, 70–90% absorbed (IOM 2001).'}],
// ---- B1 ----
['thiamine','Thiamine hydrochloride','thiamine hcl',WV,'mg',1,100,{abs:[.5,.8],why:'Active transport saturates near 5 mg; above that uptake is passive and the fraction falls (Smithline 2012).'}],
['thiamine','Thiamine mononitrate','thiamine mononitrate',WV,'mg',1,100,{abs:[.5,.8],why:'Same thiamine cation as the HCl salt (Smithline 2012).'}],
['thiamine','Benfotiamine','benfotiamine',WV,'mg',50,600,{rel:3.6,why:'Benfotiamine: ~3.6× the thiamine AUC of thiamine HCl (Loew 1996; Xie 2014).'}],
['thiamine','Sulbutiamine','sulbutiamine',WV,'mg',200,600,'Lipid-soluble disulfide; crosses membranes passively, no fractional absorption data. '+NO],
['thiamine','Allithiamine / TTFD','ttfd',WV,'mg',50,100,'TTFD: lipid-soluble, absorbed well beyond the 5 mg active-transport limit (Lonsdale 2004).'],
['thiamine','Thiamine pyrophosphate (cocarboxylase)','thiamine pyrophosphate',WV,'mg',10,50,'Dephosphorylated in the gut before uptake. '+NO],
// ---- B2 ----
['riboflavin','Riboflavin','riboflavin',WV,'mg',2,400,{abs:[.6,.85],why:'Uptake saturates at ~27 mg per dose; larger single doses are mostly excreted (Zempleni 1996).'}],
['riboflavin','Riboflavin-5-phosphate (R5P)','riboflavin 5 phosphate',WV,'mg',2,100,'Dephosphorylated to riboflavin before uptake (Zempleni 1996). '+NO],
// ---- B3 ----
['niacin','Nicotinic acid','nicotinic acid',WV,'mg',15,500,{abs:[.9,1],phi:1,why:'Nicotinic acid is almost completely absorbed (Bechgaard 1977).'}],
['niacin','Niacinamide (nicotinamide)','nicotinamide',WV,'mg',15,500,{abs:[.9,1],phi:1,why:'Nicotinamide is almost completely absorbed (IOM 1998).'}],
['niacin','Inositol hexanicotinate ("no-flush")','inositol hexanicotinate',WV,'mg',250,1000,'Little or no free nicotinic acid appears in blood (Norris 2006; NIH ODS). No reliable number, so the base rate is shown with this warning.'],
['niacin','Nicotinamide riboside (Niagen)','nicotinamide riboside',WV,'mg',100,1000,'NAD+ precursor; raises NAD+ dose-dependently (Trammell 2016). No niacin-equivalent factor set by DRI. '+NO],
['niacin','Nicotinamide mononucleotide (NMN)','nmn',WV,'mg',250,1000,'NAD+ precursor; no DRI niacin-equivalent factor. '+NO],
// ---- B5 ----
['pantothenic_acid','Calcium D-pantothenate','calcium pantothenate',WV,'mg',5,500,{abs:[.4,.6],why:'Free pantothenate ~40–61% absorbed; saturable (IOM 1998).'}],
['pantothenic_acid','Pantethine','pantethine',WV,'mg',300,900,'Hydrolysed to pantothenic acid. '+NO],
['pantothenic_acid','Panthenol','panthenol',WV,'mg',5,100,'Oxidised to pantothenic acid. '+NO],
// ---- B6 ----
['vitamin_b6','Pyridoxine HCl','pyridoxine hcl',WV,'mg',2,100,{abs:[.7,.95],phi:1,why:'Free pyridoxine is well absorbed and fully converted to PLP in healthy liver (IOM 1998).'}],
['vitamin_b6','Pyridoxal-5-phosphate (P5P)','pyridoxal 5 phosphate',WV,'mg',2,50,{abs:[.7,.95],phi:1,why:'Dephosphorylated in the gut then re-phosphorylated; same final PLP (IOM 1998).'}],
// ---- B7 ----
['biotin','D-Biotin','biotin',WV,'µg',30,10000,{abs:[.95,1],why:'Free biotin ~100% absorbed even at pharmacological doses (Zempleni 1999).'}],
// ---- B9 ----
['folate','Folic acid (with food)','folic acid',WV,'µg',200,800,{abs:[.85,.85],phi:1,why:'Folic acid with food is ~85% bioavailable; the basis of the 1.7 DFE factor (IOM 1998).'}],
['folate','Folic acid (empty stomach)','folic acid fasting',WV,'µg',200,800,{abs:[.95,1],phi:1,why:'Folic acid on an empty stomach ~100% (IOM 1998). Reduced by DHFR in the liver; unmetabolised folic acid appears above ~200 µg.'}],
['folate','L-methylfolate / 5-MTHF','5-mthf',WV,'µg',200,1000,{abs:[.85,1],phi:1,why:'5-MTHF is at least as bioavailable as folic acid and needs no DHFR step (Pietrzik 2010).'}],
['folate','Quatrefolic (5-MTHF glucosamine salt)','quatrefolic 5-mthf',WV,'µg',200,1000,{abs:[.85,1],phi:1,why:'Higher 5-MTHF AUC than the calcium salt in a small trial (Miraglia 2016); treated as 5-MTHF.'}],
['folate','Metafolin (L-5-MTHF calcium)','metafolin 5-mthf',WV,'µg',200,1000,{abs:[.85,1],phi:1,why:'Equivalent to folic acid in raising red-cell folate (Lamers 2006).'}],
['folate','Folinic acid (calcium folinate)','folinic acid',WV,'µg',200,1000,{abs:[.85,1],phi:1,why:'Reduced folate, bypasses DHFR (IOM 1998).'}],
// ---- B12 ----
['vitamin_b12','Cyanocobalamin','cyanocobalamin',WV,'µg',25,1000,'Intrinsic-factor uptake ~1.5 µg per dose plus ~1% passive (IOM 1998). Oral forms do not differ reliably (Paul & Brady 2017).'],
['vitamin_b12','Methylcobalamin','methylcobalamin',WV,'µg',25,1000,'Same 1.5 µg IF cap + 1% passive (IOM 1998); no proven advantage over cyanocobalamin (Paul & Brady 2017).'],
['vitamin_b12','Hydroxocobalamin','hydroxocobalamin',WV,'µg',25,1000,'Same oral uptake rules (IOM 1998); longer retention when injected.'],
['vitamin_b12','Adenosylcobalamin','adenosylcobalamin',WV,'µg',25,1000,'Same oral uptake rules (IOM 1998).'],
['vitamin_b12','Sublingual / spray B12','sublingual cyanocobalamin',WV,'µg',250,1000,'Sublingual works like swallowed B12, not better (Sharabi 2003); same rules applied.'],
['vitamin_b12','Liposomal B12','liposomal cyanocobalamin',WV,'µg',250,1000,'No human absorption data beyond oral rules. '+NO],
// ---- C ----
['vitamin_c','Ascorbic acid','ascorbic acid',WV,'mg',100,2000,{abs:[.7,.9],why:'70–90% absorbed at 30–180 mg; ~50% at 1 g and less above (Levine 1996).'}],
['vitamin_c','Sodium / calcium ascorbate (buffered)','buffered ascorbate',WV,'mg',100,2000,{abs:[.7,.9],why:'Same ascorbate uptake as ascorbic acid (Johnston 1994).'}],
['vitamin_c','Ester-C (calcium ascorbate + threonate)','ester-c',WV,'mg',250,1000,{abs:[.7,.9],why:'No difference in plasma ascorbate vs ascorbic acid (Johnston 1994).'}],
['vitamin_c','Liposomal vitamin C','liposomal ascorbate',WV,'mg',500,2000,{rel:1.2,why:'Modestly higher plasma levels than unencapsulated (Davis 2016, ~20–35%).'}],
['vitamin_c','Ascorbyl palmitate','ascorbyl palmitate',WV,'mg',100,500,'Fat-soluble ester; hydrolysed in the gut. '+NO],
// ---- D ----
['vitamin_d','Vitamin D3 (cholecalciferol)','cholecalciferol',FV,'µg',10,100,{abs:[.55,.8],phi:1,why:'Reference form for raising 25(OH)D.'}],
['vitamin_d','Vitamin D2 (ergocalciferol)','ergocalciferol',FV,'µg',10,100,{abs:[.55,.8],phi:.6,why:'D3 raises 25(OH)D more than D2 (meta-analysis, Tripkovic 2012); D2 counted at ~60%.'}],
['vitamin_d','Vegan D3 (lichen)','cholecalciferol lichen',FV,'µg',10,100,{abs:[.55,.8],phi:1,why:'Chemically identical cholecalciferol.'}],
['vitamin_d','Calcifediol (25-hydroxy D3)','calcifediol',FV,'µg',10,20,{abs:[.8,.95],phi:1,why:'Calcifediol is ~3× more potent per µg at raising 25(OH)D (Quesada-Gomez 2018); shown as absorbed 25(OH)D, potency noted not multiplied.'}],
// ---- E ----
['vitamin_e','Natural vitamin E (d-alpha / RRR)','rrr-alpha-tocopherol',FV,'mg',10,400,{phi:1,why:'RRR-α-tocopherol counts fully toward the RDA (IOM 2000).'}],
['vitamin_e','Synthetic vitamin E (dl-alpha / all-rac)','all-rac-alpha-tocopherol',FV,'mg',10,400,{phi:.5,why:'Only the 2R isomers (half of all-rac) count toward the RDA (IOM 2000).'}],
['vitamin_e','d-alpha-tocopheryl succinate / acetate','rrr-alpha-tocopheryl acetate',FV,'mg',10,400,{phi:1,why:'Esters hydrolysed in the gut; natural stereoisomer counts fully (IOM 2000).'}],
['vitamin_e','Mixed tocopherols','mixed tocopherols',FV,'mg',10,400,{phi:1,why:'Only the label α-tocopherol amount counts toward the RDA (IOM 2000); enter that amount.'}],
['vitamin_e','Tocotrienols','tocotrienols',FV,'mg',10,300,{phi:0,why:'Tocotrienols do not count toward the vitamin E RDA (IOM 2000).'}],
// ---- K ----
['vitamin_k','Vitamin K1 (phylloquinone)','phylloquinone',FV,'µg',50,1000,{abs:[.5,.8],why:'K1 from supplements is far better absorbed than from vegetables (Gijsbers 1996).'}],
['vitamin_k','Vitamin K2 MK-4','menaquinone-4',FV,'µg',45,1500,{rel:.3,why:'MK-4 at nutritional doses is barely detectable in serum (Sato 2012).'}],
['vitamin_k','Vitamin K2 MK-7','menaquinone-7',FV,'µg',45,360,{abs:[.6,.9],why:'MK-7 is well absorbed with a ~3-day half-life (Schurgers 2007; Sato 2012).'}],
['vitamin_k','MenaQ7 (MK-7)','menaquinone-7 menaq7',FV,'µg',45,360,{abs:[.6,.9],why:'Branded MK-7 (Schurgers 2007).'}],
['vitamin_k','K2VITAL (MK-7 all-trans)','menaquinone-7 k2vital',FV,'µg',45,360,{abs:[.6,.9],why:'Branded MK-7 (Schurgers 2007).'}],
// ---- Choline ----
['choline','Choline bitartrate','choline bitartrate',OT,'mg',250,1000,'Free choline well absorbed (IOM 1998). '+NO],
['choline','Alpha-GPC','alpha-gpc',OT,'mg',300,1200,'Enter the label choline amount (~40% of alpha-GPC mass). '+NO],
['choline','Citicoline (CDP-choline / Cognizin)','citicoline',OT,'mg',250,1000,'Enter label choline amount (~18% of mass). '+NO],
['choline','Phosphatidylcholine / lecithin','phosphatidylcholine',OT,'mg',250,1000,'Enter label choline amount (~13% of PC mass). '+NO],
// ---- Calcium ----
['calcium','Calcium carbonate (with food)','calcium carbonate',MM,'mg',200,1200,'With meals, absorption equals citrate (Heaney 1999). Without stomach acid, much lower (Recker 1985, applied when low acid is set).'],
['calcium','Calcium citrate','calcium citrate',MM,'mg',200,1200,'Does not need stomach acid (Recker 1985). '+NO],
['calcium','Calcium citrate malate','calcium citrate malate',MM,'mg',200,1200,{rel:1.1,why:'Slightly higher fractional absorption than carbonate (Miller 1988, ~+10%).'}],
['calcium','Coral calcium','coral calcium carbonate',MM,'mg',200,1000,'Mostly calcium carbonate; same rules as carbonate.'],
['calcium','Calcium phosphate (tricalcium)','calcium phosphate',MM,'mg',200,1000,'Similar to carbonate (Heaney 2001). '+NO],
['calcium','Hydroxyapatite (MCHC)','hydroxyapatite',MM,'mg',200,1000,NO],
['calcium','Calcium lactate / gluconate','calcium gluconate',MM,'mg',200,600,'Similar to carbonate (Sheikh 1987). '+NO],
['calcium','Algae calcium (Aquamin / AlgaeCal)','algae calcium carbonate',MM,'mg',200,1000,'Mostly calcium carbonate. '+NO],
// ---- Chloride ----
['chloride','Chloride (from potassium/sodium chloride)','chloride',MM,'mg',100,2000,{abs:[.9,.98],why:'Chloride is almost completely absorbed in the small intestine (IOM 2005).'}],
// ---- Magnesium ----
['magnesium','Magnesium oxide','oxide',MM,'mg',100,400,{rel:.4,why:'Fractional absorption ~4% vs ~9–11% for organic/chloride salts (Firoz & Graber 2001).'}],
['magnesium','Magnesium citrate','citrate',MM,'mg',100,400,'Better than oxide (Lindberg 1990; Walker 2003). '+NO],
['magnesium','Magnesium glycinate / bisglycinate','bisglycinate',MM,'mg',100,400,'Chelate; absorbed via peptide route; better than oxide in ileal disease (Schuette 1994). '+NO],
['magnesium','Albion magnesium bisglycinate (TRAACS)','bisglycinate albion',MM,'mg',100,400,'Branded bisglycinate (Schuette 1994). '+NO],
['magnesium','Magnesium malate','malate',MM,'mg',100,400,NO],
['magnesium','Magnesium chloride','chloride',MM,'mg',100,400,'Similar to lactate/aspartate (Firoz & Graber 2001). '+NO],
['magnesium','Magnesium lactate','lactate',MM,'mg',100,400,'Similar to chloride (Firoz & Graber 2001). '+NO],
['magnesium','Magnesium aspartate','aspartate',MM,'mg',100,400,'Similar to chloride (Firoz & Graber 2001). '+NO],
['magnesium','Magnesium L-threonate (Magtein)','l-threonate',MM,'mg',100,200,'Raises brain Mg in rats (Slutsky 2010); no human fractional absorption data. '+NO],
['magnesium','Magnesium taurate','taurate',MM,'mg',100,400,NO],
['magnesium','Magnesium orotate','orotate',MM,'mg',100,400,NO],
['magnesium','Magnesium sulfate (oral)','sulfate',MM,'mg',100,400,'Poorly absorbed; osmotic laxative. No reliable fraction. '+NO],
['magnesium','Magnesium carbonate','carbonate',MM,'mg',100,400,'Needs stomach acid; no reliable fraction. '+NO],
['magnesium','Sucrosomial magnesium','sucrosomial magnesium',MM,'mg',100,400,NO],
// ---- Phosphorus ----
['phosphorus','Phosphate salts (Na/K phosphate)','phosphate',MM,'mg',250,1000,{abs:[.6,.8],why:'Inorganic phosphate ~60–80% absorbed (IOM 1997).'}],
// ---- Potassium ----
['potassium','Potassium chloride','potassium chloride',MM,'mg',99,1000,{abs:[.85,.95],why:'~85–90% absorbed (IOM 2005).'}],
['potassium','Potassium citrate','potassium citrate',MM,'mg',99,1000,{abs:[.85,.95],why:'~85–90% absorbed (IOM 2005).'}],
['potassium','Potassium gluconate','potassium gluconate',MM,'mg',99,1000,{abs:[.85,.95],why:'Similar to chloride (Macdonald-Clarke 2016).'}],
// ---- Sodium ----
['sodium','Sodium chloride (salt tablets / electrolytes)','sodium chloride',MM,'mg',100,1000,{abs:[.9,.98],why:'Sodium is almost completely absorbed (IOM 2005).'}],
// ---- Chromium ----
['chromium','Chromium picolinate','picolinate',TM,'µg',50,1000,'Picolinate ~1.2–2.8% (Anderson 1996), modeled 2–5%.'],
['chromium','Chromax (chromium picolinate)','picolinate chromax',TM,'µg',50,1000,'Branded chromium picolinate (Anderson 1996).'],
['chromium','Chromium chloride','chromium chloride',TM,'µg',50,1000,{abs:[.004,.02],why:'Chromium chloride ~0.4% absorbed (Anderson 1983).'}],
['chromium','Chromium polynicotinate / nicotinate','chromium nicotinate',TM,'µg',50,1000,NO],
['chromium','Chromium GTF (yeast)','chromium yeast',TM,'µg',50,400,NO],
// ---- Copper ----
['copper','Copper gluconate','copper gluconate',TM,'µg',500,3000,{abs:[.3,.6],why:'Soluble copper salts 30–60% (IOM 2001; Turnlund 1989).'}],
['copper','Copper bisglycinate','copper bisglycinate',TM,'µg',500,3000,NO],
['copper','Cupric sulfate','cupric sulfate',TM,'µg',500,3000,{abs:[.3,.6],why:'Soluble copper salt (IOM 2001).'}],
['copper','Cupric oxide','cupric oxide',TM,'µg',500,3000,'Poorly available in animal studies (Baker 1999); no human number. '+NO],
// ---- Iodine ----
['iodine','Potassium iodide','potassium iodide',TM,'µg',75,300,{abs:[.9,.98],why:'Iodide >90% absorbed (IOM 2001).'}],
['iodine','Kelp / seaweed iodine','kelp',TM,'µg',75,300,'Iodine content of kelp varies widely; absorption of iodide similar (Teas 2004). '+NO],
['iodine','Molecular iodine (Lugol)','molecular iodine',TM,'µg',150,1000,'Reduced to iodide in the gut (IOM 2001). '+NO],
// ---- Iron ----
['iron','Ferrous sulfate','ferrous sulfate',TM,'mg',8,65,{abs:[.1,.15],why:'Reference iron salt; ~10–15% in iron-replete adults, more when stores are low (Hallberg 1997; ferritin rule applies).'}],
['iron','Ferrous fumarate','ferrous fumarate',TM,'mg',8,65,{abs:[.1,.15],why:'Similar to sulfate (Harrington 2011).'}],
['iron','Ferrous gluconate','ferrous gluconate',TM,'mg',8,65,{abs:[.1,.15],why:'Similar to sulfate per mg elemental iron (Santiago 2012).'}],
['iron','Iron bisglycinate','bisglycinate',TM,'mg',8,65,{abs:[.1,.15],me:{phytate:[.9,1]},why:'Similar to sulfate in water; in a high-phytate maize meal 6.0% vs 1.7% for sulfate (Bovell-Benjamin 2000), so the phytate penalty is mostly lifted. Tannins, calcium and vitamin C still act as on other non-heme iron (no form-specific data).'}],
['iron','Ferrochel (Albion iron bisglycinate)','bisglycinate ferrochel',TM,'mg',8,65,{abs:[.1,.15],me:{phytate:[.9,1]},why:'Branded bisglycinate; phytate penalty mostly lifted (Bovell-Benjamin 2000).'}],
['iron','Carbonyl iron','carbonyl',TM,'mg',8,65,{rel:.7,why:'~70% of ferrous sulfate bioavailability (Gordeuk 1987).'}],
['iron','Ferric salts (citrate, pyrophosphate)','ferric',TM,'mg',8,65,{rel:.3,why:'Ferric iron is 3–4× less absorbed than ferrous (Santiago 2012).'}],
['iron','Polysaccharide iron complex','polysaccharide iron',TM,'mg',50,150,{rel:.3,why:'Ferric complex; lower than sulfate (Santiago 2012).'}],
['iron','Heme iron polypeptide (Proferrin)','heme iron polypeptide',TM,'mg',10,30,{abs:[.15,.35],why:'Heme iron 15–35% absorbed, little affected by inhibitors (Hallberg 1997).'}],
['iron','Sucrosomial iron (SiderAL)','sucrosomial iron',TM,'mg',14,30,'Ferric pyrophosphate in a phospholipid matrix; marketed as better tolerated, no isotope fractional data. '+NO],
['iron','Lactoferrin','lactoferrin',TM,'mg',100,200,'Iron-binding protein; iron content small. '+NO],
// ---- Manganese ----
['manganese','Manganese gluconate / sulfate','manganese gluconate',TM,'mg',1,10,{abs:[.01,.05],why:'Manganese 1–5% absorbed (Finley 1994).'}],
['manganese','Manganese bisglycinate','manganese bisglycinate',TM,'mg',1,10,NO],
// ---- Molybdenum ----
['molybdenum','Sodium molybdate','sodium molybdate',TM,'µg',45,500,{abs:[.85,.93],why:'Molybdate 88–93% absorbed (Turnlund 1995).'}],
['molybdenum','Molybdenum glycinate','molybdenum glycinate',TM,'µg',45,500,NO],
// ---- Selenium ----
['selenium','Selenomethionine','selenomethionine',TM,'µg',50,200,{abs:[.9,.98],why:'Selenomethionine >90% absorbed (Thomson & Robinson 1986).'}],
['selenium','Selenium yeast (SelenoExcell)','selenium yeast',TM,'µg',50,200,{abs:[.85,.95],why:'Mostly selenomethionine (Thomson 1986).'}],
['selenium','Sodium selenite','sodium selenite',TM,'µg',50,200,{abs:[.5,.7],why:'Selenite ~50–70% absorbed (Thomson & Robinson 1986).'}],
['selenium','Sodium selenate','sodium selenate',TM,'µg',50,200,{abs:[.9,.95],why:'Selenate >90% absorbed but more is excreted in urine (Thomson 1986).'}],
['selenium','L-selenomethionine / Se-methylselenocysteine','methylselenocysteine',TM,'µg',50,200,NO],
// ---- Zinc ----
['zinc','Zinc citrate','citrate',TM,'mg',5,40,{abs:[.55,.65],why:'Fasting fractional absorption ~61% (Wegmüller 2014).'}],
['zinc','Zinc gluconate','gluconate',TM,'mg',5,40,{abs:[.55,.65],why:'Fasting fractional absorption ~61% (Wegmüller 2014).'}],
['zinc','Zinc oxide','zinc oxide',TM,'mg',5,40,{abs:[.45,.55],why:'Fasting fractional absorption ~50% (Wegmüller 2014).'}],
['zinc','Zinc sulfate','zinc sulfate',TM,'mg',5,40,{abs:[.55,.65],why:'Soluble salt, similar to gluconate (Wegmüller 2014).'}],
['zinc','Zinc picolinate','picolinate',TM,'mg',5,40,'Raised tissue zinc more than citrate/gluconate (Barrie 1987); no fractional absorption number. '+NO],
['zinc','Zinc bisglycinate','bisglycinate',TM,'mg',5,40,'Higher plasma zinc than gluconate in one trial (Gandia 2007); no fractional number. '+NO],
['zinc','OptiZinc (zinc monomethionine)','zinc monomethionine',TM,'mg',5,30,NO],
['zinc','Zinc acetate','acetate',TM,'mg',5,40,{abs:[.55,.65],why:'Soluble salt, similar to gluconate (Wegmüller 2014).'}],
['zinc','Zinc carnosine (PepZin GI)','zinc carnosine',TM,'mg',5,30,NO],
// ---- Fluoride ----
['fluoride','Sodium fluoride','sodium fluoride',TM,'mg',.25,1,{abs:[.8,.9],why:'Soluble fluoride ~80–90% absorbed (IOM 1997).'}],
// ---- Other (no DRI target; shown for completeness) ----
['creatine','Creatine monohydrate','creatine monohydrate',OT,'mg',3000,5000,{abs:[.95,1],why:'Creatine monohydrate ~99% absorbed (Deldicque 2008).'}],
['creatine','Creapure (creatine monohydrate)','creatine monohydrate creapure',OT,'mg',3000,5000,{abs:[.95,1],why:'Branded monohydrate (Deldicque 2008).'}],
['creatine','Creatine ethyl ester','creatine ethyl ester',OT,'mg',3000,5000,{phi:.3,why:'Largely degrades to creatinine in the gut; less effective than monohydrate (Spillane 2009). Conversion fraction approximate.'}],
['creatine','Creatine HCl','creatine hcl',OT,'mg',1000,3000,'More soluble; no evidence of better uptake than monohydrate. '+NO],
['creatine','Buffered creatine (Kre-Alkalyn)','kre-alkalyn',OT,'mg',1500,3000,'No advantage over monohydrate (Jagim 2012). '+NO],
['taurine','Taurine','taurine',OT,'mg',500,3000,'Well absorbed (Ghandforoush-Sattari 2010). '+NO],
['omega_3','Fish oil, natural triglyceride','omega-3 triglyceride',OT,'mg',250,3000,{abs:[.9,.95],phi:1,why:'Reference form (Dyerberg 2010).'}],
['omega_3','Fish oil, re-esterified triglyceride (rTG)','omega-3 rtg',OT,'mg',250,3000,{rel:1.24,why:'~124% of natural TG (Dyerberg 2010).'}],
['omega_3','Fish oil, ethyl ester (EE)','omega-3 ethyl ester',OT,'mg',250,3000,{rel:.73,why:'~73% of natural TG; better with a fatty meal (Dyerberg 2010; Lawson 1988).'}],
['omega_3','Krill oil (phospholipid)','omega-3 phospholipid krill',OT,'mg',250,1000,'Same EPA+DHA uptake as fish oil at equal doses (Yurko-Mauro 2015). '+NO],
['omega_3','Algae oil (DHA/EPA)','omega-3 algae',OT,'mg',250,1000,'Equivalent to fish oil DHA (Arterburn 2008). '+NO],
['coq10','CoQ10 ubiquinone','ubiquinone',OT,'mg',100,300,'Poorly absorbed (~2–3%); no reliable absolute figure. '+NO],
['coq10','CoQ10 ubiquinol (Kaneka)','ubiquinol',OT,'mg',100,300,'Higher plasma CoQ10 than ubiquinone in some trials (Langsjoen 2014); no fixed ratio. '+NO],
['curcumin','Curcumin (standard 95%)','curcumin',OT,'mg',500,2000,'Very poorly absorbed (Anand 2007). '+NO],
['curcumin','Curcumin + piperine (BioPerine)','curcumin piperine',OT,'mg',500,2000,{rel:20,why:'Piperine raised curcumin bioavailability ~20× (Shoba 1998).'}],
['curcumin','Meriva (curcumin phytosome)','curcumin phytosome meriva',OT,'mg',500,1000,{rel:29,why:'~29× total curcuminoid absorption vs unformulated (Cuomo 2011).'}],
['curcumin','BCM-95 / Curcugreen','curcumin bcm-95',OT,'mg',500,1000,{rel:6.9,why:'~6.9× vs standard curcumin (Antony 2008).'}],
['curcumin','Theracurmin','curcumin theracurmin',OT,'mg',90,180,{rel:27,why:'~27× AUC vs curcumin powder (Sasaki 2011).'}],
['curcumin','Longvida','curcumin longvida',OT,'mg',400,800,'Solid lipid particle; higher free curcumin reported (Gota 2010), no fixed ratio. '+NO],
];
export const SUPPLEMENT_FORM_ROWS=R.map(([nutrientId,name,chemicalForm,category,defaultUnit,typicalDoseMin,typicalDoseMax,bio],i)=>({supplementFormId:`sf-${i+1}`,nutrientId,name,chemicalForm,category,defaultUnit,supportedUnits:defaultUnit==='µg'?['µg','mcg','mg']:['mg','g'],typicalDoseMin,typicalDoseMax,bio:typeof bio==='string'?{why:bio}:bio,conversionToBaseNutrient:null,notes:'Enter the labelled elemental/nutrient amount; compound mass is not inferred.',source:'Cited per form; see docs/formula-review.md (Supplement forms).'}));
export const formBio=name=>SUPPLEMENT_FORM_ROWS.find(x=>x.name===name)?.bio??null;
