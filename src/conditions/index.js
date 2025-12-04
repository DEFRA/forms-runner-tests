import {
  IsCondition,
  IsNotCondition,
  IsMoreThanCondition,
  IsLessThanCondition,
  IsAtLeastCondition,
  IsAtMostCondition,
} from "./conditions.js";
import { ListController } from "../controllers/list-controller.js";

export {
  IsCondition,
  IsNotCondition,
  IsMoreThanCondition,
  IsLessThanCondition,
  IsAtLeastCondition,
  IsAtMostCondition,
};

/**
 * Map of operators to their condition classes
 */
const CONDITION_MAP = {
  is: IsCondition,
  "is not": IsNotCondition,
  "is more than": IsMoreThanCondition,
  "is less than": IsLessThanCondition,
  "is at least": IsAtLeastCondition,
  "is at most": IsAtMostCondition,
};

/**
 * @typedef {object} ConditionItemDefinition
 * @property {string} id
 * @property {string} componentId
 * @property {string} operator
 * @property {object} value
 * @property {'ListItemRef' | 'NumberValue'} type
 */

/**
 * @typedef {object} ConditionDefinition
 * @property {string} id
 * @property {string} displayName
 * @property {ConditionItemDefinition[]} items
 */

/**
 * @typedef {object} ListDefinition
 * @property {string} id
 * @property {string} name
 * @property {string} title
 * @property {string} type
 * @property {Array<{id: string, text: string, value: string}>} items
 */

/**
 * @typedef {object} FormDefinition
 * @property {Array<{components: Array<{id: string, list?: string}>}>} pages
 * @property {ConditionDefinition[]} conditions
 * @property {ListDefinition[]} lists
 */

/**
 * Find the list associated with a component
 * @param {FormDefinition} formDefinition
 * @param {string} componentId
 * @returns {ListDefinition | undefined}
 */
function findListForComponent(formDefinition, componentId) {
  for (const page of formDefinition.pages) {
    if (!page.components) continue;
    const component = page.components.find((c) => c.id === componentId);
    if (component && component.list) {
      return formDefinition.lists.find((l) => l.id === component.list);
    }
  }
  return undefined;
}

/**
 * Create a condition instance from a condition definition
 *
 * @param {ConditionDefinition} conditionDef - The condition definition from JSON
 * @param {FormDefinition} formDefinition - The full form definition (for list lookups)
 * @param {import("@playwright/test").Page} page - Playwright page object
 * @returns {object | null} - Condition instance or null if operator not supported
 */
export function createCondition(conditionDef, formDefinition, page) {
  
  const item = conditionDef.items[0];
  if (!item) {
    console.warn(`Condition ${conditionDef.displayName} has no items`);
    return null;
  }

  const ConditionClass = CONDITION_MAP[item.operator];

  if (!ConditionClass) {
    console.warn(`No condition class found for operator: ${item.operator}`);
    return null;
  }

  // Find the associated list and create a ListController if this is a ListItemRef type
  let listController;
  if (item.type === "ListItemRef") {
    const listDef = findListForComponent(formDefinition, item.componentId);
    if (listDef) {
      listController = new ListController({
        id: listDef.id,
        name: listDef.name,
        title: listDef.title,
        type: listDef.type,
        items: listDef.items,
      });
    }
  }

  // Extract the value based on NumberValue or ListItemRef
  const value = item.value;

  return new ConditionClass({
    page,
    id: conditionDef.id,
    name: conditionDef.displayName,
    operator: item.operator,
    componentId: item.componentId,
    value,
    type: item.type,
    list: listController,
  });
}

/**
 * Create all condition instances for a form
 *
 * @param {FormDefinition} formDefinition - The form definition
 * @param {import("@playwright/test").Page} page - Playwright page object
 * @returns {Map<string, object>} - Map of condition ID to condition instance
 */
export function createConditionsForForm(formDefinition, page) {
  const conditionsMap = new Map();

  if (!formDefinition.conditions) {
    return conditionsMap;
  }

  for (const conditionDef of formDefinition.conditions) {
    const condition = createCondition(conditionDef, formDefinition, page);
    if (condition) {
      conditionsMap.set(conditionDef.id, condition);
    }
  }

  return conditionsMap;
}

/**
 * Get the condition that controls a specific page
 *
 * @param {object} pageDef - The page definition
 * @param {Map<string, object>} conditionsMap - Map of condition instances
 * @returns {object | undefined} - The condition instance or undefined
 */
export function getConditionForPage(pageDef, conditionsMap) {
  if (!pageDef.condition) {
    return undefined;
  }
  return conditionsMap.get(pageDef.condition);
}

/**
 * Get list of supported operators
 * @returns {string[]}
 */
export function getSupportedOperators() {
  return Object.keys(CONDITION_MAP);
}

/**
 * Create ListController instances for all lists in a form definition
 *
 * @param {FormDefinition} formDefinition - The form definition
 * @returns {Map<string, ListController>} - Map of list ID to ListController instance
 */
export function createListControllersForForm(formDefinition) {
  const listsMap = new Map();

  if (!formDefinition.lists) {
    return listsMap;
  }

  for (const listDef of formDefinition.lists) {
    const listController = new ListController({
      id: listDef.id,
      name: listDef.name,
      title: listDef.title,
      type: listDef.type,
      items: listDef.items,
    });

    listsMap.set(listDef.id, listController);
  }

  return listsMap;
}

/**
 * Find the ListController associated with a component
 * @param {FormDefinition} formDefinition
 * @param {string} componentId
 * @param {Map<string, ListController>} listsMap
 * @returns {ListController | undefined}
 */
function findListControllerForComponent(formDefinition, componentId, listsMap) {
  for (const page of formDefinition.pages) {
    if (!page.components) continue;
    const component = page.components.find((c) => c.id === componentId);
    if (component && component.list) {
      return listsMap.get(component.list);
    }
  }
  return undefined;
}

/**
 * Create a map of component IDs to their associated condition instances
 * This allows you to quickly find all conditions that depend on a specific component
 *
 * @param {FormDefinition} formDefinition - The form definition
 * @returns {{conditions: Object<string, object[]>, lists: Map<string, ListController>}} - Object with conditions map and lists map
 */
export function getConditionsByComponentId(formDefinition) {
  const componentConditionsMap = {};
  const listsMap = createListControllersForForm(formDefinition);

  if (!formDefinition.conditions) {
    return { conditions: componentConditionsMap, lists: listsMap };
  }

  for (const conditionDef of formDefinition.conditions) {
    for (const item of conditionDef.items) {
      const componentId = item.componentId;

      if (!componentConditionsMap[componentId]) {
        componentConditionsMap[componentId] = [];
      }

      const ConditionClass = CONDITION_MAP[item.operator];

      if (!ConditionClass) {
        console.warn(`No condition class found for operator: ${item.operator}`);
        continue;
      }

      // Find the associated ListController if this is a ListItemRef type
      const listController =
        item.type === "ListItemRef"
          ? findListControllerForComponent(
              formDefinition,
              item.componentId,
              listsMap
            )
          : undefined;

      // Extract the value based on type
      let value;
      if (item.type === "NumberValue") {
        value = item.value;
      } else if (item.type === "ListItemRef") {
        value = item.value;
      }

      const condition = new ConditionClass({
        id: conditionDef.id,
        name: conditionDef.displayName,
        operator: item.operator,
        componentId: item.componentId,
        value,
        type: item.type,
        list: listController,
      });

      componentConditionsMap[componentId].push(condition);
    }
  }

  return { conditions: componentConditionsMap, lists: listsMap };
}
