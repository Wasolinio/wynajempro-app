const fs = require('fs');
const path = './src/pages/landing_v3/LandingPageV3.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/bg-\[\#fafcff\]/g, 'bg-stitch-background');
content = content.replace(/bg-slate-900/g, 'bg-stitch-primary');
content = content.replace(/text-slate-900/g, 'text-stitch-primary');
content = content.replace(/bg-slate-800/g, 'bg-stitch-primary/90');
content = content.replace(/text-slate-800/g, 'text-stitch-primary/90');

content = content.replace(/bg-blue-600/g, 'bg-stitch-secondary');
content = content.replace(/text-blue-600/g, 'text-stitch-secondary');
content = content.replace(/bg-indigo-600/g, 'bg-stitch-secondary');
content = content.replace(/text-indigo-600/g, 'text-stitch-secondary');
content = content.replace(/text-indigo-500/g, 'text-stitch-secondary/90');
content = content.replace(/bg-indigo-500/g, 'bg-stitch-secondary/90');
content = content.replace(/bg-blue-500/g, 'bg-stitch-secondary/90');
content = content.replace(/text-blue-500/g, 'text-stitch-secondary/90');

content = content.replace(/from-blue-600 to-indigo-500/g, 'from-stitch-secondary to-stitch-secondary/90');
content = content.replace(/from-blue-600 to-indigo-700/g, 'from-stitch-secondary to-stitch-secondary/80');

content = content.replace(/border-slate-200/g, 'border-stitch-outline-variant');
content = content.replace(/border-slate-100/g, 'border-stitch-outline-variant/50');
content = content.replace(/bg-slate-50/g, 'bg-stitch-surface');
content = content.replace(/bg-white/g, 'bg-stitch-surface');

fs.writeFileSync(path, content);
