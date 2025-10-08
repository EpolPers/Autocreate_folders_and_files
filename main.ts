/**
 * При написании кода используются следующие термины для наименования сущностей
 * Catalog - набор эелементов, которые создаются одномоментно.
 * Item - единичная структура каталога, которая создается на основании правил предопределенных пользователем.
 */

import { App, Editor, MarkdownView, Modal, Notice, Plugin, setIcon, PluginSettingTab, Setting } from 'obsidian';
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
		containerEl.empty();

		
		const plugin = this.plugin;
		const settings = plugin.settings;

		const catalogs = settings.catalogs;

		let inputCatalogNameEl: HTMLInputElement | null;
		let submitCatalogNameEl: Element | null;

		let navBar = new Setting(containerEl)
		.setClass('ac-navigation-bar')  
		.addButton(button => {
			
			button  
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
			
			inputCatalogNameEl = input.inputEl;
			
			input.onChange(async (value) => {
				settings.catalogNameInput = value;
			})
		})
		.addExtraButton(submit => {

			submitCatalogNameEl = submit.extraSettingsEl;

			submit 
			.setIcon('check')
			.onClick(async () => {
				
				submitCatalogNameEl = navBar.controlEl.querySelector('div[class*="extra-setting-button"]');

				inputCatalogNameEl?.classList.add('ac-hold');
				navBar.controlEl.querySelector('div[class*="extra-setting-button"]')?.classList.add('ac-hold');

				settings.catalogs.push({
					name: settings.catalogNameInput,
					items: []
				});

				createButton(navBar, settings.catalogNameInput);
				await this.plugin.saveSettings();
			})
		
			
		
		})// Кнопка ниже позже будет удалена
		.addExtraButton(buttonCatalogsDelet => buttonCatalogsDelet
			.setIcon('trash')
			.onClick(async () => {
				catalogs.forEach((el: any, i: any)=> {
					catalogs.splice(i)
				})
				await this.plugin.saveSettings();
			})
		)
		.addButton(button => button
			.setButtonText('Main settings')
			.setClass('ac-button')
			.setIcon('settings')  
			.onClick(() => { 
				/* Здесь позже будет обработчик с открытием контейнера главных настроек */
			})
			.setTooltip  
		)

	inputCatalogNameEl?.classList.add('ac-hold');
	submitCatalogNameEl?.classList.add('ac-hold');

	uploadNavBar(catalogs)
		

	/**
	 * Создает новую кнопку с пользовательским именем
	 * @param instSetting - экземпляр объекта Setting Obsidian API
	 * @param buttonName - Текст для новой кнопки
	 */
	function createButton (instSetting: Setting, buttonName: string) {
		instSetting.addButton(button => {
			button
			.setButtonText(buttonName)
			.setClass('ac-catalog-tab')
			.onClick(()=> {
				//Получаем все кнопки в navBar и удаляем у них акцентный css класс, а так же находим текущую кнопку с нужным индексом
				
				let indexCurrentCatalog;
				let notCatalogTabCount = 0;
				instSetting.components.forEach((component, i)=> {	
					if (component.buttonEl !== undefined) {
						if (component.buttonEl.isEqualNode(button.buttonEl)) {
							
							if (button.buttonEl.textContent == catalogs[i - notCatalogTabCount].name) {
								indexCurrentCatalog = i - notCatalogTabCount	
							} else {
								console.log('Catalog index matching error!')
							}	
						}
						if (component.buttonEl.classList.contains('ac-catalog-tab')) {
							component.removeCta()
						} else {
							notCatalogTabCount++;
						}
					} else {
						notCatalogTabCount++;
					}	
				})
				button.setCta()

				if (indexCurrentCatalog !== undefined) {
					
					console.log(catalogs[indexCurrentCatalog])
					//uploadCatalogContainer(undefined, catalogs[indexCurrentCatalog].items, containerCatalog)
				} else {
					console.log('Catalog index matching error!')
				}
				
			})
		}) 
				
	}

	/**
	 * Загружает все вкладки в navBar на странице загрузок на основании массива данных
	 * @param catalogList - массив объектов с данными каждого каталога
	 */
	function uploadNavBar (catalogList: any[]) {
		catalogList.forEach((catalog)=> {
			createButton (navBar, catalog.name);
		})
	}





		
		
	const catalog = settings.catalogElements;
	
	const availableItemTypes = ['folder', 'file'];
	const cssClassContainerElement = 'catalog-item';
			
	

	const containerCatalog = containerEl.createEl('div', {
		cls: 'container-catalog'
	})

			
		const catalogSettings = new Setting(containerCatalog)
			.setName('Catalog #1')
			.setDesc('Create a template for files and folders that can be added from the context menu of the file manager.')
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
						let newNameItem = findsUniqueName(catalog, settings.valueInput, availableItemTypes[1])
						catalog.push({
						itemType: availableItemTypes[1],
						itemName: newNameItem,
						itemChilds: [],
						settingKeys: {
							isCollapsedSettingWindow: undefined
						},
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
						let newNameItem = findsUniqueName(catalog, settings.valueInput, availableItemTypes[0])
						catalog.push({
						itemType: availableItemTypes[0],
						itemName: newNameItem,
						itemChilds: [],
						settingKeys: {
							isCollapsedSettingWindow: true
						},
					});
					uploadCatalogContainer(catalog.length - 1, catalog, containerCatalog);

			
					
					await this.plugin.saveSettings();
					}
				})
			);
			
			




			/**
			 * Функция сортирующая все элементы массива объектов в catalog по itemName и itemType, в том числе все вложенные массивы объектов в текущий массив объеквтов
			 * @param catalogArray массим объектов, который необходимо сортироваться
			 */

			function sortsItem (catalogArray: any[]) {
				
				catalogArray.sort((a, b) => {
					if (a !== null && b !== null){	
						if (a.itemChilds.length > 0) {
							console.log(a)
							sortsItem(a.itemChilds)
						}

						if (a.itemType !== b.itemType) {
							return a.itemType.localeCompare(b.itemType)
						}

						// Если типы одинаковы — сортировка по имени
						const nameA = a.itemName.toLowerCase();
						const nameB = b.itemName.toLowerCase();
						if (nameA < nameB) {
							return -1;
						} 
						if (nameA > nameB) {
							return 1;
						} 
						return 0;
					}
	
				})
				plugin.saveSettings();
			}

			/**
			 * Обновляет список DOM элементов на основе глобального объекта настроек
			 * @param indexCreateElement {number | undefinde} индекс элемента, который нужно добавить, если undefined, то обновляет весь список
			 */

			function uploadCatalogContainer (
				indexCreateElement: number | undefined, 
				catalogDir: { itemType: string; itemName: string; }[], 
				parentContainer: HTMLElement, 
				nestingLevel = -1,
				isDeleteCreatedItems: boolean = false,
			){

				console.log(catalog)
				
				/**
				 * Удаляет все значения null в catalog
				 * @param currentCatalog 
				 */

				function deletesNullValue (currentCatalog: any[]){
					try {
					currentCatalog.forEach((value, i) => {
						if (value == null) {
							if (currentCatalog.length > 1) {
								currentCatalog.splice(i, 1)
							}
							else if (currentCatalog.length == 1) {
								currentCatalog.splice(0)
							}
						} else if (value.itemChilds.length > 0) {
							deletesNullValue(value.itemChilds);
						}	
					})
					plugin.saveSettings();
					} catch (err) {
						console.log(deletesNullValue.name, err)
					}
				}

				deletesNullValue(catalog);

				if (isDeleteCreatedItems) {
					deleteCatalogContainer(parentContainer);
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
							

							let containerItemNameEl = containerItemInfoEl.createEl('p',{
								text: value.itemName,
								cls: 'ac-item-name'
							});

							// Добавляем обработчик событий Rename Item
							containerItemNameEl.addEventListener('click', (event) => {
								
								containerItemNameEl.classList.add('ac-hold');

								createGhostItem(containerItemInfoEl, event.currentTarget, value.itemName).then(answer => {
									if (answer.length != 0 && value.itemName !== answer) {
										let newItemName = findsUniqueName(array, answer, value.itemType);
										value.itemName = newItemName;
									}										
									plugin.saveSettings();
									
									uploadCatalogContainer(undefined, catalog, containerCatalog, -1, true);
									
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
									createGhostItem(containerItemEl, event.currentTarget, 'Name child folder').then(answer => {
										if (answer.length == 0) {
											//deleteCatalogContainer(containerCatalog);
											uploadCatalogContainer(undefined, catalog, containerCatalog,-1, true);
										} else {
											let newItemName = findsUniqueName(value.itemChilds, answer, availableItemTypes[0]);
											value.itemChilds.push({
												itemType: availableItemTypes[0],
												itemName: newItemName,
												itemChilds: [],
												settingKeys: {
													isCollapsedSettingWindow: true
												}, 
											});
											plugin.saveSettings();

											//deleteCatalogContainer(containerCatalog);
											uploadCatalogContainer(undefined, catalog, containerCatalog,-1, true);
										}								
																			
									});
								}, { once: true });

		
								// Обработка кнопки Add Child File
								buttonAddChildFileEl.addEventListener('click', (event) => {
									switchButtonCollapse(containerItemEl, value, true);
									createGhostItem(containerItemEl, event.currentTarget, 'Name Child File').then(answer => {
										if (answer.length == 0) {
											//deleteCatalogContainer(containerCatalog);
											uploadCatalogContainer(undefined, catalog, containerCatalog,-1, true);
										} else {
											
											let newItemName = findsUniqueName(value.itemChilds, answer, availableItemTypes[1]);
											value.itemChilds.push({
												itemType: availableItemTypes [1],
												itemName: newItemName,
												itemChilds: [],
												settingKeys: {
													isCollapsedSettingWindow: undefined
												}, 
											});
											plugin.saveSettings();

											//deleteCatalogContainer(containerCatalog);
											uploadCatalogContainer(undefined, catalog, containerCatalog,-1, true);
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
								uploadCatalogContainer(undefined, catalog, containerCatalog,-1, true);
							};
							




							if (value.itemChilds.length > 0) {
								uploadCatalogContainer(undefined, value.itemChilds, containerItemEl, nestingLevel)
							};

							}
							createContainer(parentContainer);
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
			
		}

		/**
		 * Очищает DOM дерево созданное на основе Catalog
		 * @param deletableCatalogContainerEl: HTMLDivElement - DOM элемент содержащий все ноды каталога, которые нужно удалить 
		 */
		function deleteCatalogContainer (deletableCatalogContainerEl: HTMLElement){
			console.log('Вызвана функция удаления контейнера каталога'); //🗑️
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
		 * Создает призрачный контейнер будующего Item с полями для ввода данных
		 * @param containerParentItemEl
		 * @param textPlaceholder  
		 * @returns promise
		 */

		async function createGhostItem(containerParentItemEl: HTMLDivElement, eventObject: EventTarget | null | undefined, textPlaceholder: string) {
			
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
					},
					cls: 'ac-input-ghost-item'
				});
				inputFormGhostItemEl.placeholder = textPlaceholder;
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
					inputGhostItemValue = inputFormGhostItemEl.value;
					resolvePromise(inputGhostItemValue);
				}

				formGhostItemEl.addEventListener('submit', handleFormSubmit);
				
				function removeGhsotItem () {
					formGhostItemEl.removeEventListener;
					containerGhostItemEl.remove;
					resolvePromise(inputGhostItemValue);
				}

				

				document.addEventListener('click', (event)=> {
					 if (containerGhostItemEl.offsetParent !== null && !containerGhostItemEl.contains(event.target as HTMLElement) && event.target !== eventObject) {
						console.log(event.target)
						removeGhsotItem();
   					 }
				})




				return await promise;
		}
			sortsItem(catalog);
			uploadCatalogContainer(undefined, catalog, containerCatalog);


			
	}

	
}