// Popup Script for 115 Offline Helper

// Config Keys
const CONFIG_KEYS = {
	SAVE_PATH: 'push115_save_path',
	SAVE_PATH_CID: 'push115_save_path_cid',
	SAVE_PATH_LIST: 'push115_save_path_list',
	AUTO_DELETE_SMALL: 'push115_auto_delete_small',
	DELETE_SIZE_THRESHOLD: 'push115_delete_size_threshold',
	AUTO_ORGANIZE: 'push115_auto_organize',
	I18N_LOCALE: 'push115_i18n_locale',
	THEME: 'push115_theme',
}

const DEFAULT_CONFIG = {
	[CONFIG_KEYS.SAVE_PATH]: '',
	[CONFIG_KEYS.SAVE_PATH_CID]: '0',
	[CONFIG_KEYS.SAVE_PATH_LIST]: '',
	[CONFIG_KEYS.AUTO_DELETE_SMALL]: false,
	[CONFIG_KEYS.DELETE_SIZE_THRESHOLD]: 100,
	[CONFIG_KEYS.AUTO_ORGANIZE]: false,
	[CONFIG_KEYS.I18N_LOCALE]: 'zh-CN',
	[CONFIG_KEYS.THEME]: 'auto',
}

const I18N_STRINGS = {
	'zh-CN': {
		panel_title: '115离线助手',
		tab_home: '主页',
		tab_settings: '设置',
		save_path_label: '默认保存目录:',
		cid_hint: '提示: 在“设置”页维护目录列表（每行：目录名:CID）',
		root_path_name: '根目录',
		auto_delete_label: '自动删除小文件',
		delete_size_label_pre: '删除小于',
		delete_size_label_post: 'MB的文件',
		auto_organize_label: '自动整理视频文件夹',
		organize_hint: '自动将散乱的视频文件整理到同名文件夹中',
		check_login_text: '检查状态',
		login_btn: '扫码登录',
		login_success: '115账号已登录',
		login_fail: '未登录，请先登录115',
		processing: '处理中...',
		settings_language_label: '语言 / Language',
		settings_theme_label: '主题 / Theme',
		theme_auto: '跟随系统',
		theme_light: '浅色',
		theme_dark: '深色',
		settings_save_dirs_label: '115 离线目录 (一行一个)',
		save_dirs_placeholder: '例如：98预处理:3280039214730565554',
		save_dirs_hint: '格式：目录名:CID，例如：电影:123456789',
	},
	'en-US': {
		panel_title: '115 Offline Helper',
		tab_home: 'Home',
		tab_settings: 'Settings',
		save_path_label: 'Default Save Directory:',
		cid_hint: 'Tip: Maintain directory list in Settings, one per line: Name:CID',
		root_path_name: 'Root',
		auto_delete_label: 'Auto delete small files',
		delete_size_label_pre: 'Delete files <',
		delete_size_label_post: 'MB',
		auto_organize_label: 'Auto organize video folders',
		organize_hint: 'Automatically organize scattered video files into folders',
		check_login_text: 'Check Status',
		login_btn: 'QR Login',
		login_success: '115 is logged in',
		login_fail: 'Not logged in, please login first',
		processing: 'Processing...',
		settings_language_label: 'Language',
		settings_theme_label: 'Theme',
		theme_auto: 'System',
		theme_light: 'Light',
		theme_dark: 'Dark',
		settings_save_dirs_label: '115 Offline Directories (One per line)',
		save_dirs_placeholder: 'e.g., Preprocess:3280039214730565554',
		save_dirs_hint: 'Format: Name:CID, e.g., Movies:123456789',
	},
}

let configCache = { ...DEFAULT_CONFIG }

function t(key) {
	const locale = configCache[CONFIG_KEYS.I18N_LOCALE] || 'zh-CN'
	const strings = I18N_STRINGS[locale] || I18N_STRINGS['zh-CN']
	return strings[key] || key
}

function sendMessage(action, details = {}) {
	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage({ action, details }, response => {
			if (chrome.runtime.lastError) {
				reject(chrome.runtime.lastError)
			} else if (response && response.success) {
				resolve(response)
			} else {
				reject(new Error(response?.error || 'Unknown error'))
			}
		})
	})
}

function getConfig(key) {
	return configCache[key]
}

function setConfig(key, value) {
	configCache[key] = value
	chrome.storage.local.set({ [key]: value })
}

function showStatus(type, msg, timeout = 3000) {
	const area = document.getElementById('push115-status-area')
	area.innerHTML = `<div class="push115-status ${type}">${msg}</div>`
	if (timeout) {
		setTimeout(() => (area.innerHTML = ''), timeout)
	}
}

function applyTheme(theme) {
	document.body.classList.remove('dark-theme')
	if (theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
		document.body.classList.add('dark-theme')
	}
}

function applyLocale() {
	// Update all text elements
	document.getElementById('push115-title-text').textContent = t('panel_title')
	document.querySelector('[data-tab="home"]').textContent = t('tab_home')
	document.querySelector('[data-tab="settings"]').textContent = t('tab_settings')
	document.getElementById('label-save-path').textContent = t('save_path_label')
	document.getElementById('hint-cid').textContent = t('cid_hint')
	document.getElementById('label-save-dirs').textContent = t('settings_save_dirs_label')
	document.getElementById('push115-save-dirs-input').placeholder = t('save_dirs_placeholder')
	document.getElementById('hint-save-dirs').textContent = t('save_dirs_hint')
	document.getElementById('label-auto-delete').textContent = t('auto_delete_label')
	document.getElementById('label-delete-pre').textContent = t('delete_size_label_pre')
	document.getElementById('label-delete-post').textContent = t('delete_size_label_post')
	document.getElementById('label-auto-organize').textContent = t('auto_organize_label')
	document.getElementById('hint-organize').textContent = t('organize_hint')
	document.getElementById('push115-check-login').innerHTML =
		'<img src="icons/check.png" width="16" height="16">' + t('check_login_text')
	document.getElementById('push115-login-btn').innerHTML =
		'<img src="icons/115.png" width="16" height="16">' + t('login_btn')

	renderSaveDirSelect()
}

function getRootLabel() {
	return t('root_path_name')
}

function renderSaveDirSelect() {
	const selectEl = document.getElementById('push115-save-dir-select')
	if (!selectEl || !window.Push115PathUtils) return

	const savedCid = Push115PathUtils.normalizeCid(getConfig(CONFIG_KEYS.SAVE_PATH_CID)) || '0'
	const listText = getConfig(CONFIG_KEYS.SAVE_PATH_LIST) || ''
	const options = Push115PathUtils.buildPathOptions(listText, getRootLabel())
	const hasSaved = options.some(item => item.cid === savedCid)

	const allOptions = hasSaved ? options : [...options, { name: '', cid: savedCid }]
	selectEl.innerHTML = allOptions
		.map(item => {
			const selected = item.cid === savedCid ? ' selected' : ''
			const label = Push115PathUtils.formatPathLabel(item, getRootLabel())
			return `<option value="${item.cid}"${selected}>${label}</option>`
		})
		.join('')
}

async function init() {
	// Load config
	const items = await chrome.storage.local.get(null)
	configCache = { ...DEFAULT_CONFIG, ...items }

	// Apply theme & locale
	applyTheme(getConfig(CONFIG_KEYS.THEME))
	applyLocale()

	document.getElementById('push115-auto-organize').checked = getConfig(CONFIG_KEYS.AUTO_ORGANIZE)
	document.getElementById('push115-auto-delete').checked = getConfig(CONFIG_KEYS.AUTO_DELETE_SMALL)
	document.getElementById('push115-delete-size').value = getConfig(CONFIG_KEYS.DELETE_SIZE_THRESHOLD)
	document.getElementById('push115-language-select').value = getConfig(CONFIG_KEYS.I18N_LOCALE)
	document.getElementById('push115-theme-select').value = getConfig(CONFIG_KEYS.THEME)
	document.getElementById('push115-save-dirs-input').value = getConfig(CONFIG_KEYS.SAVE_PATH_LIST)
	renderSaveDirSelect()

	if (getConfig(CONFIG_KEYS.AUTO_DELETE_SMALL)) {
		document.getElementById('push115-delete-section').style.display = 'block'
	}

	// Bind events
	bindEvents()
	bindLoginModalEvents()
}

function bindEvents() {
	// Tab switching
	document.querySelectorAll('.push115-tab').forEach(tab => {
		tab.addEventListener('click', () => {
			document.querySelectorAll('.push115-tab').forEach(t => t.classList.remove('active'))
			document.querySelectorAll('.push115-tab-content').forEach(c => c.classList.remove('active'))
			tab.classList.add('active')
			document.getElementById(`push115-tab-${tab.dataset.tab}`).classList.add('active')
		})
	})

	// Theme
	document.getElementById('push115-theme-select').addEventListener('change', e => {
		setConfig(CONFIG_KEYS.THEME, e.target.value)
		applyTheme(e.target.value)
	})

	// Language
	document.getElementById('push115-language-select').addEventListener('change', e => {
		setConfig(CONFIG_KEYS.I18N_LOCALE, e.target.value)
		applyLocale()
	})

	// Save directory list config
	document.getElementById('push115-save-dirs-input').addEventListener('change', e => {
		setConfig(CONFIG_KEYS.SAVE_PATH_LIST, e.target.value)
		renderSaveDirSelect()
	})

	// Auto organize
	document.getElementById('push115-auto-organize').addEventListener('change', e => {
		setConfig(CONFIG_KEYS.AUTO_ORGANIZE, e.target.checked)
	})

	// Auto delete
	document.getElementById('push115-auto-delete').addEventListener('change', e => {
		setConfig(CONFIG_KEYS.AUTO_DELETE_SMALL, e.target.checked)
		document.getElementById('push115-delete-section').style.display = e.target.checked ? 'block' : 'none'
	})

	document.getElementById('push115-delete-size').addEventListener('change', e => {
		setConfig(CONFIG_KEYS.DELETE_SIZE_THRESHOLD, e.target.value)
	})

	// Save directory
	document.getElementById('push115-save-dir-select').addEventListener('change', e => {
		const cid = Push115PathUtils.normalizeCid(e.target.value) || '0'
		const listText = getConfig(CONFIG_KEYS.SAVE_PATH_LIST) || ''
		const found = Push115PathUtils.findPathByCid(listText, cid)
		setConfig(CONFIG_KEYS.SAVE_PATH_CID, cid)
		setConfig(CONFIG_KEYS.SAVE_PATH, cid === '0' ? '' : found?.name || '')
		renderSaveDirSelect()
	})

	// Check Login
	document.getElementById('push115-check-login').addEventListener('click', async () => {
		const btn = document.getElementById('push115-check-login')
		btn.disabled = true
		btn.innerHTML = '<img src="icons/check.png" width="16" height="16">' + t('processing')
		try {
			const response = await sendMessage('API_REQUEST', {
				url: 'https://my.115.com/?ct=guide&ac=status',
				method: 'GET',
			})
			const isLogin = response.data && response.data.state === true
			showStatus(isLogin ? 'success' : 'error', isLogin ? t('login_success') : t('login_fail'))
		} catch (e) {
			showStatus('error', t('login_fail'))
		}
		btn.disabled = false
		btn.innerHTML = '<img src="icons/check.png" width="16" height="16">' + t('check_login_text')
	})

	// Login Button - open modal
	document.getElementById('push115-login-btn').addEventListener('click', () => {
		showLoginModal()
	})
}

// ========== QR Login Modal ==========

const APP_DESCRIPTIONS = {
	web: '请使用 115 App 扫码',
	ios: '请使用 115 App (iOS端) 扫码',
	android: '请使用 115 App (Android端) 扫码',
	ipad: '请使用 115 App (iPad端) 扫码',
	tv: '请使用 115 App (Android电视端) 扫码',
	qios: '请使用 115管理 App (iOS端) 扫码',
	qandroid: '请使用 115管理 App (Android端) 扫码',
	wechatmini: '请使用 微信 扫码 (115生活小程序)',
	alipaymini: '请使用 支付宝 扫码 (115生活小程序)',
}

let stopPolling = false

function showLoginModal() {
	const modal = document.getElementById('push115-login-modal')
	modal.style.display = 'flex'
	stopPolling = false

	// Reset to select area
	document.getElementById('push115-login-select-area').style.display = 'block'
	document.getElementById('push115-qrcode-area').style.display = 'none'
	document.getElementById('push115-qrcode-wrapper').innerHTML = '<span class="push115-loading"></span>'
	document.getElementById('push115-qrcode-status').textContent = '正在获取二维码...'
	updateQRTip()
}

function hideLoginModal() {
	stopPolling = true
	document.getElementById('push115-login-modal').style.display = 'none'
}

function updateQRTip() {
	const val = document.getElementById('push115-app-select').value
	const tipEl = document.getElementById('push115-qrcode-tip')
	if (tipEl && APP_DESCRIPTIONS[val]) {
		tipEl.textContent = APP_DESCRIPTIONS[val]
	}
}

// Bind modal events (called once during init)
function bindLoginModalEvents() {
	// Cancel button
	document.getElementById('push115-login-cancel').addEventListener('click', hideLoginModal)

	// Click overlay to close
	document.getElementById('push115-login-modal').addEventListener('click', e => {
		if (e.target.id === 'push115-login-modal') hideLoginModal()
	})

	// ESC to close
	document.addEventListener('keydown', e => {
		if (e.key === 'Escape') hideLoginModal()
	})

	// App select change -> update tip
	document.getElementById('push115-app-select').addEventListener('change', updateQRTip)

	// Start scan button
	document.getElementById('push115-login-start').addEventListener('click', () => {
		const selectedApp = document.getElementById('push115-app-select').value
		document.getElementById('push115-login-select-area').style.display = 'none'
		document.getElementById('push115-qrcode-area').style.display = 'block'
		startLoginFlow(selectedApp)
	})
}

async function startLoginFlow(selectedApp) {
	try {
		// 1. Get QR Token
		const tokenResp = await sendMessage('API_REQUEST', {
			url: 'https://qrcodeapi.115.com/api/1.0/web/1.0/token/',
			method: 'GET',
		})
		const tokenResult = tokenResp.data
		if (!tokenResult || tokenResult.state !== 1 || !tokenResult.data || !tokenResult.data.uid) {
			throw new Error('获取二维码 Token 失败')
		}

		const { uid, time, sign } = tokenResult.data

		// 2. Show QR Code
		const wrapper = document.getElementById('push115-qrcode-wrapper')
		if (wrapper) {
			wrapper.innerHTML = `<img src="https://qrcodeapi.115.com/api/1.0/web/1.0/qrcode?uid=${uid}&_=${Date.now()}">`
		}

		const statusEl = document.getElementById('push115-qrcode-status')
		if (statusEl) statusEl.textContent = '请扫描二维码'

		// 3. Poll status
		while (!stopPolling) {
			try {
				const statusResp = await sendMessage('API_REQUEST', {
					url: `https://qrcodeapi.115.com/get/status/?uid=${uid}&time=${time}&sign=${sign}&_=${Date.now()}`,
					method: 'GET',
				})
				const statusResult = statusResp.data
				if (!statusResult || statusResult.state !== 1 || !statusResult.data) {
					throw new Error('获取二维码状态失败')
				}

				const status = statusResult.data.status

				if (status === 0) {
					if (statusEl) statusEl.textContent = '请扫描二维码'
				} else if (status === 1) {
					if (statusEl) statusEl.textContent = '已扫码，请在手机上确认'
				} else if (status === 2) {
					if (statusEl) statusEl.textContent = '登录成功！正在获取 Cookie...'

					// 4. Exchange for cookie
					try {
						const loginResp = await sendMessage('API_REQUEST', {
							url: `https://passportapi.115.com/app/1.0/${selectedApp}/1.0/login/qrcode/`,
							method: 'POST',
							data: { account: uid, app: selectedApp },
						})

						const loginResult = loginResp.data
						if (!loginResult || loginResult.state !== 1 || !loginResult.data?.cookie) {
							throw new Error(loginResult?.error || '登录失败')
						}

						await sendMessage('SET_COOKIE', {
							cookie: loginResult.data.cookie,
						})

						if (statusEl) statusEl.textContent = ' 登录完成'
						setTimeout(() => {
							hideLoginModal()
							showStatus('success', ` 115 登录成功 (${selectedApp})，Cookie 已保存`)
						}, 1000)
					} catch (loginErr) {
						console.error('Login Error:', loginErr)
						if (statusEl) statusEl.textContent = ' 获取Cookie失败: ' + loginErr.message
						stopPolling = true
					}
					break
				} else if (status === -1) {
					if (statusEl) statusEl.textContent = '二维码已过期，请重试'
					break
				} else if (status === -2) {
					if (statusEl) statusEl.textContent = '已取消登录'
					break
				}

				await new Promise(r => setTimeout(r, 1500))
			} catch (e) {
				console.error('轮询状态错误:', e)
				await new Promise(r => setTimeout(r, 2000))
			}
		}
	} catch (e) {
		console.error('登录流程错误:', e)
		const statusEl = document.getElementById('push115-qrcode-status')
		if (statusEl) statusEl.textContent = ' 发生错误: ' + e.message
	}
}

// Start
document.addEventListener('DOMContentLoaded', init)
