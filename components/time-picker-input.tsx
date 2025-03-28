"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface TimePickerInputProps {
  value: string
  onChange: (time: string) => void
  disabled?: boolean
}

export function TimePickerInput({ value, onChange, disabled = false }: TimePickerInputProps) {
  const [hours, setHours] = useState<number>(0)
  const [minutes, setMinutes] = useState<number>(0)
  const [period, setPeriod] = useState<"AM" | "PM">("AM")
  const [open, setOpen] = useState(false)

  // Parse the time value when it changes
  useEffect(() => {
    if (value) {
      const [hourStr, minuteStr] = value.split(":")
      let hour = Number.parseInt(hourStr, 10)
      const minute = Number.parseInt(minuteStr, 10)

      let newPeriod: "AM" | "PM" = "AM"
      if (hour >= 12) {
        newPeriod = "PM"
        if (hour > 12) {
          hour -= 12
        }
      } else if (hour === 0) {
        hour = 12
      }

      setHours(hour)
      setMinutes(minute)
      setPeriod(newPeriod)
    }
  }, [value])

  // Format the time in 24-hour format for the onChange handler
  const updateTime = (newHours: number, newMinutes: number, newPeriod: "AM" | "PM") => {
    let hour24 = newHours

    // Convert to 24-hour format
    if (newPeriod === "PM" && newHours < 12) {
      hour24 = newHours + 12
    } else if (newPeriod === "AM" && newHours === 12) {
      hour24 = 0
    }

    const timeString = `${hour24.toString().padStart(2, "0")}:${newMinutes.toString().padStart(2, "0")}`
    onChange(timeString)
  }

  // Handle hour change
  const handleHourChange = (increment: boolean) => {
    const newHours = increment ? (hours % 12) + 1 : ((hours - 2 + 12) % 12) + 1

    setHours(newHours)
    updateTime(newHours, minutes, period)
  }

  // Handle minute change
  const handleMinuteChange = (increment: boolean) => {
    const newMinutes = increment ? (minutes + 5) % 60 : (minutes - 5 + 60) % 60

    setMinutes(newMinutes)
    updateTime(hours, newMinutes, period)
  }

  // Toggle AM/PM
  const togglePeriod = () => {
    const newPeriod = period === "AM" ? "PM" : "AM"
    setPeriod(newPeriod)
    updateTime(hours, minutes, newPeriod)
  }

  // Format display time
  const displayTime = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${period}`

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-full justify-start text-left font-normal bg-white/10 border-white/20 text-white hover:bg-white/20 ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={disabled}
        >
          <Clock className="mr-2 h-4 w-4" />
          {displayTime}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0 bg-black/80 border-white/20">
        <div className="p-4 bg-black/80">
          <div className="flex justify-center items-center space-x-2">
            <div className="flex flex-col items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleHourChange(true)}
                className="text-white hover:bg-white/10"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m18 15-6-6-6 6" />
                </svg>
              </Button>
              <div className="text-2xl font-bold text-white w-12 text-center">{hours.toString().padStart(2, "0")}</div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleHourChange(false)}
                className="text-white hover:bg-white/10"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </Button>
            </div>

            <div className="text-2xl font-bold text-white">:</div>

            <div className="flex flex-col items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleMinuteChange(true)}
                className="text-white hover:bg-white/10"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m18 15-6-6-6 6" />
                </svg>
              </Button>
              <div className="text-2xl font-bold text-white w-12 text-center">
                {minutes.toString().padStart(2, "0")}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleMinuteChange(false)}
                className="text-white hover:bg-white/10"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </Button>
            </div>

            <div className="flex flex-col items-center ml-2">
              <Button
                variant="outline"
                onClick={togglePeriod}
                className="h-10 bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                {period}
              </Button>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button
              variant="default"
              onClick={() => setOpen(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Done
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

