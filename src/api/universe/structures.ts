import { getNames } from '../..//internal/names';
import { ESIAgent } from '../../internal/esi-agent';
import { Responses, esi } from '../../../gen/esi';

/**
 * An api adapter that provides functions for accessing various details for a
 * moon specified by id, via functions in the
 * [universe](https://esi.tech.ccp.is/latest/#/Universe) ESI endpoints.
 */
export interface Structure {
  /**
   * @esi_example esi.structure(id).details()
   *
   * @returns Information on the specific moon
   */
  details() :Promise<Responses['get_universe_structures_structure_id']>;

  /**
   * @returns The structure's id
   */
  id() :Promise<number>;
}

/**
 * An api adapter that provides functions for accessing moon information via the
 * [universe](https://esi.tech.ccp.is/latest/#/Universe) ESI end points.
 */
export interface Structures {
  /**
   * Create a new Moon end point targeting the particular moon
   * by `id`.
   *
   * @param id The moon id
   * @returns A Moon API wrapper for the given id
   */
  (id:number) :Structure;
}

/**
 * Create a new {@link Structures} instance that uses the given `agent` to
 * make its HTTP requests to the ESI interface.
 *
 * @param agent The agent making actual requests
 * @returns A Moons API instance
 */
export function makeStructures(agent:ESIAgent) :Structures {
  return <Structures> <any> function(id:number) {
    return new StructureImpl(agent, id);
  }
}

class StructureImpl implements Structure {
  constructor(private agent:ESIAgent, private id_:number) { }

  details() {
    return this.agent.request('get_universe_structures_structure_id', {path: {structure_id: this.id_}});
  }

  id() {
    return Promise.resolve(this.id_);
  }
}
