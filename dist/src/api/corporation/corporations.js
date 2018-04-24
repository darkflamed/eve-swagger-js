"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const names_1 = require("../../internal/names");
const r = require("../../internal/resource-api");
/**
 * An api adapter for accessing various details of a single corporation,
 * specified by a provided id when the api is instantiated.
 */
class Corporation {
    constructor(agent, id) {
        this.agent = agent;
        this.id = id;
    }
    /**
     * @returns The public info of the corporation
     */
    async details() {
        return getDetails(this.agent, await this.ids());
    }
    /**
     * @returns The alliance history of the corporation
     */
    async history() {
        return getHistory(this.agent, await this.ids());
    }
    /**
     * @returns URL lookup information for the corporation icon images
     */
    async icons() {
        return getIcons(this.agent, await this.ids());
    }
    /**
     * @returns Loyalty offers available for the NPC corporation
     */
    async loyaltyOffers() {
        return getLoyaltyOffers(this.agent, await this.ids());
    }
    /**
     * @esi_route ~get_corporations_corporation_id
     *
     * @returns The name of the corporation
     */
    names() {
        return this.details().then(result => result.corporation_name);
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
exports.Corporation = Corporation;
/**
 * An api adapter for accessing various details of multiple corporations,
 * specified by a provided an array, set of ids, search query, or NPC
 * corporations when the api is instantiated.
 */
class MappedCorporations extends r.impl.SimpleMappedResource {
    constructor(agent, ids) {
        super(ids);
        this.agent = agent;
    }
    /**
     * @returns The public details of the corporations, mapped by their id
     */
    details() {
        return this.getResource(id => getDetails(this.agent, id));
    }
    /**
     * @returns The alliance history of the corporations, mapped by their id
     */
    history() {
        return this.getResource(id => getHistory(this.agent, id));
    }
    /**
     * @returns The icons of the corporations, mapped by their id
     */
    icons() {
        return this.getResource(id => getIcons(this.agent, id));
    }
    /**
     * @returns The loyalty offers for the corporations, mapped by their id
     */
    loyaltyOffers() {
        return this.getResource(id => getLoyaltyOffers(this.agent, id));
    }
    /**
     * @esi_route post_universe_names [corporation]
     * @esi_route get_corporations_names
     *
     * @returns Map from corporation id to their name
     */
    names() {
        return this.arrayIDs().then(ids => {
            if (ids.length > 100) {
                return names_1.getNames(this.agent, "corporation" /* CORPORATION */, ids);
            }
            else {
                return this.agent.request('get_corporations_names', { query: { 'corporation_ids': ids } })
                    .then(results => {
                    let map = new Map();
                    for (let r of results) {
                        map.set(r.corporation_id, r.corporation_name);
                    }
                    return map;
                });
            }
        });
    }
}
exports.MappedCorporations = MappedCorporations;
function getDetails(agent, id) {
    return agent.request('get_corporations_corporation_id', { path: { corporation_id: id } });
}
function getHistory(agent, id) {
    return agent.request('get_corporations_corporation_id_alliancehistory', { path: { corporation_id: id } });
}
function getIcons(agent, id) {
    return agent.request('get_corporations_corporation_id_icons', { path: { corporation_id: id } });
}
function getLoyaltyOffers(agent, id) {
    return agent.request('get_loyalty_stores_corporation_id_offers', { path: { corporation_id: id } });
}
//# sourceMappingURL=corporations.js.map