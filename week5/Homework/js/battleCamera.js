// Perspective arena camera. Sprites are billboards, HUD/FX stay in screen space.
const CAMERA_PRESETS = {
  PRESET_PLAYER_TURN: { yaw: -58, zoom: 1 },
  PRESET_ENEMY_TURN: { yaw: 58, zoom: 1 },
  PRESET_OVERVIEW: { yaw: 0, zoom: .9 },
};
function projectBattlePoint(x,y,z,camera,width,height) {
  const yaw=camera.yaw*Math.PI/180, pitch=Math.atan2(2.1,8);
  const along=x*Math.sin(yaw)+z*Math.cos(yaw), across=x*Math.cos(yaw)-z*Math.sin(yaw);
  const depth=(8-along)*Math.cos(pitch)+(3-y)*Math.sin(pitch);
  const up=(y-3)*Math.cos(pitch)+(8-along)*Math.sin(pitch);
  const focal=Math.min(width*.95,height*1.4)*camera.zoom;
  return {x:width/2+focal*across/depth,y:height*.43-focal*up/depth,depth,scale:focal/depth};
}
class BattleCameraController {
  constructor() {
    const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
    this.reduceMotion=motion.matches;
    this._current={...CAMERA_PRESETS.PRESET_PLAYER_TURN}; this._target={...this._current};
    this._turn='player'; this._raf=null; this._mounted=false; this._shakeUntil=0; this._shakeIntensity=0;
    window.addEventListener('resize',()=>this._apply());
    motion.addEventListener('change',e=>{this.reduceMotion=e.matches;if(e.matches)this.resetView()});
  }
  _turnPreset(){return this._turn==='monster'?CAMERA_PRESETS.PRESET_ENEMY_TURN:CAMERA_PRESETS.PRESET_PLAYER_TURN}
  // Restore current pose on replaced DOM before paint; never flash the overview.
  sync(turn) {
    if(!document.getElementById('scene-stage')) {
      if(this._raf!==null)cancelAnimationFrame(this._raf);
      this._raf=null;this._mounted=false;this._shakeUntil=0;return;
    }
    const changed=this._turn!==turn;this._turn=turn;
    if(!this._mounted){this._current={...this._turnPreset()};this._target={...this._current};this._mounted=true}
    this._apply();if(changed)this._setTarget(this._turnPreset());else this._startLoop();
  }
  setPreset(name){if(!CAMERA_PRESETS[name])return;if(name==='PRESET_PLAYER_TURN')this._turn='player';if(name==='PRESET_ENEMY_TURN')this._turn='monster';this._setTarget(CAMERA_PRESETS[name])}
  focus(side,{zoom=1.04}={}){this._setTarget({...CAMERA_PRESETS[side==='monster'?'PRESET_ENEMY_TURN':'PRESET_PLAYER_TURN'],zoom:Math.min(zoom,1.08)})}
  punchIn(side,{zoom=1.06,shake=true,shakeIntensity=3,shakeMs=200}={}){if(shake&&!this.reduceMotion){this._shakeUntil=performance.now()+shakeMs;this._shakeIntensity=shakeIntensity}this.focus(side,{zoom})}
  resetView(){this._shakeUntil=0;this._setTarget(this._turnPreset())}
  _setTarget(target){this._target={...target};if(this.reduceMotion){this._current={...target};this._apply()}else this._startLoop()}
  _apply(){
    const stage=document.getElementById('scene-stage');if(!stage)return;
    const width=stage.clientWidth,height=stage.clientHeight;if(!width||!height)return;
    const p=(x,y,z)=>projectBattlePoint(x,y,z,this._current,width,height);
    stage.dataset.cameraSide=this._turn;stage.dataset.cameraYaw=this._current.yaw.toFixed(2);
    const shake=performance.now()<this._shakeUntil&&!this.reduceMotion;
    stage.style.transform=shake?`translate(${(Math.random()-.5)*this._shakeIntensity}px,${(Math.random()-.5)*this._shakeIntensity}px)`:'';
    for(const [side,x] of [['player',-3.2],['monster',3.2]]){
      const actor=document.getElementById(`camera-${side}`);if(!actor)continue;
      const foot=p(x,0,0);actor.style.left=`${foot.x}px`;actor.style.top=`${foot.y}px`;
      actor.style.transform=`translate(-50%,-100%) scale(${foot.scale*2.65/240})`;
      actor.style.zIndex=String(Math.round(100-foot.depth));actor.style.filter=`brightness(${side===this._turn?1:.88})`;
    }
    const world=document.getElementById('arena-world');if(!world)return;
    world.setAttribute('viewBox',`0 0 ${width} ${height}`);
    const line=(a,b,color,opacity=1,weight=1)=>{const s=p(...a),e=p(...b);if(s.depth<1||e.depth<1)return '';return `<path d="M${s.x.toFixed(1)} ${s.y.toFixed(1)}L${e.x.toFixed(1)} ${e.y.toFixed(1)}" stroke="${color}" opacity="${opacity}" stroke-width="${weight}"/>`};
    let paths='';
    for(let n=-12;n<=12;n+=2)for(let t=-12;t<12;t+=2){paths+=line([n,0,t],[n,0,t+2],'#b2bec1',.16);paths+=line([t,0,n],[t+2,0,n],'#b2bec1',.16)}
    for(let n=0;n<80;n++){const a=n*Math.PI/40,b=(n+1)*Math.PI/40;paths+=line([Math.cos(a)*5.4,.01,Math.sin(a)*5.4],[Math.cos(b)*5.4,.01,Math.sin(b)*5.4],'#dec391',.7,2)}
    for(const [x,z] of [[-6,-5],[0,-7],[6,-5],[-8,1],[8,1]]){paths+=line([x,0,z],[x,3,z],'#364555',1,14);paths+=line([x,2.7,z],[x,3.2,z],'#f0d49b',.8,5)}
    world.innerHTML=paths;
    const sky=document.getElementById('arena-sky');if(sky)sky.style.transform=`translateX(${this._current.yaw*-.3}px)`;
  }
  _startLoop(){
    if(this._raf!==null||!document.getElementById('scene-stage'))return;
    let last=performance.now();
    const tick=now=>{
      this._raf=null;if(!document.getElementById('scene-stage'))return;
      const ease=1-Math.exp(-Math.min(now-last,64)/190);last=now;
      for(const key of ['yaw','zoom'])this._current[key]+=(this._target[key]-this._current[key])*ease;
      const settled=Math.abs(this._target.yaw-this._current.yaw)<.08&&Math.abs(this._target.zoom-this._current.zoom)<.001;
      if(settled)this._current={...this._target};this._apply();
      if(!settled||now<this._shakeUntil)this._raf=requestAnimationFrame(tick);
    };this._raf=requestAnimationFrame(tick);
  }
}
const battleCamera=new BattleCameraController();
