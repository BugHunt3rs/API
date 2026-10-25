import { canMoveChemicalCargo } from "@/domain/rules/chemical_cargo/cargoStatusRules";
import ChemicalCargoStatus, {
  type ChemicalCargoStatusKey,
} from "@/domain/status/ChemicalCargoStatus";

describe("canMoveChemicalCargo transitions", () => {
  it.each<[ChemicalCargoStatusKey, ChemicalCargoStatusKey]>([
    ["registered", "underAnalyses"],
    ["underAnalyses", "underInspection"],
    ["underInspection", "released"],
    ["released", "moving"],
    ["moving", "done"],
    ["registered", "canceled"],
    ["underAnalyses", "canceled"],
    ["underInspection", "canceled"],
    ["released", "canceled"],
    ["blocked", "canceled"],
    ["underInspection", "blocked"],
  ])("allows %s -> %s", (from, to) => {
    expect(canMoveChemicalCargo(from, to).canMove).toBe(true);
  });

  it.each<[ChemicalCargoStatusKey, ChemicalCargoStatusKey]>([
    ["canceled", "released"],
    ["done", "moving"],
    ["blocked", "moving"],
    ["registered", "done"],
    ["underInspection", "done"],
    ["released", "registered"],
  ])("forbids %s -> %s", (from, to) => {
    expect(canMoveChemicalCargo(from, to).canMove).toBe(false);
  });

  it.each<ChemicalCargoStatusKey>(["done", "canceled"])(
    "never leaves the terminal state %s",
    (from) => {
      for (const to of Object.keys(
        ChemicalCargoStatus,
      ) as ChemicalCargoStatusKey[]) {
        expect(canMoveChemicalCargo(from, to).canMove).toBe(false);
      }
    },
  );
});

describe("canMoveChemicalCargo", () => {
  it("allows a valid transition without reasons", () => {
    expect(canMoveChemicalCargo("released", "moving")).toEqual({
      canMove: true,
      cannotMoveReasons: [],
    });
  });

  it("rejects moving a blocked cargo with its own reason", () => {
    expect(canMoveChemicalCargo("blocked", "moving")).toEqual({
      canMove: false,
      cannotMoveReasons: ["Cargo status is blocked"],
    });
  });

  it("rejects moving a canceled cargo with its own reason", () => {
    expect(canMoveChemicalCargo("canceled", "released")).toEqual({
      canMove: false,
      cannotMoveReasons: ["Cargo status is canceled"],
    });
  });

  it("rejects a transition outside the allowed list with a generic reason", () => {
    expect(canMoveChemicalCargo("registered", "done")).toEqual({
      canMove: false,
      cannotMoveReasons: ["Status transition not allowed"],
    });
  });
});
