"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle } from "lucide-react"

interface RegistrationData {
  fullName: string
  islamicNames: string
  dateOfBirth: string
  years: string
  category: string
  mobileNumber: string
  region: string
  majlis: string
}

interface Majlis {
  id: string
  name: string
  regionId: string
}

interface Region {
  id: string
  name: string
  majlis: Majlis[]
}

export function RegistrationForm() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [registrationNumber, setRegistrationNumber] = useState("")
  const [regions, setRegions] = useState<Region[]>([])
  const [availableMajlis, setAvailableMajlis] = useState<Majlis[]>([])

  const [formData, setFormData] = useState<RegistrationData>({
    fullName: "",
    islamicNames: "",
    dateOfBirth: "",
    years: "",
    category: "",
    mobileNumber: "",
    region: "",
    majlis: "",
  })

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await fetch("/api/regions")
        if (response.ok) {
          const data = await response.json()
          setRegions(data)
        } else {
          const initialRegions: Region[] = [
            {
              id: "1",
              name: "Nairobi",
              majlis: [
                { id: "1", name: "Nairobi Central", regionId: "1" },
                { id: "2", name: "Nairobi East", regionId: "1" },
                { id: "3", name: "Nairobi West", regionId: "1" },
                { id: "4", name: "Nairobi South", regionId: "1" },
              ],
            },
            {
              id: "2",
              name: "Central",
              majlis: [
                { id: "5", name: "Thika", regionId: "2" },
                { id: "6", name: "Nyeri", regionId: "2" },
              ],
            },
            {
              id: "3",
              name: "Coast",
              majlis: [
                { id: "7", name: "Mombasa", regionId: "3" },
                { id: "8", name: "Malindi", regionId: "3" },
              ],
            },
            {
              id: "4",
              name: "Eastern",
              majlis: [
                { id: "9", name: "Machakos", regionId: "4" },
                { id: "10", name: "Meru", regionId: "4" },
              ],
            },
            {
              id: "5",
              name: "Nyanza",
              majlis: [{ id: "11", name: "Kisumu", regionId: "5" }],
            },
            {
              id: "6",
              name: "Rift Valley",
              majlis: [
                { id: "12", name: "Nakuru", regionId: "6" },
                { id: "13", name: "Eldoret", regionId: "6" },
              ],
            },
            {
              id: "7",
              name: "Western",
              majlis: [
                { id: "14", name: "Kakamega", regionId: "7" },
                { id: "15", name: "Kitale", regionId: "7" },
              ],
            },
            {
              id: "8",
              name: "North Eastern",
              majlis: [{ id: "16", name: "Garissa", regionId: "8" }],
            },
          ]
          setRegions(initialRegions)
        }
      } catch (error) {
        console.error("Failed to fetch regions:", error)
      }
    }

    fetchRegions()
  }, [])

  useEffect(() => {
    if (formData.region) {
      const selectedRegion = regions.find((r) => r.name === formData.region)
      setAvailableMajlis(selectedRegion?.majlis || [])
      if (formData.majlis) {
        setFormData((prev) => ({ ...prev, majlis: "" }))
      }
    } else {
      setAvailableMajlis([])
    }
  }, [formData.region, regions])

  const calculateAge = (dateOfBirth: string): number => {
    if (!dateOfBirth) return 0

    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    return monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age
  }

  const calculateCategory = (dateOfBirth: string): string => {
    if (!dateOfBirth) return ""

    const actualAge = calculateAge(dateOfBirth)

    if (actualAge > 55) {
      return "Saf Awwal"
    } else if (actualAge >= 40 && actualAge <= 55) {
      return "Saf Dom"
    } else {
      return "General"
    }
  }

  const handleInputChange = (field: keyof RegistrationData, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value }

      if (field === "dateOfBirth") {
        const age = calculateAge(value)
        updated.years = age > 0 ? age.toString() : ""
        updated.category = calculateCategory(value)
      }

      return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/participants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const result = await response.json()
        setRegistrationNumber(result.registrationNumber)
        setIsSubmitted(true)

        toast({
          title: "Registration Successful!",
          description: `Your registration number is ${result.registrationNumber}. Please save this for your records.`,
        })
      } else {
        throw new Error("Registration failed")
      }
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Registration Failed",
        description: "There was an error processing your registration. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-foreground mb-2">Registration Complete!</h3>
        <p className="text-muted-foreground mb-4">Thank you for registering for Ijtema 2024</p>
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-lg">Your Registration Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Registration Number:</span>
              <span className="text-primary font-bold">{registrationNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Name:</span>
              <span>{formData.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Category:</span>
              <span className="text-primary font-semibold">{formData.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Mobile:</span>
              <span>{formData.mobileNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Status:</span>
              <span className="text-primary">Registered</span>
            </div>
          </CardContent>
        </Card>
        <div className="mt-6 space-x-4">
          <Button onClick={() => window.print()}>Print Registration</Button>
          <Button
            variant="outline"
            onClick={() => {
              setIsSubmitted(false)
              setFormData({
                fullName: "",
                islamicNames: "",
                dateOfBirth: "",
                years: "",
                category: "",
                mobileNumber: "",
                region: "",
                majlis: "",
              })
            }}
          >
            Register Another Participant
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Personal Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              placeholder="Enter your complete full name"
              required
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="islamicNames">Islamic Names (Optional)</Label>
            <Input
              id="islamicNames"
              value={formData.islamicNames}
              onChange={(e) => handleInputChange("islamicNames", e.target.value)}
              placeholder="Enter your Islamic names if different from above"
            />
          </div>
          <div>
            <Label htmlFor="dateOfBirth">Date of Birth *</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="years">Years</Label>
            <Input
              id="years"
              value={formData.years}
              readOnly
              placeholder="Auto-calculated from date of birth"
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Age calculated automatically when date of birth is entered
            </p>
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category}
              readOnly
              placeholder="Auto-calculated based on age"
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Saf Awwal (55+ years), Saf Dom (40-55 years), General (under 40)
            </p>
          </div>
          <div>
            <Label htmlFor="mobileNumber">Mobile Number *</Label>
            <Input
              id="mobileNumber"
              type="tel"
              placeholder="+254..."
              value={formData.mobileNumber}
              onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Location Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="region">Region *</Label>
            <Select value={formData.region} onValueChange={(value) => handleInputChange("region", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your region" />
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
            <Label htmlFor="majlis">Majlis *</Label>
            <Select
              value={formData.majlis}
              onValueChange={(value) => handleInputChange("majlis", value)}
              disabled={!formData.region}
            >
              <SelectTrigger>
                <SelectValue placeholder={formData.region ? "Select your local majlis" : "Select region first"} />
              </SelectTrigger>
              <SelectContent>
                {availableMajlis.map((majlis) => (
                  <SelectItem key={majlis.id} value={majlis.name}>
                    {majlis.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!formData.region && (
              <p className="text-xs text-muted-foreground mt-1">Please select a region first to see available majlis</p>
            )}
          </div>
        </div>
      </div>

      <div className="pt-6">
        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing Registration...
            </>
          ) : (
            "Complete Registration"
          )}
        </Button>
      </div>
    </form>
  )
}
