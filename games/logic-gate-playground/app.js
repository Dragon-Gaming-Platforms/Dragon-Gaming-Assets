(() => {
  'use strict';
  const $=(id)=>document.getElementById(id);
  const OPS=['AND','OR','XOR','NAND','NOR','XNOR'];
  const gates=[
    {id:'G1',a:'A',b:'B',op:'XOR',sources:['A','B','C']},
    {id:'G2',a:'G1',b:'C',op:'XOR',sources:['A','B','C','G1']},
    {id:'G3',a:'G1',b:'G2',op:'OR',sources:['A','B','C','G1','G2']},
    {id:'G4',a:'G3',b:'G3',op:'OR',sources:['A','B','C','G1','G2','G3']},
  ];
  const inputs={A:false,B:false,C:false};
  function options(list,selected){return list.map(v=>`<option${v===selected?' selected':''}>${v}</option>`).join('');}
  function makeGates(){const root=$('gate-list');root.replaceChildren();gates.forEach((gate,index)=>{const row=document.createElement('div');row.className='gate-row';row.innerHTML=`<span class="gate-id">${gate.id}</span><select aria-label="${gate.id} first input" data-gate="${gate.id}" data-part="a">${options(gate.sources,gate.a)}</select><select aria-label="${gate.id} second input" data-gate="${gate.id}" data-part="b">${options(gate.sources,gate.b)}</select><select class="operator" aria-label="${gate.id} operator" data-gate="${gate.id}" data-part="op">${OPS.map(op=>`<option${op===gate.op?' selected':''}>${op}</option>`).join('')}</select><span class="gate-result" id="result-${gate.id}">0</span>`;root.appendChild(row);});
    root.querySelectorAll('select').forEach(select=>select.addEventListener('change',()=>{const gate=gates.find(g=>g.id===select.dataset.gate);gate[select.dataset.part]=select.value;render();}));}
  function operate(op,a,b){switch(op){case'AND':return a&&b;case'OR':return a||b;case'XOR':return a!==b;case'NAND':return!(a&&b);case'NOR':return!(a||b);case'XNOR':return a===b;default:return false;}}
  function circuit(a,b,c){const values={A:a,B:b,C:c};for(const gate of gates)values[gate.id]=operate(gate.op,Boolean(values[gate.a]),Boolean(values[gate.b]));return values;}
  function goal(key,a,b,c){const sum=Number(a)+Number(b)+Number(c);switch(key){case'parity':return sum%2===1;case'majority':return sum>=2;case'a-and-b-or-c':return a&&(b||c);case'a-or-b-and-c':return a||(b&&c);case'not-both':return!(a&&b);default:return false;}}
  function render(){
    document.querySelectorAll('[data-input]').forEach(button=>{const key=button.dataset.input,value=inputs[key];button.setAttribute('aria-pressed',String(value));button.querySelector('.bit').textContent=value?'1':'0';});
    const live=circuit(inputs.A,inputs.B,inputs.C),out=Boolean(live[$('output-source').value]);$('output-lamp').textContent=out?'1':'0';$('output-lamp').classList.toggle('on',out);$('output-source-label').textContent=`Reading ${$('output-source').value}`;
    gates.forEach(g=>{const e=$(`result-${g.id}`),value=Boolean(live[g.id]);e.textContent=value?'1':'0';e.classList.toggle('on',value);});
    const target=$('target').value,body=$('truth-body');body.replaceChildren();let matches=0;
    for(let bits=0;bits<8;bits++){const a=Boolean(bits&4),b=Boolean(bits&2),c=Boolean(bits&1),values=circuit(a,b,c),actual=Boolean(values[$('output-source').value]),expected=Boolean(goal(target,a,b,c)),match=actual===expected;if(match)matches++;const row=document.createElement('tr');row.className=match?'match':'miss';row.innerHTML=`<td>${String(Number(a))}${String(Number(b))}${String(Number(c))}</td><td>${Number(a)}</td><td>${Number(b)}</td><td>${Number(c)}</td><td>${Number(actual)}</td><td>${Number(expected)}</td><td>${match?'✓':'×'}</td>`;body.appendChild(row);}
    $('match-count').textContent=`${matches} / 8`;$('table-chip').textContent=`${matches} / 8`;$('challenge-state').textContent=matches===8?'Target matched!':'Try another gate layout';$('status').textContent=matches===8?'All truth-table rows match the selected target. Nice circuit!':`Current inputs produce ${out?1:0}; ${matches} of eight rows match the goal.`;
  }
  makeGates();document.querySelectorAll('[data-input]').forEach(button=>button.addEventListener('click',()=>{const key=button.dataset.input;inputs[key]=!inputs[key];render();}));$('output-source').addEventListener('change',render);$('target').addEventListener('change',render);render();
})();
