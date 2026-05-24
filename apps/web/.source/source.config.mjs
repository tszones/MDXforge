// source.config.ts
import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import {
  getMDXForgeRehypeCodeOptions,
  withMDXForgeRehypePlugins,
  withMDXForgeRemarkPlugins
} from "@mdxforge/mdx";
var docs = defineDocs({
  dir: "content/docs"
});
var source_config_default = defineConfig({
  mdxOptions: {
    remarkPlugins: withMDXForgeRemarkPlugins,
    rehypePlugins: withMDXForgeRehypePlugins,
    rehypeCodeOptions: getMDXForgeRehypeCodeOptions()
  }
});
export {
  source_config_default as default,
  docs
};
