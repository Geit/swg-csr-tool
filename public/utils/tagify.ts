const hexEncode = (val: string) => {
  return val
    .split('')
    .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('');
};

export const TAGIFY = (input: string) => parseInt(hexEncode(input), 16);

// You can find these tags by navigating to src/engine/server/library/serverGame/src/shared/objectTemplate/<objectType>.h
// and looking for `//@BEGIN TFD ID`

export const CREATURE_TAG = TAGIFY('CREO');
export const BUILDING_TAG = TAGIFY('BUIO');
export const FACTORY_TAG = TAGIFY('FCYT');
export const HARVESTER_TAG = TAGIFY('HINO');
export const INSTALLATION_TAG = TAGIFY('INSO');
export const MANF_INSTALLATION_TAG = TAGIFY('MINO');
export const RESOURCE_CONTAINER_TAG = TAGIFY('RCNO');
export const STATIC_TAG = TAGIFY('STAO');
export const TANGIBLE_TAG = TAGIFY('TANO');
