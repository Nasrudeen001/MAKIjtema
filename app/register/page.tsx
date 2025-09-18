import { RegistrationForm } from "@/components/registration-form"
import { MainNavigation } from "@/components/main-navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function RegisterPage() {
  return (
    <div>
      <MainNavigation />

      <main className="container mx-auto px-4 py-2">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Register for Ijtema 2024</CardTitle>
              <CardDescription>Please fill out all required information to complete your registration</CardDescription>
            </CardHeader>
            <CardContent>
              <RegistrationForm />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
