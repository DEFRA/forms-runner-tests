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
 * @property {object | number | boolean} value
 * @property {'ListItemRef' | 'NumberValue' | 'BooleanValue'} type
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
    if (this.type === "NumberValue") {
      return typeof this.value === "number" ? this.value : null;
    }
    if (this.type === "BooleanValue") {
      return typeof this.value === "boolean" ? this.value : null;
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
    if (this.type === "NumberValue") {
      // For "is" with numbers, any different number is a non-trigger.
      return typeof this.value === "number" ? this.value + 1 : null;
    }
    if (this.type === "BooleanValue") {
      // For "is" with booleans, the opposite boolean is a non-trigger.
      return typeof this.value === "boolean" ? !this.value : null;
    }
    return null;
  }

  /**
   * Get the value (text) that triggers this condition
   * @returns {string | null}
   */
  get triggerValue() {
    if (this.type === "NumberValue") {
      return typeof this.value === "number" ? this.value : null;
    }
    if (this.type === "BooleanValue") {
      return typeof this.value === "boolean" ? this.value : null;
    }
    const item = this.triggerListItem;
    return item ? item.text : null;
  }

  /**
   * Get a value (text) that does NOT trigger this condition
   * @returns {string | null}
   */
  get nonTriggerValue() {
    if (this.type === "NumberValue") {
      return typeof this.value === "number" ? this.value + 1 : null;
    }
    if (this.type === "BooleanValue") {
      return typeof this.value === "boolean" ? !this.value : null;
    }
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
 * @typedef {object} RelativeDateValue
 * @property {number} period
 * @property {"days" | "months" | "years" | string} unit
 * @property {"in the past" | "in the future" | string} direction
 */

/**
 * @param {any} value
 * @returns {value is RelativeDateValue}
 */
function isRelativeDateValue(value) {
  return (
    value &&
    typeof value === "object" &&
    typeof value.period === "number" &&
    typeof value.unit === "string" &&
    typeof value.direction === "string"
  );
}

/**
 * @param {RelativeDateValue} relative
 * @returns {Date}
 */
function getThresholdDate(relative) {
  const date = new Date();
  const directionMultiplier =
    relative.direction === "in the past"
      ? -1
      : relative.direction === "in the future"
      ? 1
      : -1;

  if (relative.unit === "months") {
    date.setMonth(date.getMonth() + directionMultiplier * relative.period);
    return date;
  }

  if (relative.unit === "years") {
    date.setFullYear(
      date.getFullYear() + directionMultiplier * relative.period
    );
    return date;
  }

  // Default to days
  date.setDate(date.getDate() + directionMultiplier * relative.period);
  return date;
}

/**
 * @param {Date} date
 * @param {number} days
 * @returns {Date}
 */
function addDays(date, days) {
  const out = new Date(date.getTime());
  out.setDate(out.getDate() + days);
  return out;
}

/**
 * @typedef {object} IsMoreThanConditionOptions
 * @property {import('@playwright/test').Page} page
 * @property {string} id
 * @property {string} name - condition name
 * @property {string} operator
 * @property {'NumberValue' | 'RelativeDate'} type
 * @property {string} componentId
 * @property {number | RelativeDateValue} value
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
   * @returns {number | Date | null}
   */
  get triggerValue() {
    if (this.type === "NumberValue") {
      return typeof this.value === "number" ? this.value + 1 : null;
    }

    if (this.type === "RelativeDate" && isRelativeDateValue(this.value)) {
      // "More than N [units] in the past" means a date earlier than the threshold.
      // "More than N [units] in the future" means a date later than the threshold.
      const threshold = getThresholdDate(this.value);
      return this.value.direction === "in the future"
        ? addDays(threshold, 1)
        : addDays(threshold, -1);
    }

    return null;
  }

  /**
   * Get a value that does NOT trigger this condition (value <= threshold)
   * @returns {number | Date | null}
   */
  get nonTriggerValue() {
    if (this.type === "NumberValue") {
      return typeof this.value === "number" ? this.value : null;
    }

    if (this.type === "RelativeDate" && isRelativeDateValue(this.value)) {
      // Use the boundary date itself as a safe non-trigger.
      return getThresholdDate(this.value);
    }

    return null;
  }

  /**
   * Get the boundary value (the threshold itself)
   * @returns {number | Date | null}
   */
  get boundaryValue() {
    if (this.type === "NumberValue") {
      return typeof this.value === "number" ? this.value : null;
    }

    if (this.type === "RelativeDate" && isRelativeDateValue(this.value)) {
      return getThresholdDate(this.value);
    }

    return null;
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
 * @property {'NumberValue' | 'RelativeDate'} type
 * @property {string} componentId
 * @property {number | RelativeDateValue} value
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
   * @returns {number | Date | null}
   */
  get triggerValue() {
    if (this.type === "NumberValue") {
      return typeof this.value === "number" ? this.value - 1 : null;
    }

    if (this.type === "RelativeDate" && isRelativeDateValue(this.value)) {
      // "Less than N [units] in the past" means a date later than the threshold.
      // "Less than N [units] in the future" means a date earlier than the threshold.
      const threshold = getThresholdDate(this.value);
      return this.value.direction === "in the future"
        ? addDays(threshold, -1)
        : addDays(threshold, 1);
    }

    return null;
  }

  /**
   * Get a value that does NOT trigger this condition (value >= threshold)
   * @returns {number | Date | null}
   */
  get nonTriggerValue() {
    if (this.type === "NumberValue") {
      return typeof this.value === "number" ? this.value : null;
    }

    if (this.type === "RelativeDate" && isRelativeDateValue(this.value)) {
      // Use the boundary date itself as a safe non-trigger.
      return getThresholdDate(this.value);
    }

    return null;
  }

  /**
   * Get the boundary value (the threshold itself)
   * @returns {number | Date | null}
   */
  get boundaryValue() {
    if (this.type === "NumberValue") {
      return typeof this.value === "number" ? this.value : null;
    }

    if (this.type === "RelativeDate" && isRelativeDateValue(this.value)) {
      return getThresholdDate(this.value);
    }

    return null;
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
