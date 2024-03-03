import { Metadata } from "next";
import { notFound } from "next/navigation";
import { SliceZone } from "@prismicio/react";

import { createClient } from "@/prismicio";
import { components } from "@/slices";
import Bounded from "@/components/Bounded";
import Heading from "@/components/Heading";
import { DateField, isFilled } from "@prismicio/client";
import Button from "@/components/Button";

type Params = { uid: string };

export default async function Page({ params }: { params: Params }) {
  const client = createClient();
  const page = await client
    .getByUID("project_post", params.uid)
    .catch(() => notFound());

  function formatDate(date: DateField) {
    if (isFilled.date(date)) {
      const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };

      return new Intl.DateTimeFormat("es", dateOptions).format(new Date(date));
    }
  }

  const formattedDate = formatDate(page.data.date);

  return (
    <Bounded as={"article"}>
      <div className="rounded-xl border-2 border-slate-800 bg-slate-900 px-4 py-10 md:px-8 md:py-20">
        <Heading as="h1">{page.data.title}</Heading>
        <div className="flex gap-4 text-blue-400 text-xl font-bold">
          {page.tags.map((tag, index) => (
            <span key={index} className="">
              {tag}
            </span>
          ))}
        </div>
        <p className="mt-8 border-b border-slate-600 text-xl font-medium text-slate-300">
          {formattedDate}
        </p>
        <div className="prose prose-lg prose-invert mt-12 w-full max-w-none md:mt-20"></div>
        <div className="mb-10">
          <SliceZone slices={page.data.slices} components={components} />
        </div>
        <div className="flex gap-3">
          {isFilled.link(page.data.repo_link) && (
            <Button linkField={page.data.repo_link} label={"Repository"} />
          )}
          {isFilled.link(page.data.deploy_link) && (
            <Button
              linkField={page.data.deploy_link}
              label={"Live deploy"}
              showIcon
            />
          )}
        </div>
      </div>
    </Bounded>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const client = createClient();
  const page = await client
    .getByUID("project_post", params.uid)
    .catch(() => notFound());

  return {
    title: page.data.meta_title,
    description: page.data.meta_description,
  };
}

export async function generateStaticParams() {
  const client = createClient();
  const pages = await client.getAllByType("project_post");

  return pages.map((page) => {
    return { uid: page.uid };
  });
}
