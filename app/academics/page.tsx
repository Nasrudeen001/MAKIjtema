"use client"

import { useState, useEffect } from "react"
import { MainNavigation } from "@/components/main-navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  GraduationCap,
  Plus,
  Search,
  Save,
  Users,
  BookOpen,
  Bike,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
  Download,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Loader2 } from "lucide-react"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { Combobox } from "@/components/ui/combobox"

interface Participant {
  id: string
  full_name: string
  registration_number: string
  category: string
}

interface AcademicRecord {
  id: string
  participant_id: string
  report_month: string
  knows_prayer_full: boolean
  knows_prayer_meaning: boolean
  can_read_quran: boolean
  owns_bicycle: boolean
  avg_prayers_per_day: number | null
  days_tilawat_done: number | null
  friday_prayers_attended: number | null
  huzur_sermons_listened: number | null
  nafli_fasts: number | null
  created_at: string
  participants?: {
    full_name: string
    registration_number: string
  }
}

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export default function AcademicsPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [participants, setParticipants] = useState<Participant[]>([])
  const [selectedParticipant, setSelectedParticipant] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("")
  const [knowsPrayerFull, setKnowsPrayerFull] = useState("")
  const [knowsPrayerMeaning, setKnowsPrayerMeaning] = useState("")
  const [canReadQuran, setCanReadQuran] = useState("")
  const [ownsBicycle, setOwnsBicycle] = useState("")
  const [avgPrayersPerDay, setAvgPrayersPerDay] = useState("")
  const [tilawatDays, setTilawatDays] = useState("")
  const [fridayPrayers, setFridayPrayers] = useState("")
  const [fridaySermons, setFridaySermons] = useState("")
  const [nafliFasts, setNafliFasts] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [academicRecords, setAcademicRecords] = useState<AcademicRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<AcademicRecord | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()

        const { data: participantsData, error: participantsError } = await supabase
          .from("participants")
          .select("id, full_name, registration_number, category")
          .order("full_name")

        if (participantsError) {
          console.error("[v0] Error fetching participants:", participantsError)
        } else {
          setParticipants(participantsData || [])
        }

        const { data: academicData, error: academicError } = await supabase
          .from("academic_data")
          .select(`
            *,
            participants!inner(full_name, registration_number)
          `)
          .order("created_at", { ascending: false })

        if (academicError) {
          console.error("[v0] Error fetching academic data:", academicError)
        } else {
          setAcademicRecords(academicData || [])
        }
      } catch (error) {
        console.error("[v0] Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const randomQuestionsStats = {
    totalResponses: academicRecords.length,
    knowsPrayerFull: academicRecords.filter((record) => record.knows_prayer_full === true).length,
    knowsPrayerMeaning: academicRecords.filter((record) => record.knows_prayer_meaning === true).length,
    canReadQuran: academicRecords.filter((record) => record.can_read_quran === true).length,
    ownsBicycle: academicRecords.filter((record) => record.owns_bicycle === true).length,
  }

  const handleSaveAcademicData = async () => {
    if (!selectedParticipant || !selectedMonth) {
      toast({
        title: "Missing Information",
        description: "Please select a participant and month.",
        variant: "destructive",
      })
      return
    }

    try {
      const supabase = createClient()

      const { error } = await supabase.from("academic_data").insert({
        participant_id: selectedParticipant,
        report_month: selectedMonth, // Changed from 'month' to 'report_month'
        knows_prayer_full: knowsPrayerFull === "Yes",
        knows_prayer_meaning: knowsPrayerMeaning === "Yes",
        can_read_quran: canReadQuran === "Yes",
        owns_bicycle: ownsBicycle === "Yes",
        avg_prayers_per_day: avgPrayersPerDay ? Number.parseInt(avgPrayersPerDay) : null,
        days_tilawat_done: tilawatDays ? Number.parseInt(tilawatDays) : null, // Changed from 'tilawat_days'
        friday_prayers_attended: fridayPrayers ? Number.parseInt(fridayPrayers) : null, // Changed from 'friday_prayers'
        huzur_sermons_listened: fridaySermons ? Number.parseInt(fridaySermons) : null, // Changed from 'friday_sermons'
        nafli_fasts: nafliFasts ? Number.parseInt(nafliFasts) : null,
      })

      if (error) {
        throw error
      }

      toast({
        title: "Academic Data Saved",
        description: "Academic data has been recorded successfully.",
      })

      // Reset form and refresh data
      setSelectedParticipant("")
      setSelectedMonth("")
      setKnowsPrayerFull("")
      setKnowsPrayerMeaning("")
      setCanReadQuran("")
      setOwnsBicycle("")
      setAvgPrayersPerDay("")
      setTilawatDays("")
      setFridayPrayers("")
      setFridaySermons("")
      setNafliFasts("")
      setIsDialogOpen(false)

      // Refresh academic records
      const { data: academicData } = await supabase
        .from("academic_data")
        .select(`
          *,
          participants!inner(full_name, registration_number)
        `)
        .order("created_at", { ascending: false })

      setAcademicRecords(academicData || [])
    } catch (error) {
      console.error("[v0] Error saving academic data:", error)
      toast({
        title: "Error",
        description: "Failed to save academic data. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAcademicRecord = async (recordId: string) => {
    setDeletingId(recordId)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("academic_data").delete().eq("id", recordId)

      if (error) {
        throw error
      }

      setAcademicRecords((prev) => prev.filter((record) => record.id !== recordId))
      toast({
        title: "Success",
        description: "Academic record deleted successfully",
      })
    } catch (error) {
      console.error("[v0] Error deleting academic record:", error)
      toast({
        title: "Error",
        description: "Failed to delete academic record",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  const handleViewRecord = (record: any) => {
    setSelectedRecord(record)
    setViewDialogOpen(true)
  }

  const handleEditRecord = (record: any) => {
    setSelectedRecord(record)
    // Pre-populate form fields with existing data
    setSelectedParticipant(record.participant_id)
    setSelectedMonth(record.report_month)
    setKnowsPrayerFull(record.knows_prayer_full ? "Yes" : "No")
    setKnowsPrayerMeaning(record.knows_prayer_meaning ? "Yes" : "No")
    setCanReadQuran(record.can_read_quran ? "Yes" : "No")
    setOwnsBicycle(record.owns_bicycle ? "Yes" : "No")
    setAvgPrayersPerDay(record.avg_prayers_per_day?.toString() || "")
    setTilawatDays(record.days_tilawat_done?.toString() || "")
    setFridayPrayers(record.friday_prayers_attended?.toString() || "")
    setFridaySermons(record.huzur_sermons_listened?.toString() || "")
    setNafliFasts(record.nafli_fasts?.toString() || "")
    setEditDialogOpen(true)
  }

  const handleDownloadPDF = () => {
    const doc = new jsPDF()

    const eventSettings = localStorage.getItem("eventSettings")
    const eventName = eventSettings ? JSON.parse(eventSettings).eventName : "Ijtema 2024"

    const logoImg = new Image()
    logoImg.onload = () => {
      // Add the logo at the top center
      const logoSize = 20
      const pageWidth = doc.internal.pageSize.getWidth()
      const logoX = (pageWidth - logoSize) / 2

      doc.addImage(logoImg, "JPEG", logoX, 10, logoSize, logoSize)

      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      const eventNameWidth = doc.getTextWidth(eventName)
      const eventNameX = (pageWidth - eventNameWidth) / 2
      doc.text(eventName, eventNameX, 40)

      doc.setFontSize(14)
      doc.setFont("helvetica", "normal")
      const docType = "Academic Data Report"
      const docTypeWidth = doc.getTextWidth(docType)
      const docTypeX = (pageWidth - docTypeWidth) / 2
      doc.text(docType, docTypeX, 50)

      // Add generation date and stats
      doc.setFontSize(10)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 65)
      doc.text(`Total Records: ${academicRecords.length}`, 20, 70)

      // Prepare table data
      const tableData = academicRecords.map((data) => [
        data.participants?.full_name ?? "",
        data.report_month || "N/A",
        data.knows_prayer_full ? "Yes" : "No",
        data.can_read_quran ? "Yes" : "No",
        data.owns_bicycle ? "Yes" : "No",
        data.avg_prayers_per_day?.toString() || "0",
        data.days_tilawat_done?.toString() || "0",
        data.friday_prayers_attended?.toString() || "0",
        data.huzur_sermons_listened?.toString() || "0",
        data.nafli_fasts?.toString() || "0",
      ])

      autoTable(doc, {
        head: [
          [
            "Participant",
            "Month",
            "Prayer Knowledge",
            "Quran Reading",
            "Bicycle",
            "Daily Prayers",
            "Tilawat Pages",
            "Friday Prayers",
            "Huzur Sermons",
            "Nafli Fasts",
          ],
        ],
        body: tableData,
        startY: 80, // Adjusted startY to accommodate new headers
        styles: { fontSize: 6 },
        headStyles: { fillColor: [59, 130, 246] },
      })

      // Save the PDF
      doc.save("academic-data-report.pdf")
    }

    logoImg.onerror = () => {
      console.log("[v0] Logo image failed to load, generating PDF without logo")

      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()

      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      const eventNameWidth = doc.getTextWidth(eventName)
      const eventNameX = (pageWidth - eventNameWidth) / 2
      doc.text(eventName, eventNameX, 20)

      doc.setFontSize(14)
      doc.setFont("helvetica", "normal")
      const docType = "Academic Data Report"
      const docTypeWidth = doc.getTextWidth(docType)
      const docTypeX = (pageWidth - docTypeWidth) / 2
      doc.text(docType, docTypeX, 30)

      doc.setFontSize(10)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45)
      doc.text(`Total Records: ${academicRecords.length}`, 20, 50)

      const tableData = academicRecords.map((data) => [
        data.participants?.full_name ?? "",
        data.report_month || "N/A",
        data.knows_prayer_full ? "Yes" : "No",
        data.can_read_quran ? "Yes" : "No",
        data.owns_bicycle ? "Yes" : "No",
        data.avg_prayers_per_day?.toString() || "0",
        data.days_tilawat_done?.toString() || "0",
        data.friday_prayers_attended?.toString() || "0",
        data.huzur_sermons_listened?.toString() || "0",
        data.nafli_fasts?.toString() || "0",
      ])

      autoTable(doc, {
        head: [
          [
            "Participant",
            "Month",
            "Prayer Knowledge",
            "Quran Reading",
            "Bicycle",
            "Daily Prayers",
            "Tilawat Pages",
            "Friday Prayers",
            "Huzur Sermons",
            "Nafli Fasts",
          ],
        ],
        body: tableData,
        startY: 60,
        styles: { fontSize: 6 },
        headStyles: { fillColor: [59, 130, 246] },
      })

      doc.save("academic-data-report.pdf")
    }

    logoImg.src = "/ansar-logo.jpeg"
  }

  const filteredRecords = academicRecords.filter(
    (record) =>
      record.participants?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.participants?.registration_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.report_month?.toLowerCase().includes(searchTerm.toLowerCase()), // Updated field name to match database schema
  )

  if (loading) {
    return (
      <div>
        <MainNavigation />
        <main className="container mx-auto px-4 py-2">
          <div className="text-center py-8">
            <p>Loading academic data...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div>
      <MainNavigation />

      <main className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Academic Data</h1>
            <p className="text-muted-foreground">Manage participant academic and spiritual progress</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Academic Data
            </Button>
          </div>
        </div>

        <div className="mb-4">
          <Card className="border-islamic-green/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-islamic-green">
                <CheckCircle className="w-5 h-5 mx-auto mb-2 text-islamic-green" />
                <span>Random Questions Dashboard</span>
              </CardTitle>
              <CardDescription>Statistics for general knowledge questions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-islamic-green/5 rounded-lg">
                  <Users className="w-8 h-8 mx-auto mb-2 text-islamic-green" />
                  <div className="text-2xl font-bold text-islamic-green">{randomQuestionsStats.knowsPrayerFull}</div>
                  <div className="text-sm text-muted-foreground">Know Prayer in Full</div>
                  <div className="text-xs text-muted-foreground">
                    {randomQuestionsStats.totalResponses > 0
                      ? `${Math.round((randomQuestionsStats.knowsPrayerFull / randomQuestionsStats.totalResponses) * 100)}%`
                      : "0%"}
                  </div>
                </div>

                <div className="text-center p-4 bg-islamic-green/5 rounded-lg">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 text-islamic-green" />
                  <div className="text-2xl font-bold text-islamic-green">{randomQuestionsStats.knowsPrayerMeaning}</div>
                  <div className="text-sm text-muted-foreground">Know Prayer Meaning</div>
                  <div className="text-xs text-muted-foreground">
                    {randomQuestionsStats.totalResponses > 0
                      ? `${Math.round((randomQuestionsStats.knowsPrayerMeaning / randomQuestionsStats.totalResponses) * 100)}%`
                      : "0%"}
                  </div>
                </div>

                <div className="text-center p-4 bg-islamic-green/5 rounded-lg">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 text-islamic-green" />
                  <div className="text-2xl font-bold text-islamic-green">{randomQuestionsStats.canReadQuran}</div>
                  <div className="text-sm text-muted-foreground">Can Read Quran</div>
                  <div className="text-xs text-muted-foreground">
                    {randomQuestionsStats.totalResponses > 0
                      ? `${Math.round((randomQuestionsStats.canReadQuran / randomQuestionsStats.totalResponses) * 100)}%`
                      : "0%"}
                  </div>
                </div>

                <div className="text-center p-4 bg-islamic-green/5 rounded-lg">
                  <Bike className="w-8 h-8 mx-auto mb-2 text-islamic-green" />
                  <div className="text-2xl font-bold text-islamic-green">{randomQuestionsStats.ownsBicycle}</div>
                  <div className="text-sm text-muted-foreground">Own Bicycle</div>
                  <div className="text-xs text-muted-foreground">
                    {randomQuestionsStats.totalResponses > 0
                      ? `${Math.round((randomQuestionsStats.ownsBicycle / randomQuestionsStats.totalResponses) * 100)}%`
                      : "0%"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by participant name, registration number, or month..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} modal={false}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Academic Data
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Record Academic Data</DialogTitle>
                <DialogDescription>Fill academic and spiritual information for a participant</DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="participant">Participant</Label>
                    <Select value={selectedParticipant} onValueChange={setSelectedParticipant}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select participant" />
                      </SelectTrigger>
                      <SelectContent>
                        {participants.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.full_name} ({p.registration_number})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="month">Month</Label>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month} value={month}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Card className="border-islamic-green/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-islamic-green">Random Questions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Do you know the prayer in full?</Label>
                      <RadioGroup
                        value={knowsPrayerFull}
                        onValueChange={setKnowsPrayerFull}
                        className="flex space-x-4 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Yes" id="prayer-full-yes" />
                          <Label htmlFor="prayer-full-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="No" id="prayer-full-no" />
                          <Label htmlFor="prayer-full-no">No</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label>With meaning?</Label>
                      <RadioGroup
                        value={knowsPrayerMeaning}
                        onValueChange={setKnowsPrayerMeaning}
                        className="flex space-x-4 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Yes" id="prayer-meaning-yes" />
                          <Label htmlFor="prayer-meaning-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="No" id="prayer-meaning-no" />
                          <Label htmlFor="prayer-meaning-no">No</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label>Do you know how to read the Holy Quran?</Label>
                      <RadioGroup value={canReadQuran} onValueChange={setCanReadQuran} className="flex space-x-4 mt-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Yes" id="quran-yes" />
                          <Label htmlFor="quran-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="No" id="quran-no" />
                          <Label htmlFor="quran-no">No</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label>Do you own a bicycle?</Label>
                      <RadioGroup value={ownsBicycle} onValueChange={setOwnsBicycle} className="flex space-x-4 mt-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Yes" id="bicycle-yes" />
                          <Label htmlFor="bicycle-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="No" id="bicycle-no" />
                          <Label htmlFor="bicycle-no">No</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-islamic-green/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-islamic-green">Spiritual Monthly Report</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="avg-prayers">Average Number of prayers offered per day</Label>
                        <Input
                          id="avg-prayers"
                          type="number"
                          min="0"
                          max="5"
                          value={avgPrayersPerDay}
                          onChange={(e) => setAvgPrayersPerDay(e.target.value)}
                          placeholder="0-5"
                        />
                      </div>

                      <div>
                        <Label htmlFor="tilawat-days">Number of days Tilawat of Holy Quran was done</Label>
                        <Input
                          id="tilawat-days"
                          type="number"
                          min="0"
                          max="31"
                          value={tilawatDays}
                          onChange={(e) => setTilawatDays(e.target.value)}
                          placeholder="0-31"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="friday-prayers">Number of Friday prayers attended</Label>
                        <Input
                          id="friday-prayers"
                          type="number"
                          min="0"
                          max="5"
                          value={fridayPrayers}
                          onChange={(e) => setFridayPrayers(e.target.value)}
                          placeholder="0-5"
                        />
                      </div>

                      <div>
                        <Label htmlFor="friday-sermons">Number of Huzur's Friday sermon listened</Label>
                        <Input
                          id="friday-sermons"
                          type="number"
                          min="0"
                          max="5"
                          value={fridaySermons}
                          onChange={(e) => setFridaySermons(e.target.value)}
                          placeholder="0-5"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="nafli-fasts">Number of Nafli fasts</Label>
                      <Input
                        id="nafli-fasts"
                        type="number"
                        min="0"
                        value={nafliFasts}
                        onChange={(e) => setNafliFasts(e.target.value)}
                        placeholder="Enter number"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Button
                  onClick={handleSaveAcademicData}
                  className="w-full"
                  disabled={!selectedParticipant || !selectedMonth}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Academic Data
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <GraduationCap className="w-5 h-5" />
              <span>Academic Records ({filteredRecords.length})</span>
            </CardTitle>
            <CardDescription>Academic and spiritual data for all participants</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Participant</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead>Prayer Full</TableHead>
                    <TableHead>Read Quran</TableHead>
                    <TableHead>Bicycle</TableHead>
                    <TableHead>Avg Prayers/Day</TableHead>
                    <TableHead>Tilawat Days</TableHead>
                    <TableHead>Friday Prayers</TableHead>
                    <TableHead>Friday Sermons</TableHead>
                    <TableHead>Nafli Fasts</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.participants?.full_name}</TableCell>
                      <TableCell>{record.report_month}</TableCell>
                      <TableCell>{record.knows_prayer_full ? "Yes" : "No"}</TableCell>
                      <TableCell>{record.can_read_quran ? "Yes" : "No"}</TableCell>
                      <TableCell>{record.owns_bicycle ? "Yes" : "No"}</TableCell>
                      <TableCell>{record.avg_prayers_per_day}</TableCell>
                      <TableCell>{record.days_tilawat_done}</TableCell>
                      <TableCell>{record.friday_prayers_attended}</TableCell>
                      <TableCell>{record.huzur_sermons_listened}</TableCell>
                      <TableCell>{record.nafli_fasts}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewRecord(record)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditRecord(record)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive bg-transparent"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Academic Record</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this academic record for{" "}
                                  {record.participants?.full_name}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteAcademicRecord(record.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  disabled={deletingId === record.id}
                                >
                                  {deletingId === record.id ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Deleting...
                                    </>
                                  ) : (
                                    "Delete"
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Academic Records - {selectedRecord?.participants?.full_name}</DialogTitle>
              <DialogDescription>
                Viewing all academic data for {selectedRecord?.participants?.full_name} organized by month
              </DialogDescription>
            </DialogHeader>
            {selectedRecord &&
              (() => {
                const participantRecords = academicRecords.filter(
                  (record) => record.participant_id === selectedRecord.participant_id,
                )

                // Group records by month
                const recordsByMonth = participantRecords.reduce(
                  (acc, record) => {
                    const month = record.report_month
                    if (!acc[month]) {
                      acc[month] = []
                    }
                    acc[month].push(record)
                    return acc
                  },
                  {} as Record<string, AcademicRecord[]>,
                )

                // Sort months chronologically
                const sortedMonths = Object.keys(recordsByMonth).sort((a, b) => {
                  const monthOrder = months.indexOf(a) - months.indexOf(b)
                  return monthOrder
                })

                const latestRecord =
                  participantRecords.length > 0 ? participantRecords[participantRecords.length - 1] : null

                return (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Participant</Label>
                        <p className="text-lg font-semibold">{selectedRecord.participants?.full_name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Registration Number</Label>
                        <p className="text-lg font-semibold">{selectedRecord.participants?.registration_number}</p>
                      </div>
                    </div>

                    {latestRecord && (
                      <Card className="border-islamic-green/20">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg text-islamic-green flex items-center space-x-2">
                            <BookOpen className="w-5 h-5" />
                            <span>Random Questions</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Knows Prayer in Full:</span>
                              <span
                                className={`text-sm font-medium px-2 py-1 rounded ${
                                  latestRecord.knows_prayer_full
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {latestRecord.knows_prayer_full ? "Yes" : "No"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Knows Prayer Meaning:</span>
                              <span
                                className={`text-sm font-medium px-2 py-1 rounded ${
                                  latestRecord.knows_prayer_meaning
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {latestRecord.knows_prayer_meaning ? "Yes" : "No"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Can Read Quran:</span>
                              <span
                                className={`text-sm font-medium px-2 py-1 rounded ${
                                  latestRecord.can_read_quran
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {latestRecord.can_read_quran ? "Yes" : "No"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Owns Bicycle:</span>
                              <span
                                className={`text-sm font-medium px-2 py-1 rounded ${
                                  latestRecord.owns_bicycle ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                }`}
                              >
                                {latestRecord.owns_bicycle ? "Yes" : "No"}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <div>
                      <h3 className="text-xl font-semibold text-islamic-green mb-4">Monthly Reports</h3>
                      {sortedMonths.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          No monthly reports found for this participant.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {sortedMonths.map((month) => (
                            <Card key={month} className="border-islamic-green/20">
                              <CardHeader className="pb-3">
                                <CardTitle className="text-lg text-islamic-green flex items-center space-x-2">
                                  <BookOpen className="w-5 h-5" />
                                  <span>{month} Spiritual Report</span>
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                {recordsByMonth[month].map((monthRecord, index) => (
                                  <div key={monthRecord.id} className="space-y-4">
                                    {index > 0 && <hr className="my-4" />}

                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="flex justify-between items-center">
                                        <span className="text-sm">Average Prayers per Day:</span>
                                        <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                          {monthRecord.avg_prayers_per_day || "Not specified"}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-sm">Tilawat Days:</span>
                                        <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                          {monthRecord.days_tilawat_done || "Not specified"}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-sm">Friday Prayers Attended:</span>
                                        <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                          {monthRecord.friday_prayers_attended || "Not specified"}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-sm">Friday Sermons Listened:</span>
                                        <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                          {monthRecord.huzur_sermons_listened || "Not specified"}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-sm">Nafli Fasts:</span>
                                        <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                          {monthRecord.nafli_fasts || "Not specified"}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="text-xs text-muted-foreground text-right">
                                      Record created: {new Date(monthRecord.created_at).toLocaleDateString()}
                                    </div>
                                  </div>
                                ))}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })()}
          </DialogContent>
        </Dialog>

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen} modal={false}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Academic Record</DialogTitle>
              <DialogDescription>Update academic data for {selectedRecord?.participants?.full_name}</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="participant">Participant</Label>
                  <Select value={selectedParticipant} onValueChange={setSelectedParticipant}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select participant" />
                    </SelectTrigger>
                    <SelectContent>
                      {participants.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.full_name} ({p.registration_number})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="month">Month</Label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Card className="border-islamic-green/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-islamic-green">Random Questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Do you know the prayer in full?</Label>
                    <RadioGroup
                      value={knowsPrayerFull}
                      onValueChange={setKnowsPrayerFull}
                      className="flex space-x-4 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Yes" id="edit-prayer-full-yes" />
                        <Label htmlFor="edit-prayer-full-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No" id="edit-prayer-full-no" />
                        <Label htmlFor="edit-prayer-full-no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label>With meaning?</Label>
                    <RadioGroup
                      value={knowsPrayerMeaning}
                      onValueChange={setKnowsPrayerMeaning}
                      className="flex space-x-4 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Yes" id="edit-prayer-meaning-yes" />
                        <Label htmlFor="edit-prayer-meaning-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No" id="edit-prayer-meaning-no" />
                        <Label htmlFor="edit-prayer-meaning-no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label>Do you know how to read the Holy Quran?</Label>
                    <RadioGroup value={canReadQuran} onValueChange={setCanReadQuran} className="flex space-x-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Yes" id="edit-quran-yes" />
                        <Label htmlFor="edit-quran-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No" id="edit-quran-no" />
                        <Label htmlFor="edit-quran-no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label>Do you own a bicycle?</Label>
                    <RadioGroup value={ownsBicycle} onValueChange={setOwnsBicycle} className="flex space-x-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Yes" id="edit-bicycle-yes" />
                        <Label htmlFor="edit-bicycle-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No" id="edit-bicycle-no" />
                        <Label htmlFor="edit-bicycle-no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-islamic-green/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-islamic-green">Spiritual Monthly Report</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-avg-prayers">Average Number of prayers offered per day</Label>
                      <Input
                        id="edit-avg-prayers"
                        type="number"
                        min="0"
                        max="5"
                        value={avgPrayersPerDay}
                        onChange={(e) => setAvgPrayersPerDay(e.target.value)}
                        placeholder="0-5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-tilawat-days">Number of days Tilawat of Holy Quran was done</Label>
                      <Input
                        id="edit-tilawat-days"
                        type="number"
                        min="0"
                        max="31"
                        value={tilawatDays}
                        onChange={(e) => setTilawatDays(e.target.value)}
                        placeholder="0-31"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-friday-prayers">Number of Friday prayers attended</Label>
                      <Input
                        id="edit-friday-prayers"
                        type="number"
                        min="0"
                        max="5"
                        value={fridayPrayers}
                        onChange={(e) => setFridayPrayers(e.target.value)}
                        placeholder="0-5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-friday-sermons">Number of Huzur's Friday sermon listened</Label>
                      <Input
                        id="edit-friday-sermons"
                        type="number"
                        min="0"
                        max="5"
                        value={fridaySermons}
                        onChange={(e) => setFridaySermons(e.target.value)}
                        placeholder="0-5"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="edit-nafli-fasts">Number of Nafli fasts</Label>
                    <Input
                      id="edit-nafli-fasts"
                      type="number"
                      min="0"
                      value={nafliFasts}
                      onChange={(e) => setNafliFasts(e.target.value)}
                      placeholder="Enter number"
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex space-x-2">
                <Button
                  onClick={async () => {
                    // Update existing record
                    try {
                      if (!selectedRecord) return
                      const supabase = createClient()
                      const { error } = await supabase
                        .from("academic_data")
                        .update({
                          participant_id: selectedParticipant,
                          report_month: selectedMonth,
                          knows_prayer_full: knowsPrayerFull === "Yes",
                          knows_prayer_meaning: knowsPrayerMeaning === "Yes",
                          can_read_quran: canReadQuran === "Yes",
                          owns_bicycle: ownsBicycle === "Yes",
                          avg_prayers_per_day: avgPrayersPerDay ? Number.parseInt(avgPrayersPerDay) : null,
                          days_tilawat_done: tilawatDays ? Number.parseInt(tilawatDays) : null,
                          friday_prayers_attended: fridayPrayers ? Number.parseInt(fridayPrayers) : null,
                          huzur_sermons_listened: fridaySermons ? Number.parseInt(fridaySermons) : null,
                          nafli_fasts: nafliFasts ? Number.parseInt(nafliFasts) : null,
                        })
                        .eq("id", selectedRecord!.id)

                      if (error) throw error

                      toast({
                        title: "Record Updated",
                        description: "Academic record has been updated successfully.",
                      })

                      // Refresh data
                      const { data: academicData } = await supabase
                        .from("academic_data")
                        .select(`
                          *,
                          participants!inner(full_name, registration_number)
                        `)
                        .order("created_at", { ascending: false })

                      setAcademicRecords(academicData || [])
                      setEditDialogOpen(false)
                    } catch (error) {
                      console.error("[v0] Error updating record:", error)
                      toast({
                        title: "Error",
                        description: "Failed to update record. Please try again.",
                        variant: "destructive",
                      })
                    }
                  }}
                  className="flex-1"
                  disabled={!selectedParticipant || !selectedMonth}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Update Record
                </Button>
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
