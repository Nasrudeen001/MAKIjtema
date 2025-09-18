"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Search, Plus, Mail, Phone, Edit, Trash2, Download, Loader2, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import jsPDF from "jspdf"
import "jspdf-autotable"

interface Participant {
  id: string
  registration_number: string
  full_name: string
  email: string
  mobile_number: string
  majlis: string
  region: string
  status: string
  created_at: string
  category: string
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-primary/10 text-primary"
    case "enrolled":
      return "bg-secondary/10 text-secondary-foreground"
    case "registered":
      return "bg-chart-4/10 text-chart-4"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export function ParticipantManagement() {
  const { toast } = useToast()
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [regionFilter, setRegionFilter] = useState("all")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchParticipants = async () => {
    try {
      const response = await fetch("/api/participants")
      if (response.ok) {
        const data = await response.json()
        setParticipants(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch participants",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching participants:", error)
      toast({
        title: "Error",
        description: "Failed to fetch participants",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchParticipants()
  }, [])

  const handleDeleteParticipant = async (participantId: string) => {
    setDeletingId(participantId)
    try {
      const response = await fetch(`/api/participants/${participantId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setParticipants((prev) => prev.filter((p) => p.id !== participantId))
        toast({
          title: "Success",
          description: "Participant deleted successfully",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to delete participant",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting participant:", error)
      toast({
        title: "Error",
        description: "Failed to delete participant",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()

    // Add title
    doc.setFontSize(20)
    doc.text("Participants Management Report", 20, 20)

    // Add generation date and stats
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30)
    doc.text(`Total Participants: ${participants.length}`, 20, 35)

    // Prepare table data
    const tableData = participants.map((p) => [
      p.registration_number,
      p.full_name,
      p.email,
      p.mobile_number,
      p.majlis,
      p.region,
      p.status,
      p.category,
      new Date(p.created_at).toLocaleDateString(),
    ])

    // Add table
    doc.autoTable({
      head: [["Reg #", "Name", "Email", "Mobile", "Majlis", "Region", "Status", "Category", "Registered"]],
      body: tableData,
      startY: 45,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [59, 130, 246] },
    })

    // Save the PDF
    doc.save("participants-management.pdf")
  }

  const filteredParticipants = participants.filter((participant) => {
    const matchesSearch =
      participant.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.registration_number.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || participant.status === statusFilter
    const matchesRegion = regionFilter === "all" || participant.region === regionFilter

    return matchesSearch && matchesStatus && matchesRegion
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading participants...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Participants</h2>
          <p className="text-muted-foreground">Manage all registered participants for Ijtema 2024</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button onClick={() => (window.location.href = "/register")}>
            <Plus className="w-4 h-4 mr-2" />
            Add Participant
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by name, email, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="enrolled">Enrolled</SelectItem>
                <SelectItem value="registered">Registered</SelectItem>
              </SelectContent>
            </Select>
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="Nairobi">Nairobi</SelectItem>
                <SelectItem value="Coast">Coast</SelectItem>
                <SelectItem value="Central">Central</SelectItem>
                <SelectItem value="Eastern">Eastern</SelectItem>
                <SelectItem value="Nyanza">Nyanza</SelectItem>
                <SelectItem value="Rift Valley">Rift Valley</SelectItem>
                <SelectItem value="Western">Western</SelectItem>
                <SelectItem value="North Eastern">North Eastern</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Participants Table */}
      <Card>
        <CardHeader>
          <CardTitle>Participant List</CardTitle>
          <CardDescription>
            Showing {filteredParticipants.length} of {participants.length} participants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Participant</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Registration</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParticipants.map((participant) => (
                <TableRow key={participant.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {participant.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{participant.full_name}</div>
                        <div className="text-sm text-muted-foreground">{participant.registration_number}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="w-3 h-3 mr-1" />
                        {participant.email}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="w-3 h-3 mr-1" />
                        {participant.mobile_number}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{participant.majlis}</div>
                      <div className="text-sm text-muted-foreground">{participant.region}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(participant.status)}>{participant.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{participant.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {new Date(participant.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // View participant details
                          toast({
                            title: "View Details",
                            description: `Viewing details for ${participant.full_name}`,
                          })
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Edit participant
                          toast({
                            title: "Edit Participant",
                            description: `Editing ${participant.full_name}`,
                          })
                        }}
                      >
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
                            <AlertDialogTitle>Delete Participant</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {participant.full_name}? This action cannot be undone and
                              will remove all associated data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteParticipant(participant.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              disabled={deletingId === participant.id}
                            >
                              {deletingId === participant.id ? (
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
        </CardContent>
      </Card>
    </div>
  )
}
