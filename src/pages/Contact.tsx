
import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ContactForm from "@/components/contact/ContactForm";

const Contact = () => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    <Navbar />
    <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center justify-center">
      <div className="w-full max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-900">Contact Us</h1>
        <ContactForm />
      </div>
    </main>
    <Footer />
  </div>
);

export default Contact;
