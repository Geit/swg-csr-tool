import * as THREE from 'three';

import {
  CREATURE_TAG,
  BUILDING_TAG,
  FACTORY_TAG,
  HARVESTER_TAG,
  INSTALLATION_TAG,
  MANF_INSTALLATION_TAG,
  RESOURCE_CONTAINER_TAG,
  STATIC_TAG,
  TANGIBLE_TAG,
} from '../../../utils/tagify';
import { MapValueType, isPresent } from '../../../utils/utility-types';
import { DataProviderContextData } from '../DataProvider';

const EXTRA_OBJECT_BUDGET = 10000;
const MIN_SIZE = 10000;

const getColorForObject = (object: MapValueType<DataProviderContextData['objects']>): THREE.Color => {
  switch (object.objectTypeTag) {
    case CREATURE_TAG:
      if (object.interestRadius > 0) {
        return new THREE.Color(0xffa500); // Red
      }
      return new THREE.Color(0xff0000); // Red

    case BUILDING_TAG:
      return new THREE.Color(0x800080); // Purple

    case RESOURCE_CONTAINER_TAG:
    case TANGIBLE_TAG:
      return new THREE.Color(0x5bcbcd); // Blue

    case STATIC_TAG:
      return new THREE.Color(0xffffb5); // Yellow

    case FACTORY_TAG:
    case HARVESTER_TAG:
    case INSTALLATION_TAG:
    case MANF_INSTALLATION_TAG:
      return new THREE.Color(0xb5ead6); // Green

    default:
      return new THREE.Color(0x00000); // Black
  }
};

const getBearingBetweenPoints = (a1: number, a2: number, b1: number, b2: number) => {
  let theta = Math.atan2(b1 - a1, a2 - b2);
  if (theta < 0.0) theta += Math.PI * 2;

  return theta;
};

/**
 * Creates and manages an instanced mesh for all the objects currently within the scene.
 */
class ObjectLayer extends THREE.InstancedMesh {
  objectUpdates: DataProviderContextData['objectUpdates'];
  camera: THREE.OrthographicCamera;
  objectIdToInstanceId: Map<string, number>;
  instanceIdToObjectId: Map<number, string>;
  maximumCount: number;
  raycaster: THREE.Raycaster;
  prevZoom: number;
  boundingSphereChange = false;

  constructor(
    objects: DataProviderContextData['objects'],
    objectUpdates: DataProviderContextData['objectUpdates'],
    camera: THREE.OrthographicCamera,
    canvasElement: HTMLCanvasElement
  ) {
    const dunceGeometry = new THREE.ConeGeometry(0.5, 1.5, 8);
    const material = new THREE.MeshBasicMaterial();
    const maximumCount = Math.max(objects.size + EXTRA_OBJECT_BUDGET, MIN_SIZE);

    super(dunceGeometry, material, maximumCount);

    // BUG: ThreeJS does not preallocate this for us, it's instead lazily allocated the first time
    // setColorAt is called (using the current this.count value), this means that if we dynamically
    // reduce the size of the mesh (as above) and increase it at run time (as recommended), then
    // we will be unable to set colors on items above the initial count.
    this.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(maximumCount * 3), 3);

    this.objectUpdates = objectUpdates;
    this.camera = camera;
    this.prevZoom = camera.zoom;
    this.objectIdToInstanceId = new Map<string, number>();
    this.instanceIdToObjectId = new Map<number, string>();
    this.maximumCount = maximumCount;

    // We now reduce the total number of items to be drawn to match the number of items in the
    // objects map. This prevents overdraw.
    this.count = [...objects].reduce((acc, [, obj]) => (obj.visible ? acc + 1 : acc), 0);

    let instanceIdx = 0;
    for (const [, obj] of objects) {
      if (!obj.visible) continue;

      this.createFreshObject(instanceIdx, obj);
      instanceIdx += 1;
    }

    this.setupSubscriber();

    // Mark instances for update.
    this.instanceMatrix.needsUpdate = true;
    this.instanceColor!.needsUpdate = true;

    canvasElement.addEventListener('dblclick', this.handleObjectClick.bind(this));
    this.raycaster = new THREE.Raycaster();

    this.onBeforeRender = this.handleBeforeRender.bind(this);
  }

  calculateCurrentObjectScaleFactor(zoom: number) {
    const shortestEdge = Math.min(this.camera.right, this.camera.top) * 2;
    const ratioComparedToFull = shortestEdge / 16384;

    return Math.min(50, Math.max((100 * ratioComparedToFull) / zoom, 1));
  }

  handleObjectClick(e: MouseEvent) {
    const renderRect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const x = e.clientX - renderRect.left; //x position within the element.
    const y = e.clientY - renderRect.top;

    const mouse = new THREE.Vector2((x / renderRect.width) * 2 - 1, -(y / renderRect.height) * 2 + 1);

    this.raycaster.setFromCamera(mouse, this.camera);
    const intersections = this.raycaster.intersectObject(this);
    if (intersections.length > 0) {
      const objectIds = intersections
        .map(({ instanceId }) => (instanceId ? this.instanceIdToObjectId.get(instanceId) : null))
        .filter(isPresent);

      if (objectIds.length === 0) return;

      const evtToFire = new CustomEvent('objectSelected', {
        detail: { objectIds },
      });
      document.dispatchEvent(evtToFire);
    }
  }

  setupSubscriber() {
    this.objectUpdates.subscribe({
      next: ({ type, data: obj }) => {
        switch (type) {
          case 'UPDATED':
            return this.updateObject(obj);
          case 'CREATED':
            return this.addObject(obj);
          case 'DELETED':
            return this.removeObject(obj);

          default:
            break;
        }
      },
    });
  }

  addObject(obj: MapValueType<DataProviderContextData['objects']>) {
    // Bail if the object is already in the scene
    if (this.objectIdToInstanceId.has(obj.networkId)) return;

    // We're going to try and add the new object to the instanced mesh.
    // If we can't do that because the mesh is full, we need to expand the underlying data structures.
    // This might happen a few times while the view loads, but that's fine.
    const instanceIdx = this.count;

    if (this.count >= this.maximumCount) {
      this.expandAttributes();
    }

    // If the mesh isn't full, we just put the new boy on the end and increase the count by one.
    this.createFreshObject(instanceIdx, obj);
    this.count += 1;
    this.instanceMatrix.needsUpdate = true;
    this.instanceColor!.needsUpdate = true;
    this.boundingSphereChange = true;
  }

  expandAttributes() {
    // We  expand the underlaying data structures here.
    const newMaxSize = Math.max(this.maximumCount + EXTRA_OBJECT_BUDGET, MIN_SIZE);
    const newInstanceMatrix = new THREE.InstancedBufferAttribute(new Float32Array(newMaxSize * 16), 16);
    const newInstanceColor = new THREE.InstancedBufferAttribute(new Float32Array(newMaxSize * 3), 3);

    // Copy the old Buffer Attributes into the new one.
    (newInstanceMatrix.array as Float32Array).set(this.instanceMatrix.array);
    (newInstanceColor.array as Float32Array).set(this.instanceColor!.array);

    // Overwrite the old buffer attributes.
    this.instanceMatrix = newInstanceMatrix;
    this.instanceColor = newInstanceColor;
    this.maximumCount = newMaxSize;
  }

  createFreshObject(instanceIdx: number, obj: MapValueType<DataProviderContextData['objects']>) {
    const dummyMatrix = new THREE.Matrix4();
    dummyMatrix.setPosition(obj.location[0], obj.location[1], obj.location[2]);
    const scaleFactor = this.calculateCurrentObjectScaleFactor(this.camera.zoom);
    dummyMatrix.scale(new THREE.Vector3(scaleFactor, scaleFactor, scaleFactor));

    this.setColorAt(instanceIdx, getColorForObject(obj));
    this.setMatrixAt(instanceIdx, dummyMatrix);
    this.objectIdToInstanceId.set(obj.networkId, instanceIdx);
    this.instanceIdToObjectId.set(instanceIdx, obj.networkId);
  }

  updateObject(obj: MapValueType<DataProviderContextData['objects']>) {
    const instanceIdx = this.objectIdToInstanceId.get(obj.networkId);

    // If instance not found, bail
    if (instanceIdx === undefined) return;

    // Get the existing position from the instance
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    const matrix = new THREE.Matrix4();
    this.getMatrixAt(instanceIdx, matrix);
    matrix.decompose(position, quaternion, scale);
    position.setFromMatrixPosition(matrix);

    // Calculate the bearing between the old position and new
    const newPosition = new THREE.Vector3(obj.location[0], obj.location[1], obj.location[2]);
    if (newPosition.x !== position.x || newPosition.z !== position.z) {
      const bearing = Math.PI - getBearingBetweenPoints(position.x, position.z, newPosition.x, newPosition.z);

      // We start with a cone facing upwards.
      // We then rotate it to the object's current bearing
      // We "knock" the cone down so it's the bearing.
      const newRotation = new THREE.Euler(Math.PI / 2, bearing, 0, 'ZYX');

      // Then apply that to the quat.

      quaternion.setFromEuler(newRotation);
    }

    const scaleFactor = this.calculateCurrentObjectScaleFactor(this.camera.zoom);
    scale.setScalar(scaleFactor);

    matrix.compose(newPosition, quaternion, scale);

    this.setMatrixAt(instanceIdx, matrix);
    this.instanceMatrix.needsUpdate = true;
    this.boundingSphereChange = true;
  }

  removeObject(obj: MapValueType<DataProviderContextData['objects']>) {
    // If an object is deleted, then we're going to swap it out with an object at the end of the mesh
    // then reduce the total count of objects in the mesh.
    const idxToMoveTo = this.objectIdToInstanceId.get(obj.networkId);

    if (idxToMoveTo === undefined) {
      return; // undefined behaviour
    }

    const idxToMove = this.count - 1;
    const objectIdToMove = this.instanceIdToObjectId.get(idxToMove);

    if (objectIdToMove === undefined) {
      return; // undefined behavior
    }

    if (idxToMove === idxToMoveTo || objectIdToMove === obj.networkId) {
      this.objectIdToInstanceId.delete(obj.networkId);
      this.instanceIdToObjectId.delete(idxToMoveTo);
      this.count -= 1;
      return;
    }

    this.objectIdToInstanceId.delete(obj.networkId);
    this.instanceIdToObjectId.delete(idxToMove);
    this.instanceIdToObjectId.delete(idxToMoveTo);

    this.objectIdToInstanceId.set(objectIdToMove, idxToMoveTo);
    this.instanceIdToObjectId.set(idxToMoveTo, objectIdToMove);

    const matrix = new THREE.Matrix4();
    this.getMatrixAt(idxToMove, matrix);
    this.setMatrixAt(idxToMoveTo, matrix);

    const color = new THREE.Color();
    this.getColorAt(idxToMove, color);
    this.setColorAt(idxToMoveTo, color);

    this.count -= 1;
    this.instanceMatrix.needsUpdate = true;
    this.instanceColor!.needsUpdate = true;
    this.boundingSphereChange = true;
  }

  handleBeforeRender(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera
    // geometry: THREE.BufferGeometry,
    // material: THREE.Material,
    // group: THREE.Group
  ): void {
    if (this.boundingSphereChange) {
      this.computeBoundingSphere();
      this.boundingSphereChange = false;
    }
    const newZoom = (camera as THREE.OrthographicCamera).zoom;
    if (newZoom !== this.prevZoom) {
      const scaleFactor = this.calculateCurrentObjectScaleFactor(newZoom);
      const prevScaleFactor = this.calculateCurrentObjectScaleFactor(this.prevZoom);
      const scaleRatio = scaleFactor / prevScaleFactor;

      const matrix = new THREE.Matrix4();

      for (let i = 0; i < this.count; i++) {
        this.getMatrixAt(i, matrix);

        matrix.scale(new THREE.Vector3(scaleRatio, scaleRatio, scaleRatio));

        this.setMatrixAt(i, matrix);
      }

      this.instanceMatrix.needsUpdate = true;
      this.prevZoom = newZoom;
    }
  }
}

export default ObjectLayer;
