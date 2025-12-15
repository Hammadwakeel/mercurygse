const BASE_URL = "https://hammad712-rohde-auth.hf.space"
const INGESTION_BASE_URL = "https://hammad712-ingestion.hf.space"

export interface AuthResponse {
  access_token: string
  refresh_token: string
  token_type: string
  name?: string
  avatar?: string
}

export interface UserData {
  name: string
  email: string
  avatar: string
  role: string
}

export async function login(username: string, password: string): Promise<AuthResponse> {
  const formData = new URLSearchParams()
  formData.append("username", username)
  formData.append("password", password)
  formData.append("grant_type", "password")

  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail?.[0]?.msg || "Login failed")
  }

  return response.json()
}

export async function signup(
  name: string,
  email: string,
  password: string,
  avatar?: File
): Promise<AuthResponse> {
  const formData = new FormData()
  formData.append("name", name)
  formData.append("email", email)
  formData.append("password", password)
  formData.append("role", "user")
  
  if (avatar) {
    formData.append("avatar", avatar)
  }

  const response = await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail?.[0]?.msg || "Signup failed")
  }

  return response.json()
}

export async function getMe(accessToken: string): Promise<UserData> {
  const response = await fetch(`${BASE_URL}/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch user data")
  }

  return response.json()
}

export async function updateMe(
  accessToken: string,
  name?: string,
  email?: string,
  password?: string,
  avatar?: File
): Promise<UserData> {
  const formData = new FormData()
  
  if (name) formData.append("name", name)
  if (email) formData.append("email", email)
  if (password) formData.append("password", password)
  if (avatar) formData.append("avatar", avatar)

  const response = await fetch(`${BASE_URL}/auth/me`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail?.[0]?.msg || "Update failed")
  }

  return response.json()
}

export async function getAvatar(fileId: string): Promise<Blob> {
  const response = await fetch(`${BASE_URL}/auth/avatar/${fileId}`)

  if (!response.ok) {
    throw new Error("Failed to fetch avatar")
  }

  return response.blob()
}

export async function getAvatarImage(avatarPath: string): Promise<string | null> {
  try {
    if (!avatarPath) return null
    
    const fileId = avatarPath.split('/').pop()
    
    if (!fileId) return null
    
    const blob = await getAvatar(fileId)
    return URL.createObjectURL(blob)
  } catch (error) {
    console.error("[v0] Error loading avatar image:", error)
    return null
  }
}


// --- INGESTION ENDPOINTS ---

export interface IngestionEvent {
  job_id: string
  event: string
  pages_total?: number
  pages_processed?: number
  chunks?: number
  report_path?: string
  collection?: string
  batch_index?: number
  total_docs?: number
  reason?: string
  message?: string
  result?: {
    error?: string
    message?: string
    ingested?: number
    collection?: string
  }
}

export interface IngestionCallback {
  onProgress: (progress: number, message: string) => void
  onError: (message: string) => void
  onComplete: (downloadUrl: string | null, fileName: string | null) => void
}

export async function ingestPdfStream(
  file: File, 
  callbacks: IngestionCallback
): Promise<void> {
  const formData = new FormData()
  formData.append("file", file)

  try {
    const response = await fetch(`${INGESTION_BASE_URL}/process/pdf/stream`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(text || `HTTP Error ${response.status}`)
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    let buffer = ""
    
    // State tracking
    let totalPages = 1
    let jobId: string | null = null
    let reportPath: string | null = null

    if (reader) {
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          buffer = lines.pop() || "" 

          for (const line of lines) {
            const trimmed = line.trim()
            if (trimmed.startsWith("data: ")) {
              const jsonStr = trimmed.replace("data: ", "").trim()
              if (jsonStr === "[DONE]") continue

              try {
                const data: IngestionEvent = JSON.parse(jsonStr)
                console.log("Stream Event:", data)

                // Capture Job ID when available
                if (data.job_id) {
                    jobId = data.job_id
                }

                // Capture Report Path when available
                if (data.report_path) {
                    reportPath = data.report_path
                }

                switch (data.event) {
                  case "started":
                    totalPages = data.pages_total || 1
                    callbacks.onProgress(5, "Starting processing...")
                    break

                  case "report_saved":
                    const current = data.pages_processed || 0
                    const percent = Math.min(Math.round((current / totalPages) * 50), 50)
                    callbacks.onProgress(percent, `Analyzed page ${current} of ${totalPages}`)
                    break
                  
                  case "chunking_started":
                    callbacks.onProgress(60, "Chunking content...")
                    break

                  case "chunking_finished":
                    callbacks.onProgress(70, `Created ${data.chunks} chunks`)
                    break

                  case "ingest_started":
                    callbacks.onProgress(75, `Ingesting to ${data.collection || "vector db"}...`)
                    break

                  case "ingest_batch":
                    const ingested = data.ingested_so_far || 0
                    const totalDocs = data.total_docs || 1
                    // Scale progress from 75% to 95% based on batch
                    const batchProgress = 75 + Math.round((ingested / totalDocs) * 20)
                    callbacks.onProgress(batchProgress, `Ingesting batch ${data.batch_index}...`)
                    break

                  case "ingest_finished":
                  case "completed":
                    if (data.result?.error || (data.result as any)?.message) {
                        const msg = data.result?.message || "Ingestion error"
                         // Check for billing specific errors
                        if (data.result?.error === 'voyage_billing') {
                            callbacks.onError(msg)
                            return
                        }
                        console.warn("Ingestion warning:", msg)
                    }
                    callbacks.onProgress(95, "Finalizing...")
                    break
                  
                  case "worker_done":
                    callbacks.onProgress(100, "Done")
                    break
                }
              } catch (e) {
                console.warn("JSON Parse error", e)
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }
    }

    // After stream ends, check if we have a Job ID to fetch the file
    if (jobId) {
        callbacks.onProgress(100, "Downloading report...")
        try {
            const reportRes = await fetch(`${INGESTION_BASE_URL}/process/report/download/${jobId}`)
            
            if (reportRes.ok) {
                const blob = await reportRes.blob()
                const url = URL.createObjectURL(blob)
                
                // Determine filename
                let fileName = `report_${jobId}.md`
                if (reportPath) {
                    const parts = reportPath.split('/')
                    if (parts.length > 0) fileName = parts[parts.length - 1]
                }
                
                callbacks.onComplete(url, fileName)
            } else {
                console.warn(`Failed to download report for job ${jobId}: ${reportRes.status}`)
                // Mark complete without download if fetch failed (or 404)
                callbacks.onComplete(null, null) 
            }
        } catch (fetchErr) {
            console.error("Error fetching report blob:", fetchErr)
            callbacks.onComplete(null, null)
        }
    } else {
        callbacks.onComplete(null, null)
    }

  } catch (error) {
    callbacks.onError(error instanceof Error ? error.message : "Upload failed")
  }
}