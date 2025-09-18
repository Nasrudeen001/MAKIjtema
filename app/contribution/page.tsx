"use client"

import type React from "react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
// import Image from "next/image"

import { useState, useEffect } from "react"
import { MainNavigation } from "@/components/main-navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, DollarSign, Download, Check, ChevronsUpDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface Contribution {
  id: string
  participant_id: string
  participant_name: string
  month: string
  chanda_majlis?: number
  chanda_ijtema?: number
  tehrik_e_jadid?: number
  waqf_e_jadid?: number
  publication?: number
  khidmat_e_khalq?: number
  ansar_project?: number
  created_at: string
}

interface Participant {
  id: string
  full_name: string
  registration_number: string
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

export default function ContributionPage() {
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingContribution, setEditingContribution] = useState<Contribution | null>(null)
  const [loading, setLoading] = useState(true)
  const [participantComboboxOpen, setParticipantComboboxOpen] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    participantId: "",
    month: "",
    chandaMajlis: "",
    chandaIjtema: "",
    tehrikEJadid: "",
    waqfEJadid: "",
    publication: "",
    khidmatEKhalq: "",
    ansarProject: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const supabase = createClient()

      const { data: participantsData, error: participantsError } = await supabase
        .from("participants")
        .select("id, full_name, registration_number")
        .order("full_name")

      if (participantsError) {
        console.error("[v0] Error fetching participants:", participantsError)
      } else {
        setParticipants(participantsData || [])
      }

      const { data: contributionsData, error: contributionsError } = await supabase
        .from("contributions")
        .select(`
          *,
          participants!inner(full_name, registration_number)
        `)
        .order("created_at", { ascending: false })

      if (contributionsError) {
        console.error("[v0] Error fetching contributions:", contributionsError)
      } else {
        // Transform data to match component interface
        const transformedContributions =
          contributionsData?.map((contrib) => ({
            ...contrib,
            participant_name: contrib.participants.full_name,
          })) || []
        setContributions(transformedContributions)
      }
    } catch (error) {
      console.error("[v0] Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const participant = participants.find((p) => p.id === formData.participantId)
    if (!participant) return

    try {
      const supabase = createClient()

      const contributionData = {
        participant_id: formData.participantId,
        month: formData.month,
        chanda_majlis: formData.chandaMajlis ? Number.parseFloat(formData.chandaMajlis) : null,
        chanda_ijtema: formData.chandaIjtema ? Number.parseFloat(formData.chandaIjtema) : null,
        tehrik_e_jadid: formData.tehrikEJadid ? Number.parseFloat(formData.tehrikEJadid) : null,
        waqf_e_jadid: formData.waqfEJadid ? Number.parseFloat(formData.waqfEJadid) : null,
        publication: formData.publication ? Number.parseFloat(formData.publication) : null,
        khidmat_e_khalq: formData.khidmatEKhalq ? Number.parseFloat(formData.khidmatEKhalq) : null,
        ansar_project: formData.ansarProject ? Number.parseFloat(formData.ansarProject) : null,
      }

      if (editingContribution) {
        const { error } = await supabase.from("contributions").update(contributionData).eq("id", editingContribution.id)

        if (error) throw error
        toast({ title: "Contribution updated successfully" })
      } else {
        const { error } = await supabase.from("contributions").insert(contributionData)

        if (error) throw error
        toast({ title: "Contribution recorded successfully" })
      }

      resetForm()
      loadData() // Refresh data
    } catch (error) {
      console.error("[v0] Error saving contribution:", error)
      toast({
        title: "Error",
        description: "Failed to save contribution. Please try again.",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      participantId: "",
      month: "",
      chandaMajlis: "",
      chandaIjtema: "",
      tehrikEJadid: "",
      waqfEJadid: "",
      publication: "",
      khidmatEKhalq: "",
      ansarProject: "",
    })
    setShowForm(false)
    setEditingContribution(null)
  }

  const handleEdit = (contribution: Contribution) => {
    setFormData({
      participantId: contribution.participant_id,
      month: contribution.month,
      chandaMajlis: contribution.chanda_majlis?.toString() || "",
      chandaIjtema: contribution.chanda_ijtema?.toString() || "",
      tehrikEJadid: contribution.tehrik_e_jadid?.toString() || "",
      waqfEJadid: contribution.waqf_e_jadid?.toString() || "",
      publication: contribution.publication?.toString() || "",
      khidmatEKhalq: contribution.khidmat_e_khalq?.toString() || "",
      ansarProject: contribution.ansar_project?.toString() || "",
    })
    setEditingContribution(contribution)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const supabase = createClient()

      const { error } = await supabase.from("contributions").delete().eq("id", id)

      if (error) throw error

      toast({ title: "Contribution deleted successfully" })
      loadData() // Refresh data
    } catch (error) {
      console.error("[v0] Error deleting contribution:", error)
      toast({
        title: "Error",
        description: "Failed to delete contribution. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDownloadPDF = () => {
    const doc = new jsPDF()

    const eventSettings = localStorage.getItem("eventSettings")
    const eventName = eventSettings ? JSON.parse(eventSettings).eventName : "Ijtema 2024"

    // Add logo to the center-top of the PDF
    const logoImg = new window.Image()
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
      const docType = "Contributions Report"
      const docTypeWidth = doc.getTextWidth(docType)
      const docTypeX = (pageWidth - docTypeWidth) / 2
      doc.text(docType, docTypeX, 50)

      // Add generation date and stats
      doc.setFontSize(10)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 65)
      doc.text(`Total Records: ${filteredContributions.length}`, 20, 70)

      const totalAmount = filteredContributions.reduce((sum, contrib) => sum + calculateTotal(contrib), 0)
      doc.text(`Total Amount: KES ${totalAmount.toLocaleString()}`, 20, 75)

      // Prepare table data
      const tableData = filteredContributions.map((c) => [
        c.participant_name,
        c.month,
        c.chanda_majlis?.toLocaleString() || "0",
        c.chanda_ijtema?.toLocaleString() || "0",
        c.tehrik_e_jadid?.toLocaleString() || "0",
        c.waqf_e_jadid?.toLocaleString() || "0",
        c.publication?.toLocaleString() || "0",
        c.khidmat_e_khalq?.toLocaleString() || "0",
        c.ansar_project?.toLocaleString() || "0",
        calculateTotal(c).toLocaleString(),
      ])

      autoTable(doc, {
        head: [
          [
            "Participant",
            "Month",
            "Chanda Majlis",
            "Chanda Ijtema",
            "Tehrik-e-Jadid",
            "Waqf-e-jadid",
            "Publication",
            "Khidmat-e-khalq",
            "Ansar Project",
            "Total",
          ],
        ],
        body: tableData,
        startY: 85, // Adjusted startY to accommodate new headers
        styles: { fontSize: 6 },
        headStyles: { fillColor: [59, 130, 246] },
      })

      // Save the PDF
      doc.save("contributions-report.pdf")
    }

    logoImg.onerror = () => {
      console.warn("[v0] Logo image failed to load, generating PDF without logo")
      // Generate PDF without logo if image fails to load
      const pageWidth = doc.internal.pageSize.getWidth()

      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      const eventNameWidth = doc.getTextWidth(eventName)
      const eventNameX = (pageWidth - eventNameWidth) / 2
      doc.text(eventName, eventNameX, 30)

      doc.setFontSize(14)
      doc.setFont("helvetica", "normal")
      const docType = "Contributions Report"
      const docTypeWidth = doc.getTextWidth(docType)
      const docTypeX = (pageWidth - docTypeWidth) / 2
      doc.text(docType, docTypeX, 40)

      // Add generation date and stats
      doc.setFontSize(10)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 55)
      doc.text(`Total Records: ${filteredContributions.length}`, 20, 60)

      const totalAmount = filteredContributions.reduce((sum, contrib) => sum + calculateTotal(contrib), 0)
      doc.text(`Total Amount: KES ${totalAmount.toLocaleString()}`, 20, 65)

      // Prepare table data
      const tableData = filteredContributions.map((c) => [
        c.participant_name,
        c.month,
        c.chanda_majlis?.toLocaleString() || "0",
        c.chanda_ijtema?.toLocaleString() || "0",
        c.tehrik_e_jadid?.toLocaleString() || "0",
        c.waqf_e_jadid?.toLocaleString() || "0",
        c.publication?.toLocaleString() || "0",
        c.khidmat_e_khalq?.toLocaleString() || "0",
        c.ansar_project?.toLocaleString() || "0",
        calculateTotal(c).toLocaleString(),
      ])

      autoTable(doc, {
        head: [
          [
            "Participant",
            "Month",
            "Chanda Majlis",
            "Chanda Ijtema",
            "Tehrik-e-Jadid",
            "Waqf-e-jadid",
            "Publication",
            "Khidmat-e-khalq",
            "Ansar Project",
            "Total",
          ],
        ],
        body: tableData,
        startY: 75,
        styles: { fontSize: 6 },
        headStyles: { fillColor: [59, 130, 246] },
      })

      // Save the PDF
      doc.save("contributions-report.pdf")
    }

    logoImg.crossOrigin = "anonymous"
    logoImg.src = "/ansar-logo.jpeg"
  }

  const filteredContributions = contributions.filter((contribution) => {
    const matchesSearch =
      contribution.participant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contribution.participant_id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesMonth = !selectedMonth || contribution.month.toLowerCase() === selectedMonth
    return matchesSearch && matchesMonth
  })

  const calculateTotal = (contribution: Contribution) => {
    return (
      (contribution.chanda_majlis || 0) +
      (contribution.chanda_ijtema || 0) +
      (contribution.tehrik_e_jadid || 0) +
      (contribution.waqf_e_jadid || 0) +
      (contribution.publication || 0) +
      (contribution.khidmat_e_khalq || 0) +
      (contribution.ansar_project || 0)
    )
  }

  if (loading) {
    return (
      <div>
        <MainNavigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <p>Loading contributions...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div>
      <MainNavigation />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Contribution Management</h1>
            <p className="text-muted-foreground mt-2">Record and manage participant contributions</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Record Contribution
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" modal={false}>
                <DialogHeader>
                  <DialogTitle>{editingContribution ? "Edit" : "Record"} Contribution</DialogTitle>
                  <DialogDescription>Fill in the contribution details for the participant</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="participant">Participant *</Label>
                <Select
                  value={formData.participantId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, participantId: value }))}
                  required
                >
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
                        <Label htmlFor="month">Month *</Label>
                        <Select
                          value={formData.month}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, month: value }))}
                          required
                        >
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

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="chandaMajlis">Chanda Majlis (KES)</Label>
                        <Input
                          id="chandaMajlis"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.chandaMajlis}
                          onChange={(e) => setFormData((prev) => ({ ...prev, chandaMajlis: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="chandaIjtema">Chanda Ijtema (KES)</Label>
                        <Input
                          id="chandaIjtema"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.chandaIjtema}
                          onChange={(e) => setFormData((prev) => ({ ...prev, chandaIjtema: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="tehrikEJadid">Tehrik-e-Jadid (KES)</Label>
                        <Input
                          id="tehrikEJadid"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.tehrikEJadid}
                          onChange={(e) => setFormData((prev) => ({ ...prev, tehrikEJadid: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="waqfEJadid">Waqf-e-jadid (KES)</Label>
                        <Input
                          id="waqfEJadid"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.waqfEJadid}
                          onChange={(e) => setFormData((prev) => ({ ...prev, waqfEJadid: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="publication">Publication (KES)</Label>
                        <Input
                          id="publication"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.publication}
                          onChange={(e) => setFormData((prev) => ({ ...prev, publication: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="khidmatEKhalq">Khidmat-e-khalq (KES)</Label>
                        <Input
                          id="khidmatEKhalq"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.khidmatEKhalq}
                          onChange={(e) => setFormData((prev) => ({ ...prev, khidmatEKhalq: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="ansarProject">Ansar Project (KES)</Label>
                        <Input
                          id="ansarProject"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.ansarProject}
                          onChange={(e) => setFormData((prev) => ({ ...prev, ansarProject: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="bg-primary hover:bg-primary/90">
                        {editingContribution ? "Update" : "Record"} Contribution
                      </Button>
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search Participants</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by name or registration number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Label htmlFor="month-filter">Filter by Month</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="All months" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All months</SelectItem>
                    {months.map((month) => (
                      <SelectItem key={month} value={month.toLowerCase()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contribution Form */}
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editingContribution ? "Edit" : "Record"} Contribution</CardTitle>
              <CardDescription>Fill in the contribution details for the participant</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="participant">Participant *</Label>
            <Select
              value={formData.participantId}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, participantId: value }))}
              required
            >
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
                    <Label htmlFor="month">Month *</Label>
                    <Select
                      value={formData.month}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, month: value }))}
                      required
                    >
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="chandaMajlis">Chanda Majlis (KES)</Label>
                    <Input
                      id="chandaMajlis"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.chandaMajlis}
                      onChange={(e) => setFormData((prev) => ({ ...prev, chandaMajlis: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="chandaIjtema">Chanda Ijtema (KES)</Label>
                    <Input
                      id="chandaIjtema"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.chandaIjtema}
                      onChange={(e) => setFormData((prev) => ({ ...prev, chandaIjtema: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tehrikEJadid">Tehrik-e-Jadid (KES)</Label>
                    <Input
                      id="tehrikEJadid"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.tehrikEJadid}
                      onChange={(e) => setFormData((prev) => ({ ...prev, tehrikEJadid: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="waqfEJadid">Waqf-e-jadid (KES)</Label>
                    <Input
                      id="waqfEJadid"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.waqfEJadid}
                      onChange={(e) => setFormData((prev) => ({ ...prev, waqfEJadid: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="publication">Publication (KES)</Label>
                    <Input
                      id="publication"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.publication}
                      onChange={(e) => setFormData((prev) => ({ ...prev, publication: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="khidmatEKhalq">Khidmat-e-khalq (KES)</Label>
                    <Input
                      id="khidmatEKhalq"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.khidmatEKhalq}
                      onChange={(e) => setFormData((prev) => ({ ...prev, khidmatEKhalq: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ansarProject">Ansar Project (KES)</Label>
                    <Input
                      id="ansarProject"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.ansarProject}
                      onChange={(e) => setFormData((prev) => ({ ...prev, ansarProject: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="bg-primary hover:bg-primary/90">
                    {editingContribution ? "Update" : "Record"} Contribution
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Contributions List */}
        <div className="grid gap-4">
          {filteredContributions.map((contribution) => (
            <Card key={contribution.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{contribution.participant_name}</h3>
                        <p className="text-sm text-muted-foreground">{contribution.month}</p>
                      </div>
                      <Badge variant="secondary" className="ml-auto">
                        <DollarSign className="w-3 h-3 mr-1" />
                        Total: KES {calculateTotal(contribution).toLocaleString()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 text-sm">
                      {contribution.chanda_majlis && (
                        <div>
                          <p className="text-muted-foreground">Chanda Majlis</p>
                          <p className="font-medium">KES {contribution.chanda_majlis.toLocaleString()}</p>
                        </div>
                      )}
                      {contribution.chanda_ijtema && (
                        <div>
                          <p className="text-muted-foreground">Chanda Ijtema</p>
                          <p className="font-medium">KES {contribution.chanda_ijtema.toLocaleString()}</p>
                        </div>
                      )}
                      {contribution.tehrik_e_jadid && (
                        <div>
                          <p className="text-muted-foreground">Tehrik-e-Jadid</p>
                          <p className="font-medium">KES {contribution.tehrik_e_jadid.toLocaleString()}</p>
                        </div>
                      )}
                      {contribution.waqf_e_jadid && (
                        <div>
                          <p className="text-muted-foreground">Waqf-e-jadid</p>
                          <p className="font-medium">KES {contribution.waqf_e_jadid.toLocaleString()}</p>
                        </div>
                      )}
                      {contribution.publication && (
                        <div>
                          <p className="text-muted-foreground">Publication</p>
                          <p className="font-medium">KES {contribution.publication.toLocaleString()}</p>
                        </div>
                      )}
                      {contribution.khidmat_e_khalq && (
                        <div>
                          <p className="text-muted-foreground">Khidmat-e-khalq</p>
                          <p className="font-medium">KES {contribution.khidmat_e_khalq.toLocaleString()}</p>
                        </div>
                      )}
                      {contribution.ansar_project && (
                        <div>
                          <p className="text-muted-foreground">Ansar Project</p>
                          <p className="font-medium">KES {contribution.ansar_project.toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(contribution)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(contribution.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredContributions.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">
                  {participants.length === 0
                    ? "No participants registered yet. Please register participants first."
                    : "No contributions found matching your criteria."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
