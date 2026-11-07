// Hall of Masks Rematch: every boss keeps its own records ('rematch-<boss>-<tier>'). config: the run's boss key
// (none for the M3 Old Glasswing); name: its label key; won: the result title of a won Rematch (default 'rematchWon').
// Saves before per-boss keys stored 'rematch-<tier>': every build that wrote them fought the Unborn Chrysalis there,
// so they migrate to it (`legacy`). The Hub's boss doors fight these same bosses (src/data/hub.js HUB_BOSSES).
export const REMATCH={
 chrysalis:{config:'chrysalis',name:'chrysalis'},
 chrysalis5:{config:'chrysalis5',name:'chrysalis5',won:'rematch5Won'},
 tallowgrave:{config:'tallowgrave',name:'tallowgrave',won:'tallowgraveWon'},
 antiphon:{config:'antiphon',name:'antiphon'},
 anchorite:{config:'anchorite',name:'anchorite'},
 cordycea:{config:'cordycea',name:'cordycea',won:'cordyceaWon'},
 exuvial:{config:'exuvial',name:'exuvial'},
 'old-glasswing':{config:undefined,name:'boss'}
};
export const REMATCH_IDS=Object.keys(REMATCH),legacy='chrysalis';
export const rematchBoss=config=>REMATCH_IDS.find(id=>REMATCH[id].config===config.boss)||legacy;
