import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {

  components = {};
  subElements = {};

  constructor() {
    const defRange  = {
      from: new Date(Date.now() - 30 * 86400 * 1000),
      to: new Date()
    };
    this.components.rangePicker = new RangePicker(defRange);
    this.components.ordersChart = new ColumnChart({
      label: 'Заказы',
      link: "/sales",
      url: "/api/dashboard/orders",
      range: defRange,
    });
    this.components.salesChart = new ColumnChart({
      label: 'Продажи',
      url: "/api/dashboard/sales",
      range: defRange,
    });
    this.components.customersChart = new ColumnChart({
      label: 'Клиенты',
      url: "/api/dashboard/customers",
      range: defRange,
    });
    this.components.sortableTable = new SortableTable(header, {
      url: `/api/dashboard/bestsellers?from=${defRange.from.toISOString()}&to=${defRange.to.toISOString()}`
    });
  }

  async render() {
    this.element = this.getTemplate();
    this.subElements = this.getSubElements();

    for (const [name, comp] of Object.entries(this.components)) {
      this.subElements[name].append(comp.element);
    }

    this.initEventListeners();
    return this.element;
  }

  getTemplate() {
    const container = document.createElement('div');
    container.innerHTML = `
        <div class="dashboard full-height flex-column">
            <div class="content__top-panel">
                <h2 class="page-title">Dashboard</h2>
                <div data-element="rangePicker"></div>
            </div>
            <div class="dashboard__charts">
                <div data-element="ordersChart" class="dashboard__chart_orders"></div>
                <div data-element="salesChart" class="dashboard__chart_sales"></div>
                <div data-element="customersChart" class="dashboard__chart_customers"></div>
            </div>
            <h3 class="block-title">Top sales</h3>
            <div data-element="sortableTable"></div>
        </div>`;
    return container;
  }

  getSubElements() {
    return [...this.element.querySelectorAll('[data-element]')].reduce((acc, el) => {
      acc[el.dataset.element] = el;
      return acc;
    }, {});
  }

  initEventListeners() {
    this.element.addEventListener('date-select', (event) => {
      const {from, to} = event.detail;
      this.updateComponents(from, to);
    });
  }

  async updateComponents(from, to) {
    const dataUrl = new URL('/api/dashboard/bestsellers', BACKEND_URL);
    dataUrl.searchParams.append('from', from.toISOString());
    dataUrl.searchParams.append('to', to.toISOString());

    const data = await fetchJson(dataUrl);
    this.components.sortableTable.update(data);

    for (const comp of Object.values(this.components)){
      if (comp.update && comp.update.length === 2) {
        comp.update(from, to);
      }
    }
  }

  destroy() {
    this.remove();
    for (const comp of Object.values(this.components)){
      if (this.destroy) {
        comp.destroy();
      }
    }
  }

  remove() {
    this.element.remove();
  }
}
