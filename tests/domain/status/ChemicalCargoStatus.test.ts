import ChemicalCargoStatus, {
  getStatusKey,
} from "@/domain/status/ChemicalCargoStatus";

describe("getStatusKey", () => {
  it.each(Object.entries(ChemicalCargoStatus))(
    "converts the status name of %s",
    (key, description) => {
      expect(getStatusKey(description)).toBe(key);
    },
  );

  it("returns undefined for an unknown status", () => {
    expect(getStatusKey("Unknown")).toBeUndefined();
  });
});
