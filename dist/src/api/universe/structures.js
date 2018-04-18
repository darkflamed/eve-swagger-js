"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Create a new {@link Structures} instance that uses the given `agent` to
 * make its HTTP requests to the ESI interface.
 *
 * @param agent The agent making actual requests
 * @returns A Moons API instance
 */
function makeStructures(agent) {
    return function (id) {
        return new StructureImpl(agent, id);
    };
}
exports.makeStructures = makeStructures;
class StructureImpl {
    constructor(agent, id_) {
        this.agent = agent;
        this.id_ = id_;
    }
    details() {
        return this.agent.request('get_universe_structures_structure_id', { path: { structure_id: this.id_ } });
    }
    id() {
        return Promise.resolve(this.id_);
    }
}
//# sourceMappingURL=structures.js.map