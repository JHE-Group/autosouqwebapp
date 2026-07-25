import BlogDetails from "@/components/blogs/BlogDetails";
import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import React from "react";
import Link from "next/link";
import { allBlogs } from "@/data/blogs";
export const metadata = {
  title: "Blog Details | Autosouq.om",
  description: "Buy and sell used cars in Oman — Autosouq.om",
};
export default async function page({ params }) {
  const { id } = await params;
  const blogItem =
    allBlogs.filter((elm) => elm.id == id)[0] || allBlogs[0];
  return (
    <>
      <div className="header-fixed">
        <Header2 />
      </div>
      <section className="flat-title mb-40">
        <div className="container2">
          <div className="row">
            <div className="col-lg-12">
              <div className="title-inner style">
                <div className="title-group fs-12">
                  <Link className="home fw-6 text-color-3" href={`/`}>
                    Home
                  </Link>
                  <span>Used cars for sale</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <BlogDetails blogItem={blogItem} />
      <Footer1 />
    </>
  );
}
