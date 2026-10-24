import {
  canMoveChemicalCargo,
} from "@/domain/rules/chemical_cargo/cargoStatusRules";
import ChemicalCargoStatus from "@/domain/status/ChemicalCargoStatus";

const {
  registered,
  underAnalyses,
  underInspection,
  released,
  blocked,
  moving,
  done,
  canceled,
} = ChemicalCargoStatus;

describe("canMoveChemicalCargo transitions", () => {
  it.each([
    [registered, underAnalyses],
    [underAnalyses, underInspection],
    [underInspection, released],
    [released, moving],
    [moving, done],
    [registered, canceled],
    [underAnalyses, canceled],
    [underInspection, canceled],
    [released, canceled],
    [blocked, canceled],
    [underInspection, blocked],
  ])("allows %s -> %s", (from, to) => {
    expect(canMoveChemicalCargo(from, to).canMove).toBe(true);
  });

  it.each([
    [canceled, released],
    [done, moving],
    [blocked, moving],
    [registered, done],
    [underInspection, done],
    [released, registered],
  ])("forbids %s -> %s", (from, to) => {
    expect(canMoveChemicalCargo(from, to).canMove).toBe(false);
  });

  it.each([done, canceled])("never leaves the terminal state %s", (from) => {
    for (const to of Object.values(ChemicalCargoStatus)) {
      expect(canMoveChemicalCargo(from, to).canMove).toBe(false);
    }
  });

  it("forbids an unknown status", () => {
    expect(canMoveChemicalCargo("Unknown", registered).canMove).toBe(false);
    expect(canMoveChemicalCargo(registered, "Unknown").canMove).toBe(false);
  });
});

describe("canMoveChemicalCargo", () => {
  it("allows a valid transition without reasons", () => {
    expect(canMoveChemicalCargo(released, moving)).toEqual({
      canMove: true,
      cannotMoveReasons: [],
    });
  });

  it("rejects moving a blocked cargo with its own reason", () => {
    expect(canMoveChemicalCargo(blocked, moving)).toEqual({
      canMove: false,
      cannotMoveReasons: ["Cargo status is blocked"],
    });
  });

  it("rejects moving a canceled cargo with its own reason", () => {
    expect(canMoveChemicalCargo(canceled, released)).toEqual({
      canMove: false,
      cannotMoveReasons: ["Cargo status is canceled"],
    });
  });

  it("rejects a transition outside the allowed list with a generic reason", () => {
    expect(canMoveChemicalCargo(registered, done)).toEqual({
      canMove: false,
      cannotMoveReasons: ["Status transition not allowed"],
    });
  });
});
