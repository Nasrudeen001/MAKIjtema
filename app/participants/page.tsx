"use client"

import { useState, useEffect } from "react"
import { MainNavigation } from "@/components/main-navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Download, Search, Eye, Edit, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

interface Participant {
  id: string
  full_name: string
  islamic_names?: string
  date_of_birth: string
  category: string
  mobile_number: string
  region: string
  majlis: string
  registration_number: string
}

interface Region {
  id: string
  name: string
}

export default function ParticipantsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [regionFilter, setRegionFilter] = useState("all")
  const [participants, setParticipants] = useState<Participant[]>([])
  const [regions, setRegions] = useState<Region[]>([])
  const [loading, setLoading] = useState(true)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null)
  const [editFormData, setEditFormData] = useState<Participant | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()

        const { data: participantsData, error: participantsError } = await supabase
          .from("participants")
          .select("*")
          .order("created_at", { ascending: false })

        if (participantsError) {
          console.error("[v0] Error fetching participants:", participantsError)
        } else {
          setParticipants(participantsData || [])
        }

        const { data: regionsData, error: regionsError } = await supabase.from("regions").select("*").order("name")

        if (regionsError) {
          console.error("[v0] Error fetching regions:", regionsError)
        } else {
          setRegions(regionsData || [])
        }
      } catch (error) {
        console.error("[v0] Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredParticipants = participants.filter((participant) => {
    const matchesSearch =
      participant.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.registration_number.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || participant.category === categoryFilter
    const matchesRegion = regionFilter === "all" || participant.region === regionFilter

    return matchesSearch && matchesCategory && matchesRegion
  })

  const handleDownload = async () => {
    try {
      const doc = new jsPDF()

      const eventSettings = localStorage.getItem("eventSettings")
      const eventName = eventSettings ? JSON.parse(eventSettings).eventName : "Ijtema 2024"

      // Convert image to base64 for PDF embedding
      const response = await fetch("/ansar-logo.jpeg")
      const blob = await response.blob()
      const reader = new FileReader()

      reader.onload = () => {
        const base64data = reader.result as string

        // Add the logo at the top center
        const logoSize = 20
        const pageWidth = doc.internal.pageSize.getWidth()
        const logoX = (pageWidth - logoSize) / 2

        doc.addImage(base64data, "JPEG", logoX, 10, logoSize, logoSize)

        doc.setFontSize(16)
        doc.setFont("helvetica", "bold")
        const eventNameWidth = doc.getTextWidth(eventName)
        const eventNameX = (pageWidth - eventNameWidth) / 2
        doc.text(eventName, eventNameX, 40)

        doc.setFontSize(14)
        doc.setFont("helvetica", "normal")
        const docType = "Participants Report"
        const docTypeWidth = doc.getTextWidth(docType)
        const docTypeX = (pageWidth - docTypeWidth) / 2
        doc.text(docType, docTypeX, 50)

        // Add generation date and stats
        doc.setFontSize(10)
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 65)
        doc.text(`Total Records: ${filteredParticipants.length}`, 20, 70)

        // Prepare table data
        const tableData = filteredParticipants.map((p) => [
          p.registration_number,
          p.full_name,
          p.islamic_names || "",
          p.date_of_birth,
          p.category,
          p.mobile_number,
          p.region,
          p.majlis,
        ])

        autoTable(doc, {
          head: [
            ["Registration #", "Full Name", "Islamic Name", "Date of Birth", "Category", "Mobile", "Region", "Majlis"],
          ],
          body: tableData,
          startY: 80, // Adjusted startY to accommodate new headers
          styles: { fontSize: 8 },
          headStyles: { fillColor: [59, 130, 246] },
        })

        // Save the PDF
        doc.save("participants-report.pdf")
      }

      reader.readAsDataURL(blob)
    } catch (error) {
      console.error("[v0] Error generating PDF:", error)
      const doc = new jsPDF()

      const eventSettings = localStorage.getItem("eventSettings")
      const eventName = eventSettings ? JSON.parse(eventSettings).eventName : "Ijtema 2024"
      const pageWidth = doc.internal.pageSize.getWidth()

      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      const eventNameWidth = doc.getTextWidth(eventName)
      const eventNameX = (pageWidth - eventNameWidth) / 2
      doc.text(eventName, eventNameX, 30)

      doc.setFontSize(14)
      doc.setFont("helvetica", "normal")
      const docType = "Participants Report"
      const docTypeWidth = doc.getTextWidth(docType)
      const docTypeX = (pageWidth - docTypeWidth) / 2
      doc.text(docType, docTypeX, 40)

      doc.setFontSize(10)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 55)
      doc.text(`Total Records: ${filteredParticipants.length}`, 20, 60)

      const tableData = filteredParticipants.map((p) => [
        p.registration_number,
        p.full_name,
        p.islamic_names || "",
        p.date_of_birth,
        p.category,
        p.mobile_number,
        p.region,
        p.majlis,
      ])

      autoTable(doc, {
        head: [
          ["Registration #", "Full Name", "Islamic Name", "Date of Birth", "Category", "Mobile", "Region", "Majlis"],
        ],
        body: tableData,
        startY: 70, // Adjusted startY for fallback header
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] },
      })

      doc.save("participants-report.pdf")
    }
  }

  const handleView = (participant: Participant) => {
    console.log("[v0] Opening view modal for participant:", participant.full_name)
    setSelectedParticipant(participant)
    setViewModalOpen(true)
  }

  const handleEdit = (participant: Participant) => {
    console.log("[v0] Opening edit modal for participant:", participant.full_name)
    setSelectedParticipant(participant)
    setEditFormData({ ...participant })
    setEditModalOpen(true)
  }

  const handleDelete = (participant: Participant) => {
    console.log("[v0] Opening delete confirmation for participant:", participant.full_name)
    setSelectedParticipant(participant)
    setDeleteModalOpen(true)
  }

  const handleEditSubmit = async () => {
    if (!editFormData || !selectedParticipant) return

    try {
      console.log("[v0] Updating participant:", editFormData.full_name)
      const supabase = createClient()
      const { error } = await supabase
        .from("participants")
        .update({
          full_name: editFormData.full_name,
          islamic_names: editFormData.islamic_names,
          date_of_birth: editFormData.date_of_birth,
          category: editFormData.category,
          mobile_number: editFormData.mobile_number,
          region: editFormData.region,
          majlis: editFormData.majlis,
        })
        .eq("id", selectedParticipant.id)

      if (error) {
        console.error("[v0] Error updating participant:", error)
        alert("Error updating participant. Please try again.")
      } else {
        // Update local state
        setParticipants(participants.map((p) => (p.id === selectedParticipant.id ? { ...p, ...editFormData } : p)))
        setEditModalOpen(false)
        console.log("[v0] Participant updated successfully")
      }
    } catch (error) {
      console.error("[v0] Error updating participant:", error)
      alert("Error updating participant. Please try again.")
    }
  }

  const confirmDelete = async () => {
    if (!selectedParticipant) return

    setIsDeleting(true)
    try {
      console.log("[v0] Deleting participant:", selectedParticipant.full_name)
      const supabase = createClient()
      const { error } = await supabase.from("participants").delete().eq("id", selectedParticipant.id)

      if (error) {
        console.error("[v0] Error deleting participant:", error)
        alert("Error deleting participant. Please try again.")
      } else {
        // Remove from local state
        setParticipants(participants.filter((p) => p.id !== selectedParticipant.id))
        setDeleteModalOpen(false)
        console.log("[v0] Participant deleted successfully")
      }
    } catch (error) {
      console.error("[v0] Error deleting participant:", error)
      alert("Error deleting participant. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <div>
        <MainNavigation />
        <main className="container mx-auto px-4 pt-0.5 pb-2">
          <div className="text-center py-8">
            <p>Loading participants...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div>
      <MainNavigation />

      <main className="container mx-auto px-4 pt-0.5 pb-2">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Participants</h1>
          <p className="text-muted-foreground">View and manage registered Ansar</p>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search and Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or registration number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Saf Awwal">Saf Awwal</SelectItem>
                  <SelectItem value="Saf Dom">Saf Dom</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                </SelectContent>
              </Select>

              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {regions.map((region) => (
                    <SelectItem key={region.id} value={region.name}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={handleDownload} className="w-full md:w-auto">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Participants Table */}
        <Card>
          <CardHeader>
            <CardTitle>Registered Participants ({filteredParticipants.length})</CardTitle>
            <CardDescription>Complete list of registered Ansar for Ijtema 2024</CardDescription>
          </CardHeader>
          <CardContent>
            {participants.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No participants registered yet.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Participants will appear here once they complete registration.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Registration #</TableHead>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Islamic Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Mobile</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Majlis</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredParticipants.map((participant) => (
                      <TableRow key={participant.id}>
                        <TableCell className="font-medium">{participant.registration_number}</TableCell>
                        <TableCell>{participant.full_name}</TableCell>
                        <TableCell>{participant.islamic_names || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={participant.category === "Saf Awwal" ? "default" : "secondary"}>
                            {participant.category}
                          </Badge>
                        </TableCell>
                        <TableCell>{participant.mobile_number}</TableCell>
                        <TableCell>{participant.region}</TableCell>
                        <TableCell>{participant.majlis}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleView(participant)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(participant)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(participant)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* View Modal */}
        <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Participant Details</DialogTitle>
              <DialogDescription>View participant information</DialogDescription>
            </DialogHeader>
            {selectedParticipant && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Registration Number</Label>
                  <p className="text-sm text-muted-foreground">{selectedParticipant.registration_number}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Full Name</Label>
                  <p className="text-sm text-muted-foreground">{selectedParticipant.full_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Islamic Name</Label>
                  <p className="text-sm text-muted-foreground">{selectedParticipant.islamic_names || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Date of Birth</Label>
                  <p className="text-sm text-muted-foreground">{selectedParticipant.date_of_birth}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <p className="text-sm text-muted-foreground">{selectedParticipant.category}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Mobile Number</Label>
                  <p className="text-sm text-muted-foreground">{selectedParticipant.mobile_number}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Region</Label>
                  <p className="text-sm text-muted-foreground">{selectedParticipant.region}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Majlis</Label>
                  <p className="text-sm text-muted-foreground">{selectedParticipant.majlis}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewModalOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Participant</DialogTitle>
              <DialogDescription>Update participant information</DialogDescription>
            </DialogHeader>
            {editFormData && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={editFormData.full_name}
                    onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="islamic_names">Islamic Name</Label>
                  <Input
                    id="islamic_names"
                    value={editFormData.islamic_names || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, islamic_names: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={editFormData.date_of_birth}
                    onChange={(e) => setEditFormData({ ...editFormData, date_of_birth: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={editFormData.category}
                    onValueChange={(value) => setEditFormData({ ...editFormData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Saf Awwal">Saf Awwal</SelectItem>
                      <SelectItem value="Saf Dom">Saf Dom</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="mobile_number">Mobile Number</Label>
                  <Input
                    id="mobile_number"
                    value={editFormData.mobile_number}
                    onChange={(e) => setEditFormData({ ...editFormData, mobile_number: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="region">Region</Label>
                  <Select
                    value={editFormData.region}
                    onValueChange={(value) => setEditFormData({ ...editFormData, region: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region.id} value={region.name}>
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="majlis">Majlis</Label>
                  <Input
                    id="majlis"
                    value={editFormData.majlis}
                    onChange={(e) => setEditFormData({ ...editFormData, majlis: e.target.value })}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditSubmit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this participant? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            {selectedParticipant && (
              <div className="py-4">
                <p className="text-sm">
                  <strong>Name:</strong> {selectedParticipant.full_name}
                </p>
                <p className="text-sm">
                  <strong>Registration:</strong> {selectedParticipant.registration_number}
                </p>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteModalOpen(false)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete Participant"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
