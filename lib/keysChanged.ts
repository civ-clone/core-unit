// What a registry that files a unit by its tile, home city or owner needs to hear: that one of those has changed, so it
//  can re-file the unit. `Unit`'s setters say so; a registry asks to be told while the unit is registered with it
//  (civ-clone/web-renderer#308).
//
// Held weakly both ways. By unit, so a unit nothing else refers to takes its watchers with it; and each watcher by a
//  weak reference, so a registry that is dropped without unregistering its units isn't kept alive by them.

export interface KeyWatcher<T> {
  keysChanged(entity: T): void;
}

interface Ref<T> {
  deref(): T | undefined;
}

// Reached through `globalThis` rather than by name, so this compiles against an ES2019/ES2020 `lib` (as the renderer's
//  does); every current browser and Node has it. Without it, a watcher is held strongly, as a registry holds its units.
const WeakRefImplementation:
    | (new <T extends object>(target: T) => Ref<T>)
    | undefined = (globalThis as any).WeakRef,
  ref = <T extends object>(target: T): Ref<T> =>
    WeakRefImplementation
      ? new WeakRefImplementation(target)
      : { deref: (): T => target };

const watchers: WeakMap<object, Set<Ref<KeyWatcher<any>>>> = new WeakMap();

export const watchKeys = <T extends object>(
  entity: T,
  watcher: KeyWatcher<T>
): void => {
  const entityWatchers = watchers.get(entity);

  if (!entityWatchers) {
    watchers.set(entity, new Set([ref(watcher)]));

    return;
  }

  for (const watcherRef of entityWatchers) {
    if (watcherRef.deref() === watcher) {
      return;
    }
  }

  entityWatchers.add(ref(watcher));
};

export const unwatchKeys = <T extends object>(
  entity: T,
  watcher: KeyWatcher<T>
): void => {
  const entityWatchers = watchers.get(entity);

  if (!entityWatchers) {
    return;
  }

  for (const watcherRef of entityWatchers) {
    const current = watcherRef.deref();

    // A collected watcher's reference goes too.
    if (current === watcher || current === undefined) {
      entityWatchers.delete(watcherRef);
    }
  }

  if (entityWatchers.size === 0) {
    watchers.delete(entity);
  }
};

export const keysChanged = <T extends object>(entity: T): void => {
  const entityWatchers = watchers.get(entity);

  if (!entityWatchers) {
    return;
  }

  for (const watcherRef of entityWatchers) {
    const watcher = watcherRef.deref();

    if (watcher === undefined) {
      entityWatchers.delete(watcherRef);

      continue;
    }

    watcher.keysChanged(entity);
  }
};

export default keysChanged;
