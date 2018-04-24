"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const r = require("../../internal/resource-api");
/**
 * An api adapter for accessing various details of a single corporation wallet
 * division, specified by a provided id when the api is instantiated.
 */
class WalletDivision extends r.impl.SimpleResource {
    constructor(agent, id) {
        super(id);
        this.agent = agent;
    }
    /**
     * @esi_route ~get_corporations_corporation_id_divisions
     *
     * @returns The name of the division
     */
    names() {
        return getDivisions(this.agent)
            .then(divs => r.impl.filterArray(divs.wallet || [], this.id_, e => e.division || 0).name || '');
    }
    /**
     * @esi_route ~get_corporations_corporation_id_wallets
     *
     * @returns The balance of the division
     */
    balance() {
        return getWallets(this.agent)
            .then(divs => r.impl.filterArray(divs, this.id_, e => e.division).balance);
    }
    /**
     * @esi_route get_corporations_corporation_id_wallets_division_journal
     *
     * @returns The journal entries for the wallet division
     */
    journal() {
        if (this.journal_ === undefined) {
            this.journal_ = r.impl.makeMaxIDStreamer(fromID => this.getJournal(fromID), e => e.ref_id, 2500);
        }
        return this.journal_();
    }
    /**
     * @esi_route get_corporations_corporation_id_wallets_division_transaction
     *
     * @returns The transactions for the wallet division
     */
    transactions() {
        if (this.transactions_ === undefined) {
            this.transactions_ = r.impl.makeMaxIDStreamer(fromID => this.getTransaction(fromID), e => e.transaction_id, 2500);
        }
        return this.transactions_();
    }
    async getJournal(fromID) {
        let corpID;
        if (typeof this.agent.id === 'number') {
            corpID = this.agent.id;
        }
        else {
            corpID = await this.agent.id();
        }
        return this.agent.agent.request('get_corporations_corporation_id_wallets_division_journal', {
            path: { corporation_id: corpID, division: this.id_ },
            query: { from_id: fromID }
        }, this.agent.ssoToken);
    }
    async getTransaction(fromID) {
        let corpID;
        if (typeof this.agent.id === 'number') {
            corpID = this.agent.id;
        }
        else {
            corpID = await this.agent.id();
        }
        return this.agent.agent.request('get_corporations_corporation_id_wallets_division_transactions', {
            path: { corporation_id: corpID, division: this.id_ },
            query: { from_id: fromID }
        }, this.agent.ssoToken);
    }
}
exports.WalletDivision = WalletDivision;
/**
 * An api adapter for accessing various details of multiple wallet division ids,
 * specified by a provided an array or set of ids when the api is instantiated.
 */
class MappedWalletDivisions extends r.impl.SimpleMappedResource {
    constructor(agent, ids) {
        super(ids);
        this.agent = agent;
    }
    /**
     * @esi_route ~get_corporations_corporation_id_divisions
     *
     * @returns The names of the division mapped by their id
     */
    names() {
        return this.arrayIDs().then(ids => getDivisions(this.agent)
            .then(divs => r.impl.filterArrayToMap(divs.wallet || [], ids, e => e.division || 0)).then(map => {
            let remap = new Map();
            for (let id of ids) {
                remap.set(id, map.get(id).name || '');
            }
            return remap;
        }));
    }
    /**
     * @esi_route ~get_corporations_corporation_id_wallets
     *
     * @returns The balances mapped by division id
     */
    balance() {
        return this.arrayIDs().then(ids => getWallets(this.agent)
            .then(divs => r.impl.filterArrayToMap(divs, ids, e => e.division))
            .then(map => {
            let remap = new Map();
            for (let id of ids) {
                remap.set(id, map.get(id).balance);
            }
            return remap;
        }));
    }
}
exports.MappedWalletDivisions = MappedWalletDivisions;
/**
 * An api adapter for accessing various details about every wallet division
 * associated with the corporation.
 */
class IteratedWalletDivisions extends r.impl.SimpleIteratedResource {
    constructor(agent) {
        super(r.impl.makeArrayStreamer(() => getDivisions(agent).then(divs => divs.wallet || [])), e => e.division || 0);
        this.agent = agent;
    }
    /**
     * @esi_route get_corporations_corporation_id_divisions
     *
     * @returns The names of all wallet divisions of the corporation
     */
    async *names() {
        for await (let [id, name] of this.getPaginatedResource()) {
            // Restructure the actual name object to be a tuple
            yield [id, name.name || ''];
        }
    }
    /**
     * @esi_route get_corporations_corporation_id_wallets
     *
     * @returns The balances in all of the wallet divisions of the corporation
     */
    async *balance() {
        let wallet = await getWallets(this.agent);
        for (let div of wallet) {
            yield [div.division, div.balance];
        }
    }
}
exports.IteratedWalletDivisions = IteratedWalletDivisions;
/**
 * An interface for getting APIs for a specific wallet division, a
 * known set of wallet division ids, or every wallet division for a corporation.
 */
class Wallets {
    constructor(agent) {
        this.agent = agent;
    }
    /**
     * @esi_route get_corporations_corporation_id_wallet
     *
     * @returns The sum of all wallet divisions' ballances
     */
    netBalance() {
        return getWallets(this.agent).then(wallet => {
            let sum = 0;
            for (let d of wallet) {
                sum += d.balance;
            }
            return sum;
        });
    }
    divisions(ids) {
        if (ids === undefined) {
            // All types since no id
            return new IteratedWalletDivisions(this.agent);
        }
        else if (typeof ids === 'number') {
            // Single id so single API
            return new WalletDivision(this.agent, ids);
        }
        else {
            // Set or array, so mapped API
            return new MappedWalletDivisions(this.agent, ids);
        }
    }
}
exports.Wallets = Wallets;
async function getDivisions(agent) {
    let corpID;
    if (typeof agent.id === 'number') {
        corpID = agent.id;
    }
    else {
        corpID = await agent.id();
    }
    return agent.agent.request('get_corporations_corporation_id_divisions', { path: { corporation_id: corpID } }, agent.ssoToken);
}
async function getWallets(agent) {
    let corpID;
    if (typeof agent.id === 'number') {
        corpID = agent.id;
    }
    else {
        corpID = await agent.id();
    }
    return agent.agent.request('get_corporations_corporation_id_wallets', { path: { corporation_id: corpID } }, agent.ssoToken);
}
//# sourceMappingURL=wallets.js.map