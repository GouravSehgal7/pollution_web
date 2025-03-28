// API services for fetching environmental data

// Helper function to safely get user location with fallback
export async function getUserLocation(defaultLat = 28.6139, defaultLng = 77.209) {
  return new Promise<{ latitude: number; longitude: number }>((resolve) => {
    try {
      if (!navigator.geolocation) {
        console.log("Geolocation not supported, using default location")
        resolve({ latitude: defaultLat, longitude: defaultLng })
        return
      }

      // Set a timeout in case geolocation hangs
      const timeoutId = setTimeout(() => {
        console.log("Geolocation request timed out, using default location")
        resolve({ latitude: defaultLat, longitude: defaultLng })
      }, 5000)

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId)
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        (error) => {
          clearTimeout(timeoutId)
          console.log(`Geolocation error (${error.code}): ${error.message}, using default location`)
          // Log specific error codes for debugging
          if (error.code === 1) {
            console.log("Permission denied - user did not allow location access")
          } else if (error.code === 2) {
            console.log("Position unavailable - network error or satellites couldn't be reached")
          } else if (error.code === 3) {
            console.log("Timeout - took too long to get location")
          }
          resolve({ latitude: defaultLat, longitude: defaultLng })
        },
        {
          enableHighAccuracy: false,
          timeout: 4000,
          maximumAge: 60000,
        },
      )
    } catch (error) {
      console.error("Unexpected error getting location:", error)
      resolve({ latitude: defaultLat, longitude: defaultLng })
    }
  })
}

// Function to fetch UV data from Meersens API
export async function fetchUVData(latitude?: number, longitude?: number) {
  try {
    // If coordinates aren't provided, use default coordinates
    // Don't try to get user location here - it's already handled in the component
    if (latitude === undefined || longitude === undefined) {
      // Default to Delhi coordinates
      latitude = 28.6139
      longitude = 77.209
    }

    // In a real app, you would use the actual API endpoint
    // const response = await fetch(`https://api.meersens.com/environment/public/uv/current?lat=${latitude}&lng=${longitude}`);

    // For demonstration, we'll simulate the API response
    // This would be replaced with actual API calls in production
    const mockResponse = {
      status: "success",
      data: {
        location: {
          name: "Delhi, India",
          latitude,
          longitude,
        },
        current: {
          uv_index: 9.5,
          uv_category: "Very High",
          timestamp: new Date().toISOString(),
        },
        forecast: [
          { date: "2023-05-01", max_uv: 10.2, category: "Very High" },
          { date: "2023-05-02", max_uv: 9.8, category: "Very High" },
          { date: "2023-05-03", max_uv: 11.1, category: "Extreme" },
          { date: "2023-05-04", max_uv: 10.5, category: "Very High" },
          { date: "2023-05-05", max_uv: 9.2, category: "Very High" },
        ],
        sun_info: {
          sunrise: "06:15",
          sunset: "18:45",
          solar_noon: "12:30",
        },
        protection_required: true,
      },
    }

    return mockResponse.data
  } catch (error) {
    console.error("Error fetching UV data:", error)
    throw error
  }
}

// Function to fetch water quality data from Meersens API
export async function fetchWaterQualityData(latitude?: number, longitude?: number) {
  try {
    // If coordinates aren't provided, use default coordinates
    // Don't try to get user location here - it's already handled in the component
    if (latitude === undefined || longitude === undefined) {
      // Default to Delhi coordinates
      latitude = 28.6139
      longitude = 77.209
    }

    // In a real app, you would use the actual API endpoint
    // const response = await fetch(`https://api.meersens.com/environment/public/water/current?lat=${latitude}&lng=${longitude}`);

    // For demonstration, we'll simulate the API response
    const mockResponse = {
      status: "success",
      data: {
        location: {
          name: "Delhi Municipal Supply",
          latitude,
          longitude,
        },
        parameters: {
          ph: {
            value: 7.8,
            unit: "",
            safe_min: 6.5,
            safe_max: 8.5,
            is_safe: true,
          },
          tds: {
            value: 480,
            unit: "mg/L",
            safe_max: 500,
            is_safe: true,
          },
          hardness: {
            value: 320,
            unit: "mg/L",
            safe_max: 300,
            is_safe: false,
          },
          chlorine: {
            value: 3.2,
            unit: "mg/L",
            safe_max: 4,
            is_safe: true,
          },
          turbidity: {
            value: 4.5,
            unit: "NTU",
            safe_max: 5,
            is_safe: true,
          },
          bacteria: {
            value: 0,
            unit: "CFU/100mL",
            safe_max: 0,
            is_safe: true,
          },
        },
        overall_safety: "Moderate",
        timestamp: new Date().toISOString(),
        source: "Municipal Water Testing Lab",
      },
    }

    return mockResponse.data
  } catch (error) {
    console.error("Error fetching water quality data:", error)
    throw error
  }
}

// Function to fetch AQI data
export async function fetchAQIData(latitude?: number, longitude?: number) {
  try {
    // If coordinates aren't provided, use default coordinates
    // Don't try to get user location here - it's already handled in the component
    if (latitude === undefined || longitude === undefined) {
      // Default to Delhi coordinates
      latitude = 28.6139
      longitude = 77.209
    }

    // In a real app, you would use the actual API endpoint
    // const response = await fetch(`https://api.waqi.info/feed/geo:${latitude};${longitude}/?token=YOUR_TOKEN`);

    // For demonstration, we'll simulate the API response
    const mockResponse = {
      status: "ok",
      data: {
        aqi: 312,
        idx: 8024,
        attributions: [
          {
            url: "https://app.cpcbccr.com/",
            name: "CPCB - India Central Pollution Control Board",
          },
        ],
        city: {
          name: "Delhi, India",
          geo: [latitude, longitude],
        },
        dominentpol: "pm25",
        iaqi: {
          co: { v: 19 },
          h: { v: 54 },
          no2: { v: 46 },
          o3: { v: 7 },
          p: { v: 989 },
          pm10: { v: 489 },
          pm25: { v: 187 },
          so2: { v: 8 },
          t: { v: 21 },
          w: { v: 1 },
        },
        time: {
          s: new Date().toISOString(),
          tz: "+05:30",
        },
        forecast: {
          daily: {
            pm25: [
              { avg: 220, day: "2023-05-01", max: 250, min: 190 },
              { avg: 250, day: "2023-05-02", max: 280, min: 220 },
              { avg: 280, day: "2023-05-03", max: 310, min: 250 },
              { avg: 260, day: "2023-05-04", max: 290, min: 230 },
              { avg: 240, day: "2023-05-05", max: 270, min: 210 },
              { avg: 230, day: "2023-05-06", max: 260, min: 200 },
              { avg: 220, day: "2023-05-07", max: 250, min: 190 },
            ],
          },
        },
      },
    }

    return mockResponse.data
  } catch (error) {
    console.error("Error fetching AQI data:", error)
    throw error
  }
}

