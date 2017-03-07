
angular.module('makelove').factory('_PlayerFactory', function ($rootScope, $timeout) {
    var factory = this;
    this.stepSize = 1;
    this.create = function (posObject, propagateMove, keys) {
        return new PlayerController(posObject, propagateMove, keys);
    }

    function PlayerController(posObject, propagateMove, keys) {
        var self = this;
        this.pos = posObject;
        this.keys = keys === 'wasd ' ? { up: 87, down: 83, left: 65, right: 68 } : { up: 38, down: 40, left: 37, right: 39 }; //arrows
        this.stepcounters = {};

        $timeout(loop);

        function loop() {
            var oldPosX = self.pos.x;
            var oldPosY = self.pos.y;

            var moved = false;
            if (self.stepcounters[self.keys.up]) {
                self.pos.y -= factory.stepSize; moved = true;
            }
            if (self.stepcounters[self.keys.down]) {
                self.pos.y += factory.stepSize; moved = true;
            }
            if (self.stepcounters[self.keys.left]) {
                self.pos.x -= factory.stepSize; moved = true;
            }
            if (self.stepcounters[self.keys.right]) {
                self.pos.x += factory.stepSize; moved = true;
            }


            if (moved) {
                if (!propagateMove()) {
                    //reset if move is not allowed
                    self.pos.x = oldPosX;
                    self.pos.y = oldPosY;
                    self.stepcounters = {};
                }
            }
            $timeout(loop);
        }

        $("body").keydown( function (event) {
            evt = event || window.event;
            self.stepcounters[evt.keyCode] = true;
        });
        $("body").on("keyup", function (event) {
            evt = event || window.event;
            self.stepcounters[evt.keyCode] = false;
        });
    }

    return this
})
