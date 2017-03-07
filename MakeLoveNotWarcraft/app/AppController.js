function generateUuid() {
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });

    return uuid;
}

angular.module('makelove').controller('_AppController', function ($scope, $timeout, _PlayerFactory) {
    var model = {};
    $scope.model = model;

    model.nuts = [];
    model.players = [];
    model.controllers = [];

    model.showKissMenu = false;
    model.showStart = true;
    model.credit = 0;
    model.babyCounter = 0;

    initValues();

    $scope.start = function () {
        model.showStart = false;
        $timeout(function () {
            drawCanvas();
        });
    }

    $scope.buyCar = function () {
        if (model.credit >= 20) {
            model.credit -= 20;
            model.players[0].img = 'squirrel_car';
            model.players[0].dim = { width: 266, height: 161 };
            model.players[0].pos.x = 0;
            model.players[0].pos.y = 20;
            _PlayerFactory.stepSize = 2;
            drawCanvas();
        }
        else {
            alert('Nicht genug Nüsse gesammelt! Ein Auto kostet 20.');
        }
    }

    function babyCost() {
        model.credit -= 1;
        $timeout(babyCost, 1200);
    }

    $scope.kissForNuts = function () {
        model.babyCounter++;
        if (model.players[0].img !== 'squirrel_car_kids') {
            model.credit += 5;
        }
        
        model.showKissMenu = false;
        model.players[1].img = "chipmunk_love";

        if (model.babyCounter >= 3 && model.players[0].img === 'squirrel_car') {
            alert('oha das streifenhörnchen wurde zuoft geküsst! Ab jetzt muss das Eichhörnchen die Babies mit nehmen.');
            model.players[0].img = 'squirrel_car_kids';

            $timeout(babyCost, 1200);
        }
        drawCanvas();

        $timeout(function () { model.players[1].img = "chipmunk"; drawCanvas(); }, 1200);
    }
    function drawCanvas() {
        var c = document.getElementById("playground");
        var ctx = c.getContext("2d");
        ctx.canvas.width = $(c).width();
        ctx.canvas.height = $(c).height();

        var objects = model.players.concat(model.nuts);
        objects.forEach(function (obj) {
            var i = document.getElementById(obj.img);
            ctx.drawImage(i, obj.pos.x, obj.pos.y, obj.dim.width, obj.dim.height);
        })
    }

    function propagateMove() {
        collisions = checkForCollision();
        var allowed = true;
        model.showKissMenu = false;
        if (collisions.length > 0) {
            collisions.forEach(function (col) {
                //ran into chipmunk not allowed!
                if (col[0] === 'chipmunk' || col[1] === 'chipmunk') {
                    allowed = false;
                    model.showKissMenu = true;
                    return;
                }
                //count Nut
                var nutId = col[0] === 'squirrel' ? col[1] : col[0];
                var index = -1;
                model.nuts.forEach(function (nut, i) { if (nut.id === nutId) { index = i; } });
                if (index !== -1) {
                    model.nuts.splice(index, 1);
                    model.credit++;
                    model.nuts.push(createNut());
                }
            })
        }

        drawCanvas();
        return allowed;
    }

    function initValues() {
        model.players.push({
            id: 'squirrel',
            img: 'squirrel',
            pos: { x: 0, y: 20 },
            dim: { width: 163, height: 200 }
        });
        model.players.push({
            id: 'chipmunk',
            img: 'chipmunk',
            pos: { x: 400, y: 20 },
            dim: { width: 200, height: 140 }
        });
        model.controllers.push(_PlayerFactory.create(model.players[0].pos, propagateMove, 'arrows'));
        // model.controllers.push(_PlayerFactory.create(model.players[1].pos, propagateMove, 'wasd'));

        model.nuts.push(createNut());
        model.nuts.push(createNut());
        model.nuts.push(createNut());
    }

    function checkForCollision(newly) {
        var objects = model.players.concat(model.nuts);
        if (newly) {
            objects = objects.concat(newly);
        }

        var collisions = [];
        objects.forEach(function (obj1) {
            objects.forEach(function (obj2) {
                if (obj1.id !== obj2.id) {
                    if (intersect(obj1, obj2)) {
                        if (collisionExist(collisions, obj1.id, obj2.id) === false) {
                            collisions.push([obj1.id, obj2.id]);
                        }
                    }
                }
            })
        })
        return collisions;
    }

    function collisionExist(collisions, id1, id2) {
        var found = false;
        collisions.forEach(function (col) {
            if ((col[0] === id1 && col[1] === id2) || (col[0] === id2 && col[1] === id1)) {
                found = true;
            }
        });
        return found;
    }

    function intersect(obj1, obj2) {
        return !(obj2.pos.x > obj1.pos.x + obj1.dim.width ||
           obj2.pos.x + obj2.dim.width < obj1.pos.x ||
           obj2.pos.y > obj1.pos.y + obj1.dim.height ||
           obj2.pos.y + obj2.dim.height < obj1.pos.y);
    }
    function createNut() {
        var collisionfound = true;

        while (collisionfound) {
            var posX = Math.floor((Math.random() * $('#playground').width()) + 1);
            var posY = Math.floor((Math.random() * $('#playground').height()) + 1);

            //correct position to stay in boundaries if necessary
            if (posY + 74 > $('#playground').height()) {
                posY -= (posY + 74) - $('#playground').height();
            }
            if (posX + 65 > $('#playground').width()) {
                posX -= (posX + 65) - $('#playground').width();
            }

            var newNut = {
                id: generateUuid(),
                img: 'nut',
                dim: { width: 65, height: 74 },
                pos: { x: posX, y: posY }
            }

            if (checkForCollision(newNut).length === 0) {
                return newNut;
            }
        }
    }
});