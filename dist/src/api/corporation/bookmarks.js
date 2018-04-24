"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const r = require("../../internal/resource-api");
/**
 * An api adapter that provides functions for accessing an authenticated
 * corporation's bookmarks via the
 * [bookmark](https://esi.tech.ccp.is/latest/#/Bookmarks) ESI end points.
 */
class Bookmarks {
    constructor(agent) {
        this.agent = agent;
    }
    /**
     * @esi_route get_corporations_corporation_id_bookmarks
     *
     * @return All bookmark details for the corporation
     */
    details() {
        if (this.details_ === undefined) {
            this.details_ = r.impl.makePageBasedStreamer(page => this.getDetailsPage(page)
                .then(result => ({ result, maxPages: undefined })));
        }
        return this.details_();
    }
    /**
     * @esi_route get_corporations_corporation_id_bookmarks_folders
     *
     * @returns An iterator over the folders for bookmark management
     */
    folders() {
        if (this.folders_ === undefined) {
            this.folders_ = r.impl.makePageBasedStreamer(page => this.getFoldersPage(page)
                .then(result => ({ result, maxPages: undefined })), 1000);
        }
        return this.folders_();
    }
    async getDetailsPage(page) {
        let corpID;
        if (typeof this.agent.id === 'number') {
            corpID = this.agent.id;
        }
        else {
            corpID = await this.agent.id();
        }
        return this.agent.agent.request('get_corporations_corporation_id_bookmarks', {
            path: { corporation_id: corpID }, query: { page: page }
        }, this.agent.ssoToken);
    }
    async getFoldersPage(page) {
        let corpID;
        if (typeof this.agent.id === 'number') {
            corpID = this.agent.id;
        }
        else {
            corpID = await this.agent.id();
        }
        return this.agent.agent.request('get_corporations_corporation_id_bookmarks_folders', {
            path: { corporation_id: corpID }, query: { page: page }
        }, this.agent.ssoToken);
    }
}
exports.Bookmarks = Bookmarks;
//# sourceMappingURL=bookmarks.js.map