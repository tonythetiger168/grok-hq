import * as THREE from 'three'

export function std(color, roughness = 0.92, extra = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness: extra.metalness ?? 0,
    emissive: new THREE.Color('#000000'),
    ...extra,
  })
}

export function box(parent, w, h, d, x, y, z, material, cast = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material)
  mesh.position.set(x, y, z)
  mesh.castShadow = cast
  mesh.receiveShadow = true
  parent.add(mesh)
  return mesh
}

export function cyl(parent, radiusTop, radiusBottom, height, x, y, z, material, segments = 18, cast = true) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments),
    material,
  )
  mesh.position.set(x, y, z)
  mesh.castShadow = cast
  mesh.receiveShadow = true
  parent.add(mesh)
  return mesh
}

export function worldPoint(x, z, yaw, lx, lz) {
  const anchor = new THREE.Object3D()
  anchor.position.set(x, 0, z)
  anchor.rotation.y = yaw
  anchor.updateMatrixWorld()
  return anchor.localToWorld(new THREE.Vector3(lx, 0, lz))
}

export function damp(current, target, lambda, dt) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt))
}

export function dampAngle(current, target, lambda, dt) {
  const diff = Math.atan2(Math.sin(target - current), Math.cos(target - current))
  return current + diff * (1 - Math.exp(-lambda * dt))
}
