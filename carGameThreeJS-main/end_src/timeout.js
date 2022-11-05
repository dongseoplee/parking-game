'use strict';

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({canvas});

  const fov = 75;
  const aspect = 2;  // the canvas default
  const near = 0.1;
  const far = 50;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 2, 5);

  const controls = new THREE.OrbitControls(camera, canvas);
  controls.target.set(0, 2, 0);
  controls.update();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('black');

  function addLight(position) {
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(...position);
    scene.add(light);
    scene.add(light.target);
  }
  addLight([-3, 1, 1]);
  addLight([ 2, 1, .5]);

  const bodyRadiusTop = .4;
  // const bodyRadiusBottom = .2;
  const bodyHeight = 2;
  // const bodyRadialSegments = 6;
  // const bodyGeometry = new THREE.CylinderBufferGeometry(
  //     bodyRadiusTop, bodyRadiusBottom, bodyHeight, bodyRadialSegments);

  const headRadius = 0.4 * 0.8;
  const headLonSegments = 12;
  const headLatSegments = 5;
  const headGeometry = new THREE.SphereBufferGeometry(
      headRadius, headLonSegments, headLatSegments);

  function makeLabelCanvas(baseWidth, size, name) {
    const borderSize = 2;
    const ctx = document.createElement('canvas').getContext('2d');
    const font =  `${size}px bold sans-serif`;
    ctx.font = font;
    // measure how long the name will be
    const textWidth = ctx.measureText(name).width;

    const doubleBorderSize = borderSize * 2;
    const width = baseWidth + doubleBorderSize;
    const height = size + doubleBorderSize;
    ctx.canvas.width = width;
    ctx.canvas.height = height;

    // need to set font again after resizing canvas
    ctx.font = font;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    ctx.fillStyle = '';
    ctx.fillRect(0, 0, width, height);

    // scale to fit but don't stretch
    const scaleFactor = Math.min(1, baseWidth / textWidth);
    ctx.translate(width / 2, height / 2);
    ctx.scale(scaleFactor, 1);
    ctx.fillStyle = 'white';
    ctx.fillText(name, 0, 0);

    return ctx.canvas;
  }

  function makePerson(x, labelWidth, size, name, color) {
    const canvas = makeLabelCanvas(labelWidth, size, name);
    const texture = new THREE.CanvasTexture(canvas);
    // because our canvas is likely not a power of 2
    // in both dimensions set the filtering appropriately.
    texture.minFilter = THREE.LinearFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    const labelMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
    });
    const bodyMaterial = new THREE.MeshPhongMaterial({
      color,
      flatShading: true,
    });

    const root = new THREE.Object3D();
    root.position.x = x;

    // const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    // root.add(body);
    // body.position.y = bodyHeight / 2;

    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    root.add(head);
    head.position.y = bodyHeight + headRadius * 1.1;

    const label = new THREE.Sprite(labelMaterial);
    root.add(label);
    label.position.y = bodyHeight * 4 / 5;
    label.position.z = bodyRadiusTop * 1.01;

    // if units are meters then 0.01 here makes size
    // of the label into centimeters.
    const labelBaseScale = 0.01;
    label.scale.x = canvas.width  * labelBaseScale;
    label.scale.y = canvas.height * labelBaseScale;

    scene.add(root);
    return root;
  }

  // makePerson(-3, 150, 32, 'Purple People Eater', 'purple');
  // makePerson(+3, 150, 32, 'Red Menace', 'red');

  //Time 
  const checkResult = localStorage.getItem('result') || null
  makePerson(-0, 400, 50, checkResult, 'red');

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function render() {
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
new THREE.TextGeometry( text, parameters );


