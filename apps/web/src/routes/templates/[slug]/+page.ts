import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import { getTemplateEntries, getTemplateEntry } from "$lib/templates/registry";

export const prerender = true;

export const entries = () => getTemplateEntries().map(({ slug }) => ({ slug }));

export const load: PageLoad = ({ params }) => {
  const template = getTemplateEntry(params.slug);
  if (!template) error(404, "Template not found");
  return { template };
};
