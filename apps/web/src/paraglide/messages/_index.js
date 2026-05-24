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
/** @typedef {{}} Theme_ToggleInputs */
/** @typedef {{}} Theme_LightInputs */
/** @typedef {{}} Theme_DarkInputs */
/** @typedef {{}} Theme_SystemInputs */
/** @typedef {{}} Nav_MainInputs */
/** @typedef {{}} Nav_HomeInputs */
/** @typedef {{}} Nav_Toggle_MenuInputs */
/** @typedef {{}} Nav_Mobile_MenuInputs */
/** @typedef {{}} Nav_FeaturesInputs */
/** @typedef {{}} Nav_WorkflowInputs */
/** @typedef {{}} Nav_SafetyInputs */
/** @typedef {{}} Nav_DownloadInputs */
/** @typedef {{}} Nav_ContactInputs */
/** @typedef {{}} Footer_ProductInputs */
/** @typedef {{}} Footer_ResourcesInputs */
/** @typedef {{}} Footer_CompanyInputs */
/** @typedef {{}} Footer_GithubInputs */
/** @typedef {{}} Footer_SocialInputs */
/** @typedef {{}} Footer_TaglineInputs */
/** @typedef {{}} Footer_RightsInputs */
/** @typedef {{}} Home_Meta_TitleInputs */
/** @typedef {{}} Home_Meta_DescriptionInputs */
/** @typedef {{}} Home_BadgeInputs */
/** @typedef {{}} Home_TitleInputs */
/** @typedef {{}} Home_DescriptionInputs */
/** @typedef {{}} Home_GithubInputs */
/** @typedef {{}} Home_Features_LinkInputs */
/** @typedef {{}} Home_Features_TitleInputs */
/** @typedef {{}} Home_Features_DescriptionInputs */
/** @typedef {{}} Home_Feature_Local_TitleInputs */
/** @typedef {{}} Home_Feature_Local_DescriptionInputs */
/** @typedef {{}} Home_Feature_Docs_TitleInputs */
/** @typedef {{}} Home_Feature_Docs_DescriptionInputs */
/** @typedef {{}} Home_Feature_Safe_TitleInputs */
/** @typedef {{}} Home_Feature_Safe_DescriptionInputs */
/** @typedef {{}} Home_Workflow_TitleInputs */
/** @typedef {{}} Home_Workflow_DescriptionInputs */
/** @typedef {{}} Home_Workflow_GenerateInputs */
/** @typedef {{}} Home_Workflow_OpenInputs */
/** @typedef {{}} Home_Workflow_ReviewInputs */
/** @typedef {{}} Home_Workflow_ShareInputs */
/** @typedef {{}} Home_Safety_TitleInputs */
/** @typedef {{}} Home_Safety_DescriptionInputs */
/** @typedef {{}} Home_Download_TitleInputs */
/** @typedef {{}} Home_Download_DescriptionInputs */
/** @typedef {{}} Home_Download_CtaInputs */
/** @typedef {{}} Contact_Meta_TitleInputs */
/** @typedef {{}} Contact_Meta_DescriptionInputs */
/** @typedef {{}} Contact_TitleInputs */
/** @typedef {{}} Contact_DescriptionInputs */
/** @typedef {{}} Contact_Email_TitleInputs */
/** @typedef {{}} Contact_Email_DescriptionInputs */
/** @typedef {{}} Contact_Form_TitleInputs */
/** @typedef {{}} Contact_NameInputs */
/** @typedef {{}} Contact_EmailInputs */
/** @typedef {{}} Contact_MessageInputs */
/** @typedef {{}} Contact_SendInputs */
/** @typedef {{}} Contact_SendingInputs */
/** @typedef {{}} Contact_SuccessInputs */
/** @typedef {{}} Contact_ErrorInputs */
/** @typedef {{}} Contact_Email_CtaInputs */
/** @typedef {{}} Contact_Github_CtaInputs */
/** @typedef {{}} Mail_Contact_SubjectInputs */
/** @typedef {{}} Mail_Contact_NameInputs */
/** @typedef {{}} Mail_Contact_EmailInputs */
/** @typedef {{}} Mail_Contact_MessageInputs */
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
* | "Toggle theme" |
*
* @param {Theme_ToggleInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const theme_toggle = /** @type {((inputs?: Theme_ToggleInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Theme_ToggleInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.theme_toggle(inputs)
	return __zh.theme_toggle(inputs)
});
/**
* | output |
* | --- |
* | "Light" |
*
* @param {Theme_LightInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const theme_light = /** @type {((inputs?: Theme_LightInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Theme_LightInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.theme_light(inputs)
	return __zh.theme_light(inputs)
});
/**
* | output |
* | --- |
* | "Dark" |
*
* @param {Theme_DarkInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const theme_dark = /** @type {((inputs?: Theme_DarkInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Theme_DarkInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.theme_dark(inputs)
	return __zh.theme_dark(inputs)
});
/**
* | output |
* | --- |
* | "System" |
*
* @param {Theme_SystemInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const theme_system = /** @type {((inputs?: Theme_SystemInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Theme_SystemInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.theme_system(inputs)
	return __zh.theme_system(inputs)
});
/**
* | output |
* | --- |
* | "Main navigation" |
*
* @param {Nav_MainInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const nav_main = /** @type {((inputs?: Nav_MainInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Nav_MainInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.nav_main(inputs)
	return __zh.nav_main(inputs)
});
/**
* | output |
* | --- |
* | "Home" |
*
* @param {Nav_HomeInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const nav_home = /** @type {((inputs?: Nav_HomeInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Nav_HomeInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.nav_home(inputs)
	return __zh.nav_home(inputs)
});
/**
* | output |
* | --- |
* | "Toggle menu" |
*
* @param {Nav_Toggle_MenuInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const nav_toggle_menu = /** @type {((inputs?: Nav_Toggle_MenuInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Nav_Toggle_MenuInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.nav_toggle_menu(inputs)
	return __zh.nav_toggle_menu(inputs)
});
/**
* | output |
* | --- |
* | "Mobile navigation" |
*
* @param {Nav_Mobile_MenuInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const nav_mobile_menu = /** @type {((inputs?: Nav_Mobile_MenuInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Nav_Mobile_MenuInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.nav_mobile_menu(inputs)
	return __zh.nav_mobile_menu(inputs)
});
/**
* | output |
* | --- |
* | "Features" |
*
* @param {Nav_FeaturesInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const nav_features = /** @type {((inputs?: Nav_FeaturesInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Nav_FeaturesInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.nav_features(inputs)
	return __zh.nav_features(inputs)
});
/**
* | output |
* | --- |
* | "Workflow" |
*
* @param {Nav_WorkflowInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const nav_workflow = /** @type {((inputs?: Nav_WorkflowInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Nav_WorkflowInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.nav_workflow(inputs)
	return __zh.nav_workflow(inputs)
});
/**
* | output |
* | --- |
* | "Safety" |
*
* @param {Nav_SafetyInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const nav_safety = /** @type {((inputs?: Nav_SafetyInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Nav_SafetyInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.nav_safety(inputs)
	return __zh.nav_safety(inputs)
});
/**
* | output |
* | --- |
* | "Download" |
*
* @param {Nav_DownloadInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const nav_download = /** @type {((inputs?: Nav_DownloadInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Nav_DownloadInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.nav_download(inputs)
	return __zh.nav_download(inputs)
});
/**
* | output |
* | --- |
* | "Contact" |
*
* @param {Nav_ContactInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const nav_contact = /** @type {((inputs?: Nav_ContactInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Nav_ContactInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.nav_contact(inputs)
	return __zh.nav_contact(inputs)
});
/**
* | output |
* | --- |
* | "Product" |
*
* @param {Footer_ProductInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const footer_product = /** @type {((inputs?: Footer_ProductInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Footer_ProductInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.footer_product(inputs)
	return __zh.footer_product(inputs)
});
/**
* | output |
* | --- |
* | "Resources" |
*
* @param {Footer_ResourcesInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const footer_resources = /** @type {((inputs?: Footer_ResourcesInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Footer_ResourcesInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.footer_resources(inputs)
	return __zh.footer_resources(inputs)
});
/**
* | output |
* | --- |
* | "Company" |
*
* @param {Footer_CompanyInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const footer_company = /** @type {((inputs?: Footer_CompanyInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Footer_CompanyInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.footer_company(inputs)
	return __zh.footer_company(inputs)
});
/**
* | output |
* | --- |
* | "GitHub" |
*
* @param {Footer_GithubInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const footer_github = /** @type {((inputs?: Footer_GithubInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Footer_GithubInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.footer_github(inputs)
	return __zh.footer_github(inputs)
});
/**
* | output |
* | --- |
* | "Social links" |
*
* @param {Footer_SocialInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const footer_social = /** @type {((inputs?: Footer_SocialInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Footer_SocialInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.footer_social(inputs)
	return __zh.footer_social(inputs)
});
/**
* | output |
* | --- |
* | "A safe, local-first desktop reader for AI-generated MDX and Markdown documents." |
*
* @param {Footer_TaglineInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const footer_tagline = /** @type {((inputs?: Footer_TaglineInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Footer_TaglineInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.footer_tagline(inputs)
	return __zh.footer_tagline(inputs)
});
/**
* | output |
* | --- |
* | "All rights reserved." |
*
* @param {Footer_RightsInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const footer_rights = /** @type {((inputs?: Footer_RightsInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Footer_RightsInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.footer_rights(inputs)
	return __zh.footer_rights(inputs)
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
* | "Everything focused on local AI docs review." |
*
* @param {Home_Features_TitleInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const home_features_title = /** @type {((inputs?: Home_Features_TitleInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Home_Features_TitleInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.home_features_title(inputs)
	return __zh.home_features_title(inputs)
});
/**
* | output |
* | --- |
* | "No SaaS dashboard, no generic editor, no cloud sync. Just a controlled preview target for generated documentation." |
*
* @param {Home_Features_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const home_features_description = /** @type {((inputs?: Home_Features_DescriptionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Home_Features_DescriptionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.home_features_description(inputs)
	return __zh.home_features_description(inputs)
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
/**
* | output |
* | --- |
* | "A simple AI documentation workflow." |
*
* @param {Home_Workflow_TitleInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const home_workflow_title = /** @type {((inputs?: Home_Workflow_TitleInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Home_Workflow_TitleInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.home_workflow_title(inputs)
	return __zh.home_workflow_title(inputs)
});
/**
* | output |
* | --- |
* | "Give AI a clear MDX target, then review the result locally before sharing or publishing." |
*
* @param {Home_Workflow_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const home_workflow_description = /** @type {((inputs?: Home_Workflow_DescriptionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Home_Workflow_DescriptionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.home_workflow_description(inputs)
	return __zh.home_workflow_description(inputs)
});
/**
* | output |
* | --- |
* | "Generate structured MDX or Markdown with AI using MDXForge authoring rules." |
*
* @param {Home_Workflow_GenerateInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const home_workflow_generate = /** @type {((inputs?: Home_Workflow_GenerateInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Home_Workflow_GenerateInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.home_workflow_generate(inputs)
	return __zh.home_workflow_generate(inputs)
});
/**
* | output |
* | --- |
* | "Open a local file or folder directly in the desktop app." |
*
* @param {Home_Workflow_OpenInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const home_workflow_open = /** @type {((inputs?: Home_Workflow_OpenInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Home_Workflow_OpenInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.home_workflow_open(inputs)
	return __zh.home_workflow_open(inputs)
});
/**
* | output |
* | --- |
* | "Navigate documents, inspect the outline, validate formatting, and read in a docs-style UI." |
*
* @param {Home_Workflow_ReviewInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const home_workflow_review = /** @type {((inputs?: Home_Workflow_ReviewInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Home_Workflow_ReviewInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.home_workflow_review(inputs)
	return __zh.home_workflow_review(inputs)
});
/**
* | output |
* | --- |
* | "Share the source file or export path with confidence after human review." |
*
* @param {Home_Workflow_ShareInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const home_workflow_share = /** @type {((inputs?: Home_Workflow_ShareInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Home_Workflow_ShareInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.home_workflow_share(inputs)
	return __zh.home_workflow_share(inputs)
});
/**
* | output |
* | --- |
* | "Designed around controlled MDX." |
*
* @param {Home_Safety_TitleInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const home_safety_title = /** @type {((inputs?: Home_Safety_TitleInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Home_Safety_TitleInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.home_safety_title(inputs)
	return __zh.home_safety_title(inputs)
});
/**
* | output |
* | --- |
* | "MDXForge favors a curated component whitelist and predictable rendering over arbitrary runtime capabilities." |
*
* @param {Home_Safety_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const home_safety_description = /** @type {((inputs?: Home_Safety_DescriptionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Home_Safety_DescriptionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.home_safety_description(inputs)
	return __zh.home_safety_description(inputs)
});
/**
* | output |
* | --- |
* | "Desktop first, web for discovery." |
*
* @param {Home_Download_TitleInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const home_download_title = /** @type {((inputs?: Home_Download_TitleInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Home_Download_TitleInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.home_download_title(inputs)
	return __zh.home_download_title(inputs)
});
/**
* | output |
* | --- |
* | "The website explains the product. The core experience remains a local desktop app for Windows, macOS, and Linux." |
*
* @param {Home_Download_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const home_download_description = /** @type {((inputs?: Home_Download_DescriptionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Home_Download_DescriptionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.home_download_description(inputs)
	return __zh.home_download_description(inputs)
});
/**
* | output |
* | --- |
* | "View releases" |
*
* @param {Home_Download_CtaInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const home_download_cta = /** @type {((inputs?: Home_Download_CtaInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Home_Download_CtaInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.home_download_cta(inputs)
	return __zh.home_download_cta(inputs)
});
/**
* | output |
* | --- |
* | "Contact MDXForge" |
*
* @param {Contact_Meta_TitleInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const contact_meta_title = /** @type {((inputs?: Contact_Meta_TitleInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Contact_Meta_TitleInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.contact_meta_title(inputs)
	return __zh.contact_meta_title(inputs)
});
/**
* | output |
* | --- |
* | "Contact the MDXForge team for product questions, docs workflow feedback, and local MDX preview suggestions." |
*
* @param {Contact_Meta_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const contact_meta_description = /** @type {((inputs?: Contact_Meta_DescriptionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Contact_Meta_DescriptionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.contact_meta_description(inputs)
	return __zh.contact_meta_description(inputs)
});
/**
* | output |
* | --- |
* | "Tell us how you review AI-generated docs." |
*
* @param {Contact_TitleInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const contact_title = /** @type {((inputs?: Contact_TitleInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Contact_TitleInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.contact_title(inputs)
	return __zh.contact_title(inputs)
});
/**
* | output |
* | --- |
* | "Questions, feedback, and workflow notes are welcome. MDXForge stays focused on local MDX and Markdown preview for AI documentation." |
*
* @param {Contact_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const contact_description = /** @type {((inputs?: Contact_DescriptionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Contact_DescriptionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.contact_description(inputs)
	return __zh.contact_description(inputs)
});
/**
* | output |
* | --- |
* | "Email the MDXForge team" |
*
* @param {Contact_Email_TitleInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const contact_email_title = /** @type {((inputs?: Contact_Email_TitleInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Contact_Email_TitleInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.contact_email_title(inputs)
	return __zh.contact_email_title(inputs)
});
/**
* | output |
* | --- |
* | "Use email for product feedback, bug reports, and collaboration ideas. No account or cloud workspace required." |
*
* @param {Contact_Email_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const contact_email_description = /** @type {((inputs?: Contact_Email_DescriptionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Contact_Email_DescriptionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.contact_email_description(inputs)
	return __zh.contact_email_description(inputs)
});
/**
* | output |
* | --- |
* | "Send a message" |
*
* @param {Contact_Form_TitleInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const contact_form_title = /** @type {((inputs?: Contact_Form_TitleInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Contact_Form_TitleInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.contact_form_title(inputs)
	return __zh.contact_form_title(inputs)
});
/**
* | output |
* | --- |
* | "Name" |
*
* @param {Contact_NameInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const contact_name = /** @type {((inputs?: Contact_NameInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Contact_NameInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.contact_name(inputs)
	return __zh.contact_name(inputs)
});
/**
* | output |
* | --- |
* | "Email" |
*
* @param {Contact_EmailInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const contact_email = /** @type {((inputs?: Contact_EmailInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Contact_EmailInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.contact_email(inputs)
	return __zh.contact_email(inputs)
});
/**
* | output |
* | --- |
* | "Message" |
*
* @param {Contact_MessageInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const contact_message = /** @type {((inputs?: Contact_MessageInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Contact_MessageInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.contact_message(inputs)
	return __zh.contact_message(inputs)
});
/**
* | output |
* | --- |
* | "Send message" |
*
* @param {Contact_SendInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const contact_send = /** @type {((inputs?: Contact_SendInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Contact_SendInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.contact_send(inputs)
	return __zh.contact_send(inputs)
});
/**
* | output |
* | --- |
* | "Sending..." |
*
* @param {Contact_SendingInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const contact_sending = /** @type {((inputs?: Contact_SendingInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Contact_SendingInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.contact_sending(inputs)
	return __zh.contact_sending(inputs)
});
/**
* | output |
* | --- |
* | "Thanks, your message was sent." |
*
* @param {Contact_SuccessInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const contact_success = /** @type {((inputs?: Contact_SuccessInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Contact_SuccessInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.contact_success(inputs)
	return __zh.contact_success(inputs)
});
/**
* | output |
* | --- |
* | "Failed to send the message. Please try again later." |
*
* @param {Contact_ErrorInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const contact_error = /** @type {((inputs?: Contact_ErrorInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Contact_ErrorInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.contact_error(inputs)
	return __zh.contact_error(inputs)
});
/**
* | output |
* | --- |
* | "Open email app" |
*
* @param {Contact_Email_CtaInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const contact_email_cta = /** @type {((inputs?: Contact_Email_CtaInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Contact_Email_CtaInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.contact_email_cta(inputs)
	return __zh.contact_email_cta(inputs)
});
/**
* | output |
* | --- |
* | "Open GitHub" |
*
* @param {Contact_Github_CtaInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const contact_github_cta = /** @type {((inputs?: Contact_Github_CtaInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Contact_Github_CtaInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.contact_github_cta(inputs)
	return __zh.contact_github_cta(inputs)
});
/**
* | output |
* | --- |
* | "New MDXForge contact message" |
*
* @param {Mail_Contact_SubjectInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const mail_contact_subject = /** @type {((inputs?: Mail_Contact_SubjectInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Mail_Contact_SubjectInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.mail_contact_subject(inputs)
	return __zh.mail_contact_subject(inputs)
});
/**
* | output |
* | --- |
* | "Name:" |
*
* @param {Mail_Contact_NameInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const mail_contact_name = /** @type {((inputs?: Mail_Contact_NameInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Mail_Contact_NameInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.mail_contact_name(inputs)
	return __zh.mail_contact_name(inputs)
});
/**
* | output |
* | --- |
* | "Email:" |
*
* @param {Mail_Contact_EmailInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const mail_contact_email = /** @type {((inputs?: Mail_Contact_EmailInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Mail_Contact_EmailInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.mail_contact_email(inputs)
	return __zh.mail_contact_email(inputs)
});
/**
* | output |
* | --- |
* | "Message:" |
*
* @param {Mail_Contact_MessageInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const mail_contact_message = /** @type {((inputs?: Mail_Contact_MessageInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Mail_Contact_MessageInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.mail_contact_message(inputs)
	return __zh.mail_contact_message(inputs)
});