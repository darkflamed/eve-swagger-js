"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const search_1 = require("../../internal/search");
const names_1 = require("../../internal/names");
const r = require("../../internal/resource-api");
/**
 * An api adapter for accessing various details of a single station,
 * specified by a provided id when the api is instantiated.
 */
class Station extends r.impl.SimpleResource {
    constructor(agent, id) {
        super(id);
        this.agent = agent;
    }
    /**
     * @returns Information about the station
     */
    details() {
        return getDetails(this.agent, this.id_);
    }
    /**
     * @esi_route ~get_industry_facilities
     *
     * @returns The taxes imposed on the station, or 0
     */
    taxes() {
        return this.industry().then(result => result.tax || 0);
    }
    /**
     * @esi_route ~get_industry_facilities
     *
     * @returns The industry information for the station
     */
    industry() {
        return getFacilities(this.agent)
            .then(all => r.impl.filterArray(all, this.id_, e => e.facility_id));
    }
    /**
     * @esi_route ~get_universe_stations_station_id
     *
     * @returns The name of the station
     */
    names() {
        return this.details().then(result => result.name);
    }
}
exports.Station = Station;
/**
 * An api adapter for accessing various details of multiple station ids,
 * specified by a provided an array or set of ids when the api is instantiated.
 */
class MappedStations extends r.impl.SimpleMappedResource {
    constructor(agent, ids) {
        super(ids);
        this.agent = agent;
    }
    /**
     * @returns Station details mapped by station id
     */
    details() {
        return this.getResource(id => getDetails(this.agent, id));
    }
    /**
     * @esi_route ~get_sovereignty_map
     *
     * @returns Sovereignty information for the specified stations
     */
    industry() {
        return this.arrayIDs().then(ids => {
            return getFacilities(this.agent)
                .then(all => r.impl.filterArrayToMap(all, ids, e => e.facility_id));
        });
    }
    /**
     * @esi_route ~get_industry_facilities
     *
     * @returns Taxes for the specified stations
     */
    taxes() {
        return this.arrayIDs().then(ids => {
            return getFacilities(this.agent)
                .then(all => r.impl.filterArrayToMap(all, ids, e => e.facility_id))
                .then(objMap => {
                let aMap = new Map();
                for (let [k, v] of objMap.entries()) {
                    aMap.set(k, v.tax || 0);
                }
                return aMap;
            });
        });
    }
    /**
     * @esi_route post_universe_names [station]
     *
     * @returns The specified stations' names
     */
    names() {
        return this.arrayIDs()
            .then(ids => names_1.getNames(this.agent, "station" /* STATION */, ids));
    }
}
exports.MappedStations = MappedStations;
/**
 * An api adapter for accessing various details about every station in the
 * universe.
 */
class IteratedStations extends r.impl.SimpleIteratedResource {
    constructor(agent) {
        super(r.impl.makeArrayStreamer(() => agent.request('get_industry_facilities', undefined)), e => e.facility_id);
        this.agent = agent;
    }
    /**
     * @returns The details of every station in the universe
     */
    details() {
        return this.getResource(id => getDetails(this.agent, id));
    }
    /**
     * @esi_route get_industry_facilities
     *
     * @returns Industry facility information for all stations
     */
    industry() {
        return this.getPaginatedResource();
    }
    /**
     * @esi_route get_industry_facilities
     *
     * @returns Taxes for all stations
     */
    async *taxes() {
        for await (let station of this.getPaginatedResource()) {
            yield [station[0], station[1].tax || 0];
        }
    }
    /**
     * @esi_route post_universe_names [station]
     *
     * @returns Names of all stations in the universe
     */
    names() {
        return names_1.getIteratedNames(this.agent, "station" /* STATION */, this.ids());
    }
}
exports.IteratedStations = IteratedStations;
/**
 * Create a new Stations instance that uses the given `agent` to
 * make its HTTP requests to the ESI interface.
 *
 * @param agent The agent making actual requests
 * @returns A Stations instance
 */
function makeStations(agent) {
    const stationSearch = search_1.makeDefaultSearch(agent, "station" /* STATION */);
    let stations = function (ids, strict = false) {
        if (typeof ids === 'number') {
            // Single id so single API
            return new Station(agent, ids);
        }
        else if (typeof ids === 'string') {
            // Search query, so mapped API with dynamic ids
            return new MappedStations(agent, () => stationSearch(ids, strict));
        }
        else {
            // Set or array, so mapped API with fixed ids
            return new MappedStations(agent, ids);
        }
    };
    // Add facilities() function
    stations.facilities = function () {
        return new IteratedStations(agent);
    };
    return stations;
}
exports.makeStations = makeStations;
function getDetails(agent, id) {
    return agent.request('get_universe_stations_station_id', { path: { station_id: id } });
}
function getFacilities(agent) {
    return agent.request('get_industry_facilities', undefined);
}
//# sourceMappingURL=stations.js.map