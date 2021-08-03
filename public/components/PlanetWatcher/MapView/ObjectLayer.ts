import * as THREE from 'three';

import { MapValueType } from '../../../utils/utility-types';
import { DataProviderContextData } from '../DataProvider';

const EXTRA_OBJECT_BUDGET = 10000;
const MIN_SIZE = 10000;

const hexEncode = (val: string) => {
  return val
    .split('')
    .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('');
};

const TAGIFY = (input: string) => parseInt(hexEncode(input), 16);

const CREATURE_TAG = TAGIFY('CREO');
const BUILDING_TAG = TAGIFY('BUIO');
const FACTORY_TAG = TAGIFY('FCYT');
const HARVESTER_TAG = TAGIFY('HINO');
const INSTALLATION_TAG = TAGIFY('INSO');
const MANF_INSTALLATION_TAG = TAGIFY('MINO');
const RESOURCE_CONTAINER_TAG = TAGIFY('RCNO');
const STATIC_TAG = TAGIFY('STAO');
const TANGIBLE_TAG = TAGIFY('TANO');

const getColorForTypeId = (typeId: number): THREE.Color => {
  switch (typeId) {
    case CREATURE_TAG:
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
  data: DataProviderContextData;
  camera: THREE.OrthographicCamera;
  objectIdToInstanceId: Map<string, number>;
  instanceIdToObjectId: Map<number, string>;
  maximumCount: number;
  raycaster: THREE.Raycaster;
  prevZoom: number;

  constructor(data: DataProviderContextData, camera: THREE.OrthographicCamera, canvasElement: HTMLCanvasElement) {
    const dunceGeometry = new THREE.ConeGeometry(0.5, 1.5, 8);
    const material = new THREE.MeshBasicMaterial();
    const maximumCount = Math.max(data.objects.size + EXTRA_OBJECT_BUDGET, MIN_SIZE);

    super(dunceGeometry, material, maximumCount);

    // We now reduce the total number of items to be drawn to match the number of items in the
    // objects map. This prevents overdraw.
    this.count = data.objects.size;

    // BUG: ThreeJS does not preallocate this for us, it's instead lazily allocated the first time
    // setColorAt is called (using the current this.count value), this means that if we dynamically
    // reduce the size of the mesh (as above) and increase it at run time (as recommended), then
    // we will be unable to set colors on items above the initial count.
    this.instanceColor = new THREE.BufferAttribute(new Float32Array(maximumCount * 3), 3);

    this.data = data;
    this.camera = camera;
    this.prevZoom = camera.zoom;
    this.objectIdToInstanceId = new Map<string, number>();
    this.instanceIdToObjectId = new Map<number, string>();
    this.maximumCount = maximumCount;

    let instanceIdx = 0;
    for (const [, obj] of data.objects) {
      this.createFreshObject(instanceIdx, obj);
      instanceIdx += 1;
    }

    this.setupSubscriber();

    // Mark instances for update.
    this.instanceMatrix.needsUpdate = true;
    this.instanceColor!.needsUpdate = true;

    canvasElement.addEventListener('click', this.handleObjectClick.bind(this));
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
    const intersection = this.raycaster.intersectObject(this);
    if (intersection.length > 0) {
      const instanceId = intersection[0].instanceId;

      if (!instanceId || !this.instanceIdToObjectId.has(instanceId)) return;

      const evtToFire = new CustomEvent('objectSelected', {
        detail: { objectId: this.instanceIdToObjectId.get(instanceId) },
      });
      document.dispatchEvent(evtToFire);
    }
  }

  setupSubscriber() {
    this.data.objectUpdates.subscribe({
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
  }

  expandAttributes() {
    // We  expand the underlaying data structures here.
    const newMaxSize = Math.max(this.maximumCount + EXTRA_OBJECT_BUDGET, MIN_SIZE);
    const newInstanceMatrix = new THREE.BufferAttribute(new Float32Array(newMaxSize * 16), 16);
    const newInstanceColor = new THREE.BufferAttribute(new Float32Array(newMaxSize * 3), 3);

    // Copy the old Buffer Attributes into the new one.
    (newInstanceMatrix.array as Float32Array).set(this.instanceMatrix.array);
    (newInstanceColor.array as Float32Array).set(this.instanceColor!.array);

    // Overwrite the old buffer attributes.
    this.instanceMatrix = newInstanceMatrix;
    this.instanceColor = newInstanceColor;
    this.maximumCount = newMaxSize;
  }

  createFreshObject(instanceIdx: number, obj: MapValueType<DataProviderContextData['objects']>) {
    const dummy = new THREE.Object3D();

    dummy.position.set(obj.location[0], obj.location[1], obj.location[2]);
    const scaleFactor = this.calculateCurrentObjectScaleFactor(this.camera.zoom);
    dummy.scale.set(scaleFactor, scaleFactor, scaleFactor);
    dummy.updateMatrix();

    this.setColorAt(instanceIdx, getColorForTypeId(obj.objectTypeTag));
    this.setMatrixAt(instanceIdx, dummy.matrix);
    this.objectIdToInstanceId.set(obj.networkId, instanceIdx);
    this.instanceIdToObjectId.set(instanceIdx, obj.networkId);
  }

  updateObject(obj: MapValueType<DataProviderContextData['objects']>) {
    const instanceIdx = this.objectIdToInstanceId.get(obj.networkId);

    // If instance not found, bail
    if (instanceIdx === undefined) return;

    // Get the existing position from the instance
    const position = new THREE.Vector3();
    const matrix = new THREE.Matrix4();
    this.getMatrixAt(instanceIdx, matrix);
    position.setFromMatrixPosition(matrix);

    // Calculate the bearing between the old position and new
    const newPosition = new THREE.Vector3(obj.location[0], obj.location[1], obj.location[2]);
    const bearing = Math.PI - getBearingBetweenPoints(position.x, position.z, newPosition.x, newPosition.z);

    // We start with a cone facing upwards.
    // We then rotate it to the object's current bearing
    // We "knock" the cone down so it's the bearing.
    const newRotation = new THREE.Euler(Math.PI / 2, bearing, 0, 'ZYX');

    // Then apply that to the quat.
    const quaternion = new THREE.Quaternion();
    quaternion.setFromEuler(newRotation);

    const scaleFactor = this.calculateCurrentObjectScaleFactor(this.camera.zoom);
    const scale = new THREE.Vector3(scaleFactor, scaleFactor, scaleFactor);

    matrix.compose(newPosition, quaternion, scale);

    this.setMatrixAt(instanceIdx, matrix);
    this.instanceMatrix.needsUpdate = true;
  }

  removeObject(obj: MapValueType<DataProviderContextData['objects']>) {
    // If an object is deleted, then we're going to swap it out with an object at the end of the mesh
    // then reduce the total count of objects in the mesh.
    const idxToMoveTo = this.objectIdToInstanceId.get(obj.networkId);

    if (idxToMoveTo === undefined) return; // undefined behaviour

    const idxToMove = this.count - 1;
    const objectIdToMove = this.instanceIdToObjectId.get(idxToMove);

    if (objectIdToMove === undefined) return; // undefined behavior

    this.objectIdToInstanceId.delete(obj.networkId);
    this.instanceIdToObjectId.delete(idxToMove);
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
  }

  handleBeforeRender(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera
    // geometry: THREE.BufferGeometry,
    // material: THREE.Material,
    // group: THREE.Group
  ): void {
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
