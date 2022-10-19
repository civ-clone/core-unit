# core-unit

Contains the core models relating to `Unit`s.

The primary model, `Unit`, stores related state objects (`Player`, `City`, `Tile`, `Yield`s, `Action`s) and 
convenience methods for accessing and modifying these.

A key component of a `Unit` is its ability to perform `Action`s. This package includes a `DelayedAction` class which can
easily wrap any `Action`s that take time to be carried out (`BuildIrrigation`, `Fortify`, etc.).

There's also a `UnitRegistry` which can be used to retrieve `Unit`s by `City`, `Player` or `Tile`.

Various base `Yield`s are included to represent the values of the `Unit`.

When this package is included in your build of `civ-clone`, it will automatically provide the `AdditionalData` key
`units` for `City`, `Player` and `Tile`objects as a convenience method.

Includes the following `Rule`s:

- `Action` for controlling which `Action`s are available to the `Unit`.
- `Activate` triggers actions when a `Unit` is `Unit.activate`d.
- `Busy` for tracking if `DelayedAction`s are complete.
- `CannotSupportUnit` triggered when a `City` cannot support a `Unit` for whatever reason.
- `Created` when `Unit`s are created.
- `Defeated`    "        "   defeated.
- `Destroyed`   "        "   destroyed.
- `Moved`       "        "   moved.
- `MovementCost` which controls the cost of moving the `Unit`.
- `ValidateMove` to confirm if the `Action` was successful or not.
- `Visibility` for applying the results of the `Unit`s `Visibility` `Yield` to the `PlayerWorld`.
- `Yield` controls the various `Yield`s applicable for the `Unit` (`Attack`, `Defence`, `Movement`, `Visibility`).