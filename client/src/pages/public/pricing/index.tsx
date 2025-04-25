
import { Button } from "@/components/ui/button"
import { Check, ChevronRight } from "lucide-react"
import { StatCard } from "@/pages/public/pricing/StatCard"
import TestimonialCard from "@/pages/public/pricing/TestimonialCard"
import { PricingCard } from "@/pages/public/pricing/PricingCard"
import { ComparisonTable } from "@/pages/public/pricing/ComparisonTable"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function PricingPage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Sticky Navbar is in the layout */}

      {/* Headline Section */}
      <section className="py-16 px-4 md:px-6 lg:px-8 bg-white dark:bg-gray-950">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="mb-2 text-sm uppercase tracking-wide text-fuchsia-600 dark:text-fuchsia-400">
            Pricing Plans
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Effortless Video Editing{" "}
            <span className="text-fuchsia-600 dark:text-fuchsia-400">Without the Learning Curve</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Choose the perfect plan for your needs. All plans include our core AI video enhancement features with no
            complicated software to learn.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white">
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" className="text-fuchsia-600 border-fuchsia-600 hover:bg-fuchsia-600/10">
              Schedule a Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Social Proof / Trust Bar */}
      <section className="py-8 px-4 md:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto">
          <div className="text-center mb-6 text-sm text-muted-foreground">TRUSTED BY CONTENT CREATORS WORLDWIDE</div>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {/* Placeholder logos - replace with actual partner logos */}
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded opacity-70"></div>
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded opacity-70"></div>
            <div className="h-8 w-28 bg-gray-200 dark:bg-gray-700 rounded opacity-70"></div>
            <div className="h-8 w-36 bg-gray-200 dark:bg-gray-700 rounded opacity-70"></div>
            <div className="h-8 w-30 bg-gray-200 dark:bg-gray-700 rounded opacity-70"></div>
          </div>
        </div>
      </section>

      {/* Pricing Plan Section */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-white dark:bg-gray-950">
        <div className="container mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Choose Your <span className="text-fuchsia-600 dark:text-fuchsia-400">Perfect Plan</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Whether you're just starting out or a professional content creator, we have a plan that fits your needs and
            budget.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <PricingCard
            title="Free"
            description="For casual users"
            price="$0"
            period="/month"
            features={[
              "10 minutes of video processing",
              "720p video export",
              "Basic captions",
              "Pexels stock library",
              "Watermarked exports",
            ]}
            buttonText="Get Started"
            buttonVariant="outline"
          />

          <PricingCard
            title="Basic"
            description="For content creators"
            price="$9.99"
            period="/month"
            features={[
              "60 minutes of video processing",
              "1080p HD video export",
              "Advanced captions with styling",
              "Premium stock library",
              "No watermark",
              "Basic B-roll generation",
            ]}
            buttonText="Upgrade Now"
            buttonVariant="default"
            popular={true}
          />

          <PricingCard
            title="Pro"
            description="For professionals"
            price="$19.99"
            period="/month"
            features={[
              "Unlimited video processing",
              "4K video export",
              "Advanced captions with styling",
              "Premium stock library",
              "Advanced B-roll generation",
              "Custom branding",
              "Priority processing",
            ]}
            buttonText="Upgrade Now"
            buttonVariant="outline"
          />
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground mb-4">
            All plans include our core AI video enhancement features. Need a custom plan?
          </p>
          <Button variant="link" className="text-fuchsia-600 dark:text-fuchsia-400">
            Contact us for enterprise pricing <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </section>

      {/* Credibility Building Section (Stats) */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto">
          <div className="text-center mb-2 text-sm uppercase tracking-wide text-fuchsia-600 dark:text-fuchsia-400">
            Why Choose RollUp AI
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">Trusted by Thousands of Content Creators</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-center mb-16">
            Our AI-powered platform has helped creators worldwide save time and produce better content.
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <StatCard number={70} label="Editing Time Saved" />
            <StatCard number={50} label="Engagement Boosted" />
            <StatCard number={60} label="Content Creation Simplified" />
          </div>
        </div>
      </section>

      {/* Features / Comparison Table */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-white dark:bg-gray-950">
        <div className="container mx-auto">
          <div className="text-center mb-2 text-sm uppercase tracking-wide text-fuchsia-600 dark:text-fuchsia-400">
            Feature Comparison
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">Compare Plan Features</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-center mb-16">
            See exactly what's included in each plan to make the best choice for your needs.
          </p>

          <div className="max-w-6xl mx-auto overflow-x-auto">
            <ComparisonTable />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto">
          <div className="text-center mb-2 text-sm uppercase tracking-wide text-fuchsia-600 dark:text-fuchsia-400">
            Testimonials
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">What Our Customers Say</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-center mb-16">
            Don't just take our word for it. Here's what content creators have to say about RollUp AI.
          </p>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <TestimonialCard
              quote="RollUp AI made video editing so much easier for me! I save hours every week on my YouTube content."
              author="Alex Johnson"
              role="Content Creator, YouTube"
            />
            <TestimonialCard
              quote="The B-roll options are fantastic! My videos have never looked better, and I save so much time!"
              author="Tom Brown"
              role="Freelance Videographer"
            />
            <TestimonialCard
              quote="This platform is a game-changer for content creators! Worth every penny of the Pro plan."
              author="Jake White"
              role="Video Editor, Studio"
            />
          </div>
        </div>
      </section>

      {/* Call-To-Value (CTV) Section */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-fuchsia-50 dark:bg-fuchsia-950">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Start Creating Better Videos <span className="text-fuchsia-600 dark:text-fuchsia-400">Today</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
            Join thousands of content creators who are saving time and producing better videos with RollUp AI.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <Button size="lg" className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white">
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" className="text-fuchsia-600 border-fuchsia-600 hover:bg-fuchsia-600/10">
              View Demo
            </Button>
          </div>
          <div className="flex justify-center items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Check className="h-4 w-4 mr-1 text-green-500" />
              No credit card required
            </div>
            <div className="flex items-center">
              <Check className="h-4 w-4 mr-1 text-green-500" />
              14-day free trial
            </div>
            <div className="flex items-center">
              <Check className="h-4 w-4 mr-1 text-green-500" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-white dark:bg-gray-950">
        <div className="container mx-auto">
          <div className="text-center mb-2 text-sm uppercase tracking-wide text-fuchsia-600 dark:text-fuchsia-400">
            FAQs
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-center mb-16">
            Find answers to common questions about our plans and features.
          </p>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1">
                <AccordionTrigger>What happens when I reach my usage limit?</AccordionTrigger>
                <AccordionContent>
                  When you reach your monthly usage limit, you'll need to upgrade to a higher plan or wait until your
                  usage resets at the beginning of your next billing cycle. You'll still have access to your existing
                  content, but you won't be able to process new videos until you have available minutes.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>Can I cancel my subscription at any time?</AccordionTrigger>
                <AccordionContent>
                  Yes, you can cancel your subscription at any time. Your plan will remain active until the end of your
                  current billing period. After that, your account will revert to the Free plan.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
                <AccordionContent>
                  We accept all major credit cards (Visa, Mastercard, American Express) and PayPal. For annual plans, we
                  can also provide invoicing options for businesses.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>Is there a difference in features between monthly and yearly plans?</AccordionTrigger>
                <AccordionContent>
                  No, the features are identical between monthly and yearly plans of the same tier. Yearly plans simply
                  offer a discount for paying upfront.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger>How does the video processing time work?</AccordionTrigger>
                <AccordionContent>
                  Video processing time refers to the total duration of videos you can process each month. For example,
                  with the Basic plan, you can process up to 60 minutes of video content per month. This includes all
                  processing features like adding captions, B-roll generation, and exporting.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger>What's the difference between basic and advanced B-roll generation?</AccordionTrigger>
                <AccordionContent>
                  Basic B-roll generation provides relevant stock footage based on your video content. Advanced B-roll
                  generation offers more customization options, higher quality footage sources, and AI-driven scene
                  matching for more contextually appropriate B-roll that enhances your storytelling.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7">
                <AccordionTrigger>Do you offer refunds?</AccordionTrigger>
                <AccordionContent>
                  We offer a 14-day money-back guarantee for all paid plans. If you're not satisfied with our service
                  within the first 14 days, contact our support team for a full refund.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
            <p className="mb-6 text-muted-foreground">
              Our team is ready to help you find the perfect plan for your needs.
            </p>
            <Button variant="outline" className="text-fuchsia-600 border-fuchsia-600 hover:bg-fuchsia-600/10">
              Contact Support
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
