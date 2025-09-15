import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export interface ExportData {
  userInfo: {
    name: string
    email: string
    startDate: string
  }
  dateRange: {
    from: string
    to: string
  }
  stats: {
    totalWorkouts: number
    totalVolume: number
    averageRpe: number
    currentStreak: number
  }
  workoutData: {
    date: string
    type: string
    volume: number
    rpe: number
    duration: number
  }[]
  exerciseProgress: {
    exercise: string
    startMax: number
    currentMax: number
    improvement: number
  }[]
  achievements: {
    title: string
    description: string
    unlockedAt: string
    rarity: string
  }[]
  goals: {
    title: string
    progress: number
    status: string
    targetDate: string
  }[]
}

export class ExportService {
  static async exportToPDF(data: ExportData, format: 'summary' | 'detailed' = 'summary'): Promise<void> {
    const pdf = new jsPDF()
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    let yPosition = 20

    // Helper function to add new page if needed
    const checkPageBreak = (requiredSpace: number = 20) => {
      if (yPosition + requiredSpace > pageHeight - 20) {
        pdf.addPage()
        yPosition = 20
      }
    }

    // Header
    pdf.setFontSize(24)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Body by Rings - Progress Report', 20, yPosition)
    yPosition += 15

    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Generated on: ${new Date().toLocaleDateString('fr-FR')}`, 20, yPosition)
    yPosition += 10
    pdf.text(`Period: ${data.dateRange.from} to ${data.dateRange.to}`, 20, yPosition)
    yPosition += 20

    // User Info Section
    checkPageBreak(30)
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text('User Information', 20, yPosition)
    yPosition += 10

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Name: ${data.userInfo.name}`, 25, yPosition)
    yPosition += 7
    pdf.text(`Email: ${data.userInfo.email}`, 25, yPosition)
    yPosition += 7
    pdf.text(`Training Since: ${data.userInfo.startDate}`, 25, yPosition)
    yPosition += 20

    // Statistics Overview
    checkPageBreak(50)
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Training Statistics', 20, yPosition)
    yPosition += 15

    const stats = [
      ['Total Workouts', data.stats.totalWorkouts.toString()],
      ['Total Volume', `${data.stats.totalVolume} reps`],
      ['Average RPE', data.stats.averageRpe.toString()],
      ['Current Streak', `${data.stats.currentStreak} days`]
    ]

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    stats.forEach(([label, value]) => {
      pdf.text(`${label}:`, 25, yPosition)
      pdf.text(value, 100, yPosition)
      yPosition += 7
    })
    yPosition += 15

    // Exercise Progress
    if (data.exerciseProgress.length > 0) {
      checkPageBreak(30 + data.exerciseProgress.length * 7)
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Exercise Progress', 20, yPosition)
      yPosition += 15

      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      data.exerciseProgress.forEach(exercise => {
        pdf.text(exercise.exercise, 25, yPosition)
        pdf.text(`${exercise.startMax} → ${exercise.currentMax} (+${exercise.improvement}%)`, 100, yPosition)
        yPosition += 7
      })
      yPosition += 15
    }

    // Recent Achievements
    if (data.achievements.length > 0) {
      checkPageBreak(30 + data.achievements.length * 7)
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Recent Achievements', 20, yPosition)
      yPosition += 15

      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      data.achievements.slice(0, 10).forEach(achievement => {
        pdf.text(`• ${achievement.title}`, 25, yPosition)
        pdf.text(`(${achievement.rarity})`, 150, yPosition)
        yPosition += 7
      })
      yPosition += 15
    }

    // Goals Progress
    if (data.goals.length > 0) {
      checkPageBreak(30 + data.goals.length * 7)
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Current Goals', 20, yPosition)
      yPosition += 15

      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      data.goals.forEach(goal => {
        pdf.text(`• ${goal.title}`, 25, yPosition)
        pdf.text(`${goal.progress}% - ${goal.status}`, 120, yPosition)
        yPosition += 7
      })
      yPosition += 15
    }

    // Detailed workout log (only if detailed format)
    if (format === 'detailed' && data.workoutData.length > 0) {
      checkPageBreak(50)
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Workout Log', 20, yPosition)
      yPosition += 15

      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'normal')
      
      // Table headers
      pdf.text('Date', 25, yPosition)
      pdf.text('Type', 60, yPosition)
      pdf.text('Volume', 100, yPosition)
      pdf.text('RPE', 130, yPosition)
      pdf.text('Duration', 150, yPosition)
      yPosition += 7

      // Table data
      data.workoutData.slice(0, 20).forEach(workout => {
        checkPageBreak(7)
        pdf.text(workout.date, 25, yPosition)
        pdf.text(workout.type, 60, yPosition)
        pdf.text(workout.volume.toString(), 100, yPosition)
        pdf.text(workout.rpe.toString(), 130, yPosition)
        pdf.text(`${workout.duration}min`, 150, yPosition)
        yPosition += 7
      })
    }

    // Footer
    const totalPages = pdf.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i)
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'normal')
      pdf.text(
        `Body by Rings - Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      )
    }

    // Save the PDF
    const fileName = `body-by-rings-report-${new Date().toISOString().split('T')[0]}.pdf`
    pdf.save(fileName)
  }

  static async exportElementToPDF(elementId: string, filename: string = 'export.pdf'): Promise<void> {
    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`)
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF()
      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(filename)
    } catch (error) {
      console.error('Error generating PDF:', error)
      throw error
    }
  }

  static async exportToCSV(data: any[], filename: string = 'export.csv'): Promise<void> {
    if (data.length === 0) {
      throw new Error('No data to export')
    }

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  static generateMockData(): ExportData {
    return {
      userInfo: {
        name: 'John Doe',
        email: 'john.doe@email.com',
        startDate: '2024-01-15'
      },
      dateRange: {
        from: '2024-02-01',
        to: '2024-03-15'
      },
      stats: {
        totalWorkouts: 28,
        totalVolume: 1850,
        averageRpe: 7.2,
        currentStreak: 7
      },
      workoutData: [
        { date: '2024-03-15', type: 'Push Day', volume: 85, rpe: 7, duration: 45 },
        { date: '2024-03-13', type: 'Pull Day', volume: 72, rpe: 8, duration: 42 },
        { date: '2024-03-11', type: 'Push Day', volume: 90, rpe: 6, duration: 48 },
        { date: '2024-03-09', type: 'Pull Day', volume: 78, rpe: 7, duration: 40 },
        { date: '2024-03-07', type: 'Push Day', volume: 88, rpe: 8, duration: 50 }
      ],
      exerciseProgress: [
        { exercise: 'Pull-ups', startMax: 8, currentMax: 12, improvement: 50 },
        { exercise: 'Push-ups', startMax: 20, currentMax: 25, improvement: 25 },
        { exercise: 'Dips', startMax: 6, currentMax: 8, improvement: 33 }
      ],
      achievements: [
        { 
          title: 'Pull-up Master', 
          description: 'Achieved 15 consecutive pull-ups',
          unlockedAt: '2024-03-10',
          rarity: 'rare'
        },
        { 
          title: 'Consistency Champion', 
          description: 'Worked out 7 days in a row',
          unlockedAt: '2024-03-05',
          rarity: 'common'
        }
      ],
      goals: [
        { title: 'Master Pull-ups (15 reps)', progress: 80, status: 'active', targetDate: '2024-04-15' },
        { title: 'Volume Beast (1000 reps/month)', progress: 85, status: 'active', targetDate: '2024-03-31' }
      ]
    }
  }
}