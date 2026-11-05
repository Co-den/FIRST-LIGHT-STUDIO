import ContactForm from "./ContactForm";
export const metadata = { title: "Contact", description: "Reach FIRST LIGHT STUDIO LTD about collaborations, publishing and licensing." };

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-2xl px-5 pb-24 pt-36">
      <h1 className="font-display text-6xl tracking-wide">Contact</h1>
      <p className="mt-4 text-mist">Tell us what you want to make. Choose the inquiry type that fits best.</p>
      <ContactForm />
    </section>
  );
}
