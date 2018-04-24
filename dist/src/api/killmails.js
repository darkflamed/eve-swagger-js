"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const r = require("../internal/resource-api");
/**
 * An api adapter for accessing various details of a single killmail, specified
 * by a provided id and hash when the api is instantiated.
 */
class Killmail extends r.impl.SimpleResource {
    constructor(agent, id, hash) {
        super(id);
        this.agent = agent;
        this.hash = hash;
    }
    /**
     * @returns Details about this killmail
     */
    details() {
        return getDetails(this.agent, this.id_, this.hash);
    }
    /**
     * @returns The ID and hash link for this killmail
     */
    links() {
        return Promise.resolve({ killmail_id: this.id_, killmail_hash: this.hash });
    }
}
exports.Killmail = Killmail;
/**
 * An api adapter for accessing various details of multiple killmails, specified
 * by a provided an mapping of ids and hashes.
 */
class MappedKillmails extends r.impl.SimpleMappedResource {
    constructor(agent, idHashes) {
        super(Array.from(idHashes.keys()));
        this.agent = agent;
        this.idHashes = idHashes;
    }
    /**
     * @returns Details about all of the specified killmails
     */
    details() {
        let all = [];
        for (let pair of this.idHashes.entries()) {
            all.push(getDetails(this.agent, pair[0], pair[1]));
        }
        return Promise.all(all)
            .then(kills => {
            let map = new Map();
            for (let mail of kills) {
                map.set(mail.killmail_id, mail);
            }
            return map;
        });
    }
    /**
     * @returns ID and hash links for all specified killmails
     */
    links() {
        let map = new Map();
        for (let pair of this.idHashes) {
            map.set(pair[0], { killmail_id: pair[0], killmail_hash: pair[1] });
        }
        return Promise.resolve(map);
    }
}
exports.MappedKillmails = MappedKillmails;
/**
 * An api adapter for accessing various details about every killmail restricted
 * to some dynamic scope. This scope currently is either a character's,
 * corporation's or war's killmails from losses and final blows.
 *
 * The Killmails does not provide a way to create these instances
 * because it is instead the responsibility of each scope to provide an
 * IteratedKillmails instance accessing the appropriate mails.
 */
class IteratedKillmails extends r.impl.SimpleIteratedResource {
    constructor(agent, links) {
        super(links, link => link.killmail_id);
        this.agent = agent;
    }
    /**
     * @returns An asynchronous iterator over all killmails in the scope of this
     *    particular API instance
     */
    async *details() {
        // Must stream over the links themselves and not just the ids since
        // the hash is required to get the details
        for await (let link of this.streamer()) {
            yield getDetails(this.agent, link.killmail_id, link.killmail_hash)
                .then(mail => [link.killmail_id, mail]);
        }
    }
    /**
     * @returns An asynchronous iterator over all killmail links in the scope of
     *    this particular API instance
     */
    links() {
        return this.getPaginatedResource();
    }
}
exports.IteratedKillmails = IteratedKillmails;
/**
 * Create a new Killmails API that uses the given `agent` to make its
 * HTTP requests to the ESI interface.
 *
 * @param agent The agent making actual requests
 * @returns A new Killmails
 */
function makeKillmails(agent) {
    return function (ids, hash) {
        if (typeof ids === 'number') {
            // Single killmail variant
            return new Killmail(agent, ids, hash);
        }
        else if (Array.isArray(ids)) {
            // Either a tuple or KillmailLink array so turn it into a map first
            let map = new Map();
            for (let e of ids) {
                if (e.killmail_id !== undefined) {
                    let link = e;
                    map.set(link.killmail_id, link.killmail_hash);
                }
                else {
                    let tuple = e;
                    map.set(tuple[0], tuple[1]);
                }
            }
            return new MappedKillmails(agent, map);
        }
        else {
            // A map so it can be used directly
            return new MappedKillmails(agent, ids);
        }
    };
}
exports.makeKillmails = makeKillmails;
function getDetails(agent, id, hash) {
    return agent.request('get_killmails_killmail_id_killmail_hash', { path: { killmail_id: id, killmail_hash: hash } });
}
//# sourceMappingURL=killmails.js.map