"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const r = require("../../internal/resource-api");
/**
 * An api adapter for accessing various details of a single corporation
 * starbase, specified by a provided id when the api is instantiated.
 */
class Starbase extends r.impl.SimpleResource {
    constructor(agent, id, systemID) {
        super(id);
        this.agent = agent;
        this.systemID = systemID;
    }
    /**
     * @returns The details of the specific starbase
     */
    details() {
        if (this.systemID !== undefined) {
            return getDetails(this.agent, this.id_, this.systemID);
        }
        else {
            // Must depend on summaries to get the system id as well
            return this.summaries()
                .then(summary => getDetails(this.agent, this.id_, summary.system_id));
        }
    }
    /**
     * @esi_route ~get_corporations_corporation_id_starbases
     *
     * @returns Summary and status of the specific starbase
     */
    summaries() {
        if (this.starbases_ === undefined) {
            this.starbases_ = getSummaries(this.agent);
        }
        return r.impl.filterIterated(this.starbases_(), this.id_, e => e.starbase_id);
    }
}
exports.Starbase = Starbase;
/**
 * An api adapter for accessing various details of multiple starbase ids,
 * specified by a provided an array or set of ids when the api is instantiated.
 */
class MappedStarbases extends r.impl.SimpleMappedResource {
    constructor(agent, ids) {
        super(ids);
        this.agent = agent;
    }
    /**
     * @returns Details of the starbases mapped by their id
     */
    details() {
        // First grab summaries and then load details
        return this.summaries().then(summaries => {
            let details = [];
            let ids = [];
            for (let s of summaries.values()) {
                ids.push(s.starbase_id);
                details.push(getDetails(this.agent, s.starbase_id, s.system_id));
            }
            return Promise.all(details).then(result => {
                let map = new Map();
                for (let i = 0; i < ids.length; i++) {
                    map.set(ids[i], result[i]);
                }
                return map;
            });
        });
    }
    /**
     * @esi_route ~get_corporations_corporation_id_starbases
     *
     * @returns Summary and status information for the set of starbases, mapped
     *     by their id
     */
    summaries() {
        if (this.starbases_ === undefined) {
            this.starbases_ = getSummaries(this.agent);
        }
        return this.arrayIDs()
            .then(ids => r.impl.filterIteratedToMap(this.starbases_(), ids, e => e.starbase_id));
    }
}
exports.MappedStarbases = MappedStarbases;
/**
 * An api adapter for accessing various details about every starbase of the
 * corporation.
 */
class IteratedStarbases extends r.impl.SimpleIteratedResource {
    constructor(agent) {
        super(getSummaries(agent), e => e.starbase_id);
        this.agent = agent;
    }
    /**
     * @returns Details for all of the corporation's starbases
     */
    async *details() {
        // Iterate over the paginated resource directly since it provides the
        // mandatory system id as well
        for await (let [id, base] of this.getPaginatedResource()) {
            yield getDetails(this.agent, id, base.system_id)
                .then(details => [
                id, details
            ]);
        }
    }
    /**
     * @esi_route get_corporations_corporation_id_starbases
     *
     * @returns Summary and state information for the corporation's starbases
     */
    summaries() {
        return this.getPaginatedResource();
    }
}
exports.IteratedStarbases = IteratedStarbases;
/**
 * Create a new Starbases instance that uses the given `agent` to make its HTTP
 * requests to the ESI interface. The id of the `agent` refers to the
 * corporation id. The token of the `agent` must refer to a character that has
 * authorized the expected scopes and has the appropriate in-game roles for the
 * corporation.
 *
 * @param agent The agent making actual requests
 * @returns A Starbases instance
 */
function makeStarbases(agent) {
    return function (ids, systemID) {
        if (ids === undefined) {
            // No ID so return an iterated variant
            return new IteratedStarbases(agent);
        }
        else if (typeof ids === 'number') {
            // Single variant, with optional system ID
            return new Starbase(agent, ids, systemID);
        }
        else {
            // Multiple ids, so return a mapped variant
            return new MappedStarbases(agent, ids);
        }
    };
}
exports.makeStarbases = makeStarbases;
function getSummaries(agent) {
    return r.impl.makePageBasedStreamer(page => getSummaryPage(agent, page), 1000);
}
async function getSummaryPage(agent, page) {
    let corpID;
    if (typeof agent.id === 'number') {
        corpID = agent.id;
    }
    else {
        corpID = await agent.id();
    }
    return agent.agent.request('get_corporations_corporation_id_starbases', { path: { corporation_id: corpID }, query: { page: page } }, agent.ssoToken).then(result => ({ result, maxPages: undefined }));
}
async function getDetails(agent, id, systemID) {
    let corpID;
    if (typeof agent.id === 'number') {
        corpID = agent.id;
    }
    else {
        corpID = await agent.id();
    }
    // NOTE: The swagger spec includes the page query parameter and has some
    // language talking about a list of POSes. However, the actual return type is
    // not an array so I think it's an error in the specification. Since page is
    // optional, we ignore it and don't expose it in the API.
    return agent.agent.request('get_corporations_corporation_id_starbases_starbase_id', {
        path: { corporation_id: corpID, starbase_id: id },
        query: { system_id: systemID }
    }, agent.ssoToken);
}
//# sourceMappingURL=starbases.js.map