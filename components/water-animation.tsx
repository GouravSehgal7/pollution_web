"use client"

import { useEffect, useRef } from "react"

export function WaterAnimation() {
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

      constructor() {
        this.x = Math.random() * canvas.width
        this.y = canvas.height + Math.random() * 100
        this.radius = Math.random() * 8 + 2
        this.speed = Math.random() * 2 + 0.5
        this.opacity = Math.random() * 0.5 + 0.1
        this.color = `rgba(255, 255, 255, ${this.opacity})`
      }

      update() {
        this.y -= this.speed

        // Slight horizontal movement
        this.x += Math.sin(this.y * 0.01) * 0.5

        // Reset if off screen
        if (this.y < -this.radius * 2) {
          this.y = canvas.height + Math.random() * 100
          this.x = Math.random() * canvas.width
        }
      }

      draw() {
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

    // Create waves
    const waves: Wave[] = [
      new Wave(canvas.height * 0.85, 200, 20, 0.5, "rgba(0, 120, 255, 0.2)"),
      new Wave(canvas.height * 0.8, 150, 15, 0.7, "rgba(0, 150, 255, 0.2)"),
      new Wave(canvas.height * 0.75, 100, 10, 1, "rgba(0, 180, 255, 0.2)"),
    ]

    // Animation loop
    const animate = () => {
      // Clear canvas with gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, "rgba(0, 0, 0, 0)")
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)")

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw waves
      waves.forEach((wave) => {
        wave.update()
        wave.draw()
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

