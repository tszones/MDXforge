/* eslint-disable */
import { getLocale, experimentalStaticLocale } from "../runtime.js"

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */
/** @typedef {{}} Site_NameInputs */
/** @typedef {{}} Site_TitleInputs */
/** @typedef {{}} Site_DescriptionInputs */
/** @typedef {{}} Not_Found_LabelInputs */
/** @typedef {{}} Not_Found_TitleInputs */
/** @typedef {{}} Not_Found_DescriptionInputs */
/** @typedef {{}} Language_SwitcherInputs */
/** @typedef {{}} Language_EnInputs */
/** @typedef {{}} Language_ZhInputs */
/** @typedef {{}} Home_Meta_TitleInputs */
/** @typedef {{}} Home_Meta_DescriptionInputs */
/** @typedef {{}} Home_BadgeInputs */
/** @typedef {{}} Home_TitleInputs */
/** @typedef {{}} Home_DescriptionInputs */
/** @typedef {{}} Home_GithubInputs */
/** @typedef {{}} Home_Features_LinkInputs */
/** @typedef {{}} Home_Feature_Local_TitleInputs */
/** @typedef {{}} Home_Feature_Local_DescriptionInputs */
/** @typedef {{}} Home_Feature_Docs_TitleInputs */
/** @typedef {{}} Home_Feature_Docs_DescriptionInputs */
/** @typedef {{}} Home_Feature_Safe_TitleInputs */
/** @typedef {{}} Home_Feature_Safe_DescriptionInputs */
import * as __en from "./en.js"
import * as __zh from "./zh.js"
/**
* | output |
* | --- |
* | "MDXForge" |
*
* @param {Site_NameInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const site_name = /** @type {((inputs?: Site_NameInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Site_NameInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.site_name(inputs)
	return __zh.site_name(inputs)
});
/**
* | output |
* | --- |
* | "MDXForge - Local-first MDX preview for AI docs" |
*
* @param {Site_TitleInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const site_title = /** @type {((inputs?: Site_TitleInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Site_TitleInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.site_title(inputs)
	return __zh.site_title(inputs)
});
/**
* | output |
* | --- |
* | "MDXForge is a local-first desktop workspace for safely previewing AI-generated MDX and Markdown documents." |
*
* @param {Site_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const site_description = /** @type {((inputs?: Site_DescriptionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Site_DescriptionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.site_description(inputs)
	return __zh.site_description(inputs)
});
/**
* | output |
* | --- |
* | "404" |
*
* @param {Not_Found_LabelInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const not_found_label = /** @type {((inputs?: Not_Found_LabelInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Not_Found_LabelInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.not_found_label(inputs)
	return __zh.not_found_label(inputs)
});
/**
* | output |
* | --- |
* | "Page not found" |
*
* @param {Not_Found_TitleInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const not_found_title = /** @type {((inputs?: Not_Found_TitleInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Not_Found_TitleInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.not_found_title(inputs)
	return __zh.not_found_title(inputs)
});
/**
* | output |
* | --- |
* | "The page you are looking for does not exist yet." |
*
* @param {Not_Found_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const not_found_description = /** @type {((inputs?: Not_Found_DescriptionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Not_Found_DescriptionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.not_found_description(inputs)
	return __zh.not_found_description(inputs)
});
/**
* | output |
* | --- |
* | "Switch language" |
*
* @param {Language_SwitcherInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const language_switcher = /** @type {((inputs?: Language_SwitcherInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Language_SwitcherInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.language_switcher(inputs)
	return __zh.language_switcher(inputs)
});
/**
* | output |
* | --- |
* | "English" |
*
* @param {Language_EnInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const language_en = /** @type {((inputs?: Language_EnInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Language_EnInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.language_en(inputs)
	return __zh.language_en(inputs)
});
/**
* | output |
* | --- |
* | "中文" |
*
* @param {Language_ZhInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const language_zh = /** @type {((inputs?: Language_ZhInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Language_ZhInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.language_zh(inputs)
	return __zh.language_zh(inputs)
});
/**
* | output |
* | --- |
* | "MDXForge - Preview AI-generated MDX locally" |
*
* @param {Home_Meta_TitleInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const home_meta_title = /** @type {((inputs?: Home_Meta_TitleInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Home_Meta_TitleInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.home_meta_title(inputs)
	return __zh.home_meta_title(inputs)
});
/**
* | output |
* | --- |
* | "A focused desktop reader for opening, navigating, and safely rendering local MDX and Markdown files generated by AI." |
*
* @param {Home_Meta_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const home_meta_description = /** @type {((inputs?: Home_Meta_DescriptionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Home_Meta_DescriptionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.home_meta_description(inputs)
	return __zh.home_meta_description(inputs)
});
/**
* | output |
* | --- |
* | "Local-first MDX preview for AI docs" |
*
* @param {Home_BadgeInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const home_badge = /** @type {((inputs?: Home_BadgeInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Home_BadgeInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.home_badge(inputs)
	return __zh.home_badge(inputs)
});
/**
* | output |
* | --- |
* | "Turn AI-generated MDX into a safe local reading experience." |
*
* @param {Home_TitleInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const home_title = /** @type {((inputs?: Home_TitleInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Home_TitleInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.home_title(inputs)
	return __zh.home_title(inputs)
});
/**
* | output |
* | --- |
* | "MDXForge focuses on one workflow: generate structured MDX or Markdown with AI, open it locally, review it comfortably, and share it with confidence." |
*
* @param {Home_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const home_description = /** @type {((inputs?: Home_DescriptionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Home_DescriptionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.home_description(inputs)
	return __zh.home_description(inputs)
});
/**
* | output |
* | --- |
* | "View GitHub" |
*
* @param {Home_GithubInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const home_github = /** @type {((inputs?: Home_GithubInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Home_GithubInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.home_github(inputs)
	return __zh.home_github(inputs)
});
/**
* | output |
* | --- |
* | "Explore features" |
*
* @param {Home_Features_LinkInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const home_features_link = /** @type {((inputs?: Home_Features_LinkInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Home_Features_LinkInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.home_features_link(inputs)
	return __zh.home_features_link(inputs)
});
/**
* | output |
* | --- |
* | "Open local MDX" |
*
* @param {Home_Feature_Local_TitleInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const home_feature_local_title = /** @type {((inputs?: Home_Feature_Local_TitleInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Home_Feature_Local_TitleInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.home_feature_local_title(inputs)
	return __zh.home_feature_local_title(inputs)
});
/**
* | output |
* | --- |
* | "Preview .mdx and .md files from your machine without publishing them to a cloud service." |
*
* @param {Home_Feature_Local_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const home_feature_local_description = /** @type {((inputs?: Home_Feature_Local_DescriptionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Home_Feature_Local_DescriptionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.home_feature_local_description(inputs)
	return __zh.home_feature_local_description(inputs)
});
/**
* | output |
* | --- |
* | "Docs-like reading UI" |
*
* @param {Home_Feature_Docs_TitleInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const home_feature_docs_title = /** @type {((inputs?: Home_Feature_Docs_TitleInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Home_Feature_Docs_TitleInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.home_feature_docs_title(inputs)
	return __zh.home_feature_docs_title(inputs)
});
/**
* | output |
* | --- |
* | "Render AI-generated documents with a polished navigation, outline, and reading experience." |
*
* @param {Home_Feature_Docs_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const home_feature_docs_description = /** @type {((inputs?: Home_Feature_Docs_DescriptionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Home_Feature_Docs_DescriptionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.home_feature_docs_description(inputs)
	return __zh.home_feature_docs_description(inputs)
});
/**
* | output |
* | --- |
* | "Controlled rendering" |
*
* @param {Home_Feature_Safe_TitleInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const home_feature_safe_title = /** @type {((inputs?: Home_Feature_Safe_TitleInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Home_Feature_Safe_TitleInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.home_feature_safe_title(inputs)
	return __zh.home_feature_safe_title(inputs)
});
/**
* | output |
* | --- |
* | "Use a curated component surface so generated MDX stays safe, predictable, and reviewable." |
*
* @param {Home_Feature_Safe_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const home_feature_safe_description = /** @type {((inputs?: Home_Feature_Safe_DescriptionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Home_Feature_Safe_DescriptionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.home_feature_safe_description(inputs)
	return __zh.home_feature_safe_description(inputs)
});