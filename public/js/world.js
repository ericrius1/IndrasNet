var World = function() {
  var camera, cubeCamera, cubeMap, scene, renderer, controls, stats;
  var fov = 70,
    isUserInteracting = false,
    onMouseDownMouseX = 0,
    onMouseDownMouseY = 0,
    lon = 0,
    onMouseDownLon = 0,
    lat = 0,
    onMouseDownLat = 0,
    phi = 0,
    theta = 0;
  var clock = new THREE.Clock();
  var flyMode = true;
  var envMesh;
  var light;
  var lights = [];
  var frameCounter = 0;
  var nodes = [];
  var numLights = 10;
  var sphereRadius = 20;


  var texture = THREE.ImageUtils.loadTexture('images/house.jpg', new THREE.UVMapping(), function() {

    init();
    animate();

  });

  function init() {

    camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 1, 1000);

    scene = new THREE.Scene();

    //SKY BOX

    var urls = [
        'images/sky1.jpg',
        'images/sky2.jpg',
        'images/sky4.jpg',
        'images/sky3.jpg',
        'images/sky5.jpg',
        'images/sky6.jpg'
    ];

    cubemap = THREE.ImageUtils.
    loadTextureCube(urls);



    var envMaterial = new THREE
      .MeshLambertMaterial({
      color: 0xffffff,
      envMap: cubemap
    });


    envMesh = new THREE.Mesh(new THREE.SphereGeometry(500, 60, 40), envMaterial);
    envMesh.scale.x = -1;
    scene.add(envMesh);

    renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);
    cubeCamera = new THREE.CubeCamera(1, 1000, 256);
    cubeCamera.renderTarget.minFilter = THREE.LinearMipMapLinearFilter;
    scene.add(cubeCamera);

    document.body.appendChild(renderer.domElement);

    //LIGHTS 
    scene.add(new THREE.AmbientLight(0xffffff));



    //CONTROLS
    controls = new THREE.FirstPersonControls(camera);

    controls.movementSpeed = 250;
    controls.lookSpeed = 0.2;
    controls.freeze;

    controls.lon = -90;


    createNodes();
    addLights();
    if (!flyMode) {
      document.addEventListener('mousedown', onDocumentMouseDown, false);
      document.addEventListener('mousewheel', onDocumentMouseWheel, false);
      document.addEventListener('DOMMouseScroll', onDocumentMouseWheel, false);
    }

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    document.body.appendChild(stats.domElement);
    window.addEventListener('resize', onWindowResized, false);

    onWindowResized(null);

  }

  function addLights() {
    for (var i = 0; i < numLights; i++) {
      var nodeIndex = Math.floor(Math.random() * nodes.length);
      var node = nodes[nodeIndex];
      var randColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
      var light = new THREE.PointLight(randColor, 70, 100)
      var lightPosition = new THREE.Vector3();
      lightPosition.x = node.position.x + sphereRadius;
      lightPosition.y = node.position.y;
      lightPosition.z = node.position.z; 
      lights.push({
        originalPosition: lightPosition,
        sceneLight: light
      });
      scene.add(light);
    }
  }

  function onWindowResized(event) {

    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.projectionMatrix.makePerspective(fov, window.innerWidth / window.innerHeight, 1, 1100);
    controls.handleResize();
  }

  function onDocumentMouseDown(event) {
    event.preventDefault();

    onPointerDownPointerX = event.clientX;
    onPointerDownPointerY = event.clientY;

    onPointerDownLon = lon;
    onPointerDownLat = lat;

    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('mouseup', onDocumentMouseUp, false);

  }

  function onDocumentMouseMove(event) {
    lon = (event.clientX - onPointerDownPointerX) * 0.1 + onPointerDownLon;
    lat = (event.clientY - onPointerDownPointerY) * 0.1 + onPointerDownLat;

  }

  function onDocumentMouseUp(event) {
    document.removeEventListener('mousemove', onDocumentMouseMove, false);
    document.removeEventListener('mouseup', onDocumentMouseUp, false);

  }

  function onDocumentMouseWheel(event) {

    // WebKit

    if (event.wheelDeltaY) {

      fov -= event.wheelDeltaY * 0.05;

      // Opera / Explorer 9

    } else if (event.wheelDelta) {

      fov -= event.wheelDelta * 0.05;

      // Firefox

    } else if (event.detail) {

      fov += event.detail * 1.0;

    }

    camera.projectionMatrix.makePerspective(fov, window.innerWidth / window.innerHeight, 1, 1100);

  }

  function animate() {

    requestAnimationFrame(animate);
    render();

  }

  function render() {
    var time = Date.now() * 0.0005;
    var delta = clock.getDelta();
    frameCounter++;
    stats.update();

    for (var i = 0; i < numLights; i++) {
      var light = lights[i];
      light.sceneLight.position.x = Math.sin(time * 0.7) * 10 + light.originalPosition.x;
      light.sceneLight.position.y = Math.cos(time * 0.5) * 10+ light.originalPosition.y;
      light.sceneLight.position.z = Math.cos(time * 0.3)* 10 + light.originalPosition.z;

    }


    // sphere1.visible = false; // *cough*
    cubeCamera.updateCubeMap(renderer, scene);

    // sphere1.visible = true; // *cough*
    controls.update(clock.getDelta());
    renderer.render(scene, camera);

  }

  function createNodes() {
    var cubeTarget = cubeCamera.renderTarget;
    var shinyMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      ambient: 0xffffff,
      envMap: cubeTarget
    });
    var spacing = sphereRadius * 4;
    var sphere;
    var begin = -400;
    var end = 400

    for (var x = begin; x < end; x += spacing) {
      for (var y = begin; y < end; y += spacing) {
        for (var z = begin; z < end; z += spacing) {
          sphere = new THREE.Mesh(new THREE.SphereGeometry(sphereRadius, 30, 15), shinyMaterial);
          sphere.position.x = x;
          sphere.position.y = y;
          sphere.position.z = z;
          nodes.push(sphere);
          scene.add(sphere);
        }

      }

    }
  }
}