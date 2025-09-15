'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Download, 
  FileText, 
  Share2, 
  Calendar,
  BarChart3,
  Image as ImageIcon,
  Mail,
  Loader2
} from 'lucide-react'
import { ExportService } from '@/lib/export-utils'

export function ExportTools() {
  const [isExporting, setIsExporting] = useState(false)
  const [exportType, setExportType] = useState<string | null>(null)

  const handleExportPDF = async (format: 'summary' | 'detailed') => {
    setIsExporting(true)
    setExportType(`PDF ${format}`)
    
    try {
      const data = ExportService.generateMockData()
      await ExportService.exportToPDF(data, format)
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setIsExporting(false)
      setExportType(null)
    }
  }

  const handleExportCSV = async () => {
    setIsExporting(true)
    setExportType('CSV')
    
    try {
      const data = ExportService.generateMockData()
      await ExportService.exportToCSV(data.workoutData, 'workout-data.csv')
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setIsExporting(false)
      setExportType(null)
    }
  }

  const handleExportAnalytics = async () => {
    setIsExporting(true)
    setExportType('Analytics')
    
    try {
      await ExportService.exportElementToPDF('analytics-dashboard', 'analytics-report.pdf')
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setIsExporting(false)
      setExportType(null)
    }
  }

  const handleShareSocial = (platform: 'twitter' | 'facebook' | 'linkedin') => {
    const text = "Just crushed another workout! 💪 Check out my progress with Body by Rings #fitness #calisthenics"
    const url = window.location.origin
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    }
    
    window.open(shareUrls[platform], '_blank', 'width=600,height=400')
  }

  const exportOptions = [
    {
      id: 'pdf-summary',
      title: 'PDF Summary Report',
      description: 'Quick overview of your progress, stats, and achievements',
      icon: <FileText className="h-5 w-5" />,
      action: () => handleExportPDF('summary'),
      badge: 'Recommended'
    },
    {
      id: 'pdf-detailed',
      title: 'PDF Detailed Report',
      description: 'Complete report with workout logs and detailed analytics',
      icon: <BarChart3 className="h-5 w-5" />,
      action: () => handleExportPDF('detailed'),
      badge: 'Complete'
    },
    {
      id: 'csv-data',
      title: 'CSV Data Export',
      description: 'Raw workout data for your own analysis',
      icon: <Download className="h-5 w-5" />,
      action: handleExportCSV,
      badge: 'Data'
    },
    {
      id: 'analytics-capture',
      title: 'Analytics Screenshot',
      description: 'Export current analytics dashboard as PDF',
      icon: <ImageIcon className="h-5 w-5" />,
      action: handleExportAnalytics,
      badge: 'Visual'
    }
  ]

  const shareOptions = [
    {
      id: 'twitter',
      title: 'Share on Twitter',
      description: 'Share your progress with your followers',
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => handleShareSocial('twitter')
    },
    {
      id: 'facebook',
      title: 'Share on Facebook',
      description: 'Post your achievements to Facebook',
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => handleShareSocial('facebook')
    },
    {
      id: 'linkedin',
      title: 'Share on LinkedIn',
      description: 'Inspire your professional network',
      color: 'bg-blue-700 hover:bg-blue-800',
      action: () => handleShareSocial('linkedin')
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Download className="h-6 w-6 text-blue-600" />
          Export & Share
        </h2>
        <p className="text-gray-600">
          Export your progress data or share your achievements
        </p>
      </div>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
          <CardDescription>
            Download your progress data in various formats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {exportOptions.map((option) => (
              <Card key={option.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-blue-600 mt-1">
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{option.title}</h4>
                        {option.badge && (
                          <Badge variant="outline" className="text-xs">
                            {option.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {option.description}
                      </p>
                      <Button 
                        onClick={option.action}
                        disabled={isExporting}
                        size="sm"
                        className="w-full"
                      >
                        {isExporting && exportType === option.title.split(' ')[1] ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Exporting...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Share Options */}
      <Card>
        <CardHeader>
          <CardTitle>Share Your Progress</CardTitle>
          <CardDescription>
            Let others know about your fitness journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {shareOptions.map((option) => (
              <Button
                key={option.id}
                onClick={option.action}
                className={`h-auto p-4 text-left justify-start ${option.color} text-white`}
              >
                <div>
                  <div className="font-semibold mb-1">{option.title}</div>
                  <div className="text-xs opacity-90">{option.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Email Report */}
      <Card>
        <CardHeader>
          <CardTitle>Email Reports</CardTitle>
          <CardDescription>
            Get your progress reports delivered to your inbox
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Mail className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <div className="font-medium">Weekly Progress Email</div>
                <div className="text-sm text-gray-600">
                  Receive a summary of your weekly progress every Sunday
                </div>
              </div>
              <Button variant="outline" size="sm">
                Enable
              </Button>
            </div>
            
            <div className="flex items-center gap-4">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <div className="font-medium">Monthly Report</div>
                <div className="text-sm text-gray-600">
                  Detailed monthly analysis with insights and recommendations
                </div>
              </div>
              <Button variant="outline" size="sm">
                Enable
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Export Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span><strong>PDF Summary:</strong> Perfect for sharing with trainers or tracking progress</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span><strong>PDF Detailed:</strong> Complete analysis for personal review or coaching</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span><strong>CSV Data:</strong> Import into Excel, Google Sheets, or other analysis tools</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span><strong>Analytics Screenshot:</strong> Quick visual summary of your current progress</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}