"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  async function onSubmit(data: ContactFormValues) {
    try {
      // fake API call simulation
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Contact form submitted:", data);
      toast.success("Message sent successfully!");
      form.reset();
    } catch {
      toast.error("Unexpected error. Please try again later.");
    }
  }

  return (
    <main className="max-w-3xl mx-auto py-16 px-6">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-900">Contact Us</h1>
      <p className="mb-8 text-gray-600 leading-relaxed">
        Have questions? We are here to help! Send us a message using the form
        below, or reach us through our contact details.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea
                    rows={5}
                    placeholder="Write your message here..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full cursor-pointer">
            Send Message
          </Button>
        </form>
      </Form>

      <section className="mt-16 text-gray-700">
        <h2 className="text-2xl font-semibold mb-4">Other Ways to Reach Us</h2>
        <p>
          Email:{" "}
          <a
            href="mailto:sharma.workemail@gmail.com"
            className="text-green-600 hover:underline"
          >
            sharma.workemail@gmail.com
          </a>
        </p>
        <p>
          Phone:{" "}
          <a href="tel:+1234567890" className="text-green-600 hover:underline">
            +91 12345 67890
          </a>
        </p>
        <p>Address: EnactOn, Vesu, Surat, Gujarat, India</p>
      </section>
    </main>
  );
}
