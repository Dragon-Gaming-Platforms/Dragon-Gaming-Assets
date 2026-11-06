// 玩法注册表：引擎模块只提供题与棋盘，这里补上"外壳需要知道、引擎不该关心"的那部分
// —— 首页图标、副笔在这玩法里是什么意思。加一个玩法在本文件里就三处：上面一条 import、
// SHELL 一条（glyph/dual/primary/secondary/tip）、KINDS 末尾一个；再往仓外还得跟上
// tools/playtest.mjs 的 PLAN 与那条"该怎么点"，否则新玩法进不了 CI 这道门。

import { hashSeed } from '../core/rng.js';
import dominosa from '../puzzles/dominosa.js';

const shell={glyph:'▬',dual:true,primary:'Pair',secondary:'Boundary',tip:'Tap neighboring cells to pair them; tap a domino to remove it.'};
export const KINDS=[{...dominosa,shell}];

export const byId = (id) => KINDS.find((k) => k.id === id) || null;

// 每日种子集中在这里算，首页和路由两条入口才能拿到同一道题。
export const dailySeed = (day, kindId) => `nikoli-daily|${day}|${kindId}`;

// 每日挑战的题面只由日期决定：同一天的那一套题在所有设备上是同一套。
// 尺寸也按日期轮转，这样"今天做哪档"不是玩家能挑的 —— 挑不了才叫挑战。
//
// 轮转必须吃整颗种子的哈希，不能像以前那样从同一个 h 上按 i*3 位去切：日期串只有末两位在变，
// 高位段几乎天天一样，实测有 7 个玩法在 28 天里一次都没换过尺寸（10×10 那档永远轮不到）。
// 现在每个玩法各自哈希一次，位段之间不再互相借位，玩法加到多少个都不会溢出。
export function dailySpec(day) {
  return KINDS.map((k) => {
    const seed = dailySeed(day, k.id);
    return { kindId: k.id, sizeKey: k.sizes[hashSeed(seed) % k.sizes.length].key, seed };
  });
}
