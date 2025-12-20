import { FileUpload } from "@/components/file-upload"

export default function UploadPage() {
  return (
    <main className="flex-1 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-balance">Upload Your Design</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Upload your 3D model file and get an instant price estimate. We support STL, OBJ, and 3MF file formats.
          </p>
        </div>

        <FileUpload />
      </div>
    </main>
  )
}
