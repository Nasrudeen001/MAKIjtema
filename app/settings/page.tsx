"use client"

import { useState, useEffect } from "react"
import { MainNavigation } from "@/components/main-navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Save, SettingsIcon, Edit, Trash2, Plus } from "lucide-react"
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

interface EventSettings {
  eventStartDate: string
  eventName: string
  eventLocation: string
  totalDays: number
  createdAt: string
}

export default function SettingsPage() {
  const [eventStartDate, setEventStartDate] = useState("2024-03-15")
  const [eventName, setEventName] = useState("Ijtema 2024")
  const [eventLocation, setEventLocation] = useState("Nairobi, Kenya")
  const [totalDays, setTotalDays] = useState("3")
  const [existingEvent, setExistingEvent] = useState<EventSettings | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const savedSettings = localStorage.getItem("eventSettings")
    if (savedSettings) {
      const settings: EventSettings = JSON.parse(savedSettings)
      setExistingEvent(settings)
      setEventStartDate(settings.eventStartDate)
      setEventName(settings.eventName)
      setEventLocation(settings.eventLocation)
      setTotalDays(settings.totalDays.toString())
    }
  }, [])

  const getOrdinalSuffix = (num: number): string => {
    const j = num % 10
    const k = num % 100
    if (j === 1 && k !== 11) {
      return num + "st"
    }
    if (j === 2 && k !== 12) {
      return num + "nd"
    }
    if (j === 3 && k !== 13) {
      return num + "rd"
    }
    return num + "th"
  }

  const handleSaveSettings = () => {
    const eventSettings: EventSettings = {
      eventStartDate,
      eventName,
      eventLocation,
      totalDays: Number.parseInt(totalDays),
      createdAt: existingEvent ? existingEvent.createdAt : new Date().toISOString(),
    }

    localStorage.setItem("eventSettings", JSON.stringify(eventSettings))
    setExistingEvent(eventSettings)
    setIsEditing(false)

    window.dispatchEvent(new CustomEvent("eventSettingsUpdated", { detail: eventSettings }))

    toast({
      title: existingEvent ? "Event settings updated successfully!" : "Event settings saved successfully!",
      description: "Event details will now appear on the dashboard.",
    })
  }

  const handleDeleteEvent = () => {
    localStorage.removeItem("eventSettings")
    setExistingEvent(null)
    setIsEditing(false)

    // Reset form to defaults
    setEventStartDate("2024-03-15")
    setEventName("Ijtema 2024")
    setEventLocation("Nairobi, Kenya")
    setTotalDays("3")

    window.dispatchEvent(new CustomEvent("eventSettingsUpdated", { detail: null }))

    toast({
      title: "Event deleted successfully!",
      description: "Event details have been removed from the dashboard.",
    })
  }

  const handleEditEvent = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    if (existingEvent) {
      setEventStartDate(existingEvent.eventStartDate)
      setEventName(existingEvent.eventName)
      setEventLocation(existingEvent.eventLocation)
      setTotalDays(existingEvent.totalDays.toString())
    }
    setIsEditing(false)
  }

  const getCurrentDay = () => {
    const startDate = new Date(eventStartDate)
    const currentDate = new Date()
    const diffTime = currentDate.getTime() - startDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 1) return "Event not started"
    if (diffDays > Number.parseInt(totalDays)) return "Event completed"
    return `${getOrdinalSuffix(diffDays)} day of ${totalDays}`
  }

  return (
    <div>
      <MainNavigation />

      <main className="container mx-auto px-4 py-2">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Event Settings</h1>
          <p className="text-muted-foreground">Configure event details and ordinal dates</p>
        </div>

        {existingEvent && !isEditing && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <SettingsIcon className="w-5 h-5" />
                  <span>Current Event</span>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={handleEditEvent}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Event</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this event? This action cannot be undone and will remove all
                          event details from the dashboard.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteEvent}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete Event
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardTitle>
              <CardDescription>Created on {new Date(existingEvent.createdAt).toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">{getCurrentDay()}</div>
                  <p className="text-sm text-muted-foreground">Current Progress</p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold mb-1">{existingEvent.eventName}</div>
                  <p className="text-sm text-muted-foreground">Event Name</p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold mb-1">{existingEvent.eventLocation}</div>
                  <p className="text-sm text-muted-foreground">Location</p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold mb-1">
                    {new Date(existingEvent.eventStartDate).toLocaleDateString()}
                  </div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Event Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <SettingsIcon className="w-5 h-5" />
                  <span>
                    {existingEvent && !isEditing
                      ? "Create New Event"
                      : isEditing
                        ? "Edit Event"
                        : "Event Configuration"}
                  </span>
                </div>
                {isEditing && (
                  <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                )}
              </CardTitle>
              <CardDescription>
                {existingEvent && !isEditing
                  ? "Create a new event (this will replace the current event)"
                  : isEditing
                    ? "Update event information and settings"
                    : "Basic event information and settings"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="eventName">Event Name</Label>
                <Input
                  id="eventName"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="Enter event name (e.g., 1st Annual Ijtema)"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Tip: Use ordinal numbers like 1st, 2nd, 3rd for event names
                </p>
              </div>

              <div>
                <Label htmlFor="eventLocation">Event Location</Label>
                <Input
                  id="eventLocation"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  placeholder="Enter event location"
                />
              </div>

              <div>
                <Label htmlFor="eventStartDate">Event Start Date</Label>
                <Input
                  id="eventStartDate"
                  type="date"
                  value={eventStartDate}
                  onChange={(e) => setEventStartDate(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="totalDays">Total Event Days</Label>
                <Input
                  id="totalDays"
                  type="number"
                  min="1"
                  max="10"
                  value={totalDays}
                  onChange={(e) => setTotalDays(e.target.value)}
                  placeholder="Enter total days"
                />
              </div>

              <Button onClick={handleSaveSettings} className="w-full">
                {existingEvent && !isEditing ? (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Event
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isEditing ? "Update Event" : "Save Settings"}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Event Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Event Status</span>
              </CardTitle>
              <CardDescription>Current event progress and timeline</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{getCurrentDay()}</div>
                <p className="text-muted-foreground">Current Status</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Event Name:</span>
                  <span className="text-sm text-muted-foreground">{eventName}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Location:</span>
                  <span className="text-sm text-muted-foreground">{eventLocation}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Start Date:</span>
                  <span className="text-sm text-muted-foreground">{new Date(eventStartDate).toLocaleDateString()}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Duration:</span>
                  <span className="text-sm text-muted-foreground">{totalDays} days</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Event Progress</span>
                  <span>{getCurrentDay()}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, Math.max(0, (Math.ceil((new Date().getTime() - new Date(eventStartDate).getTime()) / (1000 * 60 * 60 * 24)) / Number.parseInt(totalDays)) * 100))}%`,
                    }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
