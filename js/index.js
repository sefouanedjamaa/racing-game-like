// 定义全局变量
var container, scene, camera, renderer, controls;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock;

var movingCube;
var collideMeshList = [];
var cubes = [];
var message = document.getElementById("message");
var crash = false;
var score = 0;
var scoreText = document.getElementById("score");
var id = 0;
var crashId = " ";
var lastCrashId = " ";

init();
animate();

function init() {
    // Scene
    scene = new THREE.Scene();
    // Camera
    var screenWidth = window.innerWidth;
    var screenHeight = window.innerHeight;
    camera = new THREE.PerspectiveCamera(45, screenWidth / screenHeight, 1, 20000);
    camera.position.set(10, 70, 200);

    // Renderer
    if (Detector.webgl) {
        renderer = new THREE.WebGLRenderer({ antialias: true });
    } else {
        renderer = new THREE.CanvasRenderer();
    }
    renderer.setSize(screenWidth * 0.85, screenHeight * 0.85);
    container = document.getElementById("ThreeJS");
    container.appendChild(renderer.domElement);

    THREEx.WindowResize(renderer, camera);
    controls = new THREE.OrbitControls(camera, renderer.domElement);

    // 加入两条直线
    geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(-150, -2, -1000));
    geometry.vertices.push(new THREE.Vector3(-200, -2, 100));
    material = new THREE.LineBasicMaterial({
        color: 0xff0013, linewidth: 10, fog: true
    });
    var line1 = new THREE.Line(geometry, material);
    scene.add(line1);
    geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(150, -2, -1000));
    geometry.vertices.push(new THREE.Vector3(200, -2, 100));
    var line2 = new THREE.Line(geometry, material);
    scene.add(line2);


    // 加入控制的cube
    var cubeGeometry = new THREE.CubeGeometry(50, 50, 25, 50, 25, 50);
    
    var wireMaterial = new THREE.MeshBasicMaterial({
        color : 0x00ff00
       //wireframe: true
    });


    movingCube = new THREE.Mesh(cubeGeometry, wireMaterial);
      //        movingCube = new THREE.Mesh(cubeGeometry, material);
    //            movingCube = new THREE.BoxHelper(movingCube);
    movingCube.position.set(10, 25, -20);
    scene.add(movingCube);


}

function animate() {
    requestAnimationFrame(animate);
    update();
    renderer.render(scene, camera);
    movingCube.rotation.y +=0.01;
    movingCube.rotation.x +=0.01;

}

function update() {
    var delta = clock.getDelta();
    var moveDistance = 200 * delta;
    //console.log(moveDistance);
    var rotateAngle = Math.PI / 2 * delta;

                if (keyboard.pressed("A")) {
                  camera.rotation.z -= 0.2 * Math.PI / 180;
                   console.log("press A")
                }
               if (keyboard.pressed("D")) {
                  movingCube.rotation.y += rotateAngle;
               }

    if (keyboard.pressed("left") || keyboard.pressed("A")) {
        if (movingCube.position.x > -270)
            movingCube.position.x -= moveDistance;
        if (camera.position.x > -150) {
            camera.position.x -= moveDistance * 0.6;
            if (camera.rotation.z > -5 * Math.PI / 180) {
                camera.rotation.z -= 0.2 * Math.PI / 180;
            }
        }
    }
    if (keyboard.pressed("right") || keyboard.pressed("D")) {
        if (movingCube.position.x < 270)
            movingCube.position.x += moveDistance;
        if (camera.position.x < 150) {
            camera.position.x += moveDistance * 0.6;
            if (camera.rotation.z < 5 * Math.PI / 180) {
                camera.rotation.z += 0.2 * Math.PI / 180;
            }
        }
    }
    if (keyboard.pressed("up") || keyboard.pressed("W")) {
        movingCube.position.z -= moveDistance;
    }
    if (keyboard.pressed("down") || keyboard.pressed("S")) {
        movingCube.position.z += moveDistance;
    }

    if (!(keyboard.pressed("left") || keyboard.pressed("right") ||
        keyboard.pressed("A") || keyboard.pressed("D"))) {
        delta = camera.rotation.z;
        camera.rotation.z -= delta / 10;
    }


    var originPoint = movingCube.position.clone();

    for (var vertexIndex = 0; vertexIndex < movingCube.geometry.vertices.length; vertexIndex++) {
        // 顶点原始坐标
        var localVertex = movingCube.geometry.vertices[vertexIndex].clone();
        // 顶点经过变换后的坐标
        var globalVertex = localVertex.applyMatrix4(movingCube.matrix);
        var directionVector = globalVertex.sub(movingCube.position);

        var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
        var collisionResults = ray.intersectObjects(collideMeshList);
        if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
            crash = true;
            crashId = collisionResults[0].object.name;
            break;
        }
        crash = false;
    }

    if (crash) {
        //           message.innerText = "crash";
        movingCube.material.color.setHex(0x3FF386);
        console.log("Crash");
        if (crashId !== lastCrashId) {
            score -= 10;
            lastCrashId = crashId;
        }

        document.getElementById('explode_sound').play()
    } else {
        //            message.innerText = "Safe";
        movingCube.material.color.setHex(0x0000FF);
    }

    if (Math.random() < 0.05 && cubes.length < 50) {
        makeRandomCube();
    }

    for (i = 0; i < cubes.length; i++) {
        if (cubes[i].position.z > camera.position.z) {
            scene.remove(cubes[i]);
            cubes.splice(i, 1);
            collideMeshList.splice(i, 1);
        } else {
            cubes[i].position.z += 10;
        }
        //                renderer.render(scene, camera);
    }

    score += 0.1;
    scoreText.innerText = "Score:" + Math.floor(score);

    //controls.update();
}


// 返回一个介于min和max之间的随机数
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

// 返回一个介于min和max之间的整型随机数
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}


function makeRandomCube() {
    var a = 1 * 30,
        b = getRandomInt(1, 3) * 30,
        c = 1 * 30;
    var geometry = new THREE.CubeGeometry(a, b, c);
    var material = new THREE.MeshBasicMaterial({
        color:  0xff0000,
        size: 2
    });

    var box= new THREE.Mesh(geometry, material);
    var boxe = new THREE.BoxHelper(box);
      box.material.color.setHex(0xff0000);  

    box.position.x = getRandomArbitrary(-250, 250);
    box.position.y = 1 + b / 2;
    box.position.z = getRandomArbitrary(-800, -1200);
    cubes.push(box);
    box.name = "box_" + id;
    id++;
    collideMeshList.push(box);

    scene.add(box);
}
