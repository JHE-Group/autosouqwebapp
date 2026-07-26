"use client";
import React, { useRef, useState } from "react";

import emailjs from "@emailjs/browser";
import { useTranslations } from "next-intl";
/**
 * Is the mail transport actually configured?
 *
 * All three EmailJS variables ship empty. The form still rendered, still
 * submitted, and `sendForm("", "", …)` rejected into a `.catch` that only
 * called console.log — so a visitor filled in five fields, pressed Send, and
 * their message was silently discarded with no error and no confirmation.
 * `success` was also initialised to `true`, so the only banner it could ever
 * show said the message had been sent.
 *
 * On a site whose whole proposition is being the trustworthy end of this
 * market, a contact form that eats the message is the same failure as the
 * login modal that ate the password. The form is now only rendered when it can
 * actually deliver.
 */
const MAIL_CONFIGURED = Boolean(
  process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID &&
    process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID &&
    process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
);

const OPS_WHATSAPP = process.env.NEXT_PUBLIC_AUTOSOUQ_WHATSAPP;

export default function Contact() {
  const t = useTranslations("contactPage");
  const formRef = useRef();
  // null = nothing attempted yet. It was `true`, which pre-loaded a success
  // state before the reader had done anything.
  const [success, setSuccess] = useState(null);
  const [sending, setSending] = useState(false);

  const sendMail = (e) => {
    e.preventDefault();
    if (!MAIL_CONFIGURED || sending) return;

    setSending(true);
    emailjs
      .sendForm(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
        formRef.current,
        { publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY },
      )
      .then((res) => {
        const ok = res.status === 200;
        setSuccess(ok);
        if (ok) formRef.current.reset();
      })
      // A rejected send is the case that matters: it now tells the reader,
      // rather than logging to a console they will never open.
      .catch(() => setSuccess(false))
      .finally(() => setSending(false));
  };
  return (
    <>
      <section className="flat-property">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="inner-heading flex-two flex-wrap">
                <h1 className="heading-listing">{t("h1")}</h1>
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
                <h2>{t("sendTitle")}</h2>
                <p className="mt-12">{t("sendLede")}</p>
              </div>
              {!MAIL_CONFIGURED && (
                <div className="tfcl-notice" role="note">
                  {t("notConfigured")}
                  {OPS_WHATSAPP ? (
                    <>
                      {" "}
                      <a
                        href={`https://wa.me/${OPS_WHATSAPP}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t("whatsappUs")}
                      </a>{" "}
                      {t("instead")}
                    </>
                  ) : null}
                </div>
              )}
              <div id="comments" className="comments" hidden={!MAIL_CONFIGURED}>
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
                        <label className="font-1 fs-14 fw-5">{t("name")}</label>
                        <input
                          type="text"
                          className="tb-my-input"
                          name="name"
                          placeholder={t("namePlaceholder")}
                          required
                        />
                      </fieldset>
                      <fieldset className="phone-wrap style-text">
                        <label className="font-1 fs-14 fw-5">{t("email")}</label>
                        <input
                          type="email"
                          className="tb-my-input"
                          name="email"
                          placeholder={t("emailPlaceholder")}
                          required
                        />
                      </fieldset>
                    </div>
                    <div className="grid-sw-2">
                      <fieldset className="email-wrap style-text">
                        <label className="font-1 fs-14 fw-5">{t("phone")}</label>
                        <input
                          type="tel"
                          className="tb-my-input"
                          name="tel"
                          placeholder={t("phonePlaceholder")}
                          required
                        />
                      </fieldset>
                      <fieldset className="phone-wrap style-text">
                        <label className="font-1 fs-14 fw-5">{t("subject")}</label>
                        <input
                          type="text"
                          className="tb-my-input"
                          name="subject"
                          placeholder={t("subjectPlaceholder")}
                          required
                        />
                      </fieldset>
                    </div>
                    <fieldset className="phone-wrap style-text">
                      <label className="font-1 fs-14 fw-5">{t("message")}</label>
                      <textarea
                        id="comment-message"
                        name="message"
                        rows={4}
                        tabIndex={4}
                        placeholder={t("messagePlaceholder")}
                        aria-required="true"
                        required
                        defaultValue={""}
                      />
                    </fieldset>
                    {/* aria-live so the outcome is announced, not just drawn.
                        Renders nothing until something has actually been sent. */}
                    <div className="tfSubscribeMsg footer-sub-element active" aria-live="polite">
                      {success === true && (
                        <p style={{ color: "#15803D" }}>{t("sent")}</p>
                      )}
                      {success === false && (
                        <p style={{ color: "#B42318" }}>{t("failed")}</p>
                      )}
                    </div>
                    <div className="button-boxs">
                      <button
                        className="sc-button"
                        name="submit"
                        type="submit"
                        disabled={sending}
                      >
                        <span>{sending ? t("sending") : t("send")}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <div className="col-md-4 contact-right">
              <div className="contact-info box-sd">
                <h2 className="mb-30">{t("infoTitle")}</h2>
                {/* The theme shipped a US street address, a US phone number and
                    a themesflat@gmail.com address. Autosouq is an Oman
                    business and none of the real details have been supplied
                    yet, so these are marked as placeholders — an obvious gap is
                    safer than a plausible invention. */}
                <div className="wrap-info">
                  <div className="box-info">
                    <h5>{t("whereTitle")}</h5>
                    <p>{t("whereBody")}</p>
                  </div>
                  {OPS_WHATSAPP ? (
                    <div className="box-info">
                      <h5>{t("getInTouch")}</h5>
                      <p>
                        <a href={`https://wa.me/${OPS_WHATSAPP}`} rel="noopener noreferrer" target="_blank">
                          {t("whatsappUs")}
                        </a>
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
