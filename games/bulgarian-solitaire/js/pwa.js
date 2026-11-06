// Offline installation disabled for shared-origin hosting.
export async function registerServiceWorker(){return {ok:false,reason:'disabled-for-hosting'};}
export async function checkManifest(){return {ok:false,reason:'disabled-for-hosting'};}
