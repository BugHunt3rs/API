import ChemicalCargoStatus from "@/domain/status/ChemicalCargoStatus";
import getCargoStatusKey from "@/utils/getCargoStatusKey";

describe("getCargoStatusKey", () => {
  it.each(Object.entries(ChemicalCargoStatus))(
    "converts the status name of %s",
    (key, description) => {
      expect(getCargoStatusKey(description)).toBe(key);
    },
  );

  it("returns undefined for an unknown status", () => {
    expect(getCargoStatusKey("Unknown")).toBeUndefined();
  });
});
