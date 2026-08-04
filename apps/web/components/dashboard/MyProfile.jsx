"use client";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";

export default function MyProfile() {
  const t = useTranslations("dashboard.profile");
  const [preview, setPreview] = useState(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result); // Set the preview to the uploaded image
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-12">
          <div className="content-area">
            <main id="main" className="main-content">
              <div className="tfcl-dashboard">
                <h1 className="admin-title mb-3">{t("title")}</h1>
                {/*
                  No submit path exists — there is no profile endpoint and no
                  auth, so nothing below is persisted. Left deliberately unwired
                  rather than faked, and said out loud: a "Save changes" button
                  that silently does nothing is how a seller ends up with a
                  wrong WhatsApp number on a live listing and no idea why nobody
                  called.
                */}
                <div className="tfcl-notice" role="note">
                  {t("notice")}
                </div>
                <div className="tfcl-add-listing profile-inner">
                  <h3>{t("photo")}</h3>
                  <div className="tfcl_choose_avatar">
                    <div className="avatar">
                      <div className="form-group">
                        {preview ? (
                          <Image
                            decoding="async"
                            width={158}
                            height={138}
                            id="tfcl_avatar_thumbnail"
                            alt={t("avatarAlt")}
                            src={preview}
                            unoptimized
                          />
                        ) : (
                          // Was a stock portrait of a stranger presented as the
                          // account holder. A real new account has no photo.
                          <div style={AVATAR_PLACEHOLDER} aria-hidden="true">
                            {t("noPhoto")}
                          </div>
                        )}
                      </div>
                      <div className="choose-box">
                        <label htmlFor="tfcl_avatar">{t("upload")}</label>
                        <div className="form-group relative pb-2 pt-2">
                          <input
                            id="tfcl_avatar"
                            type="file"
                            className="form-control ip-file"
                            accept="image/*"
                            onChange={handleImageUpload}
                          />
                          <label htmlFor="tfcl_avatar">
                            <button type="button">{t("chooseFile")}</button>
                          </label>
                        </div>
                        <span className="notify-avatar">
                          {t("photoHint")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <h3 className="form-title">{t("details")}</h3>
                  <p className="tfcl-hint">
                    {t("detailsHint")}
                  </p>
                  <div className="form-group">
                    <label htmlFor="profile_name">{t("fullName")}</label>
                    <input
                      id="profile_name"
                      type="text"
                      className="form-control"
                      name="full_name"
                      placeholder={t("fullNamePlaceholder")}
                      defaultValue=""
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="profile_about">{t("about")}</label>
                    <textarea
                      id="profile_about"
                      name="about"
                      placeholder={t("aboutPlaceholder")}
                      defaultValue={""}
                    />
                  </div>
                  <div className="form-group-4">
                    <div className="form-group">
                      <label htmlFor="profile_whatsapp">
                        {t("whatsapp")}
                      </label>
                      <input
                        id="profile_whatsapp"
                        type="tel"
                        dir="ltr"
                        inputMode="tel"
                        className="form-control"
                        name="whatsapp"
                        placeholder="+968 9XXX XXXX"
                        defaultValue=""
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="profile_phone">
                        {t("otherPhone")}
                      </label>
                      <input
                        id="profile_phone"
                        type="tel"
                        dir="ltr"
                        inputMode="tel"
                        className="form-control"
                        name="phone"
                        placeholder="+968 …"
                        defaultValue=""
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="profile_email">{t("email")}</label>
                      <input
                        id="profile_email"
                        type="email"
                        className="form-control"
                        name="email"
                        placeholder={t("emailPlaceholder")}
                        defaultValue=""
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="profile_city">{t("city")}</label>
                      <select
                        id="profile_city"
                        className="form-control"
                        name="city"
                        defaultValue=""
                      >
                        <option value="">{t("selectCity")}</option>
                        {OMAN_CITIES.map((city) => (
                          <option key={city.en} value={city.en}>
                            {city.en} — {city.ar}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="profile_area">{t("area")}</label>
                    <input
                      id="profile_area"
                      type="text"
                      className="form-control"
                      name="area"
                      placeholder={t("areaPlaceholder")}
                      defaultValue=""
                    />
                  </div>
                  {/* The template embedded a Google Map of Dhaka, Bangladesh
                      here. It showed the seller nothing they had entered, and
                      cost a third-party map tile load on a metered connection —
                      removed rather than re-pointed at Muscat. */}

                  <div className="group-button-submit left mb-3">
                    <button type="button" className="pre-btn">
                      {t("save")}
                    </button>
                  </div>

                  <h3>{t("password")}</h3>
                  {/* Was a second, duplicate copy of the change-password form.
                      One form, one route. */}
                  <p className="tfcl-hint">
                    {t("passwordHint")}
                  </p>
                  <div className="group-button-submit left mb-0">
                    <Link href="/change-password" className="second-btn">
                      {t("changePassword")}
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Oman's governorate capitals and the towns with real used-car activity.
 * Bilingual because NICHE.md puts Arabic first and English equal second, and
 * because a seller in صحار should not have to recognise "Sohar" to find it.
 */
const OMAN_CITIES = [
  { en: "Muscat", ar: "مسقط" },
  { en: "Seeb", ar: "السيب" },
  { en: "Sohar", ar: "صحار" },
  { en: "Salalah", ar: "صلالة" },
  { en: "Nizwa", ar: "نزوى" },
  { en: "Sur", ar: "صور" },
  { en: "Ibri", ar: "عبري" },
  { en: "Barka", ar: "بركاء" },
  { en: "Rustaq", ar: "الرستاق" },
  { en: "Ibra", ar: "إبراء" },
  { en: "Buraimi", ar: "البريمي" },
  { en: "Khasab", ar: "خصب" },
];

const AVATAR_PLACEHOLDER = {
  width: 158,
  height: 138,
  borderRadius: 12,
  // $color-6 border, $bg-color2 fill — the theme's own neutral surface.
  border: "1px dashed #EDEDED",
  background: "#F8F8F9",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#696665", // 5.60:1 on #F8F8F9
  fontSize: 14,
};
