import React from "react";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function Banner() {
  const t = await getTranslations("aboutPage");
  return (
    <section className="tf-banner style-1">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="content relative z-2">
              <div className="heading">
                <h1 className="text-color-1">
                  {t("h1Line1")} <br />
                  {t("h1Line2")}
                </h1>
                <p className="text-color-1 fs-18 fw-4 lh-22 font">
                  {t("lede")}
                </p>
                <Link href="/used-cars" className="sc-button btn-svg">
                  <span>{t("browseCars")}</span>
                  <i className="icon-autodeal-next" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
