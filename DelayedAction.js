"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DelayedAction = void 0;
const Turn_1 = require("@civ-clone/core-turn-based-game/Turn");
const Action_1 = require("./Action");
const Busy_1 = require("./Rules/Busy");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
class DelayedAction extends Action_1.default {
    perform(turns, action = () => { }, turn = Turn_1.instance) {
        const endTurn = turn.value() + turns;
        this.unit().setActive(false);
        this.unit().moves().set(0);
        this.unit().setBusy(new Busy_1.default(new Criterion_1.default(() => turn.value() === endTurn), new Effect_1.default((...args) => {
            const unit = this.unit();
            action(...args);
            unit.setActive();
            unit.setBusy();
            unit.moves().set(this.unit().movement());
        })));
    }
}
exports.DelayedAction = DelayedAction;
exports.default = DelayedAction;
//# sourceMappingURL=DelayedAction.js.map