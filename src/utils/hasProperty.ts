export default function hasProperties(
  obj: Record<any, any>,
  expectedProperties: string[],
) {
  let hasAllExpectedProperties = true;

  for (const property of expectedProperties) {
    if (!hasAllExpectedProperties) continue;

    if (!Object.hasOwn(obj, property)) {
      hasAllExpectedProperties = false;
    }
  }

  return hasAllExpectedProperties;
}
