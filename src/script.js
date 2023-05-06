import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import * as dat from "lil-gui"

const TEXTURES = [
  "ambientOcclusion",
  "color",
  "normal",
  "roughness",
  "alpha",
  "height",
  "metalness",
]

const loadTextures = (loader, objectName) =>
  TEXTURES.reduce((acc, next) => {
    acc[next] = loader.load(`/textures/${objectName}/${next}.jpg`)
    return acc
  }, {})

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector("canvas.webgl")

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const [
  bricksTextures,
  doorTextures,
  grassTextures,
  graveTextures,
  roofTextures,
  bushTextures,
] = ["bricks", "door", "grass", "grave", "roof", "bush"].map(o =>
  loadTextures(textureLoader, o)
)

// Floor
Object.keys(grassTextures).forEach(k => {
  const texture = grassTextures[k]
  texture.repeat.set(8, 8)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
})

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(10.5, 100),
  new THREE.MeshStandardMaterial({
    map: grassTextures.color,
    aoMap: grassTextures.ambientOcclusion,
    roughnessMap: grassTextures.roughness,
    normalMap: grassTextures.normal,
  })
)
floor.geometry.setAttribute(
  "uv2",
  new THREE.Float32BufferAttribute(floor.geometry.attributes.uv.array, 2)
)
floor.rotation.x = -Math.PI * 0.5
floor.position.y = 0
scene.add(floor)

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight("#b9d5ff", 0.2)
gui.add(ambientLight, "intensity").min(0).max(1).step(0.001)
scene.add(ambientLight)

// Directional light
const moonLight = new THREE.DirectionalLight("#b9d5ff", 0.2)
moonLight.position.set(4, 5, -2)
gui.add(moonLight, "intensity").min(0).max(1).step(0.001)
gui.add(moonLight.position, "x").min(-5).max(5).step(0.001)
gui.add(moonLight.position, "y").min(-5).max(5).step(0.001)
gui.add(moonLight.position, "z").min(-5).max(5).step(0.001)
scene.add(moonLight)

// Door light
const doorLight = new THREE.PointLight("#ff7d45", 1, 7)
doorLight.position.set(0, 2.2, 2.7)

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
)
camera.position.x = 4
camera.position.y = 2
camera.position.z = 5
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * House
 */
const house = new THREE.Group()

// Walls
const walls = new THREE.Mesh(
  new THREE.BoxGeometry(4, 2.6, 4),
  new THREE.MeshStandardMaterial({
    map: bricksTextures.color,
    aoMap: bricksTextures.ambientOcclusion,
    normalMap: bricksTextures.normal,
    roughnessMap: bricksTextures.roughness,
  })
)
walls.geometry.setAttribute(
  "uv2",
  new THREE.Float32BufferAttribute(walls.geometry.attributes.uv.array, 2)
)
walls.position.y = 2.6 / 2

// Roof
Object.keys(roofTextures).forEach(k => {
  const texture = roofTextures[k]
  texture.repeat.set(3, 3)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
})

const roof = new THREE.Mesh(
  new THREE.ConeGeometry(3.3, 1.3, 4, 20),
  new THREE.MeshStandardMaterial({
    color: "#b2b6b1",
    map: roofTextures.color,
    aoMap: roofTextures.ambientOcclusion,
    normalMap: roofTextures.normal,
    roughnessMap: roofTextures.roughness,
    displacementMap: roofTextures.height,
    displacementScale: 0.2,
  })
)
roof.geometry.setAttribute(
  "uv2",
  new THREE.Float32BufferAttribute(roof.geometry.attributes.uv.array, 2)
)
roof.position.y = 3.18
roof.rotateY(Math.PI / 4)

// Door
const door = new THREE.Mesh(
  new THREE.PlaneGeometry(2.2, 2.2, 100, 100),
  new THREE.MeshStandardMaterial({
    map: doorTextures.color,
    transparent: true,
    alphaMap: doorTextures.alpha,
    aoMap: doorTextures.ambientOcclusion,
    displacementMap: doorTextures.height,
    displacementScale: 0.1,
    normalMap: doorTextures.normal,
    metalnessMap: doorTextures.metalness,
    roughnessMap: doorTextures.roughness,
  })
)
door.geometry.setAttribute(
  "uv2",
  new THREE.Float32BufferAttribute(door.geometry.attributes.uv.array, 2)
)
door.position.z = 2 + 0.01
door.position.y = 1

// Bushes
Object.keys(bushTextures).forEach(k => {
  const texture = bushTextures[k]
  texture.repeat.set(2, 2)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
})

const bushGeometry = new THREE.SphereGeometry(1, 32, 32)
const bushMaterial = new THREE.MeshStandardMaterial({
  map: bushTextures.color,
  aoMap: bushTextures.ambientOcclusion,
  roughnessMap: bushTextures.roughness,
  normalMap: bushTextures.normal,
  displacementMap: bushTextures.height,
  displacementScale: 0.3,
})
bushGeometry.setAttribute(
  "uv2",
  new THREE.Float32BufferAttribute(bushGeometry.attributes.uv.array, 2)
)

const bushes = [
  [0.5, 0.8, 0.2, 2.2],
  [0.25, 1.4, 0.1, 2.1],
  [0.4, -0.8, 0.2, 2.2],
  [0.15, -1, 0.05, 2.6],
].map(scalePosition => {
  const bush = new THREE.Mesh(bushGeometry, bushMaterial)
  bush.position.set(...scalePosition.slice(1))
  bush.scale.set(...Array.from({ length: 3 }, () => scalePosition[0]))
  return bush
})

house.add(walls, roof, door, doorLight, ...bushes)

scene.add(house)

// Ghosts
const ghosts = ["#ff00ff", "#00ffff", "#ffff00"].map(
  color => new THREE.PointLight(color, 2, 3)
)

scene.add(...ghosts)

// Graves
const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2)
const graveMaterial = new THREE.MeshStandardMaterial({
  map: graveTextures.color,
  aoMap: graveTextures.ambientOcclusion,
  normalMap: graveTextures.normal,
  roughnessMap: graveTextures.roughness,
})
graveGeometry.setAttribute(
  "uv2",
  new THREE.Float32BufferAttribute(graveGeometry.attributes.uv.array, 2)
)

const graves = Array.from({ length: 60 }, () => {
  const angle = Math.random() * Math.PI * 2
  const radius = 3 + Math.random() * 6.8
  const x = Math.sin(angle) * radius
  const z = Math.cos(angle) * radius

  const grave = new THREE.Mesh(graveGeometry, graveMaterial)
  grave.position.set(x, 0.3, z)
  grave.rotation.y = (Math.random() - 0.5) * 0.7
  grave.rotation.z = (Math.random() - 0.5) * 0.4
  return grave
})

scene.add(...graves)

// Fog
const fog = new THREE.Fog("#2f2837", 1, 15)
scene.fog = fog

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas })
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor("#2f2837")

// Do shadows
renderer.shadowMap.enabled = true
const shadows = [
  moonLight,
  doorLight,
  ...ghosts,
  ...graves,
  walls,
  ...bushes,
].forEach(l => (l.castShadow = true))
const receiveShadow = [floor, walls].map(o => (o.receiveShadow = true))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  // Update ghosts
  ghosts.forEach((ghost, i) => {
    const isOdd = i % 2 === 0
    const angle = (isOdd ? elapsedTime : -elapsedTime) * (1.1 / (i + 1))
    const x =
      Math.cos(angle) *
      (i === ghosts.length - 1 ? 7 + Math.sin(elapsedTime * 0.4) : 4 + i)
    const z =
      Math.sin(angle) *
      (i === ghosts.length - 1 ? 7 + Math.sin(elapsedTime * 0.4) : 4 + i)
    const y =
      Math.sin(elapsedTime * (3 + i * 2)) +
      (isOdd ? Math.sin(elapsedTime * 2.5) : 0)
    ghost.position.set(x, y, z)
  })

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
