export default class NotificationMessage {
  static currentMessage;

  constructor(message = '', {duration = 0, type = ''} = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;
    this.render();
  }

  destroy() {
    this.remove();
  }

  getTemplate () {
    return `
      <div class="notification ${this.type}" style="--value: ${this.duration / 1000}s">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">
            ${this.message}
          </div>
        </div>
      </div>`;
  }

  render() {
    const container = document.createElement('div');
    container.innerHTML = this.getTemplate();
    this.element = container.firstElementChild;
  }

  show(target = document.body) {
    if (NotificationMessage.currentMessage) {
      NotificationMessage.currentMessage.remove();
    }
    NotificationMessage.currentMessage = this;
    target.append(this.element);
    setTimeout(() => {
      this.remove();
    }, this.duration);
  }

  remove() {
    this.element.remove();
  }
}
