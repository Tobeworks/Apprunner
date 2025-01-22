import {$, THREE} from '../libs';
import Orbit from './Orbit';
import ThreeMouseEventConverter from './ThreeMouseEventConverter';
import ThreeTouchEventConverter from './ThreeTouchEventConverter';
import Drag from './Drag';
import CSS3DRenderer from './CSS3DRenderer';

export default class VisualWorld extends THREE.EventDispatcher {

  constructor(wnd, doc, container, useHelpers=false) {
    super();
    this.checkUpdateFlag = true;
    this.wnd = wnd;
    this.doc = doc;
    this.jContainer = container;
    this.renderCallbacks = [];
    this.diag = this.getDiag();

    this.clock = new THREE.Clock();

    this.raycaster = new THREE.Raycaster();

    this.scene = new THREE.Scene();
    this.cssScene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(30, this.width()/this.height(), 0.2, 2000);
    const scale = 1;

    this.camera.position.x = 0;
    this.camera.position.y = 5.5*scale;
    this.camera.position.z = 0;

    this.renderer = new THREE.WebGLRenderer({alpha: true, precision: VisualWorld.getPrecision(), antialias: true});
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(this.wnd.devicePixelRatio);
    this.renderer.setSize(this.width(), this.height());

    this.jContainer.append(this.renderer.domElement);

    this.cssRenderer	= new CSS3DRenderer();
    this.cssRenderer.setSize(this.width(), this.height());
    $(this.cssRenderer.domElement).css({
  		position: 'absolute',
  		top: 0,
  		margin: 0,
  		padding: 0
	  });
    this.jContainer.append(this.cssRenderer.domElement);

    this.element = this.cssRenderer.domElement;

    this.textureLoader = new THREE.TextureLoader();

    this.scene.add(new THREE.AmbientLight(0xD0D0D0));//0xC0C0C0

    this.light = new THREE.DirectionalLight(0x404040, 1);
    this.light.position.set(0, 6*scale, 0);
    this.light.castShadow = false;
    // const d = 20*scale;
    // this.light.shadow.camera.left = -d;
    // this.light.shadow.camera.right = d;
    // this.light.shadow.camera.top = d;
    // this.light.shadow.camera.bottom = -d;
    // this.light.shadow.camera.near = 1*scale;
    // this.light.shadow.camera.far = 25*scale;
    // this.light.shadow.mapSize.x = 1024;
    // this.light.shadow.mapSize.y = 1024;
    this.scene.add(this.light);

    this.controls = new Orbit(this.camera, this.element);
    this.controls.target.y = 0.5;

    const cssScene = $(this.cssRenderer.domElement).find('div'), tmpVector = new THREE.Vector3();
    this.controls.addEventListener('change', ()=> {
      this.camera.getWorldDirection(tmpVector);
      cssScene.css('display', tmpVector.y-this.camera.position.y>0? 'none': 'block');
      this.updateThree();
    });

    if(useHelpers) {
      this.scene.add(new THREE.AxisHelper(5));
    }

    this.binds = {
      onWindowResize: this.onWindowResize.bind(this),
      animate: this.animate.bind(this)
    };

    $(this.wnd).on('resize', this.binds.onWindowResize);

    this.mouseEvents = new ThreeMouseEventConverter(this.wnd, this.doc, this);
    this.touchEvents = new ThreeTouchEventConverter(this.wnd, this.doc, this);
    const filterData = {type: 'mousemove'};
    this.mouseEvents.filter = (element, e)=> {
      const types = ['mouseenter', 'mouseover', 'mouseleave', 'mouseout'], contains = (p, c)=> p===c || $.contains(p, c);
      if(e.type==='mousemove') {
        filterData.pageX = e.pageX;
        filterData.pageY = e.pageY;
      }
      return e.relatedTarget && ~types.indexOf(e.type) && contains(element, e.target) && contains(element, e.relatedTarget)? {...e, ...filterData}: e;
    };
    this.drag = new Drag(this.wnd, this.doc, this);

    this.onWindowResize();
    this.animate();
  }

  getDiag() {
    const test = $('<div style="height: 1in; width: 1in; display: none;"></div>').appendTo(this.jContainer),
    r = new THREE.Vector2(screen.width/test.width(), screen.height/test.height());
    test.remove();
    return r.length();
  }

  updateThree() {
    this.light.userData.needsUpdate = true;
  }

  dispose() {
    delete this.binds.animate;
    $(this.wnd).off('resize', this.binds.onWindowResize);
    this.mouseEvents.dispose();
    this.touchEvents.dispose();
    this.drag.dispose();
    this.controls.dispose();
  }

  width() {
    return this.jContainer.width();
  }

  height() {
    return this.jContainer.height();
  }

  setExtraLighting(v) {
    this.light.intensity = v;
  }

  isMobile() {
    return this.diag<11;
  }

  getOrbit() {
    return this.controls;
  }

  setControlsState(state) {
    this.controls.enabled = state;
  }

  getControlsState() {
    return this.controls.enabled;
  }

  onWindowResize() {
    if(this.width()>1 && this.height()>1) {
      const updateCamera = (camera)=> {
        camera.aspect = this.width()/this.height();
        camera.updateProjectionMatrix();
      },
      updateRenderer = (renderer)=> {
        renderer.setSize(this.width(), this.height());
      };

      updateCamera(this.camera);
      updateRenderer(this.renderer);
      updateRenderer(this.cssRenderer);
      this.updateThree();

      this.dispatchEvent({type: 'resize'});
    }
    else {
      setTimeout(()=> {
        this.onWindowResize();
      }, 250);
    }
  }

  addObject(object) {
    this.scene.add(object);
  }

  addCssObject(object) {
    this.cssScene.add(object);
  }

  removeCssObject(object) {
    this.cssScene.remove(object);
  }

  removeObject(object) {
    this.scene.remove(object);
  }

  animate() {
    if(this.binds.animate) {
      requestAnimationFrame(this.binds.animate);
    }
    this.render();
  }

  addRenderCallback(clb) {
    this.renderCallbacks.push(clb);
  }

  removeRenderCallback(clb) {
    const i = this.renderCallbacks.indexOf(clb);
    if(~i) {
      this.renderCallbacks.splice(i, 1);
    }
  }

  render() {
    const deltaTime = this.clock.getDelta();
    this.controls.update(deltaTime);
    for(let clb of this.renderCallbacks) {
      clb(deltaTime);
    }
    this.cssRenderer.render(this.cssScene, this.camera);
    let render = true;
    if(this.checkUpdateFlag) {
      render = false;
      for(let o of this.scene.children) {
        render = render || o.userData.needsUpdate;
        o.userData.needsUpdate = false;
      }
    }
    if(render) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  static getPrecision() {
    const scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0xffffff));

    const camera = new THREE.PerspectiveCamera(30, 1, 1, 100);
    camera.position.set(0, 0, 1);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xffffff);
    renderer.setSize(1, 1);

    const c = document.createElement('canvas'), ctx = c.getContext('2d');
    c.width = c.height = 1;
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, c.width, c.height);
    const t = new THREE.Texture(c);
    t.needsUpdate = true;

    scene.add(new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1, 1, 1),
      new THREE.MeshPhongMaterial({map: t})
    ));

    renderer.render(scene, camera);

    function getPixel(c, x, y) {
      const ps = new Uint8Array(4);
      c.readPixels(x, y, 1, 1, c.RGBA, c.UNSIGNED_BYTE, ps);
      return ps;
    }
    const p = getPixel(renderer.domElement.getContext('webgl') || renderer.domElement.getContext('experimental-webgl'), 0, 0);
    return p[0]===255&&p[1]===0&&p[2]===0? 'highp': 'mediump';
  }
}
