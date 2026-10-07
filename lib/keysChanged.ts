// What a registry that files a unit by its tile, home city or owner needs to hear: that one of those has changed, so it
//  can re-file the unit. `Unit`'s setters say so; a registry asks to be told while the unit is registered with it.
//  Held weakly by unit, so a unit nothing else refers to takes its watchers with it (civ-clone/web-renderer#308).

export interface KeyWatcher<T> {
  keysChanged(entity: T): void;
}

const watchers: WeakMap<object, Set<KeyWatcher<any>>> = new WeakMap();

export const watchKeys = <T extends object>(
  entity: T,
  watcher: KeyWatcher<T>
): void => {
  const entityWatchers = watchers.get(entity);

  if (entityWatchers) {
    entityWatchers.add(watcher);

    return;
  }

  watchers.set(entity, new Set([watcher]));
};

export const unwatchKeys = <T extends object>(
  entity: T,
  watcher: KeyWatcher<T>
): void => {
  const entityWatchers = watchers.get(entity);

  if (!entityWatchers) {
    return;
  }

  entityWatchers.delete(watcher);

  if (entityWatchers.size === 0) {
    watchers.delete(entity);
  }
};

export const keysChanged = <T extends object>(entity: T): void =>
  watchers
    .get(entity)
    ?.forEach((watcher: KeyWatcher<T>): void => watcher.keysChanged(entity));

export default keysChanged;
