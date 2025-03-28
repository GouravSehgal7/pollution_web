"use client"

import { useEffect, useRef } from "react"

export function HealthAnimation() {
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

    // Health icon class
    class HealthIcon {
      x: number
      y: number
      size: number
      type: "heart" | "lungs" | "mask" | "pill" | "doctor"
      speed: number
      opacity: number
      rotation: number
      rotationSpeed: number

      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 20 + 10
        this.type = this.getRandomType()
        this.speed = Math.random() * 0.5 + 0.1
        this.opacity = Math.random() * 0.3 + 0.1
        this.rotation = Math.random() * Math.PI * 2
        this.rotationSpeed = (Math.random() - 0.5) * 0.02
      }

      getRandomType(): "heart" | "lungs" | "mask" | "pill" | "doctor" {
        const types: ("heart" | "lungs" | "mask" | "pill" | "doctor")[] = ["heart", "lungs", "mask", "pill", "doctor"]
        return types[Math.floor(Math.random() * types.length)]
      }

      update() {
        // Move icons slowly
        this.y -= this.speed
        this.x += Math.sin(this.y * 0.01) * 0.5
        this.rotation += this.rotationSpeed

        // Reset if off screen
        if (
          this.y < -this.size ||
          this.y > canvas.height + this.size ||
          this.x < -this.size ||
          this.x > canvas.width + this.size
        ) {
          this.x = Math.random() * canvas.width
          this.y = canvas.height + this.size
          this.opacity = Math.random() * 0.3 + 0.1
        }
      }

      draw() {
        ctx.save()
        ctx.globalAlpha = this.opacity
        ctx.translate(this.x, this.y)
        ctx.rotate(this.rotation)

        switch (this.type) {
          case "heart":
            this.drawHeart()
            break
          case "lungs":
            this.drawLungs()
            break
          case "mask":
            this.drawMask()
            break
          case "pill":
            this.drawPill()
            break
          case "doctor":
            this.drawDoctor()
            break
        }

        ctx.restore()
      }

      drawHeart() {
        const s = this.size
        ctx.beginPath()
        ctx.moveTo(0, s * 0.3)
        ctx.bezierCurveTo(s * 0.3, -s * 0.3, s, s * 0.3, 0, s)
        ctx.bezierCurveTo(-s, s * 0.3, -s * 0.3, -s * 0.3, 0, s * 0.3)
        ctx.fillStyle = "rgba(236, 72, 153, 0.8)" // pink-500
        ctx.fill()
      }

      drawLungs() {
        const s = this.size

        // Left lung
        ctx.beginPath()
        ctx.moveTo(-s * 0.2, -s * 0.5)
        ctx.bezierCurveTo(-s * 0.8, -s * 0.3, -s * 0.8, s * 0.5, -s * 0.2, s * 0.5)
        ctx.lineTo(-s * 0.2, -s * 0.5)
        ctx.fillStyle = "rgba(147, 51, 234, 0.8)" // purple-600
        ctx.fill()

        // Right lung
        ctx.beginPath()
        ctx.moveTo(s * 0.2, -s * 0.5)
        ctx.bezierCurveTo(s * 0.8, -s * 0.3, s * 0.8, s * 0.5, s * 0.2, s * 0.5)
        ctx.lineTo(s * 0.2, -s * 0.5)
        ctx.fillStyle = "rgba(147, 51, 234, 0.8)" // purple-600
        ctx.fill()

        // Trachea
        ctx.beginPath()
        ctx.rect(-s * 0.1, -s * 0.7, s * 0.2, s * 0.4)
        ctx.fillStyle = "rgba(147, 51, 234, 0.8)" // purple-600
        ctx.fill()
      }

      drawMask() {
        const s = this.size

        // Mask body
        ctx.beginPath()
        ctx.ellipse(0, 0, s * 0.8, s * 0.5, 0, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(96, 165, 250, 0.8)" // blue-400
        ctx.fill()

        // Straps
        ctx.beginPath()
        ctx.moveTo(s * 0.7, -s * 0.2)
        ctx.lineTo(s * 1.2, -s * 0.5)
        ctx.moveTo(s * 0.7, s * 0.2)
        ctx.lineTo(s * 1.2, s * 0.5)
        ctx.moveTo(-s * 0.7, -s * 0.2)
        ctx.lineTo(-s * 1.2, -s * 0.5)
        ctx.moveTo(-s * 0.7, s * 0.2)
        ctx.lineTo(-s * 1.2, s * 0.5)
        ctx.strokeStyle = "rgba(96, 165, 250, 0.8)" // blue-400
        ctx.lineWidth = s * 0.1
        ctx.stroke()
      }

      drawPill() {
        const s = this.size

        // Pill capsule
        ctx.beginPath()
        ctx.ellipse(-s * 0.3, 0, s * 0.3, s * 0.15, 0, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(248, 113, 113, 0.8)" // red-400
        ctx.fill()

        ctx.beginPath()
        ctx.ellipse(s * 0.3, 0, s * 0.3, s * 0.15, 0, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(96, 165, 250, 0.8)" // blue-400
        ctx.fill()

        ctx.beginPath()
        ctx.rect(-s * 0.3, -s * 0.15, s * 0.6, s * 0.3)
        ctx.fillStyle = "rgba(248, 113, 113, 0.8)" // red-400
        ctx.fill()

        ctx.beginPath()
        ctx.rect(0, -s * 0.15, s * 0.3, s * 0.3)
        ctx.fillStyle = "rgba(96, 165, 250, 0.8)" // blue-400
        ctx.fill()
      }

      drawDoctor() {
        const s = this.size

        // Head
        ctx.beginPath()
        ctx.arc(0, -s * 0.5, s * 0.3, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
        ctx.fill()

        // Body
        ctx.beginPath()
        ctx.moveTo(-s * 0.4, -s * 0.2)
        ctx.lineTo(s * 0.4, -s * 0.2)
        ctx.lineTo(s * 0.3, s * 0.7)
        ctx.lineTo(-s * 0.3, s * 0.7)
        ctx.closePath()
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
        ctx.fill()

        // Stethoscope
        ctx.beginPath()
        ctx.arc(0, 0, s * 0.15, 0, Math.PI * 2)
        ctx.strokeStyle = "rgba(99, 102, 241, 0.8)" // indigo-500
        ctx.lineWidth = s * 0.05
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(0, s * 0.15)
        ctx.bezierCurveTo(s * 0.2, s * 0.3, s * 0.3, s * 0.4, s * 0.2, s * 0.6)
        ctx.strokeStyle = "rgba(99, 102, 241, 0.8)" // indigo-500
        ctx.lineWidth = s * 0.05
        ctx.stroke()
      }
    }

    // Create health icons
    const icons: HealthIcon[] = []
    for (let i = 0; i < 30; i++) {
      icons.push(new HealthIcon())
    }

    // Animation loop
    const animate = () => {
      // Clear canvas with gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, "rgba(0, 0, 0, 0)")
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)")

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw icons
      icons.forEach((icon) => {
        icon.update()
        icon.draw()
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

