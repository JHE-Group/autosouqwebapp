"use client";
import React, { useRef, useState } from "react";

import emailjs from "@emailjs/browser";
export default function Contact() {
  const formRef = useRef();
  const [success, setSuccess] = useState(true);
  const [showMessage, setShowMessage] = useState(false);

  const handleShowMessage = () => {
    setShowMessage(true);
    setTimeout(() => {
      setShowMessage(false);
    }, 2000);
  };

  const sendMail = (e) => {
    e.preventDefault();
    emailjs
      .sendForm(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? "",
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? "",
        formRef.current,
        { publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ?? "" }
      )
      .then((res) => {
        if (res.status === 200) {
          setSuccess(true);
          handleShowMessage();

          formRef.current.reset();
        } else {
          setSuccess(false);
          handleShowMessage();
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <>
      <section className="flat-property">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="inner-heading flex-two flex-wrap">
                <h1 className="heading-listing">Contact us</h1>
                <div className="social-listing flex-six flex-wrap">
                  <p>Share this page:</p>
                  <div className="icon-social style1">
                    <a href="#">
                      <i className="icon-autodeal-facebook" />
                    </a>
                    <a href="#">
                      <i className="icon-autodeal-linkedin" />
                    </a>
                    <a href="#">
                      <i className="icon-autodeal-twitter" />
                    </a>
                    <a href="#">
                      <i className="icon-autodeal-instagram" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* The theme embedded a Google map pinned outside Oman entirely. A map on
          a contact page reads as "this is our office", and we have no address
          to show yet, so the section is removed rather than faked. */}
      <section className="tf-section-contact">
        <div className="container">
          <div className="row">
            <div className="col-md-8 contact-left">
              <div className="heading-section mb-30">
                <h2>Send us a message</h2>
                <p className="mt-12">
                  A question about a listing, a seller, or something that does
                  not look right? Tell us and we will look into it.
                </p>
              </div>
              <div id="comments" className="comments">
                <div className="respond-comment">
                  <form
                    onSubmit={sendMail}
                    ref={formRef}
                    id="loan-calculator"
                    className="comment-form form-submit"
                    acceptCharset="utf-8"
                  >
                    <div className="grid-sw-2">
                      <fieldset className="email-wrap style-text">
                        <label className="font-1 fs-14 fw-5">Name</label>
                        <input
                          type="text"
                          className="tb-my-input"
                          name="name"
                          placeholder="Your name"
                          required
                        />
                      </fieldset>
                      <fieldset className="phone-wrap style-text">
                        <label className="font-1 fs-14 fw-5">
                          Email address
                        </label>
                        <input
                          type="email"
                          className="tb-my-input"
                          name="email"
                          placeholder="Your email"
                          required
                        />
                      </fieldset>
                    </div>
                    <div className="grid-sw-2">
                      <fieldset className="email-wrap style-text">
                        <label className="font-1 fs-14 fw-5">
                          Phone number
                        </label>
                        <input
                          type="tel"
                          className="tb-my-input"
                          name="tel"
                          placeholder="Your phone number"
                          required
                        />
                      </fieldset>
                      <fieldset className="phone-wrap style-text">
                        <label className="font-1 fs-14 fw-5">Subject</label>
                        <input
                          type="text"
                          className="tb-my-input"
                          name="subject"
                          placeholder="What is this about?"
                          required
                        />
                      </fieldset>
                    </div>
                    <fieldset className="phone-wrap style-text">
                      <label className="font-1 fs-14 fw-5">Your Message</label>
                      <textarea
                        id="comment-message"
                        name="message"
                        rows={4}
                        tabIndex={4}
                        placeholder="Your message"
                        aria-required="true"
                        required
                        defaultValue={""}
                      />
                    </fieldset>
                    <div
                      className={`tfSubscribeMsg  footer-sub-element ${
                        showMessage ? "active" : ""
                      }`}
                    >
                      {success ? (
                        <p style={{ color: "#15803D" }}>
                          Message has been sent successfully
                        </p>
                      ) : (
                        <p style={{ color: "#B42318" }}>Something went wrong</p>
                      )}
                    </div>
                    <div className="button-boxs">
                      <button className="sc-button" name="submit" type="submit">
                        <span>Send Message</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <div className="col-md-4 contact-right">
              <div className="contact-info box-sd">
                <h2 className="mb-30">Contact Us</h2>
                {/* The theme shipped a US street address, a US phone number and
                    a themesflat@gmail.com address. Autosouq is an Oman
                    business and none of the real details have been supplied
                    yet, so these are marked as placeholders — an obvious gap is
                    safer than a plausible invention. */}
                <div className="wrap-info">
                  <div className="box-info">
                    <h5>Where we are</h5>
                    <p>
                      Autosouq is based in Oman. <br />
                      [PLACEHOLDER — business address to be supplied]
                    </p>
                  </div>
                  <div className="box-info">
                    <h5>Get in touch</h5>
                    <p>[PLACEHOLDER — WhatsApp number to be supplied]</p>
                    <p>[PLACEHOLDER — support email to be supplied]</p>
                    <p>Until then, the form on this page reaches us.</p>
                  </div>
                  <div className="box-info">
                    <h5>When we reply</h5>
                    <p>[PLACEHOLDER — support hours to be supplied]</p>
                  </div>
                  <div className="box-info">
                    <h5>Follow Us:</h5>
                    <div className="icon-social style2">
                      <a href="#">
                        <i className="icon-autodeal-facebook" />
                      </a>
                      <a href="#">
                        <i className="icon-autodeal-linkedin" />
                      </a>
                      <a href="#">
                        <i className="icon-autodeal-twitter" />
                      </a>
                      <a href="#">
                        <i className="icon-autodeal-instagram" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
