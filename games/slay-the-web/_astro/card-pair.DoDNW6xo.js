import{c as s}from"./utils-state.CwIQ6hp2.js";import{m as p}from"./index.module.DIXiaPjT.js";import{C as l}from"./preact.module.BTqC4RwC.js";import"./hooks.module.B6Bl1fq7.js";import{C as a}from"./cards.BGj5wFGn.js";class u extends l{constructor(r){super(r),this.state={flipped:!1}}handleClick(){this.setState({flipped:!this.state.flipped})}render(r,d){const{card:t,gameState:e}=r,i=s(t.name,!0);return p`
			<div
				class="CardBox"
				flipped=${d.flipped?"":null}
				onClick=${()=>this.handleClick()}
			>
				${a({card:t,gameState:e})}
				${a({card:i,gameState:e})}
			</div>
		`}}export{u as default};
//# sourceMappingURL=card-pair.DoDNW6xo.js.map
