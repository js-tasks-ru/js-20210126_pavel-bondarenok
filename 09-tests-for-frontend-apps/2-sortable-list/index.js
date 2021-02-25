export default class SortableList {
  element;
  subElements;
  targetItem;
  holderItem;
  cursorOffset = {
    x: 0,
    y: 0
  };

  constructor({items = []} = {}) {
    this.render(items);
    this.initEventsListeners();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = [];
  }

  remove() {
    this.element.remove();
  }

  render(items) {
    const container = document.createElement('ul');
    container.classList.add('sortable-list');
    this.element = container;
    this.update(items);
    return container;
  }

  update(items) {
    this.subElements = items;
    items.forEach((item) => {
      item.classList.add('sortable-list__item');
      this.element.append(item);
    });
  }

  onDeleteHandle(item) {
    this.subElements = this.subElements.filter(itm => itm !== item);
    item.remove();
  }

  onGrabHandle(item, event) {
    event.preventDefault();
    this.cursorOffset.x = event.clientX - item.getBoundingClientRect().left;
    this.cursorOffset.y = event.clientY - item.getBoundingClientRect().top;

    const holder = item.cloneNode(false);
    holder.classList.add('sortable-list__placeholder');
    item.before(holder);
    this.targetItem = item;
    this.holderItem = holder;

    item.classList.add('sortable-list__item_dragging');
    item.style.width = this.holderItem.getBoundingClientRect().width + 'px';
    document.addEventListener('pointermove', this.pointerMove);

    this.moveItem(event.clientX, event.clientY);
  }

  offGrabHandle(item) {
    if (this.holderItem === null) {
      return;
    }
    document.removeEventListener('pointermove', this.pointerMove);
    this.holderItem.before(item);
    this.holderItem.remove();
    this.holderItem = null;
    item.classList.remove('sortable-list__item_dragging');
    item.style.left = '0px';
    item.style.top = '0px';
  }

  moveItem(x, y) {
    this.targetItem.style.left = `${x - this.cursorOffset.x}px`;
    this.targetItem.style.top = `${y - this.cursorOffset.y}px`;
  }

  initEventsListeners() {
    this.element.addEventListener('pointerdown', this.pointerHandlers);
    this.element.addEventListener('pointerup', this.pointerHandlers);
  }

  pointerHandlers = (event) => {
    let [attribute] = Object.keys(event.target.dataset).filter(key => key.indexOf('handle')); //The filter isn't necessary for the current task, but can be used in the future.
    if (attribute === undefined && this.targetItem) {
      [attribute] = Object.keys(this.targetItem.querySelector('[data-grab-handle]').dataset).filter(key => key.indexOf('handle'));
    }
    if (attribute === undefined) {
      return;
    }

    const prefix = {
      pointerdown: 'on',
      pointerup: 'off'
    };
    const itemElement = event.target.closest('li');
    const handlerName = `${prefix[event.type]}${attribute[0].toUpperCase()}${attribute.slice(1)}`;
    if (itemElement && typeof this[handlerName] === 'function') {
      this[handlerName](itemElement, event);
    }
  };

  pointerMove = event => {
    this.moveItem(event.clientX, event.clientY);

    const targetItemBorders = this.targetItem.getBoundingClientRect();
    for (const item of this.subElements) {
      const itemBorders = item.getBoundingClientRect();
      if (targetItemBorders.top < itemBorders.top && targetItemBorders.bottom > itemBorders.top) {
        item.before(this.holderItem);
      }
      if (targetItemBorders.bottom > itemBorders.bottom && targetItemBorders.top < itemBorders.bottom) {
        item.after(this.holderItem);
      }
    }
  };
}
