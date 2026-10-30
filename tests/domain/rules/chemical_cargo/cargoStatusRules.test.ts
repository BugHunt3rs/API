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
    expect(canMoveChemicalCargo(from, to, true).canMove).toBe(true);
  });

  it.each<[ChemicalCargoStatusKey, ChemicalCargoStatusKey]>([
    ["canceled", "released"],
    ["done", "moving"],
    ["blocked", "moving"],
    ["registered", "done"],
    ["underInspection", "done"],
    ["released", "registered"],
  ])("forbids %s -> %s", (from, to) => {
    expect(canMoveChemicalCargo(from, to, true).canMove).toBe(false);
  });

  it.each<ChemicalCargoStatusKey>(["done", "canceled"])(
    "never leaves the terminal state %s",
    (from) => {
      for (const to of Object.keys(
        ChemicalCargoStatus,
      ) as ChemicalCargoStatusKey[]) {
        expect(canMoveChemicalCargo(from, to, true).canMove).toBe(false);
      }
    },
  );
});

describe("canMoveChemicalCargo", () => {
  it("allows a valid transition without reasons", () => {
    expect(canMoveChemicalCargo("released", "moving", true)).toEqual({
      canMove: true,
      cannotMoveReasons: [],
    });
  });

  it("rejects moving a blocked cargo with its own reason", () => {
    expect(canMoveChemicalCargo("blocked", "moving", true)).toEqual({
      canMove: false,
      cannotMoveReasons: ["Cargo status is blocked"],
    });
  });

  it("rejects moving a canceled cargo with its own reason", () => {
    expect(canMoveChemicalCargo("canceled", "released", true)).toEqual({
      canMove: false,
      cannotMoveReasons: ["Cargo status is canceled"],
    });
  });

  it("rejects a transition outside the allowed list with a generic reason", () => {
    expect(canMoveChemicalCargo("registered", "done", true)).toEqual({
      canMove: false,
      cannotMoveReasons: ["Status transition not allowed"],
    });
  });
});

describe("canMoveChemicalCargo documentation", () => {
  it.each<[ChemicalCargoStatusKey, ChemicalCargoStatusKey]>([
    ["underAnalyses", "underInspection"],
    ["underInspection", "released"],
  ])("refuses %s -> %s without delivered documentation", (from, to) => {
    expect(canMoveChemicalCargo(from, to, false)).toEqual({
      canMove: false,
      cannotMoveReasons: ["Documentation not delivered"],
    });
  });

  it("allows underInspection -> released with delivered documentation", () => {
    expect(canMoveChemicalCargo("underInspection", "released", true)).toEqual({
      canMove: true,
      cannotMoveReasons: [],
    });
  });

  it.each<[ChemicalCargoStatusKey, ChemicalCargoStatusKey]>([
    ["registered", "underAnalyses"],
    ["underInspection", "blocked"],
    ["released", "moving"],
    ["underInspection", "canceled"],
  ])("does not ask for documentation on %s -> %s", (from, to) => {
    expect(canMoveChemicalCargo(from, to, false).canMove).toBe(true);
  });

  it("does not add the documentation reason to a transition that is already forbidden", () => {
    expect(canMoveChemicalCargo("underAnalyses", "released", false)).toEqual({
      canMove: false,
      cannotMoveReasons: ["Status transition not allowed"],
    });
  });
});
