/// <reference path="/scripts/babylon.js">
var engine;
var canvas;
var scene;


document.addEventListener("DOMContentLoaded", startGame, false);

function startGame() {
    if (BABYLON.Engine.isSupported()) {
        // Get canvas
        canvas = document.getElementById("renderCanvas");
        // Create engine
        engine = new BABYLON.Engine(canvas, true);

        // Load scene 
        BABYLON.SceneLoader.Load("Espilit/", "Espilit.babylon", engine, function (loadedScene) {
            scene = loadedScene;
   
            // Wait for textures and shaders to be ready
            scene.executeWhenReady(function () {
                // Attach camera to canvas inputs
                scene.activeCamera.attachControl(canvas);
                
                // Enable physics, set up the gravity level (-10 on the Y axis - Earth)
                scene.enablePhysics(new BABYLON.Vector3(0, -10, 0), new BABYLON.OimoJSPlugin());
                CreateMaterials();
                generateActions();

                var meshesColliderList = [];

                // Iterate through all non-visible colliders used by the collision engine
                for (var i = 1; i < scene.meshes.length; i++) {
                    // Find all meshes where checkCollisions is set to true but not visible in the scene:
                    if (scene.meshes[i].checkCollisions && scene.meshes[i].isVisible === false) {
                        // Activate physics properties on colliders found. 
                        scene.meshes[i].setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, { mass: 0, 
                            friction: 0.5, restitution: 0.7 
                        });
                    meshesColliderList.push(scene.meshes[i]);
                    }
                }
                
                CreateCollidersHTMLList()
                function CreateCollidersHTMLList() {
                    var listColliders = document.getElementById("listColliders");
                    for (var j = 0; j < meshesColliderList.length; j++) {
                        // Create new li Element
                        var newLi = document.createElement("li");

                        // Check visibility by input 
                        var chkVisibility = document.createElement('input');
                        chkVisibility.type = "checkbox";
                        chkVisibility.name = meshesColliderList[j].name;
                        chkVisibility.id = "colvis" + j;

                        // Check physics by input
                        var chkPhysics = document.createElement('input');
                        chkPhysics.type = "checkbox";
                        chkPhysics.name = meshesColliderList[j].name;
                        chkPhysics.id = "colphysx" + j;

                        // Check on click on input
                        (function (j) {
                            chkVisibility.addEventListener( "click", function (event) {onChangeVisibility(j, event);}, false );
                            chkPhysics.addEventListener("click", function (event) { onChangePhysics(j, event);}, false );
                        })(j)
                    
                        newLi.textContent = meshesColliderList[j].name + " visibility/physx ";

                        // Add to HTML 
                        newLi.appendChild(chkVisibility);
                        newLi.appendChild(chkPhysics);
                        listColliders.appendChild(newLi);
                    }

                    
                    function onChangeVisibility(id, event) {
                        if (!meshesColliderList[id].isVisible) {
                            meshesColliderList[id].isVisible = true;
                            meshesColliderList[id].material.alpha = 0.75;
                            meshesColliderList[id].material.ambientColor.r = 1;
                        }
                        else {
                            meshesColliderList[id].isVisible = false;
                        }
                    }

                    function onChangePhysics(id, event) {
                        if (!meshesColliderList[id].checkCollisions) {
                            meshesColliderList[id].checkCollisions = true;
                            meshesColliderList[id].setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, { mass: 0, 
                                friction: 0.5, restitution: 0.7 });
                        }
                        else {
                            meshesColliderList[id].checkCollisions = false;
                            meshesColliderList[id].setPhysicsState(BABYLON.PhysicsEngine.NoImpostor);
                        }
                    }
                }

                // Once the scene is loaded, just register a render loop to render it
                engine.runRenderLoop(function () {
                    scene.render();        
                });
            });
        }, function (progress) {
            // To do: give progress feedback to user
        });
    }
}

// The collision engine is mostly dedicated to the camera interacting with the scene. 
// Enable the checkCollision option on the camera and on the various meshes. 
// Check if two meshes are coliding, do not generate action, force, impulse

function CreateMaterials() {
    materialAmiga = new BABYLON.StandardMaterial("amiga", scene);
    materialAmiga.diffuseTexture = new BABYLON.Texture("assets/amiga.jpg", scene);
    materialAmiga.emissiveColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    materialAmiga.diffuseTexture.uScale = 5;
    materialAmiga.diffuseTexture.vScale = 5;
    materialWood = new BABYLON.StandardMaterial("wood", scene);
    materialWood.diffuseTexture = new BABYLON.Texture("assets/wood.jpg", scene);
    materialWood.emissiveColor = new BABYLON.Color3(0.5, 0.5, 0.5);
}

function generateActions() {
    window.addEventListener("keydown", function (evt) {
        // Press s for sphere
        if (evt.keyCode == 83) {
            for (var index = 0; index < 25; index++) {
                var sphere = BABYLON.Mesh.CreateSphere("Sphere0", 10, 0.5, scene);
                sphere.material = materialAmiga;
                sphere.position = new BABYLON.Vector3(0 + index / 10, 3, 5 + index / 10);
                sphere.setPhysicsState(BABYLON.PhysicsEngine.SphereImpostor, { mass: 1 });
            }
        }
        // Press b for box
        if (evt.keyCode == 66) {
            for (var index = 0; index < 10; index++) {
                var box0 = BABYLON.Mesh.CreateBox("Box0", 0.5, scene);
                box0.position = new BABYLON.Vector3(0 + index / 5, 3, 5 + index / 5);
                box0.material = materialWood;
                box0.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, { mass: 4 });
            }
        }
    });


    // Send a ray from the 2D coordinates of the mouse inside the 3D scene
    canvas.addEventListener("mousedown", function (evt) {
        // Pick objects from scene view
        var pickResult = scene.pick(evt.clientX, evt.clientY, function (mesh) {
            // Choose spheres and boxes
            if (mesh.name.indexOf("Sphere0") !== -1 || mesh.name.indexOf("Box0") !== -1) {
                return true;
            }
            return false;
        });
        // Apply an impulse force on ray touched mesh to move it
        if (pickResult.hit) {
            var dir = pickResult.pickedPoint.subtract(scene.activeCamera.position);
            dir.normalize();
            pickResult.pickedMesh.applyImpulse(dir.scale(1), pickResult.pickedPoint);
        }
    });
}

