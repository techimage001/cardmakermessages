const {JSDOM}=require('jsdom'); const fs=require('fs'); const {createCanvas}=require('canvas');
const html=fs.readFileSync('/mnt/user-data/outputs/card-maker-preview-mobile.html','utf8');
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
  w.HTMLCanvasElement.prototype.getContext=function(){return createCanvas(10,10).getContext('2d');};
  w.HTMLCanvasElement.prototype.toBlob=function(cb){cb(new w.Blob([]));};
}});
setTimeout(()=>{
  const d=dom.window.document;
  const cols=d.querySelectorAll('.category-column');
  console.log('category columns in MOBILE preview:', cols.length);
  cols.forEach(c=>{
    const title=c.querySelector('.category-column-title').textContent;
    const sel=c.querySelector('select');
    const opts=sel.options.length-1; // minus placeholder
    console.log('  '+title.padEnd(24)+' dropdown with '+opts+' occasions | hidden: '+c.hidden);
  });
  const panel=d.querySelector('[data-step-panel="1"]');
  console.log('\nstep-1 panel hidden:', panel.hidden);
  const host=d.getElementById('categoryColumns');
  console.log('container present:', !!host, '| container hidden:', host.hidden);
  // any CSS that could hide them on mobile?
  const css=html.match(/<style>([\s\S]*?)<\/style>/)[1];
  const bad=/\.category-column[^{]*\{[^}]*display:\s*none/.test(css) || /\.category-columns[^{]*\{[^}]*display:\s*none/.test(css);
  console.log('any rule hiding categories on mobile:', bad?'YES':'no');
  const m=css.match(/@media \(max-width: 520px\)[\s\S]{0,400}/);
  console.log('\nsmall-screen rule:', m? m[0].match(/\.category-columns \{[^}]*\}/)?.[0] : 'none');
  process.exit(0);
},700);
