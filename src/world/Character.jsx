import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getMats } from './materials'
import { damp, dampAngle } from './math'
import { world, getUI } from '../hooks/useWorldProgress'
import { posAt, tanAt, F } from './WorldPath'
import { dwellAt } from './journey'
import { ANIMS, POSE_KEYS, blend } from '../animations/characterAnimations'
import { stepWorld } from '../animations/scrollController'


/**
 * THE EXPLORER — a modular, procedurally-built hooded traveller (no external asset, no licensing risk).
 * Everything that moves is a named joint group, driven by characterAnimations.js. To use a rigged GLB
 * instead, replace the contents of <group ref={joints.root}> and map the same animation names to clips.
 *
 * This component also owns the per-frame world step (scroll -> position -> pose) so that position,
 * rotation and animation can never drift out of sync.
 */
export default function Character() {
  const m = getMats()
  const root = useRef()
  const j = useRef({})
  const ref = (name) => (el) => {
    j.current[name] = el
  }

  const state = useMemo(
    () => ({
      weights: Object.fromEntries(ANIMS.map((a) => [a, a === 'idle' ? 1 : 0])),
      pose: Object.fromEntries(POSE_KEYS.map((k) => [k, 0])),
      cur: Object.fromEntries(POSE_KEYS.map((k) => [k, 0])),
      phase: 0,
      yaw: 0,
      t: 0,
      tan: new THREE.Vector3(),
      pos: new THREE.Vector3(),
      face: new THREE.Vector3(),
      init: false,
    }),
    [],
  )

  useLayoutEffect(() => {
    root.current.traverse((o) => {
      if (o.isMesh) o.castShadow = true
    })
  }, [])

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    const reduced = getUI().reducedMotion
    state.t += dt

    stepWorld(dt, reduced)

    posAt(world.f, state.pos)
    tanAt(world.f, state.tan)
    const tangentYaw = Math.atan2(state.tan.x, state.tan.z)
    if (!state.init) {
      state.yaw = tangentYaw
      state.init = true
    }

    const walking = world.speed > 0.35
    const dwell = !walking ? dwellAt(world.target) : null
    const act = walking ? 'walk' : dwell?.act ?? 'idle'
    world.act = act

    // Facing: along the path while travelling; towards the point of interest while a dwell has one.
    let desiredYaw = tangentYaw
    if (!walking && dwell) {
      if (dwell.face) {
        state.face.copy(dwell.face).sub(state.pos)
        desiredYaw = Math.atan2(state.face.x, state.face.z)
      } else if (dwell.faceWp != null) {
        const p = posAt(F(dwell.faceWp), state.face).sub(state.pos)
        desiredYaw = Math.atan2(p.x, p.z)
      }
    }
    state.yaw = dampAngle(state.yaw, desiredYaw, walking ? 7 : 3.5, dt)
    world.charYaw = state.yaw

    // Animation weights chase a one-hot target, so animations cross-fade.
    for (const a of ANIMS) state.weights[a] = damp(state.weights[a], a === act ? 1 : 0, 7, dt)
    state.phase += dt * Math.min(16, world.speed * 3.9)
    blend(state.pose, state.weights, state.t, state.phase)

    // Apply, with a final per-joint damp so no pose ever pops.
    const c = state.cur
    for (const k of POSE_KEYS) c[k] = damp(c[k], state.pose[k], 16, dt)
    const J = j.current
    const sprint = THREE.MathUtils.clamp((world.speed - 8) / 14, 0, 1)

    root.current.position.copy(state.pos)
    root.current.rotation.y = state.yaw
    world.charPos.copy(state.pos)

    J.hips.position.y = c.hipsY
    J.spine.rotation.set(c.spineX + sprint * 0.2, c.spineY, 0)
    J.head.rotation.set(c.headX, c.headY, 0)
    J.lHip.rotation.x = c.lHip
    J.rHip.rotation.x = c.rHip
    J.lKnee.rotation.x = c.lKnee
    J.rKnee.rotation.x = c.rKnee
    J.lSh.rotation.set(c.lShX, 0, c.lShZ)
    J.rSh.rotation.set(c.rShX, 0, c.rShZ)
    J.lElb.rotation.x = c.lElb
    J.rElb.rotation.x = c.rElb
    J.cloak.rotation.x = c.cloakX
    const b = Math.max(0.0001, c.book)
    J.book.scale.setScalar(b)
    J.book.visible = c.book > 0.04
  })

  return (
    <group ref={root} scale={0.96}>
      <group ref={ref('hips')} position={[0, 0.95, 0]}>
        <mesh material={m.leatherDark} position={[0, 0, 0]}>
          <boxGeometry args={[0.31, 0.2, 0.2]} />
        </mesh>

        {[
          ['lHip', 'lKnee', 0.1],
          ['rHip', 'rKnee', -0.1],
        ].map(([hip, knee, x]) => (
          <group key={hip} ref={ref(hip)} position={[x, -0.04, 0]}>
            <mesh material={m.leatherDark} position={[0, -0.22, 0]}>
              <cylinderGeometry args={[0.078, 0.06, 0.45, 8]} />
            </mesh>
            <group ref={ref(knee)} position={[0, -0.45, 0]}>
              <mesh material={m.leather} position={[0, -0.21, 0]}>
                <cylinderGeometry args={[0.062, 0.05, 0.43, 8]} />
              </mesh>
              <mesh material={m.leatherDark} position={[0, -0.43, 0.05]}>
                <boxGeometry args={[0.115, 0.1, 0.26]} />
              </mesh>
              <mesh material={m.leather} position={[0, -0.3, 0]}>
                <cylinderGeometry args={[0.068, 0.062, 0.2, 8]} />
              </mesh>
            </group>
          </group>
        ))}

        <group ref={ref('spine')} position={[0, 0.1, 0]}>
          <mesh material={m.leather} position={[0, 0.25, 0]} scale={[1, 1, 0.75]}>
            <cylinderGeometry args={[0.175, 0.145, 0.5, 10]} />
          </mesh>
          <mesh material={m.leatherDark} position={[0, 0.03, 0]} scale={[1, 1, 0.8]}>
            <cylinderGeometry args={[0.152, 0.152, 0.07, 10]} />
          </mesh>
          <mesh material={m.gold} position={[0, 0.03, 0.125]}>
            <boxGeometry args={[0.06, 0.05, 0.02]} />
          </mesh>

          {/* backpack, bedroll and chest straps */}
          <mesh material={m.pack} position={[0, 0.27, -0.2]}>
            <boxGeometry args={[0.3, 0.38, 0.14]} />
          </mesh>
          <mesh material={m.leatherDark} position={[0, 0.5, -0.2]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.065, 0.065, 0.34, 8]} />
          </mesh>
          {[-0.11, 0.11].map((x) => (
            <mesh key={x} material={m.leatherDark} position={[x, 0.27, 0.115]}>
              <boxGeometry args={[0.035, 0.46, 0.03]} />
            </mesh>
          ))}

          {/* cloak, hinged at the shoulders so it can sway */}
          <group ref={ref('cloak')} position={[0, 0.53, -0.02]}>
            <mesh material={m.cloak} position={[0, -0.52, 0]} scale={[1, 1, 0.92]}>
              <cylinderGeometry args={[0.215, 0.4, 1.05, 14, 1, true, 0.75, Math.PI * 2 - 1.5]} />
            </mesh>
          </group>
          <mesh material={m.gold} position={[-0.12, 0.46, 0.165]}>
            <sphereGeometry args={[0.028, 8, 8]} />
          </mesh>

          {/* arms */}
          {[
            ['lSh', 'lElb', 0.215],
            ['rSh', 'rElb', -0.215],
          ].map(([sh, elb, x]) => (
            <group key={sh} ref={ref(sh)} position={[x, 0.46, 0]}>
              <mesh material={m.leather} position={[0, -0.15, 0]}>
                <cylinderGeometry args={[0.055, 0.048, 0.3, 8]} />
              </mesh>
              <group ref={ref(elb)} position={[0, -0.3, 0]}>
                <mesh material={m.leatherDark} position={[0, -0.14, 0]}>
                  <cylinderGeometry args={[0.046, 0.04, 0.28, 8]} />
                </mesh>
                <mesh material={m.skin} position={[0, -0.3, 0]}>
                  <sphereGeometry args={[0.045, 8, 8]} />
                </mesh>
              </group>
            </group>
          ))}

          {/* the book he reads while interacting */}
          <group ref={ref('book')} position={[0, 0.3, 0.3]} rotation={[-0.55, 0, 0]} visible={false}>
            <mesh material={m.woodDark}>
              <boxGeometry args={[0.3, 0.04, 0.22]} />
            </mesh>
            <mesh material={m.parchment} position={[0, 0.026, 0]}>
              <boxGeometry args={[0.27, 0.025, 0.2]} />
            </mesh>
            <mesh material={m.gold} position={[0, 0.0, 0.112]}>
              <boxGeometry args={[0.3, 0.042, 0.012]} />
            </mesh>
          </group>

          {/* head and hood */}
          <group ref={ref('head')} position={[0, 0.56, 0]}>
            <mesh material={m.skin} position={[0, 0.02, 0]}>
              <cylinderGeometry args={[0.05, 0.055, 0.09, 8]} />
            </mesh>
            <mesh material={m.skin} position={[0, 0.14, 0]} scale={[1, 1.1, 1.02]}>
              <sphereGeometry args={[0.112, 14, 12]} />
            </mesh>
            {[-0.04, 0.04].map((x) => (
              <mesh key={x} material={m.dark} position={[x, 0.15, 0.1]}>
                <sphereGeometry args={[0.013, 6, 6]} />
              </mesh>
            ))}
            <mesh material={m.cloak} position={[0, 0.15, -0.005]} scale={[1, 1.08, 1.08]}>
              <sphereGeometry args={[0.15, 16, 12, Math.PI / 2 + 0.95, Math.PI * 2 - 1.9, 0, 2.55]} />
            </mesh>
            <mesh material={m.cloak} position={[0, 0.04, -0.15]} rotation={[-2.5, 0, 0]}>
              <coneGeometry args={[0.1, 0.22, 8]} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  )
}

