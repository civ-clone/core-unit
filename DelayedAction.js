"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DelayedAction = void 0;
const Action_1 = require("./Action");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const Turn_1 = require("@civ-clone/core-turn-based-game/Turn");
const Busy_1 = require("./Rules/Busy");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Moved_1 = require("./Rules/Moved");
class DelayedAction extends Action_1.Action {
    constructor(from, to, unit, ruleRegistry = RuleRegistry_1.instance, turn = Turn_1.instance) {
        super(from, to, unit, ruleRegistry);
        this._turn = turn;
    }
    perform(turns, action = () => { }, BusyRule = Busy_1.default) {
        const endTurn = this._turn.value() + turns;
        this.unit().setActive(false);
        this.unit().moves().set(0);
        this.unit().setBusy(new BusyRule(new Criterion_1.default(() => this._turn.value() === endTurn), new Effect_1.default((...args) => {
            const unit = this.unit();
            unit.setActive();
            unit.setBusy();
            action(...args);
            this.ruleRegistry().process(Moved_1.default, this.unit(), this);
        })));
    }
}
exports.DelayedAction = DelayedAction;
exports.default = DelayedAction;
//# sourceMappingURL=DelayedAction.js.map