const fs = require('fs');

const dhlZonesText = `Afghanistan (AF) 8 Dominican Rep. (DO) 8 Liberia (LR) 8 San Marino (SM) 6
Albania (AL) 7 Ecuador (EC) 8 Libya (LY) 8 Sao Tome And Principe (ST) 8
Algeria (DZ) 8 Egypt (EG) 8 Liechtenstein (LI) 6 Saudi Arabia (SA) 7
American Samoa (AS) 8 El Salvador (SV) 8 Lithuania (LT) 6 Senegal (SN) 8
Andorra (AD) 6 Eritrea (ER) 8 Luxembourg (LU) 6 Serbia, Rep. Of (RS) 7
Angola (AO) 8 Estonia (EE) 6 Macau SAR China (MO) 2 Seychelles (SC) 8
Anguilla (AI) 8 Eswatini (SZ) 8 Madagascar (MG) 8 Sierra Leone (SL) 8
Antigua (AG) 8 Ethiopia (ET) 8 Malawi (MW) 8 Singapore (SG) 1
Argentina (AR) 8 Falkland Islands (FK) 8 Maldives (MV) 8 Slovakia (SK) 6
Armenia (AM) 8 Faroe Islands (FO) 8 Mali (ML) 8 Slovenia (SI) 6
Aruba (AW) 8 Fiji (FJ) 8 Malta (MT) 6 Solomon Islands (SB) 8
Australia (AU) 4 Finland (FI) 6 Marshall Islands (MH) 8 Somalia Hargeisa (XS) 8
Austria (AT) 6 France (FR) 6 Martinique (MQ) 8 Somalia Mogadishu (SO) 8
Azerbaijan (AZ) 8 French Guyana (GF) 8 Mauritania (MR) 8 South Africa (ZA) 8
Bahamas (BS) 8 Gabon (GA) 8 Mauritius (MU) 8 South Sudan (SS) 8
Bahrain (BH) 7 Gambia (GM) 8 Mayotte (YT) 8 Spain (ES) 6
Bangladesh (BD) 6 Georgia (GE) 8 Mexico (MX) 8 Sri Lanka (LK) 6
Barbados (BB) 8 Germany (DE) 6 Micronesia (FM) 8 St. Barthelemy (XY) 8
Belarus (BY) 8 Ghana (GH) 8 Moldova, Rep. Of (MD) 8 St. Eustatius (XE) 8
Belgium (BE) 6 Gibraltar (GI) 7 Monaco (MC) 6 St. Kitts (KN) 8
Belize (BZ) 8 Greece (GR) 6 Mongolia (MN) 8 St. Lucia (LC) 8
Benin (BJ) 8 Greenland (GL) 8 Montenegro, Rep Of (ME) 7 St. Maarten (XM) 8
Bermuda (BM) 8 Grenada (GD) 8 Montserrat (MS) 8 St. Vincent (VC) 8
Bhutan (BT) 3 Guadeloupe (GP) 8 Morocco (MA) 8 Sudan (SD) 8
Bolivia (BO) 8 Guam (GU) 8 Mozambique (MZ) 8 Suriname (SR) 8
Bonaire (XB) 8 Guatemala (GT) 8 Myanmar (MM) 3 Sweden (SE) 6
Bosnia & Herzegovina(BA) 7 Guernsey (GG) 7 Namibia (NA) 8 Switzerland (CH) 6
Botswana (BW) 8 Guinea Rep. (GN) 8 Nauru, Rep. Of (NR) 8 Syria (SY) 8
Brazil (BR) 8 Guinea-Bissau (GW) 8 Nepal (NP) 6 Tahiti (PF) 8
Brunei (BN) 2 Guinea-Equatorial (GQ) 8 Netherlands, The (NL) 6 Taiwan (TW) 2
Bulgaria (BG) 6 Guyana (British) (GY) 8 Nevis (XN) 8 Tajikistan (TJ) 8
Burkina Faso (BF) 8 Haiti (HT) 8 New Caledonia (NC) 8 Tanzania (TZ) 8
Burundi (BI) 8 Honduras (HN) 8 New Zealand (NZ) 4 Thailand (TH) 2
Cambodia (KH) 3 Hong Kong SAR China (HK) 2 Nicaragua (NI) 8 Timor-Leste (TL) 8
Cameroon (CM) 8 Hungary (HU) 6 Niger (NE) 8 Togo (TG) 8
Canada (CA) 5 Iceland (IS) 8 Nigeria (NG) 8 Tonga (TO) 8
Canary Islands, The (IC) 8 India (IN) 6 Niue (NU) 8 Trinidad And Tobago (TT) 8
Cape Verde (CV) 8 Indonesia (ID) 2 North Macedonia (MK) 7 Tunisia (TN) 8
Cayman Islands (KY) 8 Iran (IR) 8 Northern Mariana Islands (MP) 8 Turkey (TR) 7
Central African Rep(CF) 8 Iraq (IQ) 8 Norway (NO) 6 Turkmenistan (TM) 8
Chad (TD) 8 Ireland, Rep. Of (IE) 6 Oman (OM) 7 Turks & Caicos (TC) 8
Chile (CL) 8 Israel (IL) 8 Pakistan (PK) 8 Tuvalu (TV) 8
China (CN) 2 Italy (IT) 6 Palau (PW) 8 USA (US) 5
Colombia (CO) 8 Japan (JP) 4 Papua New Guinea (PG) 8 Uganda (UG) 8
Comoros (KM) 8 Jersey (JE) 7 Paraguay (PY) 8 Ukraine (UA) 8
Congo (CG) 8 Jordan (JO) 7 Peru (PE) 8 United Arab Emirates (AE) 7
Congo, DPR (CD) 8 Kazakhstan (KZ) 8 Philippines, The (PH) 2 United Kingdom (GB) 6
Cook Islands (CK) 8 Kenya (KE) 8 Poland (PL) 6 Uruguay (UY) 8
Costa Rica (CR) 8 Kiribati (KI) 8 Portugal (PT) 6 Uzbekistan (UZ) 8
Cote D Ivoire (CI) 8 Korea, Rep. Of (KR) 4 Puerto Rico (PR) 8 Vanuatu (VU) 8
Croatia (HR) 6 Korea, D.P.R Of (KP) 8 Qatar (QA) 7 Vatican City (VA) 6
Cuba (CU) 8 Kosovo (KV) 7 Reunion, Island Of (RE) 8 Venezuela (VE) 8
Curacao (XC) 8 Kuwait (KW) 7 Romania (RO) 6 Vietnam (VN) 3
Cyprus (CY) 6 Kyrgyzstan (KG) 8 Russian Federation (RU) 8 Virgin Islands-British (VG) 8
Czech Rep., The (CZ) 6 Laos (LA) 3 Rwanda (RW) 8 Virgin Islands-US (VI) 8
Denmark (DK) 6 Latvia (LV) 6 Saint Helena (SH) 8 Yemen, Rep. Of (YE) 8
Djibouti (DJ) 8 Lebanon (LB) 8 Samoa (WS) 8 Zambia (ZM) 8
Dominica (DM) 8 Lesotho (LS) 8 Zimbabwe (ZW) 8`;

const zonesRegex = /\(([A-Z]{2})\)\s+(\d)/g;
let zonesMap = {};
let match;
while ((match = zonesRegex.exec(dhlZonesText)) !== null) {
  zonesMap[match[1]] = parseInt(match[2], 10);
}

const documentsUpTo2Kg = [
  [0.5, 68.00, 70.00, 75.00, 92.00, 103.00, 92.00, 166.00, 168.00],
  [1.0, 85.00, 91.00, 95.00, 106.00, 115.00, 106.00, 184.00, 186.00],
  [1.5, 94.00, 109.00, 113.00, 123.00, 129.00, 127.00, 213.00, 220.00],
  [2.0, 103.00, 127.00, 131.00, 140.00, 143.00, 148.00, 242.00, 254.00]
];

const nonDocsRatesText = \`0.5 84.00 86.00 88.00 102.00 103.00 110.00 183.00 197.00
1.0 90.00 100.00 100.00 114.00 117.00 128.00 229.00 245.00
1.5 97.00 114.00 116.00 127.00 131.00 147.00 275.00 293.00
2.0 104.00 128.00 132.00 140.00 145.00 166.00 321.00 341.00
2.5 111.00 139.00 143.00 151.00 157.00 180.00 364.00 387.00
3.0 117.00 150.00 154.00 163.00 169.00 194.00 407.00 433.00
3.5 123.00 161.00 165.00 175.00 181.00 208.00 450.00 479.00
4.0 129.00 172.00 176.00 187.00 193.00 222.00 493.00 525.00
4.5 135.00 183.00 187.00 199.00 205.00 236.00 536.00 571.00
5.0 141.00 194.00 198.00 211.00 217.00 250.00 579.00 617.00
5.5 146.00 199.00 216.00 229.00 238.00 272.00 614.00 655.00
6.0 151.00 204.00 234.00 247.00 259.00 294.00 649.00 693.00
6.5 156.00 209.00 252.00 265.00 280.00 316.00 684.00 731.00
7.0 161.00 214.00 270.00 283.00 301.00 338.00 719.00 769.00
7.5 166.00 219.00 288.00 301.00 322.00 360.00 754.00 807.00
8.0 171.00 224.00 306.00 319.00 343.00 382.00 789.00 845.00
8.5 176.00 229.00 324.00 337.00 364.00 404.00 824.00 883.00
9.0 181.00 234.00 342.00 355.00 385.00 426.00 859.00 921.00
9.5 186.00 239.00 360.00 373.00 406.00 448.00 894.00 959.00
10.0 191.00 244.00 378.00 391.00 427.00 470.00 929.00 997.00
10.5 192.00 256.00 389.00 403.00 447.00 491.00 964.00 1042.00
11.0 193.00 268.00 400.00 415.00 467.00 512.00 999.00 1087.00
11.5 194.00 280.00 411.00 427.00 487.00 533.00 1034.00 1132.00
12.0 195.00 292.00 422.00 439.00 507.00 554.00 1069.00 1177.00
12.5 196.00 304.00 433.00 451.00 527.00 575.00 1104.00 1222.00
13.0 197.00 316.00 444.00 463.00 547.00 596.00 1139.00 1267.00
13.5 198.00 328.00 455.00 475.00 567.00 617.00 1174.00 1312.00
14.0 199.00 340.00 466.00 487.00 587.00 638.00 1209.00 1357.00
14.5 200.00 352.00 477.00 499.00 607.00 659.00 1244.00 1402.00
15.0 201.00 364.00 488.00 511.00 627.00 680.00 1279.00 1447.00
15.5 202.00 376.00 499.00 523.00 647.00 701.00 1314.00 1492.00
16.0 203.00 388.00 510.00 535.00 667.00 722.00 1349.00 1537.00
16.5 204.00 400.00 521.00 547.00 687.00 743.00 1384.00 1582.00
17.0 205.00 412.00 532.00 559.00 707.00 764.00 1419.00 1627.00
17.5 206.00 424.00 543.00 571.00 727.00 785.00 1454.00 1672.00
18.0 207.00 436.00 554.00 583.00 747.00 806.00 1489.00 1717.00
18.5 208.00 448.00 565.00 595.00 767.00 827.00 1524.00 1762.00
19.0 209.00 460.00 576.00 607.00 787.00 848.00 1559.00 1807.00
19.5 210.00 472.00 587.00 619.00 807.00 869.00 1594.00 1852.00
20.0 211.00 484.00 598.00 631.00 827.00 890.00 1629.00 1897.00
20.5 215.00 494.00 609.00 644.00 847.00 911.00 1667.00 1943.00
21.0 219.00 504.00 620.00 657.00 867.00 932.00 1705.00 1989.00
21.5 223.00 514.00 631.00 670.00 887.00 953.00 1743.00 2035.00
22.0 227.00 524.00 642.00 683.00 907.00 974.00 1781.00 2081.00
22.5 231.00 534.00 653.00 696.00 927.00 995.00 1819.00 2127.00
23.0 235.00 544.00 664.00 709.00 947.00 1016.00 1857.00 2173.00
23.5 239.00 554.00 675.00 722.00 967.00 1037.00 1895.00 2219.00
24.0 243.00 564.00 686.00 735.00 987.00 1058.00 1933.00 2265.00
24.5 247.00 574.00 697.00 748.00 1007.00 1079.00 1971.00 2311.00
25.0 251.00 584.00 708.00 761.00 1027.00 1100.00 2009.00 2357.00
25.5 255.00 594.00 719.00 774.00 1047.00 1121.00 2047.00 2403.00
26.0 259.00 604.00 730.00 787.00 1067.00 1142.00 2085.00 2449.00
26.5 263.00 614.00 741.00 800.00 1087.00 1163.00 2123.00 2495.00
27.0 267.00 624.00 752.00 813.00 1107.00 1184.00 2161.00 2541.00
27.5 271.00 634.00 763.00 826.00 1127.00 1205.00 2199.00 2587.00
28.0 275.00 644.00 774.00 839.00 1147.00 1226.00 2237.00 2633.00
28.5 279.00 654.00 785.00 852.00 1167.00 1247.00 2275.00 2679.00
29.0 283.00 664.00 796.00 865.00 1187.00 1268.00 2313.00 2725.00
29.5 287.00 674.00 807.00 878.00 1207.00 1289.00 2351.00 2771.00
30.0 291.00 684.00 818.00 891.00 1227.00 1310.00 2389.00 2817.00\`;

const nonDocsRates = nonDocsRatesText.trim().split('\\n').map(line => {
  return line.split(' ').map(Number);
});

const multiplierRates = [
  // From 30.1 to 70
  [11.30, 22.60, 26.80, 29.50, 43.70, 39.40, 81.80, 93.00],
  // 70.1 to 300
  [20.80, 38.50, 43.70, 49.70, 74.10, 89.00, 126.80, 147.50],
  // 300.1+
  [25.90, 48.90, 54.90, 64.50, 92.70, 113.40, 158.60, 185.30]
];

const fileContent = \`// Auto-generated from DHL Rate Card PDF

export const dhlExportZones: Record<string, number> = \${JSON.stringify(zonesMap, null, 2)};

export const documentsUpTo2Kg = \${JSON.stringify(documentsUpTo2Kg, null, 2)};

export const nonDocumentsRates = \${JSON.stringify(nonDocsRates, null, 2)};

export const multiplierRatesOver30Kg = {
  upTo70kg: \${JSON.stringify(multiplierRates[0])},
  upTo300kg: \${JSON.stringify(multiplierRates[1])},
  over300kg: \${JSON.stringify(multiplierRates[2])}
};
\`;

fs.writeFileSync('C:/Projects/skhyai-website/skhy-ai-website-main/src/data/dhlRates.ts', fileContent);
console.log('Done!');
