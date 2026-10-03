import{m as o}from"./index.module.DIXiaPjT.js";import"./preact.module.BTqC4RwC.js";import"./hooks.module.B6Bl1fq7.js";async function c(){return{runs:[],total:0}}async function m(){return{run:null,game:null}}async function f(){}function g({dungeon:e}){const t=s(e);return o`
		<h2>Dungeon stats</h2>
		<ul>
			<li>Enemies encountered: ${t.encountered}</li>
			<li>Enemies killed: ${t.killed}</li>
			<li>Total enemies health: ${t.maxHealth}</li>
			<li>Final health count: ${t.finalHealth}</li>
		</ul>
	`}const s=e=>{const t={killed:0,encountered:0,maxHealth:0,finalHealth:0};if(!e.graph)throw new Error("Missing dungeon graph");return e.pathTaken.forEach(([l,r])=>{const n=e.graph[r][l];n.room?.monsters&&(t.encountered+=n.room.monsters.length,n.room.monsters.forEach(a=>{a.currentHealth<=0&&(t.killed+=1),t.finalHealth+=a.currentHealth,t.maxHealth+=a.maxHealth}))}),t};export{g as D,s as a,c as b,m as g,f as p};
//# sourceMappingURL=dungeon-stats.gIGrJR51.js.map
