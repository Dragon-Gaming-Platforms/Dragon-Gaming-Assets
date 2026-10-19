import{$n as e,O as t}from"./Layout-C14GeEeY.js";var n={uKzFill:{value:new t(.5,.5,.6)}};function r(t,{rim:r=1,fill:i=1,rimTint:a=.5,trans:o=0,rimFade:s=null}={}){t.userData.shaderKey=`kz-char`+(o>0?`-t`:``)+(s?`-rf`:``);let c={uKzRimK:{value:r},uKzFillK:{value:i},uKzRimTint:{value:a},uKzTrans:{value:o},uKzRimFade:{value:new e(...s||[0,0])}};return t.userData.onBeforeCompile=e=>{e.uniforms.uKzFill=n.uKzFill,Object.assign(e.uniforms,c),s&&(e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
varying float vKzRestY;`).replace(`#include <begin_vertex>`,`#include <begin_vertex>
	vKzRestY = position.y;`));let t=s?` * smoothstep(uKzRimFade.x, uKzRimFade.y, vKzRestY)`:``;e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
uniform vec3 uKzFill;
uniform float uKzRimK;
uniform float uKzFillK;
uniform float uKzRimTint;
uniform float uKzTrans;
uniform vec2 uKzRimFade;${s?`
varying float vKzRestY;`:``}`).replace(`#include <opaque_fragment>`,`#ifdef USE_FOG
{
  vec3 kzSunV = normalize((viewMatrix * vec4(uSunDir, 0.0)).xyz);
  vec3 kzV = geometryViewDir;
  float kzNV = saturate(dot(normal, kzV));
  float kzFres = pow(1.0 - kzNV, 2.6);
  float kzToward = saturate(dot(normal, kzSunV) * 0.65 + 0.35);
  float kzBack = saturate(-dot(kzV, kzSunV));
  vec3 kzNW = (vec4(normal, 0.0) * viewMatrix).xyz;
  float kzSky = 0.62 + 0.38 * kzNW.y;
  outgoingLight += diffuseColor.rgb * uKzFill * (kzSky * uKzFillK);
  vec3 kzTint = mix(vec3(1.0), diffuseColor.rgb * 2.4 + 0.12, uKzRimTint);
  outgoingLight += uSunColor * kzTint * (kzFres * kzToward * (0.18 + 0.82 * kzBack) * uKzRimK)${t};
  outgoingLight += uSunColor * diffuseColor.rgb * (uKzTrans * pow(kzBack, 3.0) * (0.35 + 0.65 * kzFres));
}
#endif
#include <opaque_fragment>`)},t}var i=new t;function a(e){let t=e.lighting,r=n.uKzFill.value;if(!t||!t.fill)return;r.copy(t.fill.color).multiplyScalar(t.fill.intensity*1.1);let a=e.sky&&e.sky.uniforms&&e.sky.uniforms.uSkyZenith?e.sky.uniforms.uSkyZenith.value:null;a&&r.add(i.copy(a).multiplyScalar(1.3))}export{a as n,r as t};