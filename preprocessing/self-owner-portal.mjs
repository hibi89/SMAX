/** P18: copy a vetted, fully standalone offline owner CSV mapping HTML asset. */
import fs from 'node:fs';
import {createHash} from 'node:crypto';
export const OWNER_PORTAL_VERSION='SMAX_SELF_OWNER_PORTAL_V1';
const asset=new URL('../site/owner.html',import.meta.url);
function vetted(){
 const html=fs.readFileSync(asset,'utf8');
 const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/gu)];
 if(scripts.length!==1||/<script\s[^>]*src=/iu.test(html))throw new TypeError('SMAX_OWNER_PORTAL_ASSET_BLOCKED');
 const digest=createHash('sha256').update(scripts[0][1],'utf8').digest('base64');
 if(!html.includes('script-src &#39;sha256-'+digest+'&#39;')||
    !html.includes('connect-src &#39;none&#39;')||
    !html.startsWith('<!doctype html>'))throw new TypeError('SMAX_OWNER_PORTAL_CSP_BLOCKED');
 return {html,digest};
}
export function renderOwnerPortalHtml(){return vetted().html;}
export function ownerPortalScriptHash(){return vetted().digest;}
