var World = function() {
  var camera, cubeCamera, cubeMap, scene, renderer, controls;
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
  var frameCounter =  0;
  var nodes = [];


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

    // var mesh = new THREE.Mesh(new THREE.SphereGeometry(500, 60, 40), new THREE.MeshBasicMaterial({
    //   map: texture
    // }));

    envMesh = new THREE.Mesh(new THREE.SphereGeometry(500, 60, 40), envMaterial);
    envMesh.scale.x = -1;
    scene.add(envMesh);

    renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
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


    window.addEventListener('resize', onWindowResized, false);

    onWindowResized(null);

  }

  function addLights() {
    for (var i = 0; i < 10; i++) {
      //add lgihts
      var nodeIndex = Math.floor(Math.random() * lights.length);
      // var Node = 
      var randColor = '#'+Math.floor(Math.random()*16777215).toString(16);
      var light = new THREE.PointLight(randColor, 20, 70, 100)
      var lightPosition = new THREE.Vector3();
      lightPosition.x = -300 + Math.random() * 600;
      lightPosition.y = -300 + Math.random() * 600;
      lightPosition.z = -300 + Math.random() * 600;
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
    console.log('x', camera.position.x)
    console.log('y', camera.position.y)
    console.log('z', camera.position.z)
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
    var time = Date.now() * 0.00025;
    var z = 20,
      d = 150;
      frameCounter++;

    for (var i = 0; i < lights.length; i++) {
      var light = lights[i];
      light.sceneLight.position.x = Math.sin(time * 0.7) * d + light.originalPosition.x;
      light.sceneLight.position.z = Math.cos(time * 0.3) * d + light.originalPosition.z;
      light.sceneLight.position.y = Math.cos(time * 0.3) * d + light.originalPosition.y;

      if(i === 0 && frameCounter% 10 === 0){
        console.log(light.originalPosition)
        
      }
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
    var sphereRadius = 25;
    var spacing = sphereRadius * 4;
    var sphere;
    var begin = -300;
    var end = 300

    var i = 1;
    for (var x = begin; x < end; x += spacing) {
      for (var y = begin; y < end; y += spacing) {
        for (var z = begin; z < end; z += spacing) {
          sphere = new THREE.Mesh(new THREE.SphereGeometry(sphereRadius, 30 * i, 15 * i), shinyMaterial);
          sphere.position.x = x;
          sphere.position.y = y;
          sphere.position.z = z;
          nodes.push(sphere);
          scene.add(sphere);
          i += .001;
        }

      }

    }
  }
}