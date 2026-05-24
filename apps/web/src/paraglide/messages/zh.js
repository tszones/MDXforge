/* eslint-disable */
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


export const site_name = /** @type {(inputs: Site_NameInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`MDXForge`)
};

export const site_title = /** @type {(inputs: Site_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`MDXForge - 面向 AI 文档的本地优先 MDX 预览工具`)
};

export const site_description = /** @type {(inputs: Site_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`MDXForge 是一个本地优先的桌面工作区，用于安全预览 AI 生成的 MDX 和 Markdown 文档。`)
};

export const not_found_label = /** @type {(inputs: Not_Found_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`404`)
};

export const not_found_title = /** @type {(inputs: Not_Found_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`页面不存在`)
};

export const not_found_description = /** @type {(inputs: Not_Found_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`你访问的页面还不存在。`)
};

export const language_switcher = /** @type {(inputs: Language_SwitcherInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`切换语言`)
};

export const language_en = /** @type {(inputs: Language_EnInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`English`)
};

export const language_zh = /** @type {(inputs: Language_ZhInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`中文`)
};

export const home_meta_title = /** @type {(inputs: Home_Meta_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`MDXForge - 在本地预览 AI 生成的 MDX`)
};

export const home_meta_description = /** @type {(inputs: Home_Meta_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`一个专注的桌面阅读器，用于打开、导航并安全渲染 AI 生成的本地 MDX 和 Markdown 文件。`)
};

export const home_badge = /** @type {(inputs: Home_BadgeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`面向 AI 文档的本地优先 MDX 预览`)
};

export const home_title = /** @type {(inputs: Home_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`把 AI 生成的 MDX 变成安全的本地阅读体验。`)
};

export const home_description = /** @type {(inputs: Home_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`MDXForge 只专注一条工作流：用 AI 生成结构化 MDX 或 Markdown，在本地打开，舒适审阅，并放心分享。`)
};

export const home_github = /** @type {(inputs: Home_GithubInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`查看 GitHub`)
};

export const home_features_link = /** @type {(inputs: Home_Features_LinkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`了解功能`)
};

export const home_feature_local_title = /** @type {(inputs: Home_Feature_Local_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`打开本地 MDX`)
};

export const home_feature_local_description = /** @type {(inputs: Home_Feature_Local_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`直接预览电脑里的 .mdx 和 .md 文件，不需要发布到云端服务。`)
};

export const home_feature_docs_title = /** @type {(inputs: Home_Feature_Docs_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`文档站式阅读界面`)
};

export const home_feature_docs_description = /** @type {(inputs: Home_Feature_Docs_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`用精致的导航、大纲和阅读体验渲染 AI 生成的文档。`)
};

export const home_feature_safe_title = /** @type {(inputs: Home_Feature_Safe_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`受控渲染`)
};

export const home_feature_safe_description = /** @type {(inputs: Home_Feature_Safe_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`使用经过约束的组件集合，让生成的 MDX 更安全、可预测、便于审阅。`)
};