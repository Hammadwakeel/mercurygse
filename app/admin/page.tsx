"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { 
  AlertCircle, 
  Upload, 
  FileText, 
  Trash2, 
  Download, 
  Plus, 
  FileDown,
  FileJson,
  CheckCircle2 // Imported for Success Alert
} from 'lucide-react'
import { ingestPdfStream } from "../../lib/api" 

// --- UI COMPONENTS ---

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary',
  size?: 'default' | 'sm' | 'lg' | 'icon'
}>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm font-bold uppercase tracking-wide ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
    
    const variants = {
      default: "bg-orange-600 text-white hover:bg-zinc-900 shadow-sm",
      secondary: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
      outline: "border border-zinc-300 bg-transparent hover:bg-zinc-100 text-zinc-900 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800",
      ghost: "hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-50",
      destructive: "bg-red-600 text-white hover:bg-red-700"
    }

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-8 rounded-sm px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className || ""}`}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`bg-white dark:bg-zinc-900 rounded-sm border border-zinc-200 dark:border-zinc-800 shadow-sm text-zinc-950 dark:text-zinc-50 ${className || ""}`}
      {...props}
    />
  )
)
Card.displayName = "Card"

const Alert = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "destructive" | "success" }>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={`relative w-full rounded-sm border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 ${
        variant === "destructive"
          ? "border-red-500/50 text-red-600 dark:border-red-500 [&>svg]:text-red-600 dark:border-red-900/50 dark:text-red-500 dark:dark:border-red-900 dark:[&>svg]:text-red-500"
          : variant === "success"
          ? "border-emerald-500/50 text-emerald-900 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-500/50 dark:text-emerald-50 [&>svg]:text-emerald-600 dark:[&>svg]:text-emerald-400"
          : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50 [&>svg]:text-zinc-950 dark:[&>svg]:text-zinc-50"
      } ${className || ""}`}
      {...props}
    />
  )
)
Alert.displayName = "Alert"

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`text-sm [&_p]:leading-relaxed ${className || ""}`}
      {...props}
    />
  )
)
AlertDescription.displayName = "AlertDescription"

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false)
  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [isDark])

  return (
    <Button variant="ghost" size="icon" onClick={() => setIsDark(!isDark)} className="rounded-full border border-zinc-200 dark:border-zinc-800">
      {isDark ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><circle cx="12" cy="12" r="5"/><path d="M12 1v2"/><path d="M12 21v2"/><path d="M4.22 4.22l1.42 1.42"/><path d="M17.56 17.56l1.42 1.42"/><path d="M1 12h2"/><path d="M21 12h2"/><path d="M4.22 19.78l1.42-1.42"/><path d="M17.56 6.44l1.42-1.42"/></svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-900"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
      )}
    </Button>
  )
}

// --- MAIN COMPONENT ---

interface UploadedFile {
  id: string
  name: string
  size: number
  uploadedAt: string
  downloadUrl?: string
  resultFileName?: string
}

export default function AdminDashboard() {
  const router = useRouter()

  // Remote files from ingestion service
  const [remoteUploadedPdfs, setRemoteUploadedPdfs] = useState<string[]>([])
  const [remoteGeneratedReports, setRemoteGeneratedReports] = useState<string[]>([])
  const [isFetchingRemote, setIsFetchingRemote] = useState(false)

  // State
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  
  // Alert States
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  // Single Upload States
  const [isSingleUploading, setIsSingleUploading] = useState(false)
  const [singleProgress, setSingleProgress] = useState(0)
  const [singleStatusMsg, setSingleStatusMsg] = useState("")

  // Bulk Upload States
  const [isBulkUploading, setIsBulkUploading] = useState(false)
  const [bulkProgress, setBulkProgress] = useState(0)
  const [bulkStatusMsg, setBulkStatusMsg] = useState("")

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  const handleSingleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    // Reset Alerts
    setErrorMessage("")
    setSuccessMessage("")
    
    setIsSingleUploading(true)
    setSingleProgress(0)
    setSingleStatusMsg("Starting upload...")

    const file = files[0]
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMessage("Only PDF files are allowed for single upload")
      setIsSingleUploading(false)
      return
    }

    await ingestPdfStream(file, {
      onProgress: (progress, message) => {
        setSingleProgress(progress)
        setSingleStatusMsg(message)
      },
      onError: (msg) => {
        setErrorMessage(msg) // Show Failure Alert
        setIsSingleUploading(false)
      },
      onComplete: (downloadUrl, fileName) => {
         const newFile: UploadedFile = {
            id: Date.now().toString(),
            name: file.name,
            size: file.size,
            uploadedAt: new Date().toISOString().split("T")[0],
            downloadUrl: downloadUrl || undefined,
            resultFileName: fileName || undefined
         }
         setUploadedFiles(prev => [newFile, ...prev])
         setSingleProgress(100)
         setSingleStatusMsg("Complete")
         
         // Show Success Alert
         setSuccessMessage("File successfully uploaded and processed.")
         
         setTimeout(() => setIsSingleUploading(false), 1000)
      }
    })
    
    event.target.value = ""
  }

  const handleBulkZipUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    // Reset Alerts
    setErrorMessage("")
    setSuccessMessage("")

    setIsBulkUploading(true)
    setBulkProgress(0)
    setBulkStatusMsg("Starting bulk upload...")

    const file = files[0]
    if (!file.name.toLowerCase().endsWith(".zip")) {
        setErrorMessage("Only ZIP files are allowed for bulk upload")
        setIsBulkUploading(false)
        return
    }

    await ingestPdfStream(file, {
        onProgress: (progress, message) => {
          setBulkProgress(progress)
          setBulkStatusMsg(message)
        },
        onError: (msg) => {
          setErrorMessage(msg) // Show Failure Alert
          setIsBulkUploading(false)
        },
        onComplete: (downloadUrl, fileName) => {
           const newFile: UploadedFile = {
              id: Date.now().toString(),
              name: file.name,
              size: file.size,
              uploadedAt: new Date().toISOString().split("T")[0],
              downloadUrl: downloadUrl || undefined,
              resultFileName: fileName || undefined
           }
           setUploadedFiles(prev => [newFile, ...prev])
           setBulkProgress(100)
           
           // Show Success Alert
           setSuccessMessage("Bulk archive successfully uploaded and processed.")
           
           setTimeout(() => setIsBulkUploading(false), 1000)
        }
      })

    event.target.value = ""
  }

  const handleDeleteFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id))
  }

  async function fetchRemoteFiles() {
    setIsFetchingRemote(true)
    try {
      const res = await fetch('https://hammad712-ingestion.hf.space/files/list')
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
      const data = await res.json()
      const newUploaded = Array.isArray(data.uploaded_pdfs) ? data.uploaded_pdfs : []
      const newReports = Array.isArray(data.generated_reports) ? data.generated_reports : []

      // Compare with existing and only update if changed
      const prevUploaded = remoteUploadedPdfs || []
      const prevReports = remoteGeneratedReports || []
      const uploadedChanged = JSON.stringify(prevUploaded) !== JSON.stringify(newUploaded)
      const reportsChanged = JSON.stringify(prevReports) !== JSON.stringify(newReports)

      if (uploadedChanged) {
        setRemoteUploadedPdfs(newUploaded)
        try { localStorage.setItem('remoteUploadedPdfs', JSON.stringify(newUploaded)) } catch {}
      }
      if (reportsChanged) {
        setRemoteGeneratedReports(newReports)
        try { localStorage.setItem('remoteGeneratedReports', JSON.stringify(newReports)) } catch {}
      }
    } catch (err: any) {
      console.error('Error fetching remote files', err)
      setErrorMessage(err?.message || 'Failed to fetch remote files')
    } finally {
      setIsFetchingRemote(false)
    }
  }

  useEffect(() => {
    // try to hydrate from cache first
    try {
      const cu = localStorage.getItem('remoteUploadedPdfs')
      const cr = localStorage.getItem('remoteGeneratedReports')
      if (cu) setRemoteUploadedPdfs(JSON.parse(cu))
      if (cr) setRemoteGeneratedReports(JSON.parse(cr))
    } catch {}

    fetchRemoteFiles()
  }, [])

  async function handleDownloadMd(filename: string) {
    try {
      setErrorMessage("")
      const url = `https://hammad712-ingestion.hf.space/files/download?filename=${encodeURIComponent(filename)}`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Download failed: ${res.status}`)
      const json = await res.json()
      const downloadUrl = json?.report_download_url
      if (!downloadUrl) throw new Error('No download URL returned')
      window.open(downloadUrl, '_blank')
    } catch (err: any) {
      console.error('Error downloading md', err)
      setErrorMessage(err?.message || 'Failed to download report')
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col p-4 md:p-8 relative overflow-hidden bg-zinc-50 dark:bg-zinc-950 font-sans">
      
      <div 
        className="absolute inset-0 opacity-5 text-zinc-900 dark:text-white pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative z-10 mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div className="flex items-center justify-between">
          {/* Left: Back button */}
          <div className="flex items-center">
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="inline-flex"
            >
              Back
            </Button>
          </div>

          {/* Center: Title and description */}
          <div className="text-center mx-4 flex-1">
            <h1 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
              PDF Management
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
              Upload fleet manuals, maintenance logs, and compliance reports.
            </p>
          </div>

          {/* Right: Theme toggle */}
          <div className="flex items-center">
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* ERROR ALERT */}
      {errorMessage && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-medium ml-2">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* SUCCESS ALERT */}
      {successMessage && (
        <Alert variant="success" className="mb-6">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription className="font-medium ml-2">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-8 relative z-10">
        
        {/* Single File Upload */}
        <Card className={`group relative overflow-hidden transition-all duration-300 ${isSingleUploading ? 'border-orange-500 ring-1 ring-orange-500' : 'hover:border-orange-500 dark:hover:border-orange-500'}`}>
          <div className={`absolute top-0 left-0 w-1 h-full transition-colors duration-300 ${isSingleUploading ? 'bg-orange-600' : 'bg-zinc-200 dark:bg-zinc-800 group-hover:bg-orange-600'}`} />
          <div className="p-6 md:p-8 pl-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-sm text-orange-600">
                <Upload className="w-6 h-6" />
              </div>
              <h2 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white uppercase tracking-wide">
                Single PDF Upload
              </h2>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6 text-sm">
              Upload individual fleet documents manually.
            </p>

            <div className="space-y-4">
              <label className="block">
                <div className={`relative border-2 border-dashed rounded-sm p-8 text-center cursor-pointer transition-all group/upload ${isSingleUploading ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10 cursor-not-allowed' : 'border-zinc-300 dark:border-zinc-700 hover:border-orange-500 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10'}`}>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleSingleFileUpload}
                    disabled={isSingleUploading || isBulkUploading}
                    className="hidden"
                  />
                  <FileText className={`w-12 h-12 mx-auto mb-3 transition-colors ${isSingleUploading ? 'text-orange-500 animate-pulse' : 'text-zinc-400 dark:text-zinc-600 group-hover/upload:text-orange-500'}`} />
                  <p className="text-zinc-900 dark:text-white font-bold uppercase text-sm tracking-wide">
                    {isSingleUploading ? "Processing..." : "Click to browse or drag & drop"}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                    PDF files only (Max 10MB)
                  </p>
                </div>
              </label>

              {/* Progress Bar ONLY for Single Upload */}
              {isSingleUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      {singleStatusMsg || "Processing..."}
                    </span>
                    <span className="text-xs font-bold text-orange-600">
                      {Math.round(singleProgress)}%
                    </span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-orange-600 h-full transition-all duration-300"
                      style={{ width: `${singleProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Bulk ZIP Upload */}
        <Card className={`group relative overflow-hidden transition-all duration-300 ${isBulkUploading ? 'border-orange-500 ring-1 ring-orange-500' : 'hover:border-orange-500 dark:hover:border-orange-500'}`}>
          <div className={`absolute top-0 left-0 w-1 h-full transition-colors duration-300 ${isBulkUploading ? 'bg-orange-600' : 'bg-zinc-200 dark:bg-zinc-800 group-hover:bg-orange-600'}`} />
          <div className="p-6 md:p-8 pl-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-sm text-zinc-600 dark:text-zinc-300">
                <Plus className="w-6 h-6" />
              </div>
              <h2 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white uppercase tracking-wide">
                Bulk ZIP Upload
              </h2>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6 text-sm">
              Batch upload multiple documents via ZIP archive.
            </p>

            <div className="space-y-4">
              <label className="block">
                <div className={`relative border-2 border-dashed rounded-sm p-8 text-center cursor-pointer transition-all group/upload ${isBulkUploading ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10 cursor-not-allowed' : 'border-zinc-300 dark:border-zinc-700 hover:border-orange-500 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10'}`}>
                  <input
                    type="file"
                    accept=".zip"
                    onChange={handleBulkZipUpload}
                    disabled={isSingleUploading || isBulkUploading}
                    className="hidden"
                  />
                  <FileText className={`w-12 h-12 mx-auto mb-3 transition-colors ${isBulkUploading ? 'text-orange-500 animate-pulse' : 'text-zinc-400 dark:text-zinc-600 group-hover/upload:text-orange-500'}`} />
                  <p className="text-zinc-900 dark:text-white font-bold uppercase text-sm tracking-wide">
                    {isBulkUploading ? "Processing..." : "Click to browse or drag & drop"}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                    ZIP files only (Max 50MB)
                  </p>
                </div>
              </label>

              {/* Progress Bar ONLY for Bulk Upload */}
              {isBulkUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      {bulkStatusMsg || "Processing Archive..."}
                    </span>
                    <span className="text-xs font-bold text-orange-600">
                      {Math.round(bulkProgress)}%
                    </span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-orange-600 h-full transition-all duration-300"
                      style={{ width: `${bulkProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Remote files from ingestion service */}
      <div className="grid md:grid-cols-2 gap-6 mb-6 relative z-10">
        <Card>
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-orange-600" />
              <h2 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white uppercase tracking-wide">
                Remote Uploaded PDFs <span className="text-zinc-400 ml-2">({remoteUploadedPdfs.length})</span>
              </h2>
              <div className="ml-auto">
                <Button variant="ghost" size="sm" onClick={fetchRemoteFiles} className="inline-flex">Refresh</Button>
              </div>
            </div>

            {isFetchingRemote ? (
              <div className="text-sm text-zinc-500">Loading...</div>
            ) : remoteUploadedPdfs.length === 0 ? (
              <div className="text-sm text-zinc-500">No remote uploaded PDFs found.</div>
            ) : (
              <div className="space-y-2">
                {remoteUploadedPdfs.map((name) => (
                  <div key={name} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-sm border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                      <FileText className="w-5 h-5 text-orange-600 flex-shrink-0" />
                      <div className="truncate text-sm font-medium">{name}</div>
                    </div>
                    <div className="mt-3 sm:mt-0 flex items-center gap-2 w-full sm:w-auto">
                      <Button variant="secondary" size="sm" className="w-full sm:w-auto" onClick={() => handleDownloadMd(name)}>Download</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <FileJson className="w-6 h-6 text-emerald-600" />
              <h2 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white uppercase tracking-wide">
                Generated Reports <span className="text-zinc-400 ml-2">({remoteGeneratedReports.length})</span>
              </h2>
              <div className="ml-auto">
                <Button variant="ghost" size="sm" onClick={fetchRemoteFiles} className="inline-flex">Refresh</Button>
              </div>
            </div>

            {isFetchingRemote ? (
              <div className="text-sm text-zinc-500">Loading...</div>
            ) : remoteGeneratedReports.length === 0 ? (
              <div className="text-sm text-zinc-500">No generated reports found.</div>
            ) : (
              <div className="space-y-2">
                {remoteGeneratedReports.map((name) => (
                  <div key={name} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-sm border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                      <FileJson className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <div className="truncate text-sm font-medium">{name}</div>
                    </div>
                    <div className="mt-3 sm:mt-0 flex items-center gap-2 w-full sm:w-auto">
                      <Button variant="secondary" size="sm" className="w-full sm:w-auto" onClick={() => handleDownloadMd(name)}>Download MD</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}