"use client"

import { useEffect, useRef } from "react"

export function WaterPollutionAnimation() {
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

    // Pollutant class
    class Pollutant {
      x: number
      y: number
      size: number
      type: "oil" | "plastic" | "chemical" | "waste"
      speed: number
      rotation: number
      rotationSpeed: number
      color: string
      opacity: number

      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 15 + 5
        this.type = this.getRandomType()
        this.speed = Math.random() * 0.5 + 0.1
        this.rotation = Math.random() * Math.PI * 2
        this.rotationSpeed = (Math.random() - 0.5) * 0.02
        this.color = this.getColor()
        this.opacity = Math.random() * 0.7 + 0.3
      }

      getRandomType(): "oil" | "plastic" | "chemical" | "waste" {
        const types: ("oil" | "plastic" | "chemical" | "waste")[] = ["oil", "plastic", "chemical", "waste"]
        return types[Math.floor(Math.random() * types.length)]
      }

      getColor(): string {
        switch (this.type) {
          case "oil":
            return `rgba(30, 30, 30, ${this.opacity})`
          case "plastic":
            return `rgba(255, 255, 255, ${this.opacity})`
          case "chemical":
            return `rgba(0, 255, 0, ${this.opacity})`
          case "waste":
            return `rgba(139, 69, 19, ${this.opacity})`
          default:
            return `rgba(100, 100, 100, ${this.opacity})`
        }
      }

      update() {
        // Move pollutants
        this.y += Math.sin(this.x * 0.01) * 0.2
        this.x += this.speed
        this.rotation += this.rotationSpeed

        // Reset if off screen
        if (this.x > canvas.width + this.size) {
          this.x = -this.size
          this.y = Math.random() * canvas.height
        }
      }

      draw() {
        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.rotate(this.rotation)
        ctx.globalAlpha = this.opacity

        switch (this.type) {
          case "oil":
            // Draw oil slick
            ctx.beginPath()
            ctx.arc(0, 0, this.size, 0, Math.PI * 2)
            ctx.fillStyle = this.color
            ctx.fill()
            break
          case "plastic":
            // Draw plastic piece
            ctx.beginPath()
            ctx.rect(-this.size / 2, -this.size / 2, this.size, this.size)
            ctx.fillStyle = this.color
            ctx.fill()
            ctx.strokeStyle = "rgba(200, 200, 200, 0.5)"
            ctx.lineWidth = 1
            ctx.stroke()
            break
          case "chemical":
            // Draw chemical spill
            ctx.beginPath()
            for (let i = 0; i < 5; i++) {
              const angle = (i / 5) * Math.PI * 2
              const x = Math.cos(angle) * this.size
              const y = Math.sin(angle) * this.size
              if (i === 0) ctx.moveTo(x, y)
              else ctx.lineTo(x, y)
            }
            ctx.closePath()
            ctx.fillStyle = this.color
            ctx.fill()
            break
          case "waste":
            // Draw waste
            ctx.beginPath()
            ctx.moveTo(-this.size / 2, -this.size / 2)
            ctx.lineTo(this.size / 2, -this.size / 2)
            ctx.lineTo(0, this.size / 2)
            ctx.closePath()
            ctx.fillStyle = this.color
            ctx.fill()
            break
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

    // Create pollutants
    const pollutants: Pollutant[] = []
    for (let i = 0; i < 50; i++) {
      pollutants.push(new Pollutant())
    }

    // Create waves with more vibrant colors
    const waves: Wave[] = [
      new Wave(canvas.height * 0.85, 200, 20, 0.5, "rgba(0, 100, 255, 0.3)"),
      new Wave(canvas.height * 0.8, 150, 15, 0.7, "rgba(0, 150, 255, 0.3)"),
      new Wave(canvas.height * 0.75, 100, 10, 1, "rgba(0, 200, 255, 0.3)"),
    ]

    // Animation loop
    const animate = () => {
      // Clear canvas with gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, "rgba(0, 50, 100, 0.5)")
      gradient.addColorStop(0.5, "rgba(0, 100, 150, 0.5)")
      gradient.addColorStop(1, "rgba(0, 150, 200, 0.5)")

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw waves
      waves.forEach((wave) => {
        wave.update()
        wave.draw()
      })

      // Update and draw pollutants
      pollutants.forEach((pollutant) => {
        pollutant.update()
        pollutant.draw()
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

