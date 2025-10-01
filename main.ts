/**
 * При написании кода используются следующие термины для наименования сущностей
 * Catalog - набор эелементов, которые создаются одномоментно.
 * Item - единичная структура каталога, которая создается на основании правил предопределенных пользователем.
 */

import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { start } from 'repl';

// Remember to rename these classes and interfaces!

interface PluginSettings {
	mySetting: string;
	createdElementType: string;
	valueInput: string;
	catalogElements: any;
}

const DEFAULT_SETTINGS: PluginSettings = {
	mySetting: 'default',
	createdElementType: '',
	valueInput: '',
	catalogElements: [],
}

export default class Autocreate extends Plugin {
	settings: PluginSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		/*const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (_evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
		});*/

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
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
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

class MainSettingTab extends PluginSettingTab {
	plugin: Autocreate;
	
	constructor(app: App, plugin: Autocreate) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;
		const settings = this.plugin.settings;
		const catalog = this.plugin.settings.catalogElements;
		const plugin = this.plugin;

		const cssClassContainerElement = 'catalog-item';

		let domCatalog: any[] = [];
				
		containerEl.empty();

		const containerCatalog = containerEl.createEl('div', {
			cls: 'container-catalog'
		})
	

		const catalogSettings = new Setting(containerCatalog)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(elementNameInput => elementNameInput
				.setPlaceholder('Name file or folder')
				//.setValue(this.plugin.settings.catalog)
				.onChange(async (value) => {
					settings.valueInput = value;
				})
				.setValue(settings.valueInput)
			)
			.addButton(button => button
				.setButtonText("Add file")
				.setTooltip('Add file')
				.setIcon("file-plus")
				.onClick(async () => {
					if (settings.valueInput.length > 0) {
						catalog.push({
						itemType: 'file',
						itemName: settings.valueInput,
						itemChilds: [],
						});
					uploadCatalogContainer(catalog.length - 1, catalog, containerCatalog);
					
					await this.plugin.saveSettings();
					}
				})
			)
			.addButton(button => button
				.setButtonText("Add folder")
				.setTooltip('Add folder')
				.setIcon("folder-plus")
				.onClick(async () => {
					
					if (settings.valueInput.length > 0) {
						catalog.push({
						itemType: 'folder',
						itemName: settings.valueInput,
						itemChilds: [],
					});
					uploadCatalogContainer(catalog.length - 1, catalog, containerCatalog);

			
					
					await this.plugin.saveSettings();
					}
				})
			);
			




			/**
			 * Обновляет список DOM элементов на основе глобального объекта настроек
			 * @param indexCreateElement {number | undefinde} индекс элемента, который нужно добавить, если undefined, то обновляет весь список
			 */

			function uploadCatalogContainer (indexCreateElement: number | undefined, catalogDir: { itemType: string; itemName: string; }[], parentContainer: HTMLElement, nestingLevel = -1) {
				
				
				function deletesNullValue (currentCatalog: any[]){
					currentCatalog.forEach((value, i) => {
						if (value == null) {
							currentCatalog.splice(i, 1)
						} else if (value.itemChilds.length > 0) {
							deletesNullValue(value.itemChilds);
						}

						
				})
				}

				deletesNullValue(catalog);


				nestingLevel = nestingLevel + 1;

				catalogDir.forEach((value: {
					itemChilds: any; itemType: string; itemName: string; }, i: number) => {
					
						if (value !== null){
					
						if (i == indexCreateElement || indexCreateElement == undefined) {
						

							function createContainer (parentContainer: HTMLElement) {
											
							// Создается родительский контейнер элемента
							let containerItemEl = parentContainer.createEl('div', {
								cls: 'setting-item, ' + cssClassContainerElement  
							});
							// Добавляем DOM элемент для value
							//value.domContainer = containerSettingItem

							// Создается контейнер блока информации в родительском контейнере
							let containerItemInfoEl = containerItemEl.createEl('div', {
								cls: 'setting-item-info',
							})
							// Создаем информацию в контейнере блока информации
							let containerItemTypeEl = containerItemInfoEl.createEl('div', {
								text: '{' + value.itemType + '} ',
							});
							let containerItemNameEl = containerItemInfoEl.createEl('p',{
								text: value.itemName,
								cls: 'ac-item-name'
							});

							// Добавляем обработчик событий Rename Item
							containerItemNameEl.addEventListener('click', (event) => {
								
								containerItemNameEl.classList.add('ac-hold');

								createGhostItem(containerItemInfoEl, event.currentTarget).then(answer => {
									if (answer.length != 0) {
										value.itemName = answer;
									}										
									plugin.saveSettings();
									deleteCatalogContainer(containerCatalog);
									uploadCatalogContainer(undefined, catalog, containerCatalog);
									
								});

							}, { once: true });
							
							// Создается контейнер блока управления в родительском контейнере 
							let itemControlContainerEl = containerItemEl.createEl('div', {
								cls: 'setting-item-control',
							});

							// Создаем органы управления в контейнере блока управления в зависимости от условий
							// Если это папка то создается кнопка добавления файлов как орган управления
							if (value.itemType == 'folder') {

								let buttonAddChildFileEl = itemControlContainerEl.createEl('button', {
									text: 'Add File'
								});
								let buttonAddChildFolderEl = itemControlContainerEl.createEl('button', {
									text: 'Add Folder'
								});
								
								// Обработка кнопки Add Child Folder

								buttonAddChildFolderEl.addEventListener('click', (event) => {
								
									createGhostItem(containerItemEl, event.currentTarget).then(answer => {
										if (answer.length == 0) {
											answer = 'New folder'
										}
										
										value.itemChilds.push({
											itemType: 'folder',
											itemName: answer,
											itemChilds: [] 
										});
										plugin.saveSettings();

										deleteCatalogContainer(containerCatalog);
										uploadCatalogContainer(undefined, catalog, containerCatalog);
									
									});
								}, { once: true });

		
								// Обработка кнопки Add Child File
								buttonAddChildFileEl.addEventListener('click', (event) => {
									createGhostItem(containerItemEl, event.currentTarget).then(answer => {
										if (answer.length == 0) {
											answer = 'New file'
										}
										
										value.itemChilds.push({
											itemType: 'file',
											itemName: answer,
											itemChilds: [] 
										});
										plugin.saveSettings();

										deleteCatalogContainer(containerCatalog);
										uploadCatalogContainer(undefined, catalog, containerCatalog);
									
									});
								}, { once: true });
							
							}
							
							// Создается кнопка удаления данного элемента в контейнер блока управления
							let buttonElementRemove = itemControlContainerEl.createEl('button', {
								text: 'Delete'
							});
							
							
							// Оброботчик кнопки Delete у элемента
							buttonElementRemove.onclick = function() {	
								delete catalogDir[i];
								containerItemEl.remove();
								plugin.saveSettings();
							};
							
							if (value.itemChilds.length > 0) {

								uploadCatalogContainer(undefined, value.itemChilds, containerItemEl, nestingLevel)
							};

							//uploadDomArray(domCatalog, nestingLevel)

							}
							createContainer(parentContainer);
					}
				}
				});
			
			}
			/**
			 * 
			 * @param deletableCatalogContainerEl: HTMLDivElement - DOM элемент содержащий все ноды каталога  
			 */
			function deleteCatalogContainer (deletableCatalogContainerEl: HTMLDivElement){
				console.log('Вызвана функция удаления контейнера каталога');
				deletableCatalogContainerEl.querySelectorAll('.' + cssClassContainerElement).forEach((item)=>{
					item.remove();
				})
			}


			
			/**
			 * 
			 * @param buttonSubmitEl 
			 * @param inputEl 
			 * @returns 
			 */
			/*
			async function getInputValue (buttonSubmitEl: HTMLButtonElement, inputEl: HTMLInputElement, variable: any) {
				let inputValue = '';
				let resolvePromise: (value: String) => void; // Хранит ссылку на функцию resolve
				const promise = new Promise((resolve) => {
					resolvePromise = resolve;
				});
				buttonSubmitEl.onclick = () => {
					inputValue = inputEl.value;
					resolvePromise(inputValue); // Разрешаем промис при клике
				};

				variable = promise;
				return await variable;
			}*/

		/**
		 * Создает призрачный контейнер будующего Item с полями для ввода данных
		 * @param containerParentItemEl 
		 * @returns promise
		 */

		async function createGhostItem(containerParentItemEl: HTMLDivElement, eventObject: EventTarget | null | undefined) {
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
						pattern: '[^\\.\\[\\]\\#\\^\\|\\/\\*\\<\\>\\:\\?\\\\\\s"]{1}[^\\[\\]\\#\\^\\|\\/\\*\\<\\>\\:\\?\\\\"]{0,253}[^\\[\\]\\#\\^\\|\\/\\*\\<\\>\\:\\?\\s\\\\"]|[^\\.\\[\\]\\#\\^\\|\\/\\*\\<\\>\\:\\?\\\\\\s"]{1}',
						required: 'true'
					}
				});
				inputFormGhostItemEl.focus();

				let buttonSubmitFormGhostItemEl = formGhostItemEl.createEl('button', {
					text: 'Ok',
				});
				buttonSubmitFormGhostItemEl.type = 'submit';


				/**
				 * Перехватывает событие по отправки формы
				 * @param event Событие, которое необходимо прервать
				 */
				function handleFormSubmit (event: { preventDefault: () => void; }) {
					event.preventDefault();
					inputGhostItemValue = inputFormGhostItemEl.value;
					resolvePromise(inputGhostItemValue);
				}

				formGhostItemEl.addEventListener('submit', handleFormSubmit);
				
				function removeGhsotItem () {
					console.log('Удаляю', containerGhostItemEl)
					formGhostItemEl.removeEventListener;
					containerGhostItemEl.remove;
					resolvePromise(inputGhostItemValue);
				}

				

				document.addEventListener('click', (event)=> {
					console.log(containerGhostItemEl.offsetParent !== null && !containerGhostItemEl.contains(event.target as HTMLElement) && event.target !== eventObject)
					 if (containerGhostItemEl.offsetParent !== null && !containerGhostItemEl.contains(event.target as HTMLElement) && event.target !== eventObject) {
						removeGhsotItem();
   					 }
				})




				return await promise;
		}


			uploadCatalogContainer(undefined, catalog, containerCatalog);


			
	}

	
}