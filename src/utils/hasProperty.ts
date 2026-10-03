export default function hasProperties<
  T extends Record<any, any>,
  K extends keyof T,
>(obj: T, expectedProperties: K[]) {
  let hasAllExpectedProperties = true;

  for (const property of expectedProperties) {
    if (!hasAllExpectedProperties) continue;

    if (!Object.hasOwn(obj, property)) {
      hasAllExpectedProperties = false;
    }
  }

  return hasAllExpectedProperties;
}
