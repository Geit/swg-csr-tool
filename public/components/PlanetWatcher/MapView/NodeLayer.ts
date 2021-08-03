import { euiPaletteColorBlind } from '@elastic/eui';
import { PlaneGeometry, MeshBasicMaterial, Mesh, Group } from 'three';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils';

import { isPresent } from '../../../utils/utility-types';
import { DataProviderContextData } from '../DataProvider';

const palette = euiPaletteColorBlind();

/**
 * Nodes (or cells) are the individual areas within a planet that objects can be partitioned into.
 * Generally, each cell is 100m^2 - and there are 160 each in both the X/Z dimension. However,
 * it is possible for cells to exist outside this range, for reasons beyond me. Each cell can be shared
 * by one or more servers.
 *
 * The purpose of this class is to produce geometries representing the extents of areas
 * managed by each server, by combining multiple cells into a single contiguous mass where possible.
 * We do not care if the geometries overlap, as this is how they are in the game too.
 */
class NodeLayer extends Group {
  data: DataProviderContextData;
  serverCellIndexes: Map<number, Set<string>>;
  timeoutId: number;

  constructor(data: DataProviderContextData) {
    super();

    this.serverCellIndexes = new Map();

    for (const [, ns] of data.nodeStatus) {
      ns.serverIds?.forEach(serverId => {
        let existingIndexes = this.serverCellIndexes.get(serverId);

        if (!existingIndexes) {
          existingIndexes = new Set();
        }

        existingIndexes.add(`${ns.location[0]}|${ns.location[2]}`);

        this.serverCellIndexes.set(serverId, existingIndexes);
      });
    }

    this.data = data;
    this.setupSubscriber();
    this.timeoutId = (setTimeout(() => this.rebuildChildren(), 250) as unknown) as number;
  }

  setupSubscriber() {
    this.data.nodeUpdates.subscribe({
      next: ({ type, data: ns }) => {
        if (type === 'UPDATED') {
          ns.serverIds?.forEach(serverId => {
            let existingIndexes = this.serverCellIndexes.get(serverId);

            if (!existingIndexes) {
              existingIndexes = new Set();
            }

            existingIndexes.add(`${ns.location[0]}|${ns.location[2]}`);

            this.serverCellIndexes.set(serverId, existingIndexes);
          });
          //console.log('reset rebuild');
          clearTimeout(this.timeoutId);
          this.timeoutId = (setTimeout(() => this.rebuildChildren(), 250) as unknown) as number;
        }
      },
    });
  }

  rebuildChildren() {
    this.clear();

    let idx = 0;

    for (const [, cellIndexes] of this.serverCellIndexes) {
      const geometries = [...cellIndexes]
        .map(cellIndex => {
          const ns = this.data.nodeStatus.get(cellIndex);

          if (!ns) return null;

          const geometry = new PlaneGeometry(100, 100)
            .rotateX(Math.PI / 2)
            .translate(ns.location[0], ns.location[1], ns.location[2]);

          return geometry;
        })
        .filter(isPresent);

      if (geometries.length === 0) continue;

      const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(geometries);

      const mesh = new Mesh(
        mergedGeometry,
        new MeshBasicMaterial({
          transparent: true,
          opacity: 0.45,
          color: palette[idx % 10],
        })
      );

      this.add(mesh);
      idx += 1;
    }
  }
}

export default NodeLayer;
