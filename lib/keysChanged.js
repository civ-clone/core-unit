"use strict";
// What a registry that files a unit by its tile, home city or owner needs to hear: that one of those has changed, so it
//  can re-file the unit. `Unit`'s setters say so; a registry asks to be told while the unit is registered with it.
//  Held weakly by unit, so a unit nothing else refers to takes its watchers with it (civ-clone/web-renderer#308).
Object.defineProperty(exports, "__esModule", { value: true });
exports.keysChanged = exports.unwatchKeys = exports.watchKeys = void 0;
const watchers = new WeakMap();
const watchKeys = (entity, watcher) => {
    const entityWatchers = watchers.get(entity);
    if (entityWatchers) {
        entityWatchers.add(watcher);
        return;
    }
    watchers.set(entity, new Set([watcher]));
};
exports.watchKeys = watchKeys;
const unwatchKeys = (entity, watcher) => {
    const entityWatchers = watchers.get(entity);
    if (!entityWatchers) {
        return;
    }
    entityWatchers.delete(watcher);
    if (entityWatchers.size === 0) {
        watchers.delete(entity);
    }
};
exports.unwatchKeys = unwatchKeys;
const keysChanged = (entity) => {
    var _a;
    return (_a = watchers
        .get(entity)) === null || _a === void 0 ? void 0 : _a.forEach((watcher) => watcher.keysChanged(entity));
};
exports.keysChanged = keysChanged;
exports.default = exports.keysChanged;
//# sourceMappingURL=keysChanged.js.map