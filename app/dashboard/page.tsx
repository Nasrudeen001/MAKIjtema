"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MainNavigation } from "@/components/main-navigation"
import { Users, UserCheck, MapPin, Calendar, DollarSign, TrendingUp, Settings } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface EventSettings {
  eventStartDate: string
  eventName: string
  eventLocation: string
  totalDays: number
  createdAt: string
}

interface ContributionStat {
  name: string
  payers: number
  total_amount: number
}

interface RegionStat {
  name: string
  participants: number
}

function getOrdinalSuffix(num: number): string {
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

export default function DashboardPage() {
  const [eventSettings, setEventSettings] = useState<EventSettings | null>(null)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadEventSettings = () => {
      const savedSettings = localStorage.getItem("eventSettings")
      if (savedSettings) {
        setEventSettings(JSON.parse(savedSettings))
      } else {
        setEventSettings(null)
      }
    }

    // Load initial settings
    loadEventSettings()

    // Listen for event settings updates
    const handleEventUpdate = (event: CustomEvent) => {
      setEventSettings(event.detail)
    }

    window.addEventListener("eventSettingsUpdated", handleEventUpdate as EventListener)

    return () => {
      window.removeEventListener("eventSettingsUpdated", handleEventUpdate as EventListener)
    }
  }, [])

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        console.log("[v0] Starting dashboard data fetch")
        const supabase = createClient()

        const { data: testConnection, error: connectionError } = await supabase
          .from("participants")
          .select("count", { count: "exact", head: true })

        if (connectionError) {
          console.log("[v0] Database connection error:", connectionError)
          throw new Error(`Database connection failed: ${connectionError.message}`)
        }

        console.log("[v0] Database connection successful")

        // Get participant statistics
        const { data: participantStats, error: participantError } = await supabase
          .from("participants")
          .select("category, region")

        if (participantError) {
          console.log("[v0] Participant fetch error:", participantError)
          throw new Error(`Failed to fetch participants: ${participantError.message}`)
        }

        console.log("[v0] Participants fetched:", participantStats?.length || 0)

        const totalParticipants = participantStats?.length || 0
        const safAwwal = participantStats?.filter((p) => p.category === "Saf Awwal").length || 0
        const safDom = participantStats?.filter((p) => p.category === "Saf Dom").length || 0
        const totalRegions = new Set(participantStats?.map((p) => p.region)).size || 0

        // Get contribution statistics
        const { data: contributions, error: contributionError } = await supabase
          .from("contributions")
          .select("*")
          .not("month", "is", null)

        if (contributionError) {
          console.log("[v0] Contribution fetch error:", contributionError)
        }

        console.log("[v0] Contributions fetched:", contributions?.length || 0)

        const contributionStats: ContributionStat[] = [
          {
            name: "Chanda Majlis",
            payers: contributions?.filter((c) => c.chanda_majlis > 0).length || 0,
            total_amount: contributions?.reduce((sum, c) => sum + (c.chanda_majlis || 0), 0) || 0,
          },
          {
            name: "Chanda Ijtema",
            payers: contributions?.filter((c) => c.chanda_ijtema > 0).length || 0,
            total_amount: contributions?.reduce((sum, c) => sum + (c.chanda_ijtema || 0), 0) || 0,
          },
          {
            name: "Tehrik-e-Jadid",
            payers: contributions?.filter((c) => c.tehrik_e_jadid > 0).length || 0,
            total_amount: contributions?.reduce((sum, c) => sum + (c.tehrik_e_jadid || 0), 0) || 0,
          },
          {
            name: "Waqf-e-jadid",
            payers: contributions?.filter((c) => c.waqf_e_jadid > 0).length || 0,
            total_amount: contributions?.reduce((sum, c) => sum + (c.waqf_e_jadid || 0), 0) || 0,
          },
          {
            name: "Publication",
            payers: contributions?.filter((c) => c.publication > 0).length || 0,
            total_amount: contributions?.reduce((sum, c) => sum + (c.publication || 0), 0) || 0,
          },
          {
            name: "Khidmat-e-khalq",
            payers: contributions?.filter((c) => c.khidmat_e_khalq > 0).length || 0,
            total_amount: contributions?.reduce((sum, c) => sum + (c.khidmat_e_khalq || 0), 0) || 0,
          },
          {
            name: "Ansar Project",
            payers: contributions?.filter((c) => c.ansar_project > 0).length || 0,
            total_amount: contributions?.reduce((sum, c) => sum + (c.ansar_project || 0), 0) || 0,
          },
        ]

        // Get regional statistics
        const regionCounts =
          participantStats?.reduce(
            (acc, p) => {
              acc[p.region] = (acc[p.region] || 0) + 1
              return acc
            },
            {} as Record<string, number>,
          ) || {}

        const regionStats = Object.entries(regionCounts)
          .map(([name, participants]) => ({ name, participants }))
          .sort((a, b) => b.participants - a.participants)

        setDashboardData({
          participantStats: {
            total_participants: totalParticipants,
            saf_awwal: safAwwal,
            saf_dom: safDom,
            total_regions: totalRegions,
          },
          contributionStats,
          regionStats,
        })
        setError(null)
      } catch (error) {
        console.error("[v0] Error fetching dashboard data:", error)
        setError(error instanceof Error ? error.message : "Unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const getCurrentDay = () => {
    if (!eventSettings) return "No event configured"

    const startDate = new Date(eventSettings.eventStartDate)
    const currentDate = new Date()
    const diffTime = currentDate.getTime() - startDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 1) return "Event not started"
    if (diffDays > eventSettings.totalDays) return "Event completed"
    return `${getOrdinalSuffix(diffDays)} day of ${eventSettings.totalDays}`
  }

  const getProgressPercentage = () => {
    if (!eventSettings) return 0

    const startDate = new Date(eventSettings.eventStartDate)
    const currentDate = new Date()
    const diffTime = currentDate.getTime() - startDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return Math.min(100, Math.max(0, (diffDays / eventSettings.totalDays) * 100))
  }

  if (loading) {
    return (
      <div>
        <MainNavigation />
        <main className="container mx-auto px-4 pt-0.5 pb-2">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Loading dashboard data...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <MainNavigation />
        <main className="container mx-auto px-4 pt-0.5 pb-2">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Overview of Ijtema System</p>
          </div>
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">Database Connection Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700 mb-4">{error}</p>
              <p className="text-sm text-red-600">
                Please ensure the Supabase database schema has been created by running the SQL script.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const { participantStats, contributionStats, regionStats } = dashboardData

  const totalContributionAmount = contributionStats.reduce(
    (sum: number, contrib: ContributionStat) => sum + Number(contrib.total_amount),
    0,
  )
  const totalContributors = contributionStats.reduce((sum: number, contrib: ContributionStat) => sum + Number(contrib.payers), 0)

  return (
    <div>
      <MainNavigation />

      <main className="container mx-auto px-4 pt-0.5 pb-2">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of {eventSettings ? eventSettings.eventName : "Ijtema System"}
          </p>
        </div>

        {eventSettings && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Current Event Details</span>
              </CardTitle>
              <CardDescription>Live event information and progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">{getCurrentDay()}</div>
                  <p className="text-sm text-muted-foreground">Current Progress</p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold mb-1">{eventSettings.eventName}</div>
                  <p className="text-sm text-muted-foreground">Event Name</p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold mb-1">{eventSettings.eventLocation}</div>
                  <p className="text-sm text-muted-foreground">Location</p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold mb-1">
                    {new Date(eventSettings.eventStartDate).toLocaleDateString()}
                  </div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Event Progress</span>
                  <span>{getCurrentDay()}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-3">
                  <div
                    className="bg-primary h-3 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage()}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saf Awwal</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{participantStats.saf_awwal}</div>
              <p className="text-xs text-muted-foreground">Above 55 years</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saf Dom</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{participantStats.saf_dom}</div>
              <p className="text-xs text-muted-foreground">40-55 years</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{participantStats.total_participants}</div>
              <p className="text-xs text-muted-foreground">All registered Ansar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Regions Represented</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{participantStats.total_regions}</div>
              <p className="text-xs text-muted-foreground">Across Kenya</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 mb-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span>Total Contributions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      KSh {totalContributionAmount.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">Total Amount</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{totalContributors}</div>
                    <p className="text-xs text-muted-foreground">Total Contributors</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Top Contributions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contributionStats
                  .sort((a: ContributionStat, b: ContributionStat) => b.total_amount - a.total_amount)
                  .slice(0, 3)
                  .map((contrib: ContributionStat) => (
                    <div key={contrib.name} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{contrib.name}</span>
                      <div className="text-right">
                        <div className="text-sm font-bold text-primary">
                          KSh {contrib.total_amount.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">{contrib.payers} payers</div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Contribution Statistics</CardTitle>
            <CardDescription>Number of payers and total amounts for each contribution type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contributionStats.map((contrib: ContributionStat) => (
                <div key={contrib.name} className="p-4 bg-secondary/50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">{contrib.name}</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Payers:</span>
                      <span className="font-bold text-primary">{contrib.payers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Amount:</span>
                      <span className="font-bold text-primary">KSh {contrib.total_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Avg:</span>
                      <span className="text-xs">
                        KSh {Math.round(Number(contrib.total_amount) / Number(contrib.payers)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-4 mb-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Event Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Event Day</span>
                    <span>{getCurrentDay()}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage()}%` }}
                    ></div>
                  </div>
                </div>
                {eventSettings && (
                  <div className="text-sm text-muted-foreground">
                    Started: {new Date(eventSettings.eventStartDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Saf Awwal (55+ years)</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${(participantStats.saf_awwal / participantStats.total_participants) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{participantStats.saf_awwal}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Saf Dom (40-55 years)</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${(participantStats.saf_dom / participantStats.total_participants) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{participantStats.saf_dom}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Regional Representation</CardTitle>
            <CardDescription>Participants by region across Kenya</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {regionStats.map((region: RegionStat) => (
                <div key={region.name} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <span className="font-medium">{region.name}</span>
                  <span className="text-primary font-bold">{region.participants}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
