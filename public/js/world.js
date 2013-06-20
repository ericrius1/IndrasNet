var World = function() {
  var camera, cubeCamera, scene, renderer;
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

  var texture = THREE.ImageUtils.loadTexture('images/house.jpg', new THREE.UVMapping(), function() {

    init();
    animate();

  });

  function init() {

    camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 1, 1000);

    scene = new THREE.Scene();

    var mesh = new THREE.Mesh(new THREE.SphereGeometry(500, 60, 40), new THREE.MeshBasicMaterial({
      map: texture
    }));
    mesh.scale.x = -1;
    scene.add(mesh);

    renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    cubeCamera = new THREE.CubeCamera(1, 1000, 256);
    cubeCamera.renderTarget.minFilter = THREE.LinearMipMapLinearFilter;
    scene.add(cubeCamera);

    document.body.appendChild(renderer.domElement);

    //LIGHTS
    var light1 = new THREE.AmbientLight( 0xffffff, 50, 50 );
    scene.add( light1 );
    light1.position = new THREE.Vector3(10, 10, 10);

    var light2 = new THREE.PointLight( 0xff00ff, 20, 50 );
    scene.add( light2 );
    light2.position = new THREE.Vector3(10, 10, 10);


  

    createSpheres();

    document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener('mousewheel', onDocumentMouseWheel, false);
    document.addEventListener('DOMMouseScroll', onDocumentMouseWheel, false);
    window.addEventListener('resize', onWindowResized, false);

    onWindowResized(null);

  }

  function onWindowResized(event) {

    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.projectionMatrix.makePerspective(fov, window.innerWidth / window.innerHeight, 1, 1100);
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

    var time = Date.now();

    // lon += .15;

    lat = Math.max(-85, Math.min(85, lat));
    phi = THREE.Math.degToRad(90 - lat);
    theta = THREE.Math.degToRad(lon);

    // sphere1.position.x = Math.sin(time * 0.001) * 30;
    // sphere1.position.y = Math.sin(time * 0.0011) * 30;
    // sphere1.position.z = Math.sin(time * 0.0012) * 30;


   

    camera.position.x = 100 * Math.sin(phi) * Math.cos(theta);
    camera.position.y = 100 * Math.cos(phi);
    camera.position.z = 100 * Math.sin(phi) * Math.sin(theta);

    camera.lookAt(scene.position);


    // sphere1.visible = false; // *cough*

    cubeCamera.updateCubeMap(renderer, scene);

    // sphere1.visible = true; // *cough*

    renderer.render(scene, camera);

  }

  function createSpheres(){
    var cubeTarget = cubeCamera.renderTarget;
    var shinyMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff, ambient: 0xffffff, envMap: cubeTarget  } );
    var sphereRadius = 20;
    var spacing = sphereRadius * 3;
    var sphere;
    var i = 1;
    for(var x = -20; x <400; x+=spacing){
      sphere = new THREE.Mesh(new THREE.SphereGeometry(sphereRadius, 30, 15 * i), shinyMaterial);
      sphere.position.x = x;
      scene.add(sphere);
    }
    // sphere1 = new THREE.Mesh(new THREE.SphereGeometry(sphereRadius, 30, 15), shinyMaterial);
    // scene.add(sphere1);

  }

}