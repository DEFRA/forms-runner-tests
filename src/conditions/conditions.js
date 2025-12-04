/**
 * @typedef {object} ListItem
 * @property {string} id
 * @property {string} text
 * @property {string} value
 */

/**
 * @typedef {import('../controllers/list-controller.js').ListController} ListController
 */

/**
 * @typedef {object} IsConditionOptions
 * @property {import('@playwright/test').Page} [page]
 * @property {string} id
 * @property {string} name - condition name
 * @property {string} operator
 * @property {string} componentId
 * @property {object} value
 * @property {'ListItemRef' | 'NumberValue'} type
 * @property {ListController} [list] - The ListController instance
 */

export class IsCondition {
  /**
   * @param {IsConditionOptions} options
   */
  constructor({ page, id, name, operator, componentId, value, type, list }) {
    this.page = page;
    this.id = id;
    this.name = name;
    this.operator = operator;
    this.componentId = componentId;
    this.value = value;
    this.type = type;
    this.list = list;
  }

  /**
   * Get all items from the list
   * @returns {ListItem[]}
   */
  get listItems() {
    if (this.type === "ListItemRef" && this.list) {
      return this.list.getAllItems();
    }
    return [];
  }

  /**
   * Get the list item that triggers this condition
   * @returns {ListItem | null}
   */
  get triggerListItem() {
    if (this.type === "ListItemRef" && this.list) {
      return this.list.getItem(this.value.itemId) || null;
    }
    return null;
  }

  /**
   * Get a list item that does NOT trigger this condition
   * @returns {ListItem | null}
   */
  get nonTriggerListItem() {
    if (this.type === "ListItemRef" && this.list) {
      const items = this.list.getAllItems();
      return items.find((item) => item.id !== this.value.itemId) || null;
    }
    return null;
  }

  /**
   * Get the value (text) that triggers this condition
   * @returns {string | null}
   */
  get triggerValue() {
    const item = this.triggerListItem;
    return item ? item.text : null;
  }

  /**
   * Get a value (text) that does NOT trigger this condition
   * @returns {string | null}
   */
  get nonTriggerValue() {
    const item = this.nonTriggerListItem;
    return item ? item.text : null;
  }

  /**
   * Get all non-triggering list items
   * @returns {ListItem[]}
   */
  get allNonTriggerItems() {
    if (this.type === "ListItemRef" && this.list) {
      return this.list
        .getAllItems()
        .filter((item) => item.id !== this.value.itemId);
    }
    return [];
  }
}

/**
 * @typedef {object} IsMoreThanConditionOptions
 * @property {import('@playwright/test').Page} page
 * @property {string} id
 * @property {string} name - condition name
 * @property {string} operator
 * @property {'NumberValue'} type
 * @property {string} componentId
 * @property {number} value
 */
export class IsMoreThanCondition {
  /**
   * @param {IsMoreThanConditionOptions} options
   */
  constructor({ page, id, name, operator, componentId, value, type }) {
    this.page = page;
    this.id = id;
    this.name = name;
    this.operator = operator;
    this.componentId = componentId;
    this.value = value;
    this.type = type;
  }

  /**
   * Get a value that triggers this condition (value > threshold)
   * @returns {number | null}
   */
  get triggerValue() {
    return this.type === "NumberValue" ? this.value + 1 : null;
  }

  /**
   * Get a value that does NOT trigger this condition (value <= threshold)
   * @returns {number | null}
   */
  get nonTriggerValue() {
    return this.type === "NumberValue" ? this.value : null;
  }

  /**
   * Get the boundary value (the threshold itself)
   * @returns {number | null}
   */
  get boundaryValue() {
    return this.type === "NumberValue" ? this.value : null;
  }

  /**
   * Get a value well below the threshold
   * @returns {number | null}
   */
  get safeLowValue() {
    return this.type === "NumberValue" ? Math.max(0, this.value - 1) : null;
  }
}

/**
 * @typedef {object} IsLessThanConditionOptions
 * @property {import('@playwright/test').Page} page
 * @property {string} id
 * @property {string} name - condition name
 * @property {string} operator
 * @property {'NumberValue'} type
 * @property {string} componentId
 * @property {number} value
 */
export class IsLessThanCondition {
  /**
   * @param {IsLessThanConditionOptions} options
   */
  constructor({ page, id, name, operator, componentId, value, type }) {
    this.page = page;
    this.id = id;
    this.name = name;
    this.operator = operator;
    this.componentId = componentId;
    this.value = value;
    this.type = type;
  }

  /**
   * Get a value that triggers this condition (value < threshold)
   * @returns {number | null}
   */
  get triggerValue() {
    return this.type === "NumberValue" ? this.value - 1 : null;
  }

  /**
   * Get a value that does NOT trigger this condition (value >= threshold)
   * @returns {number | null}
   */
  get nonTriggerValue() {
    return this.type === "NumberValue" ? this.value : null;
  }

  /**
   * Get the boundary value (the threshold itself)
   * @returns {number | null}
   */
  get boundaryValue() {
    return this.type === "NumberValue" ? this.value : null;
  }
}

/**
 * @typedef {object} IsAtLeastConditionOptions
 * @property {import('@playwright/test').Page} page
 * @property {string} id
 * @property {string} name - condition name
 * @property {string} operator
 * @property {'NumberValue'} type
 * @property {string} componentId
 * @property {number} value
 */
export class IsAtLeastCondition {
  /**
   * @param {IsAtLeastConditionOptions} options
   */
  constructor({ page, id, name, operator, componentId, value, type }) {
    this.page = page;
    this.id = id;
    this.name = name;
    this.operator = operator;
    this.componentId = componentId;
    this.value = value;
    this.type = type;
  }

  /**
   * Get a value that triggers this condition (value >= threshold)
   * @returns {number | null}
   */
  get triggerValue() {
    return this.type === "NumberValue" ? this.value : null;
  }

  /**
   * Get a value that does NOT trigger this condition (value < threshold)
   * @returns {number | null}
   */
  get nonTriggerValue() {
    return this.type === "NumberValue" ? this.value - 1 : null;
  }
}

/**
 * @typedef {object} IsAtMostConditionOptions
 * @property {import('@playwright/test').Page} page
 * @property {string} id
 * @property {string} name - condition name
 * @property {string} operator
 * @property {'NumberValue'} type
 * @property {string} componentId
 * @property {number} value
 */
export class IsAtMostCondition {
  /**
   * @param {IsAtMostConditionOptions} options
   */
  constructor({ page, id, name, operator, componentId, value, type }) {
    this.page = page;
    this.id = id;
    this.name = name;
    this.operator = operator;
    this.componentId = componentId;
    this.value = value;
    this.type = type;
  }

  /**
   * Get a value that triggers this condition (value <= threshold)
   * @returns {number | null}
   */
  get triggerValue() {
    return this.type === "NumberValue" ? this.value : null;
  }

  /**
   * Get a value that does NOT trigger this condition (value > threshold)
   * @returns {number | null}
   */
  get nonTriggerValue() {
    return this.type === "NumberValue" ? this.value + 1 : null;
  }
}

/**
 * @typedef {object} IsNotConditionOptions
 * @property {import('@playwright/test').Page} [page]
 * @property {string} id
 * @property {string} name - condition name
 * @property {string} operator
 * @property {string} componentId
 * @property {object} value
 * @property {'ListItemRef' | 'NumberValue'} type
 * @property {ListController} [list]
 */
export class IsNotCondition {
  /**
   * @param {IsNotConditionOptions} options
   */
  constructor({ page, id, name, operator, componentId, value, type, list }) {
    this.page = page;
    this.id = id;
    this.name = name;
    this.operator = operator;
    this.componentId = componentId;
    this.value = value;
    this.type = type;
    this.list = list;
  }

  /**
   * Get all items from the list
   * @returns {ListItem[]}
   */
  get listItems() {
    if (this.type === "ListItemRef" && this.list) {
      return this.list.getAllItems();
    }
    return [];
  }

  /**
   * Get the list item that does NOT match (triggers "is not" condition)
   * @returns {ListItem | null}
   */
  get triggerListItem() {
    if (this.type === "ListItemRef" && this.list) {
      const items = this.list.getAllItems();
      return items.find((item) => item.id !== this.value.itemId) || null;
    }
    return null;
  }

  /**
   * Get the list item that DOES match (does not trigger "is not" condition)
   * @returns {ListItem | null}
   */
  get nonTriggerListItem() {
    if (this.type === "ListItemRef" && this.list) {
      return this.list.getItem(this.value.itemId) || null;
    }
    return null;
  }

  /**
   * Get a value (text) that triggers this condition
   * @returns {string | null}
   */
  get triggerValue() {
    const item = this.triggerListItem;
    return item ? item.text : null;
  }

  /**
   * Get the value (text) that does NOT trigger this condition
   * @returns {string | null}
   */
  get nonTriggerValue() {
    const item = this.nonTriggerListItem;
    return item ? item.text : null;
  }
}
