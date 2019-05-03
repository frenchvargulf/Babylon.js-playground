var BABYLON;
(function (BABYLON) {
    var OimoJSPlugin = (function () {
        function OimoJSPlugin() {
            this.world;
            this._registeredMeshes = [];
        }
        OimoJSPlugin.prototype.initialize = function (iterations) {
            this.world = new OIMO.World();
            this.world.clear();
        };

        OimoJSPlugin.prototype.setGravity = function (gravity) {
            this.world.gravity = gravity;
        };

        OimoJSPlugin.prototype.registerMesh = function (mesh, impostor, options) {
            this.unregisterMesh(mesh);
            mesh.computeWorldMatrix(true);

            // register mesh
            switch (impostor) {
                case BABYLON.PhysicsEngine.SphereImpostor:
                    var bsphere = mesh.getBoundingInfo().boundingSphere;
                    var size = bsphere.maximum.subtract(bsphere.minimum).scale(0.5).multiply(mesh.scaling);
                    var body = new OIMO.Body({
                        type:'sphere',
                        size:[size.x],
                        pos:[mesh.position.x, mesh.position.y, mesh.position.z],
                        rot:[mesh.rotation.x/OIMO.TO_RAD, mesh.rotation.y/OIMO.TO_RAD, mesh.rotation.z/OIMO.TO_RAD],
                        move:options.move,
                        config:[options.mass, options.friction, options.restitution],
                        world:this.world});
                    this._registeredMeshes.push({
                        mesh : mesh,
                        body : body});
                    break;

                case BABYLON.PhysicsEngine.PlaneImpostor:
                case BABYLON.PhysicsEngine.BoxImpostor:
                    var bbox = mesh.getBoundingInfo().boundingBox;
                    var size = bbox.extends.scale(2).multiply(mesh.scaling);
                    var body = new OIMO.Body({
                        type:'box',
                        size:[size.x||0.1, size.y||0.1, size.z||0.1],
                        pos:[mesh.position.x, mesh.position.y, mesh.position.z],
                        rot:[mesh.rotation.x/OIMO.TO_RAD, mesh.rotation.y/OIMO.TO_RAD, mesh.rotation.z/OIMO.TO_RAD],
                        move:options.move,
                        config:[options.mass, options.friction, options.restitution],
                        world:this.world});

                    this._registeredMeshes.push({
                        mesh : mesh,
                        body : body});
                    break;

            }
            return null;
        };

        OimoJSPlugin.prototype.registerMeshesAsCompound = function (parts, options) {
            var types = [],
                sizes = [],
                positions = [],
                rotations = [];

            var initialMesh = parts[0].mesh;

            for (var index = 0; index < parts.length; index++) {
                var part = parts[index];
                var bodyParameters = this._createBodyAsCompound(part, options, initialMesh);
                types.push(bodyParameters.type);
                sizes.push.apply(sizes, bodyParameters.size);
                positions.push.apply(positions, bodyParameters.pos);
                rotations.push.apply(rotations, bodyParameters.rot);
            }
            var body = new OIMO.Body({
                type:types,
                size:sizes,
                pos:positions,
                rot:rotations,
                move:options.move||true,
                config:[options.mass, options.friction, options.restitution],
                world:this.world});

            this._registeredMeshes.push({
                mesh : initialMesh,
                body : body});


        };

        OimoJSPlugin.prototype._createBodyAsCompound = function(part, options, initialMesh) {
            var bodyParameters;
            var mesh = part.mesh;

            switch (part.impostor) {
                case BABYLON.PhysicsEngine.SphereImpostor:
                    var bsphere = mesh.getBoundingInfo().boundingSphere;
                    var size = bsphere.maximum.subtract(bsphere.minimum).scale(0.5).multiply(mesh.scaling);
                    bodyParameters = {
                        type:'sphere',
                        size:[size.x, -1, -1],
                        pos:[mesh.position.x, mesh.position.y, mesh.position.z],
                        rot:[mesh.rotation.x/OIMO.TO_RAD, mesh.rotation.y/OIMO.TO_RAD, mesh.rotation.z/OIMO.TO_RAD]
                    };
                    break;

                case BABYLON.PhysicsEngine.PlaneImpostor:
                case BABYLON.PhysicsEngine.BoxImpostor:
                    var bbox = part.mesh.getBoundingInfo().boundingBox;
                    var size = bbox.extends.scale(2).multiply(mesh.scaling);
                    var relativePosition = mesh.position;
                    bodyParameters = {
                        type:'box',
                        size:[size.x||0.1, size.y||0.1, size.z||0.1],
                        pos:[relativePosition.x, relativePosition.y, relativePosition.z],
                        rot:[mesh.rotation.x/OIMO.TO_RAD, mesh.rotation.y/OIMO.TO_RAD, mesh.rotation.z/OIMO.TO_RAD]
                    };
                    break;
            }

            return bodyParameters;



        };

        OimoJSPlugin.prototype.unregisterMesh = function (mesh) {
            for (var index = 0; index < this._registeredMeshes.length; index++) {
                var registeredMesh = this._registeredMeshes[index];
                if (registeredMesh.mesh === mesh ||registeredMesh.mesh === mesh.parent) {
                    if (registeredMesh.body) {
                        this._world.removeRigidBody(registeredMesh.body.body);
                        this._unbindBody(registeredMesh.body);
                    }
                    this._registeredMeshes.splice(index, 1);
                    return;
                }
            }
        };

        OimoJSPlugin.prototype._unbindBody = function (body) {
            for (var index = 0; index < this._registeredMeshes.length; index++) {
                var registeredMesh = this._registeredMeshes[index];
                if (registeredMesh.body === body) {
                    registeredMesh.body = null;
                }
            }
        };

        /**
         * Update the body position according to the mesh position
         * @param mesh
         */
        OimoJSPlugin.prototype.updateBodyPosition = function(mesh) {
            for (var index = 0; index < this._registeredMeshes.length; index++) {
                var registeredMesh = this._registeredMeshes[index];
                if (registeredMesh.mesh === mesh ||registeredMesh.mesh === mesh.parent) {
                    var body = registeredMesh.body.body;
                    body.setPosition(mesh.position.x, mesh.position.y, mesh.position.z);
                    body.setOrientation(mesh.rotation.x, mesh.rotation.y, mesh.rotation.z);
                    return;
                }
            }
        };

        OimoJSPlugin.prototype.applyImpulse = function (mesh, force, contactPoint) {


            for (var index = 0; index < this._registeredMeshes.length; index++) {
                var registeredMesh = this._registeredMeshes[index];
                if (registeredMesh.mesh === mesh || registeredMesh.mesh === mesh.parent) {
                    registeredMesh.body.body.applyImpulse(contactPoint.scale(OIMO.INV_SCALE), force.scale(OIMO.INV_SCALE*0.01));
                    return;
                }
            }
        };

        OimoJSPlugin.prototype.createLink = function (mesh1, mesh2, pivot1, pivot2, options) {
            var body1 = null,
                body2 = null;
            for (var index = 0; index < this._registeredMeshes.length; index++) {
                var registeredMesh = this._registeredMeshes[index];
                if (registeredMesh.mesh === mesh1) {
                    body1 = registeredMesh.body.body;
                } else if (registeredMesh.mesh === mesh2) {
                    body2 = registeredMesh.body.body;
                }
            }
            if (!body1 || !body2) {
                return false;
            }
            if (!options) {
                options = {};
            }

            new OIMO.Link({
                type:options.type,
                body1:body1,
                body2:body2,
                min:options.min,
                max:options.max,
                axe1:options.axe1,
                axe2:options.axe2,
                pos1:[pivot1.x, pivot1.y, pivot1.z],
                collision:options.collision,
                spring:options.spring,
                world:this.world});

            return true;

        };

        OimoJSPlugin.prototype.dispose = function () {
            this.world.clear();
            while (this._registeredMeshes.length) {
                this.unregisterMesh(this._registeredMeshes[0].mesh);
            }
        };

        OimoJSPlugin.prototype.isSupported = function () {
            return OIMO.REVISION !== undefined;
        };

        OimoJSPlugin.prototype.runOneStep = function(time) {
            this.world.step();

            // Update the position of all registered meshes
            var i = this._registeredMeshes.length;
            var m;
            while (i--) {

                var body = this._registeredMeshes[i].body.body;
                var mesh = this._registeredMeshes[i].mesh;
                if(!body.sleeping){

                    if (body.shapes.next) {
                        mesh.position.x = body.shapes.next.position.x * OIMO.WORLD_SCALE;
                        mesh.position.y = body.shapes.next.position.y * OIMO.WORLD_SCALE;
                        mesh.position.z = body.shapes.next.position.z * OIMO.WORLD_SCALE;
                        var mtx = BABYLON.Matrix.FromArray(body.getMatrix());

                        if (!mesh.rotationQuaternion) {
                            mesh.rotationQuaternion = new BABYLON.Quaternion(0, 0, 0, 1);
                        }
                        mesh.rotationQuaternion.setFromRotationMatrix(mtx);

                    } else {
                        m = body.getMatrix();
                        var mtx = BABYLON.Matrix.FromArray(m);
                        mesh.position.x = mtx.m[12];
                        mesh.position.y = mtx.m[13];
                        mesh.position.z = mtx.m[14];

                        if (!mesh.rotationQuaternion) {
                            mesh.rotationQuaternion = new BABYLON.Quaternion(0, 0, 0, 1);
                        }
                        mesh.rotationQuaternion.setFromRotationMatrix(mtx);
                    }
                }
            }
        };
        return OimoJSPlugin;
    })();
    BABYLON.OimoJSPlugin = OimoJSPlugin;
})(BABYLON || (BABYLON = {}));