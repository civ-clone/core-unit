# core-unit

Contains the core models relating to `Unit`s.

The primary model, `Unit`, stores related state objects (`Player`, `City`, `Tile`, `Yield`s, `Action`s) and 
convenience methods for accessing and modifying these.

A key component of a `Unit` is its ability to perform `Action`s. This package includes a `DelayedAction` class which can
easily wrap any `Action`s that take time to be carried out (`BuildIrrigation`, `Fortify`, etc.).

There's also a `UnitRegistry` which can be used to retrieve `Unit`s by `City`, `Player` or `Tile`.

Various base `Yield`s are included to represent the values of the `Unit`.

## Unit traits

A `UnitTrait` is something a unit *type* can do or is, other than its domain: ignoring zones of control, founding
cities, carrying aircraft. The trait classes themselves live in their own `base-unit-trait-*` packages. A game declares
which of its unit classes have which traits with `UnitTraits` rules, so the same class can differ between games and a
`RuleSet` can switch a single trait:

```ts
ruleRegistry.register(
  ...unitTraits('civ1-unit:unit/trait', Diplomat, IgnoresZoneOfControl, NonCombatant),
  ...unitTraits('civ1-unit:unit/trait', Carrier, new Carries(Air))
);
```

Rules then ask `unit.hasTrait(NonCombatant)` (from the unit's own `RuleRegistry`), or, for a class such as a build
item, `hasTrait(Diplomat, NonCombatant, ruleRegistry)`. `traitsOf` returns the traits themselves, with their parameters,
`traitCriterion(Trait)` is a ready-made `Criterion`, and `unitAction` accepts trait classes alongside unit classes. The
answers are kept per class and registry until a `UnitTraits` rule is registered, removed or switched.

So a trait declaration must depend on the class alone: never on game state, which it isn't asked about again, and never
on traits (a declaration that asks about the class being resolved throws `UnitTraitCycleError`). Don't subclass
`UnitTraits`: registering a subclass's rule doesn't clear the registry's cache for `UnitTraits`. `traitsOf` lists every
declaration, so a trait declared on both a parent and a leaf class appears twice for the leaf.

`npm run bench` logs what a lookup costs against `instanceof`.

Traits belong to the class, so they are never saved and never sent to a client. A unit's own state (veteran, fortified)
stays a `UnitImprovement`.

When this package is included in your build of `civ-clone`, it will automatically provide the `AdditionalData` key
`units` for `City`, `Player` and `Tile`objects as a convenience method.

Includes the following `Rule`s:

- `Action` for controlling which `Action`s are available to the `Unit`.
- `Activate` triggers actions when a `Unit` is `Unit.activate`d.
- `Busy` for tracking if `DelayedAction`s are complete.
- `CannotSupportUnit` triggered when a `City` cannot support a `Unit` for whatever reason.
- `CombatResolver` fights a battle (see "Combat" below).
- `Created` when `Unit`s are created.
- `Damaged` when a `Unit` survives a battle with damage.
- `Defeated`    "        "   defeated (and destroyed).
- `DefenderRank` scores the units on an attacked square to choose its defender.
- `Destroyed`   "        "   destroyed.
- `Moved`       "        "   moved.
- `MovementCost` which controls the cost of moving the `Unit`.
- `UnitTraits` declares which `UnitTrait`s a unit class has (see above).
- `ValidateMove` to confirm if the `Action` was successful or not.
- `Visibility` for applying the results of the `Unit`s `Visibility` `Yield` to the `PlayerWorld`.
- `WorkRate` for how fast a `Unit` gets through a `DelayedAction` (2 halves the turns, rounded up).
- `Yield` controls the various `Yield`s applicable for the `Unit` (`Attack`, `Defence`, `Firepower`, `HitPoints`,
  `Movement`, `Visibility`).
## Combat

None of these rules has to be registered: a game that registers none fights as before, with a single roll and
units that are either whole or destroyed.

- `HitPoints` and `Firepower` are `Yield`s like `Attack`. `unit.hitPoints()` is `[remaining, maximum]`, and
  `unit.damage()`/`unit.setDamage(n)` hold what the unit has taken (`setDamage` refuses a non-finite `n` with a
  `RangeError`). A unit only has a `_damage` property while it is
  damaged, so it isn't saved for an undamaged unit. It isn't one of the unit's keys either: send it to a client through
  `AdditionalData` if it should see it.
- `CombatResolver` (`[attacker, defender, attack, defence, power, randomNumberGenerator]` → `CombatResult`) decides a
  battle in place of the single roll. The attack applies the winner's damage, processes `Defeated` for the loser and
  `Damaged` for a winner that took damage.
- `DefenderRank` (`[attacker, candidate, attack, defence]` → a score) chooses the defender in place of the highest
  defence.
- `WorkRate` (`[unit]` → a rate) shortens a `DelayedAction` to `ceil(turns / rate)` turns.

Each of the three uses the first answer that isn't `undefined`. A rule declines through its `Criterion`, not by
returning `undefined`: every rule whose criteria match still runs, so only one should match (a second resolver would
fight the battle again). A resolver must name the attacker and defender as winner and loser and leave the winner alive
(damage below its `HitPoints`); `Attack` throws otherwise.
