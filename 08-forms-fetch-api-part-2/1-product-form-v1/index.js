import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

const API_ENDPOINTS = {
  categories: 'api/rest/categories',
  products: 'api/rest/products'
};

export default class ProductForm {

  element;
  subElements = {};
  data = {
    categories: [],
    product: {
      images: []
    }
  };
  initRequests = [];

  constructor(productId) {
    this.productId = productId;
    this.initRequests.push(this.getJSON(API_ENDPOINTS.categories, {_sort: 'weight', _refs: 'subcategory'}));
    if (productId) {
      this.initRequests.push(this.getJSON(API_ENDPOINTS.products, {id: productId}));
    } else {
      this.initRequests.push(Promise.resolve([{images: []}]));
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
    this.data = {categories: [], product: {images: []}};
    this.initRequests = [];
  }

  remove() {
    this.element.remove();
  }

  async getJSON(path, query) {
    const url = new URL(path, BACKEND_URL);
    for (const [key, val] of Object.entries(query)) {
      url.searchParams.append(key, val);
    }
    return await fetchJson(url);
  }

  async render() {
    [this.data.categories, [this.data.product]] = await Promise.all(this.initRequests);
    this.element = this.getTemplate();
    this.subElements = this.getSubElements();
    if (this.productId) {
      this.renderProduct();
    }
    this.initEventListeners();
    return this.element;
  }

  renderProduct() {
    for (const [key, val] of Object.entries(this.data.product)) {
      //const el = this.subElements.productForm[key];
      const el = this.subElements.productForm.querySelector(`#${key}`);
      if (el) {
        el.value = val;
      }
    }
    const imgContainer = this.getImageContainer();
    this.subElements['imageListContainer'].append(imgContainer);
    this.updateImageContainerContent();
  }

  getSubElements() {
    return [...this.element.querySelectorAll('[data-element]')].reduce((acc, el) => {
      acc[el.dataset.element] = el;
      return acc;
    }, {});
  }

  getTemplate() {
    const container = document.createElement('div');
    container.innerHTML = `<div class="product-form">
        <form data-element="productForm" class="form-grid">
          <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label">Название товара</label>
              <input required="" type="text" name="title" id="title" class="form-control" placeholder="Название товара">
            </fieldset>
          </div>
          <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea required="" class="form-control" name="description" id="description" data-element="productDescription" placeholder="Описание товара""></textarea>
          </div>
          <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Фото</label>
            <div data-element="imageListContainer"></div>
            <button type="button" name="uploadImage" id="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
          </div>
          <div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
            ${this.getCategories()}
          </div>
          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Цена ($)</label>
              <input required="" type="number" name="price" id="price" class="form-control" placeholder="100">
            </fieldset>
            <fieldset>
              <label class="form-label">Скидка ($)</label>
              <input required="" type="number" name="discount" id="discount" class="form-control" placeholder="0">
            </fieldset>
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input required="" type="number" class="form-control" name="quantity" id="quantity" placeholder="1">
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select class="form-control" name="status" id="status">
              <option value="1">Активен</option>
              <option value="0">Неактивен</option>
            </select>
          </div>
          <div class="form-buttons">
            <button type="submit" name="save" class="button-primary-outline">
              ${this.productId ? 'Сохранить' : 'Добавить'} товар
            </button>
          </div>
        </form>
      </div>`;
    return container.firstElementChild;
  }

  getImageContainer() {
    const imgContainer = document.createElement('ul');
    imgContainer.classList.add('sortable-list');
    return imgContainer;
  }

  updateImageContainerContent() {
    this.subElements['imageListContainer'].firstElementChild.innerHTML = this.data.product.images.map(img => this.getImageItem(img)).join('');
  }

  getImageItem(image) {
    return `<li class="products-edit__imagelist-item sortable-list__item" style="">
              <input type="hidden" name="url" value="${image.url}">
              <input type="hidden" name="source" value="${image.source}">
              <span>
                <img src="icon-grab.svg" data-grab-handle="" alt="grab">
                <img class="sortable-table__cell-img" alt="Image" src="${image.url}">
                <span>${image.source}</span>
              </span>
              <button type="button">
                <img src="icon-trash.svg" data-delete-handle="" alt="delete">
              </button>
            </li>`;
  }

  getCategories() {
    const options = [];
    for (const cat of this.data.categories) {
      for (const sub of cat.subcategories) {
        options.push(`<option value="${sub.id}">${cat.title} > ${sub.title}</option>`);
      }
    }
    return `<select class="form-control" name="subcategory" id="subcategory">
              ${options.join('')}
            </select>`;
  }

  initEventListeners() {
    this.element.querySelector('button[name="uploadImage"]').addEventListener('pointerdown', this.addNewImage);
    this.subElements['imageListContainer'].addEventListener('pointerdown', this.removeImage);
    this.subElements['productForm'].addEventListener('submit', this.formSubmit);
  }

  removeEventListeners() {
    this.element.querySelector('button[name="uploadImage"]').removeEventListener('pointerdown', this.addNewImage);
    this.subElements['imageListContainer'].removeEventListener('pointerdown', this.removeImage);
    this.subElements['productForm'].removeEventListener('submit', this.formSubmit);
  }

  addNewImage = async event => {
    const inputFile = document.createElement('input');
    inputFile.type = 'file';
    inputFile.accept = 'image/*';
    inputFile.onchange = async () => {
      try {
        event.target.classList.add('is-loading');
        event.target.disabled = true;
        const [file] = inputFile.files;
        const form = new FormData();
        form.append('image', file);
        const params = {
          method: 'POST',
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
          },
          body: form
        };
        const url = new URL('/3/image', 'https://api.imgur.com');
        const response = await fetchJson(url, params);
        /*
          ToDo: После решения проблемы с отправкой, проверить работоспособность этой части
         */
        this.data.product.images.push({
          url: response.data.link,
          source: file.name
        });
        this.updateImageContainerContent();
      } catch (ex) {
        console.log(ex);
      } finally {
        event.target.classList.remove('is-loading');
        event.target.disabled = false;
      }

    };
    inputFile.click();
  };

  removeImage = async event => {
    if (!(event.target.tagName === 'IMG' && event.target.closest('button'))) {
      return;
    }

    const imgSource = event.target.closest('li').querySelector('input[name="source"]').value;
    this.data.product.images = this.data.product.images.filter(img => img.source !== imgSource);
    this.updateImageContainerContent();
  };

  formSubmit = async event => {
    event.preventDefault();
    this.save();
  };

  async save() {
    const url = new URL(API_ENDPOINTS.products, BACKEND_URL);
    const product = this.getProductData();
    product.images = this.data.product.images;
    const params = {
      method: this.productId ? 'PATCH' : 'PUT',
      headers: {
        'Content-Type': `application/json`
      },
      body: JSON.stringify(product)
    };
    const response = await fetchJson(url, params);

    const eName = this.productId ? 'product-updated' : 'product-saved';
    const myEvent = new CustomEvent(eName, {detail: response});
    this.element.dispatchEvent(myEvent);
  }

  getProductData() {
    /*It works in browser, but doesn't work for tests
    const formElems = [...this.subElements['productForm']].filter(el => el.classList.contains('form-control'));
    return formElems.reduce((acc, el) => {
      acc[el.name] = parseInt(el.value) || el.value;
      return acc;
    }, {});*/

    const {productForm: form = {}} = this.subElements;
    const controls = ['title', 'description', 'subcategory', 'price', 'discount', 'quantity', 'status'];
    return controls.reduce((acc, field) => {
      const val = form.querySelector(`#${field}`).value;
      switch (field) {
      case 'price':
      case 'discount':
      case 'quantity':
      case 'status':
        acc[field] = parseInt(val);
        break;
      default:
        acc[field] = val;
      }
      return acc;
    }, {id: this.productId || ''});
  }
}
