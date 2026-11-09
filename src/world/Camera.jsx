import { useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { world } from '../hooks/useWorldProgress'
import { cameraProfileAt } from '../animations/cameraAnimations'
import { damp, dampAngle } from './math'


/**
 * Third-person follow camera. The camera orbits the character at a profile-driven azimuth/radius, using
 * a heavily smoothed copy of the character's heading, so turns in the path never snap the view.
 */
export default function CameraRig() {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const st = useMemo(
    () => ({
      yaw: 0,
      az: 0,
      r: 6,
      h: 2,
      lookY: 1.4,
      ahead: 0,
      pos: new THREE.Vector3(),
      look: new THREE.Vector3(),
      want: new THREE.Vector3(),
      lookWant: new THREE.Vector3(),
      init: false,
    }),
    [],
  )

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    const p = cameraProfileAt(world.f)
    const portrait = size.width / size.height < 0.9
    const widen = portrait ? 1.0 + (0.9 - size.width / size.height) * 1.1 : 1

    // intro sweep: start high and wide, settle into the hero shot
    const e = world.introT
    const ease = e * e * (3 - 2 * e)
    const introR = 1 + (1 - ease) * 2.2
    const introH = (1 - ease) * 9
    const introAz = (1 - ease) * 0.9

    if (!st.init) {
      st.yaw = world.charYaw
      st.az = p.az
      st.r = p.r
      st.h = p.h
      st.lookY = p.lookY
      st.ahead = p.ahead
    }
    const lag = world.fast ? 2.2 : 3.2
    st.yaw = dampAngle(st.yaw, world.charYaw, lag, dt)
    st.az = damp(st.az, p.az, 2.6, dt)
    st.r = damp(st.r, p.r, 2.6, dt)
    st.h = damp(st.h, p.h, 2.6, dt)
    st.lookY = damp(st.lookY, p.lookY, 2.6, dt)
    st.ahead = damp(st.ahead, p.ahead, 2.6, dt)

    const a = st.yaw + st.az + introAz
    const r = st.r * widen * introR
    // angle 0 => camera sits behind the character (negative facing direction)
    st.want.set(world.charPos.x - Math.sin(a) * r, world.charPos.y + st.h * (portrait ? 1.1 : 1) + introH, world.charPos.z - Math.cos(a) * r)
    // In portrait the bottom sheet covers the lower half of the screen, so aim below the explorer to lift him into view.
    const lift = portrait ? 0.2 * st.r * widen : 0
    st.lookWant.set(
      world.charPos.x + Math.sin(st.yaw) * st.ahead,
      world.charPos.y + st.lookY - lift,
      world.charPos.z + Math.cos(st.yaw) * st.ahead,
    )

    if (!st.init) {
      st.pos.copy(st.want)
      st.look.copy(st.lookWant)
      st.init = true
    } else {
      const k = 1 - Math.exp(-(world.fast ? 3.0 : 4.2) * dt)
      st.pos.lerp(st.want, k)
      st.look.lerp(st.lookWant, 1 - Math.exp(-5 * dt))
    }
    camera.position.copy(st.pos)
    camera.lookAt(st.look)

    const fov = p.fov + (portrait ? 8 : 0)
    if (Math.abs(camera.fov - fov) > 0.05) {
      camera.fov = damp(camera.fov, fov, 3, dt)
      camera.updateProjectionMatrix()
    }
  })
  return null
}
