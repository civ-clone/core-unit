import {
  Turn,
  instance as turnInstance,
} from '@civ-clone/core-turn-based-game/Turn';
import Action from './Action';
import Busy from './Rules/Busy';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Unit from './Unit';

export class DelayedAction extends Action {
  perform(
    turns: number,
    action: (...args: any[]) => void = () => {},
    turn: Turn = turnInstance
  ): void {
    const endTurn: number = turn.value() + turns;

    this.unit().setActive(false);

    this.unit().moves().set(0);

    this.unit().setBusy(
      new Busy(
        new Criterion((): boolean => turn.value() === endTurn),
        new Effect((...args: any[]): void => {
          const unit: Unit = this.unit();

          action(...args);

          unit.setActive();
          unit.setBusy();
          unit.moves().set(this.unit().movement());
        })
      )
    );
  }
}

export default DelayedAction;
