import {
  PlaneGeometry,
  MeshBasicMaterial,
  Group,
  Raycaster,
  Vector2,
  OrthographicCamera,
  InstancedMesh,
  Matrix4,
  Vector3,
} from 'three';
import throttle from 'lodash.throttle';
import { Required } from 'utility-types';
import debounce from 'lodash.debounce';

import { DataProviderContextData } from '../DataProvider';
import { PlanetWatcherNodeStatusUpdate } from '../../../graphql.generated';

const NODE_SIZE = 100;

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
  serverCellIndexes: Map<number, Set<string>> = new Map();
  timeoutId: number;
  raycaster: Raycaster;
  camera: OrthographicCamera;

  constructor(
    private readonly nodeStatus: DataProviderContextData['nodeStatus'],
    private readonly nodeUpdates: DataProviderContextData['nodeUpdates'],
    private readonly gameServerStatus: DataProviderContextData['gameServerStatus'],
    private readonly gameServerUpdates: DataProviderContextData['gameServerUpdates'],
    camera: OrthographicCamera,
    canvasElement: HTMLCanvasElement
  ) {
    super();
    this.setupSubscribers();

    for (const ns of nodeStatus.values()) {
      this.updateCellIndexesFromNodeStatus(ns);
    }

    this.gameServerStatus = gameServerStatus;
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

  private handleHover(e: MouseEvent) {
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

  private updateCellIndexesFromNodeStatus(newNodeStatus: Required<Partial<PlanetWatcherNodeStatusUpdate>, 'location'>) {
    newNodeStatus.serverIds?.forEach(serverId => {
      const existingIndexes = this.serverCellIndexes.get(serverId) ?? new Set();

      existingIndexes.add(`${newNodeStatus.location[0]}|${newNodeStatus.location[2]}`);

      this.serverCellIndexes.set(serverId, existingIndexes);
    });
  }

  private queueChildRebuild() {
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => this.rebuildChildren(), 100) as unknown as number;
  }

  private setupSubscribers() {
    this.nodeUpdates.subscribe({
      next: ({ type, data: ns }) => {
        if (type === 'UPDATED') {
          this.updateCellIndexesFromNodeStatus(ns);
          this.debouncedChildRebuild();
        }
      },
    });

    this.gameServerUpdates.subscribe({
      next: () => {
        this.debouncedChildRebuild();
      },
    });
  }

  private debouncedChildRebuild = debounce(() => this.rebuildChildren(), 100);

  private rebuildChildren() {
    this.clear();
    for (const [serverId, cellIndexes] of this.serverCellIndexes) {
      const gameServerDetails = this.gameServerStatus.get(serverId);
      if (!gameServerDetails) {
        continue;
      }

      const matrix = new Matrix4();
      const geometry = new PlaneGeometry(NODE_SIZE, NODE_SIZE).rotateX(Math.PI / 2);
      const material = new MeshBasicMaterial({
        transparent: true,
        opacity: 0.4,
        color: gameServerDetails.color,
      });
      const instancedMesh = new InstancedMesh(geometry, material, cellIndexes.size);

      let currentCellIndexId = 0;
      for (const cellIndex of cellIndexes) {
        const nodeStatus = this.nodeStatus.get(cellIndex);

        if (nodeStatus) {
          matrix.setPosition(nodeStatus.location[0], nodeStatus.location[1], nodeStatus.location[2]);
          matrix.scale(new Vector3(1, 1, 1));
        } else {
          matrix.scale(new Vector3(0, 0, 0));
        }

        instancedMesh.setMatrixAt(currentCellIndexId, matrix);

        currentCellIndexId += 1;
      }

      if (currentCellIndexId === 0) continue;

      instancedMesh.userData.serverId = serverId;

      this.add(instancedMesh);
    }
  }
}

export default NodeLayer;
