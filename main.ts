/**
 * При написании кода используются следующие термины для наименования сущностей
 * Catalog - набор эелементов, которые создаются одномоментно.
 * Item - единичная структура каталога, которая создается на основании правил предопределенных пользователем.
 */

import { log } from 'console';
import { create } from 'domain';
import { mkdir } from 'fs';
import { App, Editor, Vault, MarkdownView, Modal, Notice, Plugin, setIcon, PluginSettingTab, Setting, ExtraButtonComponent, ButtonComponent, Component, setTooltip, displayTooltip, TextComponent, normalizePath } from 'obsidian';
import { start } from 'repl';

// Remember to rename these classes and interfaces!

interface PluginSettings {
	mySetting: string;
	createdElementType: string;
	catalogElements: any;

	valueInput: string;
	catalogNameInput: string;

	catalogs: any;
}

const DEFAULT_SETTINGS: PluginSettings = {
	mySetting: 'default',
	createdElementType: '',
	catalogElements: [],

	valueInput: '',
	catalogNameInput: '',

	catalogs: []
}



export default class Autocreate extends Plugin {
	settings: PluginSettings;
		

	async onload() {

		await this.loadSettings();
		const vault = this.app.vault;
		const catalog = this.settings.catalogs[0]
		const catalogs = this.settings.catalogs;


		//registerFileMenu(this, catalogs);
		
		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Autocreate', (_evt: MouseEvent) => {
			createdCatalogOnVault(catalog);			
		});

		//function registerFileMenu (this, catalogs) {
			this.registerEvent(
				this.app.workspace.on('file-menu', (menu, file) => {
				catalogs.forEach(catalog => {			
					menu.addItem((item) => {
						item
						.setSection('action-primary')
						.setTitle(`Создать каталог ${catalog.name}`)
						.setIcon('chart-bar-increasing')
						.onClick(async () => {
							if (catalog.items.length > 0) {
								createdCatalogOnVault(catalog, file.path)
							} else {
								new Notice(`В каталоге ${catalog.name} нет элементов`)
							}
							
						});
					})


				})
				
				})
			);
		//}

	
		function createdCatalogOnVault (catalog: any, path) {
			if (catalog.hasOwnProperty('items')) {
				catalog = catalog.items
			}

			catalog.forEach((item: { itemType: string; itemName: string; }) => {
				let deepPath;
				if (item.itemType == 'file') {
					vault.create(`${path}/${item.itemName}.md`, '')
				} else if (item.itemType == 'folder') {
					deepPath = `${path}/${item.itemName}`
					vault.createFolder(deepPath)
				}

				if (item.itemChilds.length > 0 && item.itemChilds !== undefined) {
					
					createdCatalogOnVault(item.itemChilds, `${deepPath}/`)
				}
			});
			
		}
		// Perform additional things with the ribbon
		//ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		/*const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');*/

		// This adds a simple command that can be triggered anywhere
		/*this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});*/
		// This adds an editor command that can perform some operation on the current editor instance
		/*this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, _view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});*/
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		/*this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});*/

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new MainSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		/*this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});*/

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		//this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

/*class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}*/




export class ModalSubmitDelete extends Modal {
  constructor(app: App, textModal: string = '', onSubmit: (result: boolean) => void) {
    super(app);
	if (textModal.length == 0) {
		this.setContent('Вы действительно хотите удалить этот элемент')
	} else {
		this.setContent(textModal)
	}
	
	
	new Setting(this.contentEl)
        .addButton((btn) =>
        btn
			.setButtonText('Yes')
			.setClass('ac-delete-button')
			.onClick(() => {
			this.close();
			onSubmit(true);
			})
		)
		.addButton((btn) =>
		btn
			.setButtonText('No')
            .onClick(() => {
            this.close();
            onSubmit(false);
          })
		)
  }
}


class MainSettingTab extends PluginSettingTab {
	plugin: Autocreate;
	
	constructor(app: App, plugin: Autocreate) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		
		

		const {containerEl} = this;
		containerEl.empty();

		const app = this.app;
		const plugin = this.plugin;
		const settings = plugin.settings;

		const catalogs = settings.catalogs;

		let buttonMainSettingsComp: ButtonComponent;

		renderMainSettings(renderNavBar(plugin), buttonMainSettingsComp)

		/**
		 * Генерирует навигационное меню
		 * @param plugin 
		 * @returns 
		 */

		function renderNavBar (plugin: Autocreate) {

			let inputCatalogNameComp;
			let inputCatalogNameEl: HTMLElement;
			let compSubmitCatalogName: ExtraButtonComponent;
			let submitCatalogNameEl: Element | null;

			let inputCatalogNameValue: string = '';
			let navBar = new Setting(containerEl)
			.setClass('ac-navigation-bar')  
			.addButton(buttonAddCatalogComp => {
				
				buttonAddCatalogComp  
				.setButtonText('Add catalog')
				.setClass('ac-button')
				.setIcon('circle-plus')  
				.onClick(() => { 
					inputCatalogNameEl?.classList.toggle('ac-hold');
					submitCatalogNameEl?.classList.toggle('ac-hold');
				})
				.setTooltip  
			})
			.addText(input => {
				
				
				input.inputEl.maxLength = 20;
				
				inputCatalogNameComp = input;
				inputCatalogNameEl = input.inputEl;				
				
				input.onChange(async (value) => {

					inputCatalogNameValue = value;
				})
			})
			.addExtraButton(submit => {
				compSubmitCatalogName = submit;
				submitCatalogNameEl = submit.extraSettingsEl;

				submit 
				.setIcon('check')
				.onClick(async () => {
				if (handlesInvalidInput(inputCatalogNameEl, inputCatalogNameValue, catalogs)) {
				} else {
						inputCatalogNameEl?.classList.add('ac-hold');
						submitCatalogNameEl?.classList.add('ac-hold');
						settings.catalogs.push({
							name: inputCatalogNameValue.trim(),
							items: []
						});
						createButton(navBar, inputCatalogNameValue, buttonMainSettingsComp);
						inputCatalogNameComp.setValue('')
						await plugin.saveSettings();
						
					}
				})
			})
			.addButton(buttonMainSettings => {
			
			buttonMainSettingsComp = buttonMainSettings;
				
			buttonMainSettings
				.setButtonText('Main settings')
				.setClass('ac-button-main-settings')
				.setIcon('settings')  
				.onClick(() => { 
					renderMainSettings(navBar, buttonMainSettings);
				})
				.setTooltip  
			})

			inputCatalogNameEl?.classList.add('ac-hold');
			submitCatalogNameEl?.classList.add('ac-hold');

			renderCatalogTabs(catalogs, navBar, buttonMainSettingsComp);

			return navBar;
		}

		/**
		 * Processes an incorrect input
		 * @param inputEl - The field above which the notification should be displayed
		 * @param checkValue - The value that needs to be checked
		 * @param catalogs - An array of objects with all values
		 * @param type?: string - Type for new item (Optional) 
		 * @returns boolean
		 */
		function handlesInvalidInput (inputEl: HTMLElement, checkValue: string, catalogs: any[], type: string | undefined = undefined) {
			
			if (!checksValueInput(checkValue, catalogs, 'Duplicates', type).value.result) {
				displayTooltip(inputEl, 'Such a name already exists', {
					placement: 'bottom',
					classes: ['ac-invalid-tooltip']
				} )	
				return true					
			} else if (checkValue.trim().length === 0) {
				displayTooltip(inputEl, 'The input cannot be empty', {
					placement: 'bottom',
					classes: ['ac-invalid-tooltip']
				} )
				return true	
			} else if (!checksValueInput(checkValue, catalogs, 'Symbols').value.result){
				displayTooltip(inputEl, 'For the name, you can not use a space at the beginning and end, as well as characters: .[]#^*<>:?/|\\ in any part of the name.', {
					placement: 'bottom',
					classes: ['ac-invalid-tooltip']
				} )
				return true	
			} else {
				false
			}
		}

		/**
		 * Checks the value for validity
		 * @param value: string
		 * @param catalogs: [] - an array of objects with all values 
		 * @param typeChecked 
		 * @param type?: string - Type for new item (Optional)
		 */
		function checksValueInput (value: string, catalogs: any[], typeChecked: 'Symbols'| 'Duplicates', type: string | undefined = undefined) {
			let checkResult = {};

			if (typeChecked === 'Symbols') {
				checkResult = checksSymbols(value);
			}

			if (typeChecked === 'Duplicates') {
				checkResult = checksDuplicates(value, catalogs, type);
			}

			return checkResult;

			/**
			 * Checks the value for valid symbols
			 * @param value - the value being checked
			 * @returns { checkName: string, value: {result: boolean, message: string }
			}
			 */
			function checksSymbols (value: string) {
				const regexInput = /^([^\.\[\]\#\^\|\/\*\<\>\:\?\s"]{1}[^\[\]\#\^\|\/\*\<\>\:\?\\"]{0,253}[^\.\[\]\#\^\|\/\*\<\>\:\?\s"\\]{1})$|^[^\.\[\]\#\^\|\/\*\<\>\:\?\s"\\]{1}$/
				if (!regexInput.test(value)) {
					return {
						checkName: checksSymbols.name,
						value: {
							result: false,
							//message: 'For the name, you can not use a space at the beginning and end, as well as characters: .[]#^*<>:?/|\\ in any part of the name.'
						}
					}
				} else {
					return {
						checkName: checksSymbols.name,
						value: {
							result: true,
							//message: 'Verification is successful'
						}
					}
				}
			}

			/**
			 * Checks the value for duplicates
			 * @param value - the value being checked
			 * @param catalogs - an array of objects with all values 
			 * @param type?: string - Type for new item (Optional)
			 */
			function checksDuplicates (value: string, catalogs: any[], type: string | undefined) {
				let result;
				if (catalogs !== undefined) {					
					result = catalogs.some((catalog: any)=> {
						if (catalog.hasOwnProperty('name')) {
							return catalog.name === value;
						} else if (catalog.hasOwnProperty('itemName')) {
							return catalog.itemName === value && catalog.itemType === type;
						}		
					})
				} else {
					result = false;
				}	
				if (result) {
					return {
						checkName: checksDuplicates.name,
						value: {
							result: false,
							//message: 'Such a name already exists'
						}
					}
				} else {
					return {
						checkName: checksDuplicates.name,
						value: {
							result: true,
							//message: 'Verification is successful'
						}
					}
				}	
			}
		}
		

		/**
		 * Очищает акцент у всех компонентов экземпляра являющихся кнопками 
		 * @param components массив с компонентами экземпляра предоставляемый Obsidian API
		 */

		function clearAllCta (components: any[]) {
			components.forEach((component, i)=> {
				if (component.buttonEl !== undefined) {
					component.removeCta()
				 }
			})
		}






		/**
		 * Создает новую кнопку с пользовательским именем
		 * @param instSetting - экземпляр объекта Setting Obsidian API
		 * @param buttonName - Текст для новой кнопки
		 */
		function createButton (instSetting: Setting, buttonName: string, buttonMainSettingsComp: ButtonComponent) {
			try {
				instSetting.addButton(tab => {
					tab
					.setButtonText(buttonName)
					.setClass('ac-catalog-tab')
					.onClick(()=> {

						let indexTab = catalogs.findIndex((element: { name: string; }) => element.name === tab.buttonEl.textContent)						
						clearAllCta(instSetting.components);
						tab.setCta();
						containerEl.querySelector('.container-catalog')?.remove()
						containerEl.querySelector('.container-settings')?.remove()
						renderCatalog(catalogs[indexTab].items, plugin, indexTab, instSetting, buttonMainSettingsComp);
						
					})
				})
			} catch (err) {
				console.log(createButton.name, err)
			}
					
		}


		/**
		 * Создает контейнер с главными настройками плагина
		 * @param instSetting - экземпляр объекта navBar Setting Obsidian API
		 */
		function renderMainSettings (instSetting: Setting, buttonMainSettingsComp: ButtonComponent) {
			containerEl.querySelector('.container-settings')?.remove();
			containerEl.querySelector('.container-catalog')?.remove();
			instSetting.components.forEach((component, i)=> {
				if (component.buttonEl !== undefined) {
					component.removeCta()
				}
				
			})
			buttonMainSettingsComp.setCta()


			const containerMainSettings = containerEl.createEl('div', {
				cls: 'container-settings'
			})

			let settingDeleteCatalogs = new Setting (containerMainSettings)
			.setName('Delete all created catalogs')
			.setDesc('Caution! This function will completely delete all created directories without the possibility of restoring them.')
			.addButton(buttonCatalogsDelet => buttonCatalogsDelet
				.setButtonText('Delete all catalogs')
				.setClass('ac-delete-button')
				.onClick(async () => {
					new ModalSubmitDelete(app, 'Вы действительно хотите удалить все элементы', (results)=> {
						if (results) {
							catalogs.splice(0);
							plugin.saveSettings();
							instSetting.clear();
							containerEl.querySelector('.ac-navigation-bar')?.remove();
							renderMainSettings(renderNavBar(plugin), buttonMainSettingsComp);
							//renderCatalogTabs(catalogs, instSetting, buttonMainSettingsComp);
						}
					}).open();
					
				})
			)
		}

		/**
		 * Загружает все вкладки в navBar на странице загрузок на основании массива данных
		 * @param catalogData - массив объектов с данными каждого каталога
		 * @param instSetting - экземпляр объекта navBar Setting Obsidian API
		 */
		function renderCatalogTabs (catalogData: any[], instSetting: Setting, buttonMainSettingsComp: ButtonComponent) {
			instSetting.components.forEach ((component, i, components)=> {
				if (component.buttonEl !== undefined) {
					if (component.buttonEl.classList.contains('ac-catalog-tab')) {
					//component.buttonEl.remove()
					instSetting.components.splice(i,1)
					
					}
				}
				
			})

			// Для каждого каталога вызывает функцию по созданию вкладки
			catalogData.forEach((catalog)=> {
				createButton (instSetting, catalog.name, buttonMainSettingsComp);
			})
		}






		
		
		/**
		 * Renders the catalog items
		 * @param catalog 
		 * @param plugin 
		 * @param indexCatalog 
		 */
		
		function renderCatalog (catalog: any[], plugin: any, indexCatalog: number, instSetting: Setting, buttonMainSettingsComp: ButtonComponent) {

			const availableItemTypes = ['folder', 'file'];
			const cssClassContainerElement = 'catalog-item';
				
			const containerCatalog = containerEl.createEl('div', {
				cls: 'container-catalog'
			})
			const containerCatalogSettings = containerCatalog.createEl('div', {
				cls: 'container-catalog-sttings'
			})

			let inputItemNameEl: HTMLInputElement;
			let inputItemNameComp: TextComponent;
			let inputItemNameValue: string = '';


			const catalogSettings = new Setting(containerCatalog)
				.setName('Create a root directory item')
				.setDesc('Create a template for files and folders that can be added from the context menu of the file manager.')
				.addText(elementNameInput => {
					
					inputItemNameComp = elementNameInput;
					inputItemNameEl = elementNameInput.inputEl;


					elementNameInput.setPlaceholder('Name file or folder')
					//.setValue(this.plugin.settings.catalog)
					.onChange(async (value) => {
						inputItemNameValue = value;
					})
					//.setValue(settings.valueInput)
				})
				.addButton(button => button
					.setButtonText("Add file")
					.setTooltip('Add file')
					.setIcon("file-plus")
					.onClick(async () => {												
							if (handlesInvalidInput(inputItemNameEl, inputItemNameValue, catalog, availableItemTypes[1])) {
								
							} else {
								catalog.push({
								itemType: availableItemTypes[1],
								itemName: inputItemNameValue,
								itemChilds: [],
								settingKeys: {
									isCollapsedSettingWindow: undefined
								},
								});

							sortsCatalog(catalog);
							uploadCatalogContainer(undefined, catalog, containerCatalog, indexCatalog, -1, true);
							inputItemNameComp.setValue('');
							await plugin.saveSettings();
							}
						
					})
				)
				.addButton(button => button
					.setButtonText("Add folder")
					.setTooltip('Add folder')
					.setIcon("folder-plus")
					.onClick(async () => {
						try {
							if (handlesInvalidInput(inputItemNameEl, inputItemNameValue, catalog, availableItemTypes[0])){

							} 
							else {
								catalog.push({
								itemType: availableItemTypes[0],
								itemName: inputItemNameValue,
								itemChilds: [],
								settingKeys: {
									isCollapsedSettingWindow: true
								},
							});
							sortsCatalog(catalog);
							uploadCatalogContainer(undefined, catalog, containerCatalog, indexCatalog, -1, true);
							inputItemNameComp.setValue('');
							await plugin.saveSettings();
							}
						} catch (err) {
							console.log('An error occurred when creating the root folder!', err)
						}
					})
				);
				

				// Контейнер настройки определенного каталога
				new Setting(containerCatalogSettings)
					.setName('Delete this catalog')
					.addButton(button=>button
						.setButtonText('Delete')
						.setClass('ac-delete-button')
						.onClick(async () => {
							
							new ModalSubmitDelete(app, 'Вы действительно хотите удалить этот элемент', (results)=> {
								if (results) {
									catalogs.splice(indexCatalog,1);
									plugin.saveSettings();
									instSetting.clear();
									containerEl.querySelector('.ac-navigation-bar')?.remove();
									renderNavBar(plugin);
									renderMainSettings(instSetting, buttonMainSettingsComp);
								}
							}).open();
						})	
					)



				

				/**
				 * Обновляет список DOM элементов на основе глобального объекта настроек
				 * @param indexCreateElement {number | undefinde} индекс элемента, который нужно добавить, если undefined, то обновляет весь список
				 */

				function uploadCatalogContainer (
					indexCreateElement: number | undefined, 
					catalogDir: { itemType: string; itemName: string; }[], 
					parentContainerEl: HTMLElement,
					indexCatalog: number, 
					nestingLevel = -1,
					isEnabledClearContainer: boolean = false,
				){

					
					/**
					 * Deleted null value from catalog
					 * @param currentCatalog 
					 */

					function clearsCatalogNull (currentCatalog: Array<{itemName: string, itemType: string, itemChilds: []  }>){
						 try {
							// Check if the input parameter is an array
							if (!Array.isArray(currentCatalog)) {
								throw new Error('The input parameter must be an array');
							}

							// Use a reverse loop for safe element removal
							for (let i = currentCatalog.length - 1; i >= 0; i--) {
								const item = currentCatalog[i];

								// Check the current item
								if (item === null || item === undefined) {
									currentCatalog.splice(i, 1);
								} else {
									// Check for the presence and correctness of nested elements
									if (item.hasOwnProperty('itemChilds') && 
										Array.isArray(item.itemChilds)) {
										clearsCatalogNull(item.itemChilds);
									}
								}
							}
						} catch (err) {
							console.error(`Error in ${clearsCatalogNull.name}:`, err.message);
						}
					}

					clearsCatalogNull(catalogDir);					
					sortsCatalog(catalogDir);

					if (isEnabledClearContainer) {
						deleteCatalogContainer(parentContainerEl);
					}

					nestingLevel = nestingLevel + 1;

					catalogDir.forEach((value: {
						settingKeys: any;
						itemChilds: any; itemType: string; itemName: string; }, i: number, array) => {
							if (value !== null){
						
							if (i == indexCreateElement || indexCreateElement == undefined) {
							

								function createContainer (parentContainer: HTMLElement) {
												
								
								// Создается родительский контейнер элемента
								let containerItemEl = parentContainer.createEl('div', {
									cls: cssClassContainerElement  
								});
								containerItemEl.classList.add('ac-item-container');
								if (value.settingKeys.isCollapsedSettingWindow == true) {
									containerItemEl.setAttribute('collapsed', 'true')
								} else if (value.settingKeys.isCollapsedSettingWindow == false) {
									containerItemEl.setAttribute('collapsed', 'false')
								}
								

								// Если этот контейнер вложен в родительский контейнер и имеет значение ключа isCollapsedSettingWindow true или undefined то он скрывается. Необходимо для function collapsing
								if (containerItemEl.parentNode.getAttribute('collapsed') === 'true') {
									containerItemEl.classList.add('ac-hold');
								}
								


								// Добавляем DOM элемент для value
								//value.domContainer = containerSettingItem

								// Создается контейнер блока информации в родительском контейнере
								let containerItemInfoEl = containerItemEl.createEl('div', {
									cls: 'setting-item-info'
								})
								containerItemInfoEl.classList.add('ac-setting-item-info');

								// Создаем кнопку сворачивания
								if (value.itemType == availableItemTypes[0]){
									let buttonCollapseEl = containerItemInfoEl.createEl('button', {
										text: '>',
										cls: 'ac-collapse-button'
									});
									setIcon(buttonCollapseEl, 'chevron-right');
									if (containerItemEl.getAttribute('collapsed') === 'false') {
										buttonCollapseEl.classList.add('ac-is-expanded');
									}
									
									// Обработчик кнопки button collapse
									buttonCollapseEl.addEventListener('click', () => {
										switchButtonCollapse(containerItemEl, value);
									})

							
								}

								
								// Создаем контэйнер с типом элемента
								let containerItemTypeEl = containerItemInfoEl.createEl('div', {
									text: '{' + value.itemType + '}',
									cls: 'ac-item-type'
								});
								if (value.itemType == availableItemTypes[0]) {
									setIcon(containerItemTypeEl, 'folder');
								} else if (value.itemType == availableItemTypes[1]) {
									setIcon(containerItemTypeEl, 'file');
								}
								
								// Создаем параграф с именем элемента
								let containerItemNameEl = containerItemInfoEl.createEl('p',{
									text: value.itemName,
									cls: 'ac-item-name'
								});

								// Создаем иконку оповещения о возможности переименовывания элемента
								let renameLabelEl = containerItemNameEl.createEl('label',{
									cls: 'ac-rename-label'
								});
								setIcon(renameLabelEl, 'pen-line');


								// Добавляем обработчик событий Rename Item
								containerItemNameEl.addEventListener('click', (event) => {
									
									containerItemNameEl.classList.add('ac-hold');

									createGhostItem(containerItemInfoEl, event.currentTarget, value.itemType, catalogDir).then(answer => {
										if (answer.length != 0 && value.itemName !== answer) {
											//let newItemName = findsUniqueName(array, answer, value.itemType);
											value.itemName = answer;
										}										
										plugin.saveSettings();
										
										uploadCatalogContainer(undefined, catalog, containerCatalog, indexCatalog, -1, true);
										
									});

								}, { once: true });
								
								// Создается контейнер блока управления в родительском контейнере 
								let itemControlContainerEl = containerItemEl.createEl('div', {
									cls: 'setting-item-control'
								});
								itemControlContainerEl.classList.add('ac-setting-item-control');

								// Создаем органы управления в контейнере блока управления в зависимости от условий
								// Если это папка то создается кнопка добавления файлов как орган управления
								if (value.itemType == availableItemTypes[0]) {

									let buttonAddChildFileEl = itemControlContainerEl.createEl('button', {
										text: 'Add File',
										cls: 'ac-add-file-button'
									});
									setIcon(buttonAddChildFileEl, 'file-plus');
									let buttonAddChildFolderEl = itemControlContainerEl.createEl('button', {
										text: 'Add Folder',
										cls: 'ac-add-folder-button'
									});
									setIcon(buttonAddChildFolderEl, 'folder-plus');
									

									
									// Обработка кнопки Add Child Folder

									buttonAddChildFolderEl.addEventListener('click', (event) => {
										switchButtonCollapse(containerItemEl, value, true);
										createGhostItem(containerItemEl, event.currentTarget, availableItemTypes[0], value.itemChilds).then(answer => {									
											if (answer == '') {
												//deleteCatalogContainer(containerCatalog);
												uploadCatalogContainer(undefined, catalog, containerCatalog, indexCatalog, -1, true);
											} else {
												//let newItemName = findsUniqueName(value.itemChilds, answer, availableItemTypes[0]);
												value.itemChilds.push({
													itemType: availableItemTypes[0],
													itemName: answer,
													itemChilds: [],
													settingKeys: {
														isCollapsedSettingWindow: true
													}, 
												});
												plugin.saveSettings();
												sortsCatalog(catalog);
												uploadCatalogContainer(undefined, catalog, containerCatalog, indexCatalog, -1, true);
											}								
																				
										});
									}, { once: true });

			
									// Обработка кнопки Add Child File
									buttonAddChildFileEl.addEventListener('click', (event) => {
										switchButtonCollapse(containerItemEl, value, true);
										createGhostItem(containerItemEl, event.currentTarget, availableItemTypes[1], value.itemChilds).then(answer => {
											if (answer == '') {
												uploadCatalogContainer(undefined, catalog, containerCatalog, indexCatalog, -1, true);
											} else {
												
												//let newItemName = findsUniqueName(value.itemChilds, answer, availableItemTypes[1]);
												value.itemChilds.push({
													itemType: availableItemTypes [1],
													itemName: answer,
													itemChilds: [],
													settingKeys: {
														isCollapsedSettingWindow: undefined
													}, 
												});
												plugin.saveSettings();
												sortsCatalog(catalog);
												uploadCatalogContainer(undefined, catalog, containerCatalog, indexCatalog, -1, true);
											}								
																				
										});
									}, { once: true });
								
								}
								
								// Создается кнопка удаления данного элемента в контейнер блока управления
								let buttonElementRemove = itemControlContainerEl.createEl('button', {
									text: 'Delete',
									cls: 'ac-delete-button'
								});
								setIcon(buttonElementRemove, 'trash');
								
								
								// Оброботчик кнопки Delete у элемента
								buttonElementRemove.onclick = function() {	
									delete catalogDir[i];
									containerItemEl.remove();
									plugin.saveSettings();
									uploadCatalogContainer(undefined, catalog, containerCatalog, indexCatalog, -1, true);
								};
								




								if (value.itemChilds.length > 0) {
									uploadCatalogContainer(undefined, value.itemChilds, containerItemEl, nestingLevel)
								};

								}
								createContainer(parentContainerEl);
						}
					}
					});
				
				}

			/**
			 * Переключает состояние кнопки Button Collapse находящейся в родительском контейнере с помощью удаления или добавления ко всем дочерним элементам класса ac-hold и добавления класса ac-is-expanded к самой кнопке
			 * @param parentEl - DOM родительского элемента в котором содержаться дочерние элементы которые необходимо скрыть или показать
			 * @param catalogItem - элемент из каталога, в который стоит сохранить состояние контейнера
			 * @param requiredСondition - (true|false|undefined) состояние, которое необходимо передать кнопке. Если undefined то функция изменит кнопку на противоположное от текущего состояние
			 */
			function switchButtonCollapse (parentEl: HTMLDivElement, catalogItem: { settingKeys: any; itemChilds?: any; itemType?: string; itemName?: string; }, requiredСondition: boolean | undefined = undefined) {
				try {
					if (requiredСondition == true) {
						catalogItem.settingKeys.isCollapsedSettingWindow = false
					} else if (requiredСondition == false) {
						catalogItem.settingKeys.isCollapsedSettingWindow = true
					} else {
						catalogItem.settingKeys.isCollapsedSettingWindow = !catalogItem.settingKeys.isCollapsedSettingWindow;
					}
					plugin.saveSettings();
					let buttonEl;
					for (let childItemEl of parentEl.childNodes) {
						if (childItemEl.classList.contains('ac-setting-item-info')) {
							buttonEl = childItemEl.querySelector('.ac-collapse-button')
						}
						if (childItemEl.classList.contains(cssClassContainerElement)) {
							if (requiredСondition == true) {
								childItemEl.classList.remove('ac-hold');
							} else if (requiredСondition == false) {
								childItemEl.classList.add('ac-hold');
							} else {
							childItemEl.classList.toggle('ac-hold');
							}
						}
					}
					if (requiredСondition == true) {
						buttonEl.classList.add('ac-is-expanded');
					} else if (requiredСondition == false) {
						buttonEl.classList.remove('ac-is-expanded');
					} else {
					buttonEl.classList.toggle('ac-is-expanded');
					}
				} catch (err) {
					console.log(switchButtonCollapse.name, err)
				}
				
			}

			/**
			 * Очищает DOM дерево созданное на основе Catalog
			 * @param deletableCatalogContainerEl: HTMLDivElement - DOM элемент содержащий все ноды каталога, которые нужно удалить 
			 */
			function deleteCatalogContainer (deletableCatalogContainerEl: HTMLElement){
				deletableCatalogContainerEl.querySelectorAll('.' + cssClassContainerElement).forEach((item)=>{
					item.remove();
				})
			}


			/**
			 * Проверяет массив объектов на наличие одинаковых имен между уже существующим и тем, которое функция принимает в качестве аргумента.
			 * @param arrayWhereFind текущий массив объектов, дочерний Catalog
			 * @param newName имя которое нужно проверить на уникальность
			 * @param newType типа Item который имеет newName
			 * @retirns currentName + уникальный индекс созданный функцией 
			 */

			function findsUniqueName (arrayWhereFind: any[], newName: string, newType: string) {
				if (arrayWhereFind.length == 0) {
					return newName;
				} else {
					const hasName = arrayWhereFind.some(item => item.itemName == newName && item.itemType == newType);
					if (!hasName) {
						return newName;
					} else {
						
						let newNameArr: (any) = newName.split(" ");
						if (isNaN(Number(newNameArr[newNameArr.length-1]))) {
							newNameArr.push('1');
							newName = newNameArr.join(" ")	
						} else {
							let nameIndex: (string|number) = newNameArr[newNameArr.length-1];
							newNameArr[newNameArr.length-1]++;
							newName = newNameArr.join(" ")	
						}
						
						for (; arrayWhereFind.some(item => item.itemName == newName && item.itemType == newType);){
							newNameArr = newName.split(" ");
							newNameArr[newNameArr.length-1]++;
							newName = newNameArr.join(" ")	
						};
						new Notice('An item with that name already exists in this directory, so the "'+ newName +'" item was created.');
						console.log('An item with that name already exists in this directory, so the "'+ newName +'" item was created.')
						return newName;
					}	
				}
				
			}

			/**
			 * Функция сортирующая все элементы массива объектов в catalog по itemName и itemType, в том числе все вложенные массивы объектов в текущий массив объеквтов
			 * @param catalogArray массим объектов, который необходимо сортироваться
			 */

			function sortsCatalog (catalogArray: any[]) {
				
				catalogArray.sort((a, b) => {
					// Проверка на null
					if (a === null || b === null) {
						return a === null ? 1 : -1;
					}

					// Сначала сортируем по типу (папки перед файлами)
					if (a.itemType === 'folder' && b.itemType === 'file') {
						return -1; // Папки выше
					}
					if (a.itemType === 'file' && b.itemType === 'folder') {
						return 1; // Файлы ниже
					}

					// Если типы одинаковые, сортируем по имени
					if (a.itemType === b.itemType) {
						const lettersA = (a.itemName.match(/[a-zA-Z]+/) || [''])[0];
						const lettersB = (b.itemName.match(/[a-zA-Z]+/) || [''])[0];
						
						const numA = parseInt((a.itemName.match(/\d+/) || ['0'])[0], 10);
						const numB = parseInt((b.itemName.match(/\d+/) || ['0'])[0], 10);

						// Сначала сравниваем буквенную часть
						if (lettersA !== lettersB) {
							return lettersA.localeCompare(lettersB);
						}

						// Затем сравниваем числовую часть
						if (numA !== numB) {
							return numA - numB;
						}
					}

					return 0;
						
				})
				
				catalogArray.forEach(item => {
					if (item.itemChilds && item.itemChilds.length > 0) {
						sortsCatalog(item.itemChilds);
					}
				});

				//plugin.saveSettings();
			}

			/**
			 * Создает призрачный контейнер будующего Item с полями для ввода данных
			 * @param containerParentItemEl
			 * @param typeNewItem  
			 * @returns promise
			 */

			async function createGhostItem(containerParentItemEl: HTMLDivElement, eventObject: EventTarget | null | undefined, typeNewItem: string, currentCatalog: any[]) {
				
					let inputGhostItemValue = '';
					let resolvePromise: (value: string) => void; // Хранит ссылку на функцию resolve

					// Создаем промис, который будет ожидать ввода
					const promise = new Promise<string>((resolve) => {
						resolvePromise = resolve;
					});

					// Создаем DOM новой формы
					let containerGhostItemEl = containerParentItemEl.createEl('div', {
						cls: 'ac-ghost-item-container'
					})

					let formGhostItemEl = containerGhostItemEl.createEl('form', {
						cls: 'ac-form-ghost-item',
						attr: {
							name: 'acFormGhostItem'
						}
					});
					let inputFormGhostItemEl = formGhostItemEl.createEl('input', {
						type: 'text',
						attr: {
							//pattern: '[^\\.\\[\\]\\#\\^\\|\\/\\*\\<\\>\\:\\?\\\\\\s"]{1}[^\\[\\]\\#\\^\\|\\/\\*\\<\\>\\:\\?\\\\"]{0,253}[^\\[\\]\\#\\^\\|\\/\\*\\<\\>\\:\\?\\s\\\\"]|[^\\.\\[\\]\\#\\^\\|\\/\\*\\<\\>\\:\\?\\\\\\s"]{1}',
							required: 'true'
						},
						cls: 'ac-input-ghost-item'
					});
					inputFormGhostItemEl.placeholder = `Name of the new ${typeNewItem}`;
					inputFormGhostItemEl.focus();

					let buttonSubmitFormGhostItemEl = formGhostItemEl.createEl('button', {
						text: 'Ok',
					});
					setIcon(buttonSubmitFormGhostItemEl, 'check');
					buttonSubmitFormGhostItemEl.type = 'submit';
				

					/**
					 * Перехватывает событие по отправки формы
					 * @param event Событие, которое необходимо прервать
					 */
					function handleFormSubmit (event: { preventDefault: () => void; }) {
						event.preventDefault();
						
						if (handlesInvalidInput(inputFormGhostItemEl, inputFormGhostItemEl.value, currentCatalog, typeNewItem)) {
							inputFormGhostItemEl.focus();
						} else {
							resolvePromise(inputFormGhostItemEl.value);
						}

						/*const regexInput = /^([^\.\[\]\#\^\|\/\*\<\>\:\?\s"]{1}[^\[\]\#\^\|\/\*\<\>\:\?\\"]{0,253}[^\.\[\]\#\^\|\/\*\<\>\:\?\s"\\]{1})$|^[^\.\[\]\#\^\|\/\*\<\>\:\?\s"\\]{1}$/
						if (regexInput.test(inputFormGhostItemEl.value)) {
							console.log(regexInput.test(inputFormGhostItemEl.value));
							inputGhostItemValue = inputFormGhostItemEl.value;
							
						} else {
							displayTooltip(inputFormGhostItemEl, 'For the name, you can not use a space at the beginning and end, as well as characters: .[]#^*<>:?/|\\ in any part of the name.', {
							placement: 'bottom',
							classes: ['ac-invalid-tooltip']
						})
						
						}*/
						
						
					}

					formGhostItemEl.addEventListener('submit', handleFormSubmit);
					
					function removeGhsotItem () {
						formGhostItemEl.removeEventListener;
						containerGhostItemEl.remove;
						resolvePromise(inputGhostItemValue);
					}

					

					document.addEventListener('click', (event)=> {
						if (containerGhostItemEl.offsetParent !== null && !containerGhostItemEl.contains(event.target as HTMLElement) && event.target !== eventObject) {
							removeGhsotItem();
						}
					})




					return await promise;
			}
				
				uploadCatalogContainer(undefined, catalog, containerCatalog, indexCatalog);
		}

			
	}

	
}

/**
 * 
 * 
 * 
 * 
 * 
 */

