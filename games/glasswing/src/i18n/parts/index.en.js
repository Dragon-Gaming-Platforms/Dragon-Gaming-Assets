// Per-feature English string fragments: one file per package, src/i18n/parts/<pkg>.en.js (`export default {...}`), each
// with a <pkg>.fr.js twin holding the same keys. The integrator adds one import line and one spread per fragment, e.g.
//   import hud from './m0-hud.en.js';   ->   export default {...hud};
// tests/run.mjs rejects a key defined twice (base or another fragment), EN/FR drift per fragment, and unwired fragments.
import hud from './m0-hud.en.js';
import hub from './hub.en.js';
import monsters from './monsters.en.js';
import mend from './mend.en.js';
import fixes from './fixes.en.js';
import tallowgrave from './tallowgrave.en.js';
import antiphon from './antiphon.en.js';
import anchorite from './anchorite.en.js';
import cordycea from './cordycea.en.js';
import exuvial from './exuvial.en.js';
import m1Husk from './m1-husk.en.js';
import formExuvial from './form-exuvial.en.js';
import bossTips from './boss-tips.en.js';
import chrysalis5 from './chrysalis5.en.js';
import moults5 from './moults5.en.js';
import onboarding from './onboarding.en.js';
import formTallowgrave from './form-tallowgrave.en.js';
import antiphonForm from './antiphon-form.en.js';
import formAnchorite from './form-anchorite.en.js';
import crownedBloom from './crowned-bloom.en.js';
export default {...hud,...hub,...monsters,...mend,...fixes,...tallowgrave,...antiphon,...anchorite,...cordycea,...exuvial,...m1Husk,...bossTips,...chrysalis5,...moults5,...onboarding,...formTallowgrave,...antiphonForm,...formAnchorite,...crownedBloom,...formExuvial};
