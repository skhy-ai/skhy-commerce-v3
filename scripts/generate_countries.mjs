import fs from 'fs';

const content = fs.readFileSync('src/data/dhl/dhlRates.ts', 'utf-8');
const match = content.match(/export const dhlExportZones: Record<string, number> = \{([\s\S]*?)\};/);

if (match) {
  const codes = match[1].match(/"([A-Z]{2})"/g).map(s => s.replace(/"/g, ''));
  const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
  const countries = codes.map(code => {
    try { 
        return { code, name: regionNames.of(code) }; 
    } catch(e) { 
        return { code, name: code }; 
    }
  }).sort((a, b) => a.name.localeCompare(b.name));
  
  const out = 'export const COUNTRIES = ' + JSON.stringify(countries, null, 2) + ';\n';
  fs.writeFileSync('src/data/countries.ts', out);
  console.log('Successfully wrote', countries.length, 'countries to src/data/countries.ts');
} else {
  console.error('Could not parse dhlExportZones');
}
