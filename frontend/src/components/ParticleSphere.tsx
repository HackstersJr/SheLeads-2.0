/**
 * ParticleSphere.tsx
 * Gemini Live-style animated particle sphere using Three.js + R3F.
 * Two modes:
 *   listening  → large warm golden sphere pulsing in the centre
 *   responding → small sphere shrinks to bottom centre, text streams above
 */
import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface SpherePointsProps {
    listening: boolean
    responding: boolean
}

function SpherePoints({ listening, responding }: SpherePointsProps) {
    const meshRef = useRef<THREE.Points>(null!)
    const COUNT = 1800

    const { positions, colors } = useMemo(() => {
        const positions = new Float32Array(COUNT * 3)
        const colors = new Float32Array(COUNT * 3)
        const phi = Math.PI * (3 - Math.sqrt(5))  // golden angle

        for (let i = 0; i < COUNT; i++) {
            const y = 1 - (i / (COUNT - 1)) * 2
            const r = Math.sqrt(1 - y * y)
            const th = phi * i
            positions[i * 3] = r * Math.cos(th)
            positions[i * 3 + 1] = y
            positions[i * 3 + 2] = r * Math.sin(th)

            // Warm amber dots interspersed with white dots
            if (i % 3 === 0) {
                colors[i * 3] = 1.0
                colors[i * 3 + 1] = 0.65
                colors[i * 3 + 2] = 0.1
            } else {
                colors[i * 3] = 0.95
                colors[i * 3 + 1] = 0.92
                colors[i * 3 + 2] = 0.88
            }
        }
        return { positions, colors }
    }, [])

    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry()
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
        return geo
    }, [positions, colors])

    useFrame((state) => {
        if (!meshRef.current) return
        const t = state.clock.elapsedTime

        // Rotation
        meshRef.current.rotation.y = t * 0.18
        meshRef.current.rotation.x = Math.sin(t * 0.08) * 0.15

        // Scale: big when listening, small when responding
        const targetScale = responding ? 0.35 : listening ? 1.0 : 0.55
        meshRef.current.scale.setScalar(
            THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.06)
        )

        // Position: keep it centered in its canvas
        meshRef.current.position.y = 0

        // Breathing pulse when listening
        if (listening && !responding) {
            const pulse = 1 + Math.sin(t * 1.8) * 0.05
            meshRef.current.scale.multiplyScalar(pulse)
        }
    })

    return (
        <points ref={meshRef} geometry={geometry}>
            <pointsMaterial
                size={0.028}
                vertexColors
                transparent
                opacity={0.92}
                sizeAttenuation
                depthWrite={false}
            />
        </points>
    )
}

interface ParticleSphereProps {
    listening: boolean
    responding: boolean
    className?: string
}

export function ParticleSphere({ listening, responding, className = '' }: ParticleSphereProps) {
    return (
        <div className={`${className} sphere-glow`} style={{ pointerEvents: 'none' }}>
            <Canvas
                camera={{ position: [0, 0, 2.8], fov: 55 }}
                gl={{ antialias: true, alpha: true }}
                style={{ background: 'transparent' }}
            >
                <ambientLight intensity={0.4} />
                <SpherePoints listening={listening} responding={responding} />
            </Canvas>
        </div>
    )
}
