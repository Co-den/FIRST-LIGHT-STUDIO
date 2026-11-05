"use client";
import { useState } from "react";
import { site } from "@/data/site";

const types = ["General inquiry", "Creative collaboration", "Publishing", "Licensing", "Other business inquiry"];

export default function ContactForm() {
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);

  function onSubmit(e) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget));
    const err = {};
    if (!f.name?.trim()) err.name = "Enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(f.email || "")) err.email = "Enter a valid email address.";
    if (!f.subject?.trim()) err.subject = "Enter a subject.";
    if ((f.message || "").trim().length < 10) err.message = "Write at least 10 characters.";
    setErrors(err);
    if (Object.keys(err).length === 0) setDone(true); // TODO: connect a server action or email service
  }

  if (done) {
    return (
      <div role="status" className="mt-10 border border-sun/50 p-6">
        <h2 className="font-head text-xl font-bold text-sun">Form validated. Nothing was sent.</h2>
        <p className="mt-2 text-mist">
          This form is not yet connected to an email service, so your message was not delivered.
          {site.contactEmail ? <> Write to <a className="text-sun underline" href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a> instead.</> : " A contact email has not been configured yet."}
        </p>
      </div>
    );
  }

  const field = "mt-2 w-full rounded-sm border border-white/25 bg-midnight px-4 py-3 text-white";
  const Err = ({ id }) => errors[id] ? <p id={`${id}-err`} className="mt-1 text-sm text-red-300">{errors[id]}</p> : null;
  const a11y = (id) => ({ "aria-invalid": !!errors[id], "aria-describedby": errors[id] ? `${id}-err` : undefined });

  return (
    <form onSubmit={onSubmit} noValidate className="mt-10 grid gap-6">
      <div><label htmlFor="name" className="font-head font-bold">Name</label><input id="name" name="name" autoComplete="name" className={field} {...a11y("name")} /><Err id="name" /></div>
      <div><label htmlFor="email" className="font-head font-bold">Email</label><input id="email" name="email" type="email" autoComplete="email" className={field} {...a11y("email")} /><Err id="email" /></div>
      <div><label htmlFor="type" className="font-head font-bold">Inquiry type</label><select id="type" name="type" className={field}>{types.map((t) => <option key={t}>{t}</option>)}</select></div>
      <div><label htmlFor="subject" className="font-head font-bold">Subject</label><input id="subject" name="subject" className={field} {...a11y("subject")} /><Err id="subject" /></div>
      <div><label htmlFor="message" className="font-head font-bold">Message</label><textarea id="message" name="message" rows={6} className={field} {...a11y("message")} /><Err id="message" /></div>
      <button className="justify-self-start rounded-sm bg-sun px-8 py-3.5 font-head font-bold text-night transition hover:bg-white active:scale-95">Send message</button>
    </form>
  );
}
