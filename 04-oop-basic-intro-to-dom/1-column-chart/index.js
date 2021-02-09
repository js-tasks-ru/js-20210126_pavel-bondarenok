export default class ColumnChart {
  constructor({data = [], label = '', link = '', value = 0, chartHeight = 50} = {}) {
    this.data = data;
    this.label = label;
    this.link = link;
    this.value = value;
    this.chartHeight = chartHeight;
    this.render();
  }

  destroy() {
    this.remove();
  }

  render() {
    const getColumnProps = (data) => {
      const maxValue = Math.max(...data);
      const scale = this.chartHeight / maxValue;

      return data.map(item => {
        return {
          percent: (item / maxValue * 100).toFixed(0) + '%',
          value: String(Math.floor(item * scale))
        };
      });
    };

    const container = document.createElement('div');
    const columns = getColumnProps(this.data).map(prop => `<div style="--value: ${prop.value}" data-tooltip="${prop.percent}"></div>`).join('');

    container.innerHTML = `<div class="dashboard__chart_orders ${(this.data.length > 0) ? '' : 'column-chart_loading'}">
          <div class="column-chart" style="--chart-height: ${this.chartHeight}">
            <div class="column-chart__title">
              ${this.label ?? ''}
              <a href="${this.link ?? '#'}" class="column-chart__link">View all</a>
            </div>
            <div class="column-chart__container">
              <div data-element="header" class="column-chart__header">${this.value ?? ''}</div>
              <div data-element="body" class="column-chart__chart">
                ${columns}
              </div>
            </div>
          </div>
        </div>`;

    this.element = container.firstElementChild;

  }

  update(newData) {
    this.data = newData;
    this.render();
  }

  remove() {
    this.element.remove();
  }
}
