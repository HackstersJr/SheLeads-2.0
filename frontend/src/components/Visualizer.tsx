import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as random from 'maath/random/dist/maath-random.esm'

interface ParticleSphereProps {
    state?: 'idle' | 'listening' | 'speaking'
}

function ParticleSphere({ state = 'idle' }: ParticleSphereProps) {
    const ref = useRef<any>(null)

    // Create 5000 points randomly distributed inside a sphere
    const sphere = useMemo(() => {
        const positions = new Float32Array(5000 * 3)
        random.inSphere(positions, { radius: 1.5 })
        return positions
    }, [])

    useFrame((stateObj, delta) => {
        if (!ref.current) return

        // Base rotation
        ref.current.rotation.x -= delta / 10
        ref.current.rotation.y -= delta / 15

        // Dynamic reaction based on state
        if (state === 'listening') {
            ref.current.rotation.x -= delta / 2
            ref.current.rotation.y -= delta / 2
            // Pulsate scale slightly
            const scaleBase = 1.0 + Math.sin(stateObj.clock.elapsedTime * 8) * 0.05
            ref.current.scale.set(scaleBase, scaleBase, scaleBase)
        } else if (state === 'speaking') {
            ref.current.rotation.x += delta / 3
            ref.current.rotation.y += delta / 3
            // Stronger pulsing for speaking
            const scaleBase = 1.0 + Math.sin(stateObj.clock.elapsedTime * 12) * 0.1
            ref.current.scale.set(scaleBase, scaleBase, scaleBase)
        } else {
            // Idle slow breathing
            const scaleBase = 1.0 + Math.sin(stateObj.clock.elapsedTime * 2) * 0.02
            ref.current.scale.set(scaleBase, scaleBase, scaleBase)
        }
    })

    // Colors based on state
    const color =
        state === 'listening' ? '#a3e635' : // Lime-400
            state === 'speaking' ? '#fde047' : // Yellow-300
                '#22c55e' // Green-500

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
                <PointMaterial
                    transparent
                    color={color}
                    size={0.05}
                    sizeAttenuation={true}
                    depthWrite={false}
                />
            </Points>
        </group>
    )
}

export default function Visualizer({ state = 'idle' }: ParticleSphereProps) {
    return (
        <div className="absolute inset-0 z-0">
            <Canvas camera={{ position: [0, 0, 5] }}>
                <ParticleSphere state={state} />
            </Canvas>
        </div>
    )
}
