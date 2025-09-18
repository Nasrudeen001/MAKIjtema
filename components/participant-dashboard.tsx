"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { BookOpen, Award, Calendar, TrendingUp, Clock, CheckCircle, Download, Eye, Star, Target } from "lucide-react"
import jsPDF from "jspdf"
import "jspdf-autotable"

const participantData = {
  id: "MAK2024001",
  name: "Ahmed Hassan",
  email: "ahmed.hassan@email.com",
  jamaat: "Nairobi Central",
  registrationDate: "2024-12-01",
  status: "active",
  overallGrade: "A-",
  averageScore: 81.8,
  totalAssessments: 2,
  completedAssessments: 2,
  attendanceRate: 100,
  certificates: 1,
}

const assessmentResults = [
  {
    id: 1,
    title: "Quranic Knowledge Quiz",
    subject: "Quran",
    date: "2024-12-17",
    score: 85.5,
    totalMarks: 100,
    grade: "A",
    feedback: "Excellent understanding of Quranic concepts. Keep up the good work!",
    examiner: "Qari Muhammad Ahmad",
    status: "completed",
  },
  {
    id: 2,
    title: "Hadith Comprehension Test",
    subject: "Hadith",
    date: "2024-12-17",
    score: 78.0,
    totalMarks: 100,
    grade: "B+",
    feedback: "Good grasp of Hadith knowledge. Work on contextual understanding.",
    examiner: "Maulana Abdul Rahman",
    status: "completed",
  },
]

const enrolledSessions = [
  {
    id: 1,
    title: "Quranic Recitation and Tajweed",
    instructor: "Qari Muhammad Ahmad",
    date: "2024-12-15",
    time: "09:00 - 10:30",
    venue: "Main Hall A",
    status: "attended",
    attendance: "present",
  },
  {
    id: 2,
    title: "Hadith Studies: Sahih Bukhari",
    instructor: "Maulana Abdul Rahman",
    date: "2024-12-15",
    time: "11:00 - 12:00",
    venue: "Lecture Hall B",
    status: "attended",
    attendance: "present",
  },
  {
    id: 3,
    title: "Islamic Jurisprudence Basics",
    instructor: "Dr. Mirza Tahir Ahmad",
    date: "2024-12-15",
    time: "14:00 - 15:15",
    venue: "Conference Room C",
    status: "enrolled",
    attendance: "pending",
  },
]

const certificates = [
  {
    id: 1,
    number: "CERT2024003",
    title: "Certificate of Participation",
    description: "Successfully completed Ijtema 2024 academic program",
    issueDate: "2024-12-18",
    verificationCode: "VER2024003",
    status: "issued",
  },
]

const getGradeColor = (grade: string) => {
  switch (grade) {
    case "A+":
      return "bg-primary text-primary-foreground"
    case "A":
    case "A-":
      return "bg-secondary text-secondary-foreground"
    case "B+":
    case "B":
      return "bg-chart-4/20 text-chart-4"
    default:
      return "bg-muted text-muted-foreground"
  }
}

const getAttendanceColor = (attendance: string) => {
  switch (attendance) {
    case "present":
      return "bg-primary/10 text-primary"
    case "absent":
      return "bg-destructive/10 text-destructive"
    case "excused":
      return "bg-chart-4/10 text-chart-4"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export function ParticipantDashboard() {
  const handleDownloadProgressReport = () => {
    const doc = new jsPDF()

    // Add title and participant info
    doc.setFontSize(20)
    doc.text("Progress Report", 20, 20)

    doc.setFontSize(12)
    doc.text(`Participant: ${participantData.name}`, 20, 35)
    doc.text(`ID: ${participantData.id}`, 20, 42)
    doc.text(`Jamaat: ${participantData.jamaat}`, 20, 49)
    doc.text(`Overall Grade: ${participantData.overallGrade}`, 20, 56)

    // Add generation date
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 65)

    // Add performance summary
    doc.setFontSize(14)
    doc.text("Performance Summary", 20, 80)

    const summaryData = [
      ["Average Score", `${participantData.averageScore}%`],
      ["Assessments Completed", `${participantData.completedAssessments}/${participantData.totalAssessments}`],
      ["Attendance Rate", `${participantData.attendanceRate}%`],
      ["Certificates Earned", participantData.certificates.toString()],
      ["Status", participantData.status],
    ]
    ;(doc as any).autoTable({
      head: [["Metric", "Value"]],
      body: summaryData,
      startY: 90,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [59, 130, 246] },
    })

    // Add assessment results
    doc.setFontSize(14)
    doc.text("Assessment Results", 20, (doc as any).lastAutoTable.finalY + 20)

    const assessmentData = assessmentResults.map((assessment) => [
      assessment.title,
      assessment.subject,
      new Date(assessment.date).toLocaleDateString(),
      `${assessment.score}/${assessment.totalMarks}`,
      assessment.grade,
      assessment.examiner,
    ])
    ;(doc as any).autoTable({
      head: [["Assessment", "Subject", "Date", "Score", "Grade", "Examiner"]],
      body: assessmentData,
      startY: (doc as any).lastAutoTable.finalY + 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    })

    // Save the PDF
    doc.save(`${participantData.name}-progress-report.pdf`)
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">AH</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Welcome back, {participantData.name}!</h2>
            <p className="text-muted-foreground">
              Participant ID: {participantData.id} • {participantData.jamaat}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <Badge className="bg-primary/10 text-primary">{participantData.status}</Badge>
              <Badge className={getGradeColor(participantData.overallGrade)}>
                Overall Grade: {participantData.overallGrade}
              </Badge>
            </div>
          </div>
        </div>
        <Button onClick={handleDownloadProgressReport}>
          <Download className="w-4 h-4 mr-2" />
          Download PDF Report
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{participantData.averageScore}%</div>
            <p className="text-xs text-muted-foreground">Across all assessments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assessments</CardTitle>
            <BookOpen className="h-4 w-4 text-secondary-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {participantData.completedAssessments}/{participantData.totalAssessments}
            </div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{participantData.attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">Session attendance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates</CardTitle>
            <Award className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-3">{participantData.certificates}</div>
            <p className="text-xs text-muted-foreground">Earned</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Progress Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Academic Progress
                </CardTitle>
                <CardDescription>Your performance across different subjects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Quranic Studies</span>
                      <span className="text-sm text-muted-foreground">85.5%</span>
                    </div>
                    <Progress value={85.5} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Hadith Studies</span>
                      <span className="text-sm text-muted-foreground">78.0%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Islamic Jurisprudence</span>
                      <span className="text-sm text-muted-foreground">Pending</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your latest achievements and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    <div>
                      <p className="text-sm font-medium">Completed Hadith Comprehension Test</p>
                      <p className="text-xs text-muted-foreground">Score: 78/100 (B+) • 2 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    <div>
                      <p className="text-sm font-medium">Completed Quranic Knowledge Quiz</p>
                      <p className="text-xs text-muted-foreground">Score: 85.5/100 (A) • 3 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-chart-3 rounded-full mt-2" />
                    <div>
                      <p className="text-sm font-medium">Certificate of Participation issued</p>
                      <p className="text-xs text-muted-foreground">CERT2024003 • 1 week ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assessments">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Assessment Results</h3>
                <p className="text-sm text-muted-foreground">Your performance in all completed assessments</p>
              </div>
            </div>

            <div className="grid gap-4">
              {assessmentResults.map((assessment) => (
                <Card key={assessment.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{assessment.title}</CardTitle>
                        <CardDescription>
                          {assessment.subject} • Examined by {assessment.examiner}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <Badge className={getGradeColor(assessment.grade)}>{assessment.grade}</Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(assessment.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Score</span>
                        <span className="text-lg font-bold text-primary">
                          {assessment.score}/{assessment.totalMarks} (
                          {((assessment.score / assessment.totalMarks) * 100).toFixed(1)}%)
                        </span>
                      </div>
                      <Progress value={(assessment.score / assessment.totalMarks) * 100} className="h-2" />
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm font-medium mb-1">Examiner Feedback:</p>
                        <p className="text-sm text-muted-foreground">{assessment.feedback}</p>
                      </div>
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sessions">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Enrolled Sessions</h3>
                <p className="text-sm text-muted-foreground">Your registered academic sessions and attendance</p>
              </div>
            </div>

            <div className="grid gap-4">
              {enrolledSessions.map((session) => (
                <Card key={session.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold">{session.title}</h4>
                          <Badge className={getAttendanceColor(session.attendance)}>{session.attendance}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">Instructor: {session.instructor}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(session.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {session.time}
                          </div>
                          <div className="flex items-center">
                            <BookOpen className="w-4 h-4 mr-1" />
                            {session.venue}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {session.status === "attended" ? (
                          <CheckCircle className="w-6 h-6 text-primary" />
                        ) : (
                          <Clock className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="certificates">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">My Certificates</h3>
                <p className="text-sm text-muted-foreground">Certificates earned during the ijtema</p>
              </div>
            </div>

            <div className="grid gap-4">
              {certificates.map((certificate) => (
                <Card key={certificate.id} className="border-primary/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Award className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{certificate.title}</CardTitle>
                          <CardDescription>{certificate.description}</CardDescription>
                        </div>
                      </div>
                      <Badge className="bg-primary/10 text-primary">
                        <Star className="w-3 h-3 mr-1" />
                        {certificate.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium">Certificate Number</p>
                        <p className="text-sm text-muted-foreground font-mono">{certificate.number}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Issue Date</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(certificate.issueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Verification Code</p>
                        <p className="text-sm text-muted-foreground font-mono">{certificate.verificationCode}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Status</p>
                        <p className="text-sm text-primary capitalize">{certificate.status}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button>
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </Button>
                      <Button variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        View Certificate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {certificates.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Certificates Yet</h3>
                  <p className="text-muted-foreground">
                    Complete assessments and maintain good attendance to earn certificates.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
