const {readFileSync}=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
let mounted=true, cancelled=0;
const stage={clientWidth:1100,clientHeight:480,dataset:{},style:{}};
const nodes={'scene-stage':stage,'camera-player':{style:{}},'camera-monster':{style:{}}};
const context=vm.createContext({window:{matchMedia:()=>({matches:true,addEventListener(){}}),addEventListener(){}},document:{getElementById:id=>mounted?nodes[id]:null},performance:{now:()=>0},requestAnimationFrame:()=>1,cancelAnimationFrame:()=>cancelled++});
vm.runInContext(readFileSync('js/battleCamera.js','utf8'),context);
const run=code=>vm.runInContext(code,context);
for(const [width,height] of [[1100,480],[720,346],[360,340]]){
  for(const yaw of [-58,0,58]){
    const [p,e]=[-3.2,3.2].map(x=>run(`projectBattlePoint(${x},0,0,{yaw:${yaw},zoom:1},${width},${height})`));
    assert.ok(p.x<e.x,'actors keep screen order through orbit');
    if(yaw<0)assert.ok(p.scale>e.scale*1.6,'player near, enemy distant');
    if(yaw>0)assert.ok(e.scale>p.scale*1.6,'enemy near, player distant');
    for(const actor of [p,e]){
      assert.ok(actor.x-actor.scale*2.65/2.4>0);
      assert.ok(actor.x+actor.scale*2.65/2.4<width);
      assert.ok(actor.y<height&&actor.y-actor.scale*2.65>0,'whole actor fits vertically');
    }
  }
}
run("battleCamera.sync('player');battleCamera.sync('monster')");
assert.equal(stage.dataset.cameraYaw,'58.00','reduced motion snaps to enemy');
run("battleCamera.punchIn('monster');battleCamera.resetView()");
assert.equal(stage.dataset.cameraYaw,'58.00','action reset retains active turn');
stage.style={};run("battleCamera.sync('monster')");
assert.ok(nodes['camera-monster'].style.transform,'re-render reapplies pose');
mounted=false;run("battleCamera.sync('player')");assert.ok(cancelled>0);
mounted=true;run("battleCamera.sync('player')");assert.equal(stage.dataset.cameraYaw,'-58.00','new match resets pose');
console.log('PASS: projection bounds, depth reversal, reduced motion, action reset, re-render and teardown');
