"use client"

import React, { useState, useEffect } from "react"
import { 
  AlertCircle, 
  Upload, 
  FileText, 
  Trash2, 
  Download, 
  Plus, 
  CheckCircle2 
} from 'lucide-react'

// --- MOCK UI COMPONENTS (Inlined for Preview) ---

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'outline' | 'ghost' | 'destructive' }>(
  ({ className, variant = 'default', ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm font-bold uppercase tracking-wide ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
    const variants = {
      default: "bg-orange-600 text-white hover:bg-zinc-900 shadow-sm",
      outline: "border border-zinc-300 bg-transparent hover:bg-zinc-100 text-zinc-900 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800",
      ghost: "hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-50",
      destructive: "bg-red-600 text-white hover:bg-red-700"
    }
    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${className || ""}`}
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

const Alert = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "destructive" }>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={`relative w-full rounded-sm border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-zinc-950 dark:[&>svg]:text-zinc-50 ${
        variant === "destructive"
          ? "border-red-500/50 text-red-600 dark:border-red-500 [&>svg]:text-red-600 dark:border-red-900/50 dark:text-red-500 dark:dark:border-red-900 dark:[&>svg]:text-red-500"
          : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
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

// Mock Theme Toggle
const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false)
  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [isDark])

  return (
    <Button variant="ghost" size="icon" onClick={() => setIsDark(!isDark)} className="rounded-full w-10 h-10 border border-zinc-200 dark:border-zinc-800">
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
  progress?: number
}

export default function AdminDashboard() {
  // Mock Router
  const router = { push: (path: string) => console.log(`Navigating to ${path}`) }

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([
    {
      id: "1",
      name: "Mercury_Fleet_Report_Q3.pdf",
      size: 2048576,
      uploadedAt: "2024-11-15",
    },
  ])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState("")

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  const handleSingleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files
    if (!files) return

    setUploading(true)
    setErrorMessage("")

    try {
      Array.from(files).forEach((file) => {
        if (!file.name.toLowerCase().endsWith(".pdf")) {
          throw new Error("Only PDF files are allowed for single upload")
        }

        // Simulate upload progress
        let progress = 0
        const interval = setInterval(() => {
          progress += Math.random() * 30
          if (progress >= 100) {
            progress = 100
            clearInterval(interval)

            const newFile: UploadedFile = {
              id: Date.now().toString(),
              name: file.name,
              size: file.size,
              uploadedAt: new Date().toISOString().split("T")[0],
            }
            setUploadedFiles((prev) => [newFile, ...prev])
            setUploadProgress(0)
          } else {
            setUploadProgress(progress)
          }
        }, 500)
      })
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Upload failed"
      )
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }

  const handleBulkZipUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files
    if (!files) return

    setUploading(true)
    setErrorMessage("")

    try {
      Array.from(files).forEach((file) => {
        if (!file.name.toLowerCase().endsWith(".zip")) {
          throw new Error("Only ZIP files are allowed for bulk upload")
        }

        let progress = 0
        const interval = setInterval(() => {
          progress += Math.random() * 25
          if (progress >= 100) {
            progress = 100
            clearInterval(interval)

            // Simulate extracting multiple PDFs from zip
            const pdfCount = Math.floor(Math.random() * 5) + 1
            for (let i = 0; i < pdfCount; i++) {
              const newFile: UploadedFile = {
                id: Date.now().toString() + i,
                name: `Fleet_Maintenance_Log_${i + 1}.pdf`,
                size: Math.floor(Math.random() * 5000000) + 1000000,
                uploadedAt: new Date().toISOString().split("T")[0],
              }
              setUploadedFiles((prev) => [newFile, ...prev])
            }
            setUploadProgress(0)
          } else {
            setUploadProgress(progress)
          }
        }, 400)
      })
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Upload failed"
      )
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id))
  }

  return (
    <div className="min-h-screen w-full flex flex-col p-4 md:p-8 relative overflow-hidden bg-zinc-50 dark:bg-zinc-950 font-sans">
      
      {/* Industrial Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-5 text-zinc-900 dark:text-white pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex justify-between items-end mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <span className="bg-orange-600 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm tracking-widest">Admin Portal</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
            PDF Management
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-md">
            Upload fleet manuals, maintenance logs, and compliance reports.
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <ThemeToggle />
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="hidden md:inline-flex"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <Alert variant="destructive" className="mb-6 border-red-600 bg-red-50 dark:bg-red-900/20">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800 dark:text-red-300 font-medium ml-2">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Upload Sections */}
      <div className="grid md:grid-cols-2 gap-6 mb-8 relative z-10">
        
        {/* Single File Upload */}
        <Card className="group relative overflow-hidden hover:border-orange-500 dark:hover:border-orange-500 transition-all duration-300">
          <div className="absolute top-0 left-0 w-1 h-full bg-zinc-200 dark:bg-zinc-800 group-hover:bg-orange-600 transition-colors duration-300" />
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
                <div className="relative border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-sm p-8 text-center cursor-pointer hover:border-orange-500 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all group/upload">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleSingleFileUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  <FileText className="w-12 h-12 text-zinc-400 dark:text-zinc-600 group-hover/upload:text-orange-500 transition-colors mx-auto mb-3" />
                  <p className="text-zinc-900 dark:text-white font-bold uppercase text-sm tracking-wide">
                    Click to browse or drag & drop
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                    PDF files only (Max 10MB)
                  </p>
                </div>
              </label>

              {/* Progress Bar */}
              {uploading && uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Uploading...
                    </span>
                    <span className="text-xs font-bold text-orange-600">
                      {Math.round(uploadProgress)}%
                    </span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-orange-600 h-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Bulk ZIP Upload */}
        <Card className="group relative overflow-hidden hover:border-orange-500 dark:hover:border-orange-500 transition-all duration-300">
          <div className="absolute top-0 left-0 w-1 h-full bg-zinc-200 dark:bg-zinc-800 group-hover:bg-orange-600 transition-colors duration-300" />
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
                <div className="relative border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-sm p-8 text-center cursor-pointer hover:border-orange-500 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all group/upload">
                  <input
                    type="file"
                    accept=".zip"
                    onChange={handleBulkZipUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  <FileText className="w-12 h-12 text-zinc-400 dark:text-zinc-600 group-hover/upload:text-orange-500 transition-colors mx-auto mb-3" />
                  <p className="text-zinc-900 dark:text-white font-bold uppercase text-sm tracking-wide">
                    Click to browse or drag & drop
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                    ZIP files only (Max 50MB)
                  </p>
                </div>
              </label>

              {/* Progress Bar */}
              {uploading && uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Processing Archive...
                    </span>
                    <span className="text-xs font-bold text-orange-600">
                      {Math.round(uploadProgress)}%
                    </span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-orange-600 h-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* File Gallery */}
      <Card className="relative z-10 border-t-4 border-t-orange-600 rounded-sm">
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-6 h-6 text-orange-600" />
            <h2 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white uppercase tracking-wide">
              Uploaded Documents <span className="text-zinc-400 ml-2">({uploadedFiles.length})</span>
            </h2>
          </div>

          {uploadedFiles.length === 0 ? (
            <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-sm border-dashed">
              <FileText className="w-16 h-16 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-wide">
                No files uploaded yet
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-2">
                Start by uploading your first PDF or ZIP file above
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="group flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-sm border border-zinc-200 dark:border-zinc-800 hover:border-orange-400 dark:hover:border-orange-600 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="p-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-sm">
                        <FileText className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-zinc-900 dark:text-white font-bold text-sm truncate">
                        {file.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
                            {formatFileSize(file.size)}
                        </span>
                        <span className="text-zinc-300 dark:text-zinc-700">•</span>
                        <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
                            {file.uploadedAt}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-zinc-600 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-500"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => handleDeleteFile(file.id)}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}