"use client"

import { useEffect, useRef } from "react"

export function WaterAnimationEnhanced() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Bubble class
    class Bubble {
      x: number
      y: number
      radius: number
      speed: number
      opacity: number
      color: string
      glowIntensity: number
      pulseDirection: number
      pulseSpeed: number

      constructor() {
        this.x = Math.random() * canvas.width
        this.y = canvas.height + Math.random() * 100
        this.radius = Math.random() * 8 + 2
        this.speed = Math.random() * 2 + 0.5
        this.opacity = Math.random() * 0.5 + 0.1
        this.color = `rgba(255, 255, 255, ${this.opacity})`
        this.glowIntensity = Math.random() * 10 + 5
        this.pulseDirection = Math.random() > 0.5 ? 1 : -1
        this.pulseSpeed = Math.random() * 0.02 + 0.01
      }

      update() {
        // Move bubbles slowly
        this.y -= this.speed

        // Slight horizontal movement
        this.x += Math.sin(this.y * 0.01) * 0.5

        // Pulsating glow effect
        this.glowIntensity += this.pulseDirection * this.pulseSpeed
        if (this.glowIntensity > 15 || this.glowIntensity < 5) {
          this.pulseDirection *= -1
        }

        // Reset if off screen
        if (this.y < -this.radius * 2) {
          this.y = canvas.height + Math.random() * 100
          this.x = Math.random() * canvas.width
          this.opacity = Math.random() * 0.5 + 0.1
        }
      }

      draw() {
        // Glow effect
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius + this.glowIntensity)
        gradient.addColorStop(0, `rgba(100, 200, 255, ${this.opacity})`)
        gradient.addColorStop(1, "rgba(100, 200, 255, 0)")

        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius + this.glowIntensity, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        // Bubble
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.fill()

        // Add highlight
        ctx.beginPath()
        ctx.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.2, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
        ctx.fill()
      }
    }

    // Particle class for floating debris
    class Particle {
      x: number
      y: number
      size: number
      color: string
      speedX: number
      speedY: number
      rotation: number
      rotationSpeed: number
      type: "leaf" | "debris" | "microplastic"

      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 5 + 2
        this.type = Math.random() > 0.7 ? "leaf" : Math.random() > 0.5 ? "debris" : "microplastic"

        if (this.type === "leaf") {
          this.color = `hsl(${Math.random() * 60 + 90}, 70%, 40%)`
          this.size = Math.random() * 8 + 4
        } else if (this.type === "debris") {
          this.color = `hsl(${Math.random() * 30}, 70%, 30%)`
        } else {
          this.color = `hsl(${Math.random() * 360}, 70%, 70%)`
          this.size = Math.random() * 3 + 1
        }

        this.speedX = (Math.random() - 0.5) * 0.5
        this.speedY = (Math.random() - 0.5) * 0.5
        this.rotation = Math.random() * Math.PI * 2
        this.rotationSpeed = (Math.random() - 0.5) * 0.02
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY
        this.rotation += this.rotationSpeed

        // Wrap around screen
        if (this.x < 0) this.x = canvas.width
        if (this.x > canvas.width) this.x = 0
        if (this.y < 0) this.y = canvas.height
        if (this.y > canvas.height) this.y = 0
      }

      draw() {
        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.rotate(this.rotation)

        if (this.type === "leaf") {
          // Draw leaf shape
          ctx.beginPath()
          ctx.ellipse(0, 0, this.size, this.size / 2, 0, 0, Math.PI * 2)
          ctx.fillStyle = this.color
          ctx.fill()

          // Leaf vein
          ctx.beginPath()
          ctx.moveTo(-this.size, 0)
          ctx.lineTo(this.size, 0)
          ctx.strokeStyle = `hsl(${Math.random() * 60 + 90}, 30%, 30%)`
          ctx.lineWidth = 0.5
          ctx.stroke()
        } else if (this.type === "debris") {
          // Draw irregular shape for debris
          ctx.beginPath()
          ctx.moveTo(0, -this.size)
          for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5
            const radius = this.size * (0.5 + Math.random() * 0.5)
            ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius)
          }
          ctx.closePath()
          ctx.fillStyle = this.color
          ctx.fill()
        } else {
          // Microplastic - small bright particles
          ctx.beginPath()
          ctx.arc(0, 0, this.size, 0, Math.PI * 2)
          ctx.fillStyle = this.color
          ctx.fill()
        }

        ctx.restore()
      }
    }

    // Wave class
    class Wave {
      points: { x: number; y: number }[]
      height: number
      segment: number
      wavelength: number
      amplitude: number
      speed: number
      color: string
      offset: number

      constructor(height: number, wavelength: number, amplitude: number, speed: number, color: string) {
        this.height = height
        this.wavelength = wavelength
        this.amplitude = amplitude
        this.speed = speed
        this.color = color
        this.offset = 0

        // Create wave points
        this.segment = 10
        this.points = []

        for (let x = 0; x <= canvas.width + this.segment; x += this.segment) {
          this.points.push({ x, y: 0 })
        }
      }

      update() {
        this.offset += this.speed

        // Update wave points
        for (let i = 0; i < this.points.length; i++) {
          const point = this.points[i]
          point.y = Math.sin((point.x + this.offset) / this.wavelength) * this.amplitude + this.height
        }
      }

      draw() {
        ctx.beginPath()
        ctx.moveTo(0, canvas.height)

        // Draw wave
        for (let i = 0; i < this.points.length; i++) {
          const point = this.points[i]
          ctx.lineTo(point.x, point.y)
        }

        // Complete the shape
        ctx.lineTo(canvas.width, canvas.height)
        ctx.closePath()

        // Fill with gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
        gradient.addColorStop(0, this.color)
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)")

        ctx.fillStyle = gradient
        ctx.fill()
      }
    }

    // Create bubbles
    const bubbles: Bubble[] = []
    for (let i = 0; i < 100; i++) {
      bubbles.push(new Bubble())
    }

    // Create particles
    const particles: Particle[] = []
    for (let i = 0; i < 50; i++) {
      particles.push(new Particle())
    }

    // Create waves with more vibrant colors
    const waves: Wave[] = [
      new Wave(canvas.height * 0.85, 200, 20, 0.5, "rgba(0, 150, 255, 0.3)"),
      new Wave(canvas.height * 0.8, 150, 15, 0.7, "rgba(0, 200, 255, 0.3)"),
      new Wave(canvas.height * 0.75, 100, 10, 1, "rgba(0, 230, 255, 0.3)"),
    ]

    // Light rays effect
    const drawLightRays = () => {
      const numRays = 5
      const rayWidth = canvas.width / numRays

      for (let i = 0; i < numRays; i++) {
        const x = i * rayWidth + Math.sin(Date.now() * 0.001 + i) * 50
        const width = rayWidth * 0.5

        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
        gradient.addColorStop(0, "rgba(255, 255, 255, 0.1)")
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)")

        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x + width, 0)
        ctx.lineTo(x + width * 0.5, canvas.height)
        ctx.closePath()
        ctx.fillStyle = gradient
        ctx.fill()
      }
    }

    // Animation loop
    const animate = () => {
      // Clear canvas with gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, "rgba(0, 50, 100, 0.5)")
      gradient.addColorStop(0.5, "rgba(0, 100, 150, 0.5)")
      gradient.addColorStop(1, "rgba(0, 150, 200, 0.5)")

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw light rays
      drawLightRays()

      // Update and draw waves
      waves.forEach((wave) => {
        wave.update()
        wave.draw()
      })

      // Update and draw particles
      particles.forEach((particle) => {
        particle.update()
        particle.draw()
      })

      // Update and draw bubbles
      bubbles.forEach((bubble) => {
        bubble.update()
        bubble.draw()
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10" />
}

