// Read-only Git integration preflight. Never fetches, merges, checks out or deploys.
import {spawnSync} from 'node:child_process';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const scriptRoot=resolve(dirname(fileURLToPath(import.meta.url)),'..');
function git(args, cwd) {
  const r=spawnSync('git',args,{cwd,encoding:'utf8',windowsHide:true,maxBuffer:32*1024*1024});
  if(r.error || r.status!==0) throw Error(`git ${args[0]} failed: ${String(r.stderr||r.error?.message||'unknown').trim()}`);
  return r.stdout.trimEnd();
}
function refSha(ref,cwd){return git(['rev-parse','--verify',`${ref}^{commit}`],cwd).trim();}
function tree(ref,cwd){
  const items=git(['ls-tree','-rz',ref],cwd).split('\0').filter(Boolean);
  const paths=new Map();
  for(const item of items){
    const pos=item.indexOf('\t');
    if(pos<0) throw Error('Unexpected git tree entry');
    const meta=item.slice(0,pos).split(' ');
    if(meta[1]==='blob') paths.set(item.slice(pos+1),meta[2]);
  }
  return paths;
}
function changes(base, next){
  const names=new Set([...base.keys(),...next.keys()]);
  return [...names].filter(p=>base.get(p)!==next.get(p)).sort();
}
export function reconcile({cwd=scriptRoot,mainRef='origin/main',frontendRef='origin/frontend',expectMain,expectFrontend}={}) {
  const repository=git(['rev-parse','--show-toplevel'],cwd).trim();
  const main=refSha(mainRef,repository), frontend=refSha(frontendRef,repository);
  if(expectMain && main!==expectMain) throw Error(`main snapshot changed: expected ${expectMain}, got ${main}`);
  if(expectFrontend && frontend!==expectFrontend) throw Error(`frontend snapshot changed: expected ${expectFrontend}, got ${frontend}`);
  const common=git(['merge-base',main,frontend],repository).trim();
  const [baseTree,mainTree,frontTree]=[tree(common,repository),tree(main,repository),tree(frontend,repository)];
  const mainChanges=changes(baseTree,mainTree),frontChanges=changes(baseTree,frontTree);
  const frontChanged=new Set(frontChanges),mainChanged=new Set(mainChanges);
  const sharedChanges=mainChanges.filter(p=>frontChanged.has(p) && mainTree.get(p)!==frontTree.get(p));
  const sameChanges=mainChanges.filter(p=>frontChanged.has(p) && mainTree.get(p)===frontTree.get(p));
  const mainOnly=mainChanges.filter(p=>!frontChanged.has(p));
  const frontendOnly=frontChanges.filter(p=>!mainChanged.has(p));
  return {
    status:sharedChanges.length?'REVIEW_REQUIRED':'NO_SHARED_CHANGE_REVIEW',
    releaseApproved:false, mergePerformed:false, main:{ref:mainRef,sha:main},frontend:{ref:frontendRef,sha:frontend},
    mergeBase:common, counts:{mainOnly:mainOnly.length,frontendOnly:frontendOnly.length,sharedChanges:sharedChanges.length,sameChanges:sameChanges.length},
    sharedChanges,mainOnly,frontendOnly,
    warning:sharedChanges.length?'Both branches changed these paths; they are review candidates, not confirmed Git merge conflicts. Do not overwrite either side.':'No differing changes to the same path; still requires QA and manual integration approval.'
  };
}
const isCli=process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url);
if(isCli){
  try{
    const args=process.argv.slice(2);
    if(args.includes('--help')) {
      console.log('Usage: node scripts/qa-branch-reconcile.mjs [--main origin/main] [--frontend origin/frontend] [--expect-main SHA] [--expect-frontend SHA]');
    }else{
      const options={};const map={'--main':'mainRef','--frontend':'frontendRef','--expect-main':'expectMain','--expect-frontend':'expectFrontend'};
      for(let i=0;i<args.length;i+=2){
        if(!Object.hasOwn(map,args[i])||!args[i+1]||args[i+1].startsWith('--')) throw Error('Unsupported/missing CLI argument '+args[i]);
        options[map[args[i]]]=args[i+1];
      }
      const report=reconcile(options);
      console.log(JSON.stringify(report,null,2));
      if(report.status==='REVIEW_REQUIRED') process.exitCode=2;
    }
  }catch(e){console.error(JSON.stringify({status:'BLOCKED',releaseApproved:false,mergePerformed:false,reason:String(e.message??e)},null,2));process.exitCode=3;}
}
