UPDATE public.ingredients
SET target_benefits = array_replace(target_benefits, 'Antibiotic-associated diarrhoea prevention', 'Gut flora balance during and after antibiotic courses')
WHERE 'Antibiotic-associated diarrhoea prevention' = ANY(target_benefits);

UPDATE public.ingredients
SET target_benefits = array_replace(target_benefits, 'Immune defence', 'Normal immune system function')
WHERE 'Immune defence' = ANY(target_benefits);