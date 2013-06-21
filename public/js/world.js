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
  var envMesh;
  var tempLight;
  var lights = [];
  var frameCounter = 0;
  var nodes = [];
  var numLights = 6;
  var sphereRadius = 25;
  var lightRange = 0;
  var movementSpeed = 111;
  var lookSpeed = .05;
  var lightIntensity = 11.0;
  var lightDistance = 155;
  var numNodes;
  var tempNode;
  var time;

  var gui, lightConfig = {
      lightIntensity: lightIntensity
    };

  init();
  animate();

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

    controls.movementSpeed = movementSpeed;
    controls.lookSpeed = lookSpeed;
    controls.freeze;

    controls.lon = -90;

    //DATGUI
    guiSetup();


    createNodes();
    addLights();
    // stats = new Stats();
    // stats.domElement.style.position = 'absolute';
    // stats.domElement.style.top = '0px';
    // document.body.appendChild(stats.domElement);
    window.addEventListener('resize', onWindowResized, false);
    document.addEventListener('mousewheel', onDocumentMouseWheel, false);
    document.addEventListener('DOMMouseScroll', onDocumentMouseWheel, false);

    onWindowResized(null);

  }

  function guiSetup() {
    //gui = new dat.GUI();

    // gui.add(lightConfig, 'lightIntensity', 0, 500).onChange(function() {

    //   lightIntensity= lightConfig.lightIntensity;
    //   for(var i = 0; i < lights.length; i++){
    //     debugger;
    //     lights[i].sceneLight.distance = lightIntensity;
    //   }

    // });
  }

  function addLights() {
    for (var i = 0; i < numLights; i++) {
      var nodeIndex = Math.floor(Math.random() * nodes.length);
      var node = nodes[nodeIndex];
      var randColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
      var light = new THREE.PointLight(randColor, lightIntensity, lightDistance)
      var lightPosition = new THREE.Vector3();
      lightPosition.x = node.originalPosition.x;
      lightPosition.y = node.originalPosition.y;
      lightPosition.z = node.originalPosition.z;
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

  function onDocumentMouseWheel(event) {

    // WebKit

    if (event.wheelDeltaY) {

      fov -= event.wheelDeltaY * 0.005;

      // Opera / Explorer 9

    } else if (event.wheelDelta) {

      fov -= event.wheelDelta * 0.005;

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
    time = Date.now() * .0004;
    var delta = clock.getDelta();
    // stats.update();

    for (var i = 0; i < numLights; i++) {
      tempLight = lights[i];
      tempLight.sceneLight.position.x = Math.sin(time) * 111 + tempLight.originalPosition.x;
      tempLight.sceneLight.position.y = Math.cos(time) * 111 + tempLight.originalPosition.y;
      tempLight.sceneLight.position.z = Math.cos(time) * 111 + tempLight.originalPosition.z;

    }

    for (var i = 0; i < numNodes; i++) {
      tempNode = nodes[i];
      if (i % 2 === 0) {
        tempNode.sphere.position.x = Math.sin(time * .2) * 3 + tempNode.originalPosition.x;
        tempNode.sphere.position.y = Math.cos(time * .5) * 5 + tempNode.originalPosition.y;
        tempNode.sphere.position.z = Math.cos(time * .3) * 2 + tempNode.originalPosition.z;
      } else {
        tempNode.sphere.position.x = Math.sin(time * .3) * 1 + tempNode.originalPosition.x;
        tempNode.sphere.position.y = Math.cos(time * .4) * 3 + tempNode.originalPosition.y;
        tempNode.sphere.position.z = Math.cos(time * .2) * 1 + tempNode.originalPosition.z;
      }

    }

    cubeCamera.updateCubeMap(renderer, scene);

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
    var begin = -300;
    var end = 300

    for (var x = begin; x < end; x += spacing) {
      for (var y = begin; y < end; y += spacing) {
        for (var z = begin; z < end; z += spacing) {
          sphere = new THREE.Mesh(new THREE.SphereGeometry(sphereRadius, 30, 15), shinyMaterial);
          var position = new THREE.Vector3(x + Math.random() * 20, y + Math.random() * 20, z + Math.random() * 20);
          sphere.position.copy(position);
          nodes.push({
            originalPosition: position,
            sphere: sphere
          });
          scene.add(sphere);
        }

      }

    }
    numNodes = nodes.length;
  }
}