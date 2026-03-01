import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Scale, FileText, Users, Shield } from "lucide-react";
import { Link } from "wouter";

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">Legal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-foreground flex items-center justify-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              Terms and Conditions
            </CardTitle>
            <p className="text-muted-foreground mt-2">Last updated: January 2025</p>
          </CardHeader>
          
          <CardContent className="space-y-8 prose prose-slate max-w-none dark:prose-invert">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using BrainMate AI ("Service"), you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Description of Service</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                BrainMate AI is an educational technology platform that enables educators to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Create AI-powered tutors from educational content</li>
                <li>Generate interactive learning experiences with 3D avatars</li>
                <li>Track student engagement and learning analytics</li>
                <li>Access premium educational simulations and tools</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. Subscription Plans</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-foreground">Free Plan</h3>
                  <p className="text-muted-foreground">Limited features for testing and evaluation purposes.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground">Pro Plan (₹199/month)</h3>
                  <p className="text-muted-foreground">Enhanced features including advanced analytics and unlimited tutors.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground">Premium Plan (₹599/month)</h3>
                  <p className="text-muted-foreground">Full access to all features including NASA simulations and priority support.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. User Responsibilities</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">Users agree to:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Provide accurate account information</li>
                <li>Use the service for educational purposes only</li>
                <li>Not upload copyrighted content without permission</li>
                <li>Respect intellectual property rights</li>
                <li>Not attempt to reverse engineer or hack the platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Content Ownership</h2>
              <p className="text-muted-foreground leading-relaxed">
                You retain ownership of your uploaded content. BrainMate AI has the right to process this content 
                solely for the purpose of providing the AI tutoring service. We do not claim ownership of your educational materials.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Privacy and Data Protection</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your privacy is important to us. Please review our Privacy Policy to understand how we collect, 
                use, and protect your information. We comply with applicable data protection regulations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Payment Terms</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Subscription fees are charged monthly in advance. All prices are in Indian Rupees (INR). 
                We reserve the right to change pricing with 30 days notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                Either party may terminate this agreement at any time. Upon termination, your access to the service 
                will cease immediately. Data retention policies are outlined in our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">9. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                BrainMate AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages 
                resulting from your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">10. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                For questions about these Terms and Conditions, please contact us at:
              </p>
              <div className="bg-muted p-4 rounded-lg mt-4">
                <p className="font-medium text-foreground">Email: brainmateai0@gmail.com</p>
                <p className="text-muted-foreground text-sm mt-1">We typically respond within 24 hours</p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}