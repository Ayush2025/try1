import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield, Eye, Lock, Database } from "lucide-react";
import { Link } from "wouter";

export default function Privacy() {
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
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">Privacy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-foreground flex items-center justify-center gap-3">
              <Eye className="h-8 w-8 text-primary" />
              Privacy Policy
            </CardTitle>
            <p className="text-muted-foreground mt-2">Last updated: January 2025</p>
          </CardHeader>
          
          <CardContent className="space-y-8 prose prose-slate max-w-none dark:prose-invert">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Information We Collect</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    Account Information
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We collect your email address, name, and profile information when you create an account through our authentication system.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground">Educational Content</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Documents, PDFs, videos, and other educational materials you upload to create AI tutors.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground">Usage Analytics</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Session data, interaction patterns, learning progress, and platform usage statistics to improve our service.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Provide and maintain the BrainMate AI service</li>
                <li>Process your educational content to create AI tutors</li>
                <li>Generate analytics and insights about learning progress</li>
                <li>Improve our platform and develop new features</li>
                <li>Send important service updates and communications</li>
                <li>Provide customer support and technical assistance</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. Data Security</h2>
              <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="text-lg font-medium text-foreground mb-2 flex items-center gap-2">
                  <Lock className="h-5 w-5 text-blue-600" />
                  Security Measures
                </h3>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>End-to-end encryption for data transmission</li>
                  <li>Secure database storage with regular backups</li>
                  <li>Access controls and authentication protocols</li>
                  <li>Regular security audits and vulnerability assessments</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Data Sharing and Third Parties</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third parties. We may share data in the following limited circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>With AI service providers (OpenAI, Groq) to process educational content</li>
                <li>With analytics providers to understand platform usage</li>
                <li>When required by law or legal process</li>
                <li>To protect our rights, property, or safety</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Your Rights and Choices</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-foreground">Access and Portability</h3>
                  <p className="text-muted-foreground">You can request a copy of your personal data and educational content.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground">Correction and Updates</h3>
                  <p className="text-muted-foreground">You can update your account information and profile details at any time.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground">Deletion</h3>
                  <p className="text-muted-foreground">You can request deletion of your account and associated data by contacting support.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your data for as long as your account is active or as needed to provide services. 
                Educational content and analytics data may be retained for service improvement purposes. 
                You can request data deletion at any time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. International Data Transfers</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your data may be transferred to and processed in countries other than your own. 
                We ensure appropriate safeguards are in place to protect your information during such transfers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                BrainMate AI is intended for educational institutions and educators. We do not knowingly collect 
                personal information from children under 13 without parental consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">9. Updates to Privacy Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes 
                by email or through a prominent notice on our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">10. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-muted p-4 rounded-lg mt-4">
                <p className="font-medium text-foreground">Email: brainmateai0@gmail.com</p>
                <p className="text-muted-foreground text-sm mt-1">Privacy Officer</p>
                <p className="text-muted-foreground text-sm">Response time: Within 48 hours</p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}