import { useTranslations } from "next-intl";
import React from "react";
import EmptyState from "./EmptyState";

/**
 * /message
 *
 * This file previously contained seven invented conversation threads with stock
 * avatars, plus a full fake exchange in which "Adam, Sales Consultant at Toyota
 * Cubao" quotes a Toyota Fortuner with a downpayment and monthly payments to a
 * "Mr Williamson", and hands out a Philippine mobile number and a stranger's
 * Gmail address. Wrong country, wrong price bracket (a Fortuner is far above the
 * OMR 6,000 ceiling), wrong business model — Autosouq is not a finance
 * dealership — and every participant made up.
 *
 * There is no messaging backend, and NICHE.md is explicit that contacting a
 * seller is "one WhatsApp tap" rather than an in-app inbox, so this screen says
 * so plainly instead of simulating an inbox that does not exist.
 */
export default function Messages() {
  const t = useTranslations("dashboard.messages");
  const tPage = useTranslations("dashboard.page");
  return (
    <div className="container">
      <div className="row">
        <div className="col-md-12">
          <div className="content-area">
            <main id="main" className="main-content">
              <div className="tfcl-dashboard">
                <h1 className="admin-title mb-3">{tPage("messages")}</h1>
                <div className="tfcl-card">
                  <EmptyState
                    icon="chat"
                    title={t("emptyTitle")}
                    body={t("emptyBody")}
                    actionHref="/my-profile"
                    actionLabel={t("emptyAction")}
                  />
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
