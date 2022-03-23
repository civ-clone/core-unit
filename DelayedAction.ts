import { Action, IAction } from './Action';
import { Moved, IMovedRegistry } from './Rules/Moved';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  Turn,
  instance as turnInstance,
} from '@civ-clone/core-turn-based-game/Turn';
import Busy from './Rules/Busy';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Tile from '@civ-clone/core-world/Tile';
import Unit from './Unit';

export interface IDelayedAction extends IAction {
  perform(turns: number, action: (...args: any[]) => void): void;
}

export class DelayedAction extends Action implements IDelayedAction {
  #turn: Turn;

  constructor(
    from: Tile,
    to: Tile,
    unit: Unit,
    ruleRegistry: RuleRegistry = ruleRegistryInstance,
    turn: Turn = turnInstance
  ) {
    super(from, to, unit, ruleRegistry);

    this.#turn = turn;
  }

  perform(
    turns: number,
    action: (...args: any[]) => void = () => {},
    BusyRule: typeof Busy = Busy
  ): void {
    const endTurn: number = this.#turn.value() + turns;

    this.unit().setActive(false);
    this.unit().moves().set(0);

    this.unit().setBusy(
      new BusyRule(
        new Criterion((): boolean => this.#turn.value() === endTurn),
        new Effect((...args: any[]): void => {
          const unit: Unit = this.unit();

          unit.setActive();
          unit.setBusy();

          action(...args);

          (this.ruleRegistry() as IMovedRegistry).process(
            Moved,
            this.unit(),
            this
          );
        })
      )
    );
  }
}

export default DelayedAction;
