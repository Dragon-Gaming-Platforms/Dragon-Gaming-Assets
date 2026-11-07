// Fragments français par fonctionnalité : un fichier par paquet, src/i18n/parts/<pkg>.fr.js (`export default {...}`),
// jumeau de <pkg>.en.js avec les mêmes clés. L'intégrateur ajoute une ligne d'import et un spread par fragment, par ex.
//   import hud from './m0-hud.fr.js';   ->   export default {...hud};
// Le français tutoie le joueur (« tu »), comme le reste de l'interface.
import hud from './m0-hud.fr.js';
import hub from './hub.fr.js';
import monsters from './monsters.fr.js';
import mend from './mend.fr.js';
import fixes from './fixes.fr.js';
import tallowgrave from './tallowgrave.fr.js';
import antiphon from './antiphon.fr.js';
import anchorite from './anchorite.fr.js';
import cordycea from './cordycea.fr.js';
import exuvial from './exuvial.fr.js';
import m1Husk from './m1-husk.fr.js';
import formExuvial from './form-exuvial.fr.js';
import bossTips from './boss-tips.fr.js';
import chrysalis5 from './chrysalis5.fr.js';
import moults5 from './moults5.fr.js';
import onboarding from './onboarding.fr.js';
import formTallowgrave from './form-tallowgrave.fr.js';
import antiphonForm from './antiphon-form.fr.js';
import formAnchorite from './form-anchorite.fr.js';
import crownedBloom from './crowned-bloom.fr.js';
export default {...hud,...hub,...monsters,...mend,...fixes,...tallowgrave,...antiphon,...anchorite,...cordycea,...exuvial,...m1Husk,...bossTips,...chrysalis5,...moults5,...onboarding,...formTallowgrave,...antiphonForm,...formAnchorite,...crownedBloom,...formExuvial};
