import { SSOAgent } from '../../internal/esi-agent';
import { Responses, esi } from '../../../gen/esi';
/**
 * An api adapter that provides functions for removing a particular fitting of a
 * character, specified by id via functions in the
 * [fittings](https://esi.tech.ccp.is/latest/#/Fittings) ESI endpoints.
 */
export interface Fitting {
    /**
     * @esi_example esi.characters(1, 'token').fittings(2).del()
     *
     * @returns An empty Promise resolving when the delete request completes
     */
    del(): Promise<Responses['delete_characters_character_id_fittings_fitting_id']>;
    /**
     * @returns The fitting id
     */
    id(): Promise<number>;
}
/**
 * An api adapter over the end points handling a character's fittings via
 * functions in the [fittings](https://esi.tech.ccp.is/latest/#/Fittings) ESI
 * endpoints.
 */
export interface Fittings {
    /**
     * @esi_example esi.characters(1, 'token').fittings()
     *
     * @returns All of a character's fittings and their details
     */
    (): Promise<Responses['get_characters_character_id_fittings']>;
    /**
     * Create a new Fitting end point targeting the particular fitting by
     * `id`.
     *
     * @param id The fitting id
     * @returns A Fitting API wrapper
     */
    (id: number): Fitting;
    /**
     * @esi_route post_characters_character_id_fittings
     * @esi_example esi.characters(1, 'token').fittings.add({...})
     *
     * @param fitting The new fitting
     * @returns The id of the created fitting
     */
    add(fitting: esi.character.fitting.NewFitting): Promise<number>;
}
/**
 * Create a new {@link Fittings} instance that uses the given character agent to
 * make its HTTP requests to the ESI interface.
 *
 * @param char The character access information
 * @returns An Fittings API instance
 */
export declare function makeFittings(char: SSOAgent): Fittings;
