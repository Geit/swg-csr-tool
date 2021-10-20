import { PlaneGeometry, MeshBasicMaterial, Mesh, Group, Raycaster, Vector2, OrthographicCamera } from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';
import throttle from 'lodash.throttle';

import { isPresent } from '../../../utils/utility-types';
import { DataProviderContextData } from '../DataProvider';

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
  nodeUpdates: DataProviderContextData['nodeUpdates'];
  nodeStatus: DataProviderContextData['nodeStatus'];
  gameServerStatus: DataProviderContextData['gameServerStatus'];
  serverCellIndexes: Map<number, Set<string>>;
  timeoutId: number;
  raycaster: Raycaster;
  camera: OrthographicCamera;

  constructor(
    nodeStatus: DataProviderContextData['nodeStatus'],
    nodeUpdates: DataProviderContextData['nodeUpdates'],
    gameServerStatus: DataProviderContextData['gameServerStatus'],
    camera: OrthographicCamera,
    canvasElement: HTMLCanvasElement
  ) {
    super();

    this.serverCellIndexes = new Map();

    for (const [, ns] of nodeStatus) {
      ns.serverIds?.forEach(serverId => {
        let existingIndexes = this.serverCellIndexes.get(serverId);

        if (!existingIndexes) {
          existingIndexes = new Set();
        }

        existingIndexes.add(`${ns.location[0]}|${ns.location[2]}`);

        this.serverCellIndexes.set(serverId, existingIndexes);
      });
    }

    this.nodeUpdates = nodeUpdates;
    this.nodeStatus = nodeStatus;
    this.gameServerStatus = gameServerStatus;
    this.setupSubscriber();
    this.timeoutId = setTimeout(() => this.rebuildChildren(), 250) as unknown as number;

    const throttledMouseMove = throttle(this.handleHover.bind(this), 100);
    canvasElement.addEventListener('mousemove', throttledMouseMove);
    canvasElement.addEventListener('mouseout', () => {
      throttledMouseMove.cancel();
      const evtToFire = new CustomEvent('zoneHover', {
        detail: { serversUnderMouse: [] },
      });
      document.dispatchEvent(evtToFire);
    });

    this.raycaster = new Raycaster();
    this.camera = camera;
  }

  handleHover(e: MouseEvent) {
    const renderRect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const x = e.clientX - renderRect.left; //x position within the element.
    const y = e.clientY - renderRect.top;

    const mouse = new Vector2((x / renderRect.width) * 2 - 1, -(y / renderRect.height) * 2 + 1);

    this.raycaster.setFromCamera(mouse, this.camera);
    const intersections = this.raycaster.intersectObject(this, true);

    const serversUnderMouse = intersections.map(intersection => intersection.object.userData.serverId);

    const evtToFire = new CustomEvent('zoneHover', {
      detail: { serversUnderMouse },
    });
    document.dispatchEvent(evtToFire);
  }

  setupSubscriber() {
    this.nodeUpdates.subscribe({
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
          this.timeoutId = setTimeout(() => this.rebuildChildren(), 250) as unknown as number;
        }
      },
    });
  }

  rebuildChildren() {
    this.clear();
    for (const [serverId, cellIndexes] of this.serverCellIndexes) {
      const geometries = [...cellIndexes]
        .map(cellIndex => {
          const ns = this.nodeStatus.get(cellIndex);

          if (!ns) return null;

          const geometry = new PlaneGeometry(100, 100)
            .rotateX(Math.PI / 2)
            .translate(ns.location[0], ns.location[1], ns.location[2]);

          return geometry;
        })
        .filter(isPresent);

      if (geometries.length === 0) continue;

      // @ts-expect-error threejs types are currently wrong.
      const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(geometries);

      const mesh = new Mesh(
        mergedGeometry,
        new MeshBasicMaterial({
          transparent: true,
          opacity: 0.4,
          color: this.gameServerStatus.get(serverId)!.color,
        })
      );

      mesh.userData.serverId = serverId;

      this.add(mesh);
    }
  }
}

export default NodeLayer;
