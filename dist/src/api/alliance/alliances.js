"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const names_1 = require("../../internal/names");
const r = require("../../internal/resource-api");
/**
 * An api adapter for accessing various details of a single alliance, specified
 * by a provided id when the api is instantiated.
 */
class Alliance {
    constructor(agent, id) {
        this.agent = agent;
        this.id = id;
    }
    /**
     * @returns The public info of the alliance
     */
    async details() {
        return getDetails(this.agent, await this.ids());
    }
    /**
     * @returns The ids of the corporation members of the alliance
     */
    async corporations() {
        return getCorporations(this.agent, await this.ids());
    }
    /**
     * @returns URL lookup information for the alliance icon images
     */
    async icons() {
        return getIcons(this.agent, await this.ids());
    }
    /**
     * @esi_route ~get_alliances_alliance_id
     *
     * @returns The name of the alliance
     */
    names() {
        return this.details().then(info => info.alliance_name);
    }
    ids() {
        if (typeof this.id === 'number') {
            return Promise.resolve(this.id);
        }
        else {
            return this.id();
        }
    }
}
exports.Alliance = Alliance;
/**
 * An api adapter for accessing various details of multiple alliance, specified
 * by a provided an array, set of ids, or search query when the api is
 * instantiated.
 */
class MappedAlliances extends r.impl.SimpleMappedResource {
    constructor(agent, ids) {
        super(ids);
        this.agent = agent;
    }
    /**
     * @returns Map from alliance id to their details
     */
    details() {
        return this.getResource(id => getDetails(this.agent, id));
    }
    /**
     * @returns Map from alliance id to their corporation members
     */
    corporations() {
        return this.getResource(id => getCorporations(this.agent, id));
    }
    /**
     * @returns Map from alliance id to their icon information
     */
    icons() {
        return this.getResource(id => getIcons(this.agent, id));
    }
    /**
     * @esi_route post_universe_names [alliance]
     * @esi_route get_alliances_names
     *
     * @returns Map from alliance id to their name
     */
    names() {
        return this.arrayIDs().then(ids => {
            if (ids.length > 100) {
                return names_1.getNames(this.agent, "alliance" /* ALLIANCE */, ids);
            }
            else {
                return this.agent.request('get_alliances_names', { query: { 'alliance_ids': ids } })
                    .then(result => {
                    let map = new Map();
                    for (let r of result) {
                        map.set(r.alliance_id, r.alliance_name);
                    }
                    return map;
                });
            }
        });
    }
}
exports.MappedAlliances = MappedAlliances;
/**
 * An api adapter for accessing various details about every alliance in the
 * game. Even though a route exists to get all alliance ids at once, due to
 * their quantity, the API provides asynchronous iterators for the rest of their
 * details.
 */
class IteratedAlliances extends r.impl.SimpleIteratedResource {
    constructor(agent) {
        super(r.impl.makeArrayStreamer(() => this.agent.request('get_alliances', undefined)), id => id);
        this.agent = agent;
    }
    /**
     * @returns Iterator for details of every alliance
     */
    details() {
        return this.getResource(id => getDetails(this.agent, id));
    }
    /**
     * @returns Iterator for the member corporations of every alliance
     */
    corporations() {
        return this.getResource(id => getCorporations(this.agent, id));
    }
    /**
     * @returns Iterator for the icon information of every alliance
     */
    icons() {
        return this.getResource(id => getIcons(this.agent, id));
    }
    /**
     * @esi_route post_universe_names [alliance]
     *
     * @returns Iterator for the names of every alliance
     */
    names() {
        return names_1.getIteratedNames(this.agent, "alliance" /* ALLIANCE */, this.ids());
    }
}
exports.IteratedAlliances = IteratedAlliances;
function getDetails(agent, id) {
    return agent.request('get_alliances_alliance_id', { path: { 'alliance_id': id } });
}
function getCorporations(agent, id) {
    return agent.request('get_alliances_alliance_id_corporations', { path: { 'alliance_id': id } });
}
function getIcons(agent, id) {
    return agent.request('get_alliances_alliance_id_icons', { path: { 'alliance_id': id } });
}
//# sourceMappingURL=alliances.js.map