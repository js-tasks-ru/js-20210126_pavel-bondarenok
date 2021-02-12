export default class SortableTable {
  subElements = {};

  constructor(header = [], {data = []} = {}) {
    this.header = Object.fromEntries(header.map(col => [col.id, col]));
    this.data = data;
    this.render();
  }

  destroy() {
    this.remove();
  }

  remove() {
    this.element.remove();
  }

  getHeaderContent() {
    return Object.values(this.header).map(col =>
      `<div class="sortable-table__cell" data-id="${col.id}" data-sortable="${col.sortable}" >
        <span>${col.title}</span>
      </div>`
    ).join('');
  }

  getBodyContent(data = this.data) {
    const columnsNames = Object.keys(this.header);
    const templateColumns = Object.fromEntries(Object.entries(this.header).filter(([k, v]) => v.hasOwnProperty('template')));
    return data.map(row => {
      const cells = columnsNames.map(name => {
        //Here "this" is undefined.
        if (templateColumns.hasOwnProperty(name)) {
          return templateColumns[name].template(row[name]);
        }
        return `<div class="sortable-table__cell">${row[name]}</div>`;
      }, this).join(''); //Why "this" doesn't exist in internal call?
      return `<a href="/" class="sortable-table__row">${cells}</a>`;
    }, this).join('');
  }

  get template() {
    return `
      <div class="sortable-table">
        <div data-element="header" class="sortable-table__header sortable-table__row">${this.getHeaderContent()}</div>
        <div data-element="body" class="sortable-table__body">${this.getBodyContent()}</div>
      </div>
    `;
  }

  render() {
    const container = document.createElement('div');
    container.innerHTML = this.template;
    this.element = container.firstElementChild;
    this.subElements = this.getSubElements(this.element);
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  sort(fieldName, order = 'asc') {
    if (this.header[fieldName].sortable === false) {
      return;
    }

    const comparer = (fName, dir) => {
      const sortType = this.header[fName].sortType;
      switch (sortType) {
      case 'string':
        return this.data.sort((a, b) => dir * a[fName].localeCompare(b[fName], ['ru-RU', 'en-US'], {caseFirst: 'upper'}));
      case 'number' :
        return this.data.sort((a, b) => dir * (a[fName] - b[fName]));
      default:
        return this.data;
      }
    };

    switch (order) {
    case 'asc':
      this.data = comparer.call(this, fieldName, 1);
      break;
    case 'desc' :
      this.data = comparer.call(this, fieldName, -1);
      break;
    default:
      return;
    }
    this.update();
  }

  update(data = this.data) {
    this.subElements.body.innerHTML = this.getBodyContent(data);
  }
}

