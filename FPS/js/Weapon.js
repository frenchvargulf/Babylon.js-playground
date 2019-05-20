Weapon = function(game, player) {

    this.game = game;
    this.player = player;

    // The weapon mesh
    var wp = game.assets["gun"][0];
    wp.isVisible = true;
    wp.rotationQuaternion = null;
    wp.rotation.x = -Math.PI/2;
    wp.rotation.y = Math.PI;
    wp.parent = player.camera;
    wp.position = new BABYLON.Vector3(0.25,-0.4,1);
    this.mesh = wp;

    // The initial rotation
    this._initialRotation = this.mesh.rotation.clone();

    // The fire rate
    this.fireRate = 250.0;
    this._currentFireRate = this.fireRate;
    this.canFire = true;

    // The particle emitter
    var scene = this.game.scene;
    var particleSystem = new BABYLON.ParticleSystem("particles", 100, scene );
    particleSystem.emitter = this.mesh; // the starting object, the emitter
    particleSystem.particleTexture = new BABYLON.Texture("assets/particles/gunshot_125.png", scene);
    particleSystem.emitRate = 5;
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
    particleSystem.minEmitPower = 1;
    particleSystem.maxEmitPower = 3;
    particleSystem.colorDead = new BABYLON.Color4(1, 1, 1, 0.0);

    particleSystem.minLifeTime = 0.2;
     particleSystem.maxLifeTime = 0.2;

    particleSystem.updateSpeed = 0.02;
    //particleSystem.start();
    this.particleSystem = particleSystem;

    var _this = this;
    this.game.scene.registerBeforeRender(function() {
        if (!_this.canFire) {
            _this._currentFireRate -= BABYLON.Tools.GetDeltaTime();
            if (_this._currentFireRate <= 0) {
                _this.canFire = true;
                _this._currentFireRate = _this.fireRate;
            }
        }
    });


};

Weapon.prototype = {

    /**
     * Animate the weapon
     */
    animate : function() {
        this.particleSystem.start();

        var start = this._initialRotation.clone();
        var end = start.clone();

        end.x += Math.PI/10;

        // Create the Animation object
        var display = new BABYLON.Animation(
            "fire",
            "rotation",
            60,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

        // Animations keys
        var keys = [{
            frame: 0,
            value: start
        },{
            frame: 10,
            value: end
        },{
            frame: 100,
            value: start
        }];

        // Add these keys to the animation
        display.setKeys(keys);

        // Link the animation to the mesh
        this.mesh.animations.push(display);

        // Run the animation !
        var _this = this;
        this.game.scene.beginAnimation(this.mesh, 0, 100, false, 10, function() {
            _this.particleSystem.stop();
        });


    },

    /**
     * Fire the weapon if possible.
     * The mesh is animated and some particles are emitted.
     */
    fire : function(pickInfo) {
        if (this.canFire) {
            if (pickInfo.hit && pickInfo.pickedMesh.name === "target") {
                pickInfo.pickedMesh.explode();
            } else {
                var b = BABYLON.Mesh.CreateBox("box", 0.1, this.game.scene);
                b.position = pickInfo.pickedPoint.clone();
            }
            this.animate();
            this.canFire = false;
        } else {
            // Nothing to do : cannot fire
        }
    }
};