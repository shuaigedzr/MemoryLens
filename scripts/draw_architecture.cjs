// Documentation-only SVG/PNG builder. Requires bundled sharp.
const fs=require('node:fs'),path=require('node:path'),sharp=require('sharp');
process.chdir(path.resolve(__dirname,'..'));
const box=(x,y,w,h,title,lines,fill='#edf3f0',dash=false)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${fill}" stroke="#52655e" stroke-width="2" ${dash?'stroke-dasharray="8 6"':''}/><text x="${x+w/2}" y="${y+35}" text-anchor="middle" font-size="23" font-weight="bold">${title}</text>${lines.map((l,i)=>`<text x="${x+w/2}" y="${y+68+i*28}" text-anchor="middle" font-size="20">${l}</text>`).join('')}`;
const edge=d=>`<path d="${d}" fill="none" stroke="#385b4d" stroke-width="2.5" marker-end="url(#arrow)"/>`;
const label=(x,y,t)=>`<text x="${x}" y="${y}" text-anchor="middle" font-size="18" fill="#314c40">${t}</text>`;
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="950" viewBox="0 0 1400 950"><defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8" fill="#385b4d"/></marker></defs><rect width="1400" height="950" fill="white"/><g font-family="Arial,sans-serif" fill="#142d23">
<text x="40" y="38" font-size="28" font-weight="bold">MemoryLens system architecture</text><text x="40" y="70" font-size="20">Solid boxes and arrows implemented | No runtime LLM or external service</text>
${box(40,180,225,125,'Student',['Task','Review and control'],'#fff')}
${box(390,180,280,155,'Browser interface',['index.html + app.js','Confirm / ignore / cancel'])}
${box(790,180,250,155,'Rule engine',['engine.js analyse','Task, topic, evidence, age'])}
${box(1130,180,230,155,'Template output',['renderPlan','Selected values only'])}
${box(390,500,280,150,'State and events',['Store methods','Correct / remove / undo','IDs and outcomes'])}
${box(390,770,280,140,'localStorage',['One JSON document','Notes, sources, recovery'])}
${box(40,500,225,150,'Fictional fixtures',['A / B / C records','Explicit Load demo'],'#fff7e5')}
${box(900,655,420,150,'Planned research',['Controlled explanation comparison','Participant evaluation','Not implemented'],'#fff',true)}
${edge('M265 240 L390 240')}${label(328,225,'Actions')}
${edge('M670 220 L790 220')}${label(731,205,'Task / ignore')}
${edge('M790 290 L735 290 L735 395 L535 395 L535 335')}${label(675,425,'Reasons / sources / issues')}
${edge('M1040 240 L1130 240')}${label(1084,275,'Ready IDs')}
${edge('M1245 180 L1245 115 L530 115 L530 180')}${label(885,103,'Plan at the same memory revision')}
${edge('M450 335 L450 500')}${label(365,440,'Checked action')}
${edge('M670 560 L915 560 L915 335')}${label(810,595,'Validated state / revision')}
${edge('M490 650 L490 770')}${label(395,718,'Checked write')}
${edge('M585 770 L585 650')}${label(670,718,'Load / validate')}
${edge('M265 560 L390 560')}${label(326,545,'Opt in')}
<text x="900" y="852" font-size="20">Python serves static files only</text><text x="900" y="884" font-size="20">Engine tests use a storage adapter</text><text x="900" y="916" font-size="20">Browser acceptance uses actual Chrome</text>
</g></svg>`;
fs.writeFileSync('docs/architecture.svg',svg);
fs.writeFileSync('docs/architecture.dot',`digraph MemoryLens { rankdir=LR; student -> ui [label="actions"]; ui -> analyse [label="task / ignore"]; analyse -> ui [label="reasons / sources / issues"]; analyse -> template [label="ready selected IDs"]; template -> ui [label="plan"]; ui -> store [label="checked actions"]; store -> analyse [label="state / revision"]; store -> localStorage [label="checked write"]; localStorage -> store [label="load / validate"]; fictionalFixtures -> store [label="opt in"]; plannedComparison [style=dashed,label="Planned comparison and participant evaluation"]; }\n`);
sharp(Buffer.from(svg),{density:180}).png().toFile('docs/architecture.png').then(()=>console.log('Updated editable SVG/DOT and PNG architecture.'));
