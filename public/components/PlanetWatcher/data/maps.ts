export interface MapConfiguration {
  id: string;
  waypointCommandId: string | false;
  displayName: string;
  planetMap: {
    size: number;
    offset: {
      x: number;
      z: number;
    };
  } | null;
  raster: {
    maxZoom: number;
    backgroundImage: string;
    attribution: string;
    size: number;
  } | null;
}

const DEFAULT_SWG_MAP_SIZE = 16384;
const DEFAULT_RASTERIZED_MAP_SIZE = 4096;

const mapConfigs: readonly MapConfiguration[] = [
  {
    id: 'corellia',
    waypointCommandId: 'corellia',
    displayName: 'Corellia',
    planetMap: { size: DEFAULT_SWG_MAP_SIZE, offset: { x: 0, z: 0 } },
    raster: {
      maxZoom: 4,
      backgroundImage: 'planets/lossy/map_corellia.avif',
      attribution: "Sytner's Satellite Maps 2.0",
      size: DEFAULT_RASTERIZED_MAP_SIZE,
    },
  },
  {
    id: 'dantooine',
    waypointCommandId: 'dantooine',
    displayName: 'Dantooine',
    planetMap: { size: DEFAULT_SWG_MAP_SIZE, offset: { x: 0, z: 0 } },
    raster: {
      maxZoom: 4,
      backgroundImage: 'planets/lossy/map_dantooine.avif',
      attribution: "Sytner's Satellite Maps 2.0",
      size: DEFAULT_RASTERIZED_MAP_SIZE,
    },
  },
  {
    id: 'dathomir',
    waypointCommandId: 'dathomir',
    displayName: 'Dathomir',
    planetMap: { size: DEFAULT_SWG_MAP_SIZE, offset: { x: 0, z: 0 } },
    raster: {
      maxZoom: 4,
      backgroundImage: 'planets/lossy/map_dathomir.avif',
      attribution: "Sytner's Satellite Maps 2.0",
      size: DEFAULT_RASTERIZED_MAP_SIZE,
    },
  },
  {
    id: 'endor',
    waypointCommandId: 'endor',
    displayName: 'Endor',
    planetMap: { size: DEFAULT_SWG_MAP_SIZE, offset: { x: 0, z: 0 } },
    raster: {
      maxZoom: 4,
      backgroundImage: 'planets/lossy/map_endor.avif',
      attribution: "Sytner's Satellite Maps 2.0",
      size: DEFAULT_RASTERIZED_MAP_SIZE,
    },
  },
  {
    id: 'lok',
    waypointCommandId: 'lok',
    displayName: 'Lok',
    planetMap: { size: DEFAULT_SWG_MAP_SIZE, offset: { x: 0, z: 0 } },
    raster: {
      maxZoom: 4,
      backgroundImage: 'planets/lossy/map_lok.avif',
      attribution: "Sytner's Satellite Maps 2.0",
      size: DEFAULT_RASTERIZED_MAP_SIZE,
    },
  },
  {
    id: 'naboo',
    waypointCommandId: 'naboo',
    displayName: 'Naboo',
    planetMap: { size: DEFAULT_SWG_MAP_SIZE, offset: { x: 0, z: 0 } },
    raster: {
      maxZoom: 4,
      backgroundImage: 'planets/lossy/map_naboo.avif',
      attribution: "Sytner's Satellite Maps 2.0",
      size: DEFAULT_RASTERIZED_MAP_SIZE,
    },
  },
  {
    id: 'rori',
    waypointCommandId: 'rori',
    displayName: 'Rori',
    planetMap: { size: DEFAULT_SWG_MAP_SIZE, offset: { x: 0, z: 0 } },
    raster: {
      maxZoom: 4,
      backgroundImage: 'planets/lossy/map_rori.avif',
      attribution: "Sytner's Satellite Maps 2.0",
      size: DEFAULT_RASTERIZED_MAP_SIZE,
    },
  },
  {
    id: 'talus',
    waypointCommandId: 'talus',
    displayName: 'Talus',
    planetMap: { size: DEFAULT_SWG_MAP_SIZE, offset: { x: 0, z: 0 } },
    raster: {
      maxZoom: 4,
      backgroundImage: 'planets/lossy/map_talus.avif',
      attribution: "Sytner's Satellite Maps 2.0",
      size: DEFAULT_RASTERIZED_MAP_SIZE,
    },
  },
  {
    id: 'tatooine',
    waypointCommandId: 'tatooine',
    displayName: 'Tatooine',
    planetMap: { size: DEFAULT_SWG_MAP_SIZE, offset: { x: 0, z: 0 } },
    raster: {
      maxZoom: 4,
      backgroundImage: 'planets/lossy/map_tatooine.avif',
      attribution: "Sytner's Satellite Maps 2.0",
      size: DEFAULT_RASTERIZED_MAP_SIZE,
    },
  },
  {
    id: 'yavin4',
    waypointCommandId: 'yavin4',
    displayName: 'Yavin 4',
    planetMap: { size: DEFAULT_SWG_MAP_SIZE, offset: { x: 0, z: 0 } },
    raster: {
      maxZoom: 4,
      backgroundImage: 'planets/lossy/map_yavin4.avif',
      attribution: "Sytner's Satellite Maps 2.0",
      size: DEFAULT_RASTERIZED_MAP_SIZE,
    },
  },
  {
    id: 'mustafar',
    waypointCommandId: 'mustafar',
    displayName: 'Mustafar',
    planetMap: { size: 8192, offset: { x: 0, z: 0 } },
    raster: {
      maxZoom: 2,
      backgroundImage: 'planets/lossy/mustafar-topo.png',
      attribution: 'SWG Game Files',
      size: 1024,
    },
  },
  {
    id: 'kashyyyk_main',
    waypointCommandId: 'kachirho',
    displayName: 'Kashyyyk',
    planetMap: {
      size: 2048,
      offset: { x: 0, z: 112 },
    },
    raster: {
      maxZoom: 2,
      backgroundImage: 'planets/lossy/map_kashyyyk_main.avif',
      attribution: 'SWG Game Files',
      size: 1024,
    },
  },
  {
    id: 'kashyyyk_dead_forest',
    waypointCommandId: 'khowir',
    displayName: 'Kashyyyk - Kkowir Forest',
    planetMap: {
      size: 1000,
      offset: { x: 0, z: 0 },
    },
    raster: {
      maxZoom: 2,
      backgroundImage: 'planets/lossy/map_kashyyyk_dead_forest.avif',
      attribution: 'SWG Game Files',
      size: 1024,
    },
  },
  {
    id: 'kashyyyk_hunting',
    waypointCommandId: 'etyyy',
    displayName: 'Kashyyyk - Etyyy Hunting Grounds',
    planetMap: {
      size: 2844,
      offset: { x: 0, z: 0 },
    },
    raster: {
      maxZoom: 2,
      backgroundImage: 'planets/lossy/map_kashyyyk_hunting.avif',
      attribution: 'SWG Game Files',
      size: 1024,
    },
  },
  // The Rryatt trail is weird - It has multiple different coordinate systems for each of the different levels
  // It is not possible to make a waypoint for a given level unless the PC is already within that level.
  // It should at the very least be possible to put points on the map for it, but that can be an excercise for a
  // future iteration.
  // dsrc/sku.0/sys.shared/compiled/game/datatables/buildout/areas_kashyyyk_rryatt_trail.tab may hold clues useful
  // for implementation.
  {
    id: 'kashyyyk_rryatt_trail',
    waypointCommandId: false,
    displayName: 'Kashyyyk - Rryatt Trail',
    planetMap: {
      size: 2048,
      offset: { x: -0, z: 0 },
    },
    raster: {
      maxZoom: 2,
      backgroundImage: 'planets/lossy/map_kashyyyk_rryatt_trail.avif',
      attribution: 'SWG Game Files',
      size: 1024,
    },
  },
  {
    id: 'kashyyyk_north_dungeons',
    waypointCommandId: false,
    displayName: 'Kashyyyk - North Dungeons',
    planetMap: {
      size: 8192,
      offset: { x: -42, z: 15 },
    },
    raster: {
      maxZoom: 4,
      backgroundImage: 'planets/lossy/kashyyyk_north_dungeons.png',
      attribution: "Sytner's Satellite Maps 2.0",
      size: DEFAULT_RASTERIZED_MAP_SIZE,
    },
  },
  {
    id: 'kashyyyk_south_dungeons',
    waypointCommandId: false,
    displayName: 'Kashyyyk - South Dungeons',
    planetMap: {
      size: 7300,
      offset: { x: -700, z: 1325 },
    },
    raster: {
      maxZoom: 4,
      backgroundImage: 'planets/lossy/kashyyyk_south_dungeons.png',
      attribution: "Sytner's Satellite Maps 2.0",
      size: DEFAULT_RASTERIZED_MAP_SIZE,
    },
  },
  {
    id: 'kashyyyk_pob_dungeons',
    waypointCommandId: false,
    displayName: 'Kashyyyk - POB Dungeons',
    planetMap: {
      size: 8192,
      offset: { x: 0, z: 0 },
    },
    raster: null,
  },
  {
    id: 'bespin',
    waypointCommandId: 'bespin',
    displayName: 'Bespin',
    planetMap: { size: DEFAULT_SWG_MAP_SIZE, offset: { x: 0, z: 0 } },
    raster: {
      maxZoom: 5,
      backgroundImage: 'planets/lossy/map_bespin_full.avif',
      attribution: 'SWG Legends',
      size: 16384,
    },
  },
  {
    id: 'adventure1',
    waypointCommandId: false,
    displayName: 'Dungeons - Tusken King',
    planetMap: {
      size: DEFAULT_SWG_MAP_SIZE,
      offset: { x: 0, z: 0 },
    },
    raster: null,
  },
  {
    id: 'adventure2',
    waypointCommandId: false,
    displayName: 'Dungeons - Hoth',
    planetMap: {
      size: DEFAULT_SWG_MAP_SIZE,
      offset: { x: 0, z: 0 },
    },
    raster: null,
  },
  {
    id: 'dungeon1',
    waypointCommandId: false,
    displayName: 'Dungeons - Tansarri/OG Heroics/Terentatek',
    planetMap: {
      size: DEFAULT_SWG_MAP_SIZE,
      offset: { x: 0, z: 0 },
    },
    raster: null,
  },
  {
    id: 'dungeon2',
    waypointCommandId: false,
    displayName: 'Dungeons - DJT',
    planetMap: {
      size: DEFAULT_SWG_MAP_SIZE,
      offset: { x: 0, z: 0 },
    },
    raster: null,
  },
  {
    id: 'dungeon3',
    waypointCommandId: false,
    displayName: 'Dungeons - Bespin',
    planetMap: {
      size: DEFAULT_SWG_MAP_SIZE,
      offset: { x: 0, z: 0 },
    },
    raster: null,
  },
  {
    id: 'space_tatooine',
    waypointCommandId: false,
    displayName: 'Space - Tatooine',
    planetMap: {
      size: DEFAULT_SWG_MAP_SIZE,
      offset: { x: 0, z: 0 },
    },
    raster: null,
  },
  {
    id: 'space_lok',
    waypointCommandId: false,
    displayName: 'Space - Lok',
    planetMap: {
      size: DEFAULT_SWG_MAP_SIZE,
      offset: { x: 0, z: 0 },
    },
    raster: null,
  },
  {
    id: 'space_naboo',
    waypointCommandId: false,
    displayName: 'Space - Naboo',
    planetMap: {
      size: DEFAULT_SWG_MAP_SIZE,
      offset: { x: 0, z: 0 },
    },
    raster: null,
  },
  {
    id: 'space_endor',
    waypointCommandId: false,
    displayName: 'Space - Endor',
    planetMap: {
      size: DEFAULT_SWG_MAP_SIZE,
      offset: { x: 0, z: 0 },
    },
    raster: null,
  },
  {
    id: 'space_corellia',
    waypointCommandId: false,
    displayName: 'Space - Corellia',
    planetMap: {
      size: DEFAULT_SWG_MAP_SIZE,
      offset: { x: 0, z: 0 },
    },
    raster: null,
  },
  {
    id: 'space_dantooine',
    waypointCommandId: false,
    displayName: 'Space - Dantooine',
    planetMap: {
      size: DEFAULT_SWG_MAP_SIZE,
      offset: { x: 0, z: 0 },
    },
    raster: null,
  },
  {
    id: 'space_kashyyyk',
    waypointCommandId: false,
    displayName: 'Space - Kashyyyk',
    planetMap: {
      size: DEFAULT_SWG_MAP_SIZE,
      offset: { x: 0, z: 0 },
    },
    raster: null,
  },
  {
    id: 'space_dathomir',
    waypointCommandId: false,
    displayName: 'Space - Dathomir',
    planetMap: {
      size: DEFAULT_SWG_MAP_SIZE,
      offset: { x: 0, z: 0 },
    },
    raster: null,
  },
  {
    id: 'space_yavin4',
    waypointCommandId: false,
    displayName: 'Space - Yavin IV',
    planetMap: {
      size: DEFAULT_SWG_MAP_SIZE,
      offset: { x: 0, z: 0 },
    },
    raster: null,
  },
  {
    id: 'space_heavy1',
    waypointCommandId: false,
    displayName: 'Space - Deep Space',
    planetMap: {
      size: DEFAULT_SWG_MAP_SIZE,
      offset: { x: 0, z: 0 },
    },
    raster: null,
  },
  {
    id: 'space_light1',
    waypointCommandId: false,
    displayName: 'Space - Kessel',
    planetMap: {
      size: DEFAULT_SWG_MAP_SIZE,
      offset: { x: 0, z: 0 },
    },
    raster: null,
  },
  {
    id: 'space_nova_orion',
    waypointCommandId: false,
    displayName: 'Space - Ord Mantell',
    planetMap: {
      size: DEFAULT_SWG_MAP_SIZE,
      offset: { x: 0, z: 0 },
    },
    raster: null,
  },
] as const;

export default mapConfigs;
