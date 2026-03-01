import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CreditCard, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function Refund() {
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
              <CreditCard className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">Refunds</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-foreground flex items-center justify-center gap-3">
              <CreditCard className="h-8 w-8 text-primary" />
              Refund Policy
            </CardTitle>
            <p className="text-muted-foreground mt-2">Last updated: January 2025</p>
          </CardHeader>
          
          <CardContent className="space-y-8 prose prose-slate max-w-none dark:prose-invert">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Overview</h2>
              <p className="text-muted-foreground leading-relaxed">
                At BrainMate AI, we want you to be completely satisfied with our service. This refund policy 
                outlines the conditions under which refunds may be requested and processed.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Refund Eligibility</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <h3 className="text-lg font-medium text-foreground mb-3 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Eligible for Refund
                  </h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground text-sm">
                    <li>Technical issues preventing platform access</li>
                    <li>Service unavailability for more than 24 hours</li>
                    <li>Billing errors or duplicate charges</li>
                    <li>Subscription cancelled within first 7 days</li>
                    <li>Features not working as advertised</li>
                  </ul>
                </div>

                <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <h3 className="text-lg font-medium text-foreground mb-3 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    Not Eligible for Refund
                  </h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground text-sm">
                    <li>Change of mind after 7 days</li>
                    <li>Violation of terms of service</li>
                    <li>Failure to use the service</li>
                    <li>Partial month usage</li>
                    <li>Third-party service limitations</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Refund Timeline</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-semibold text-primary">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">7-Day Money Back Guarantee</h3>
                    <p className="text-muted-foreground text-sm">
                      Cancel within 7 days of subscription for a full refund, no questions asked.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-semibold text-primary">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">30-Day Technical Issues</h3>
                    <p className="text-muted-foreground text-sm">
                      Technical problems preventing service use may qualify for refund within 30 days.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-semibold text-primary">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Billing Errors</h3>
                    <p className="text-muted-foreground text-sm">
                      Duplicate charges or billing errors will be refunded immediately upon verification.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Subscription Plans</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-foreground">Free Plan</h3>
                  <p className="text-muted-foreground">No charges, no refunds applicable.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground">Pro Plan (₹199/month)</h3>
                  <p className="text-muted-foreground">Monthly billing, eligible for 7-day money back guarantee.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground">Premium Plan (₹599/month)</h3>
                  <p className="text-muted-foreground">Monthly billing, eligible for 7-day money back guarantee.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">How to Request a Refund</h2>
              <div className="bg-blue-50 dark:bg-blue-950/30 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Refund Process
                </h3>
                <ol className="list-decimal pl-6 space-y-3 text-muted-foreground">
                  <li>
                    <strong>Contact Support:</strong> Email us at brainmateai0@gmail.com with your refund request
                  </li>
                  <li>
                    <strong>Include Details:</strong> Provide your account email, subscription plan, and reason for refund
                  </li>
                  <li>
                    <strong>Review Process:</strong> We'll review your request within 2 business days
                  </li>
                  <li>
                    <strong>Processing:</strong> Approved refunds are processed within 5-7 business days
                  </li>
                  <li>
                    <strong>Confirmation:</strong> You'll receive email confirmation once the refund is processed
                  </li>
                </ol>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Refund Method</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Refunds will be processed using the same payment method used for the original purchase:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Credit/Debit Card: 5-7 business days</li>
                <li>Digital Wallets: 3-5 business days</li>
                <li>Bank Transfer: 7-10 business days</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Partial Refunds</h2>
              <p className="text-muted-foreground leading-relaxed">
                Partial refunds may be considered in exceptional circumstances, such as prolonged service 
                outages or significant feature unavailability. These are evaluated on a case-by-case basis.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Cancellation vs Refund</h2>
              <div className="bg-yellow-50 dark:bg-yellow-950/30 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-muted-foreground">
                  <strong>Important:</strong> Cancelling your subscription stops future billing but does not 
                  automatically issue a refund for the current billing period. To request a refund, please 
                  follow the refund process outlined above.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Contact for Refunds</h2>
              <p className="text-muted-foreground leading-relaxed">
                For all refund requests and billing inquiries, please contact our support team:
              </p>
              <div className="bg-muted p-4 rounded-lg mt-4">
                <p className="font-medium text-foreground">Email: brainmateai0@gmail.com</p>
                <p className="text-muted-foreground text-sm mt-1">Subject: Refund Request - [Your Account Email]</p>
                <p className="text-muted-foreground text-sm">Response time: Within 48 hours</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Changes to Refund Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify this refund policy at any time. Changes will be effective 
                immediately upon posting on our website. Continued use of our service after changes 
                constitutes acceptance of the new policy.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}