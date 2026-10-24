import ChemicalCargoStatus from "@/domain/status/ChemicalCargoStatus";

const ALLOWED_CHEMICAL_CARGO_MOVEMENTS: Record<string, string[]> = {
  [ChemicalCargoStatus.registered]: [
    ChemicalCargoStatus.underAnalyses,
    ChemicalCargoStatus.canceled,
  ],
  [ChemicalCargoStatus.underAnalyses]: [
    ChemicalCargoStatus.underInspection,
    ChemicalCargoStatus.canceled,
  ],
  [ChemicalCargoStatus.underInspection]: [
    ChemicalCargoStatus.released,
    ChemicalCargoStatus.blocked,
    ChemicalCargoStatus.canceled,
  ],
  [ChemicalCargoStatus.released]: [
    ChemicalCargoStatus.moving,
    ChemicalCargoStatus.canceled,
  ],
  [ChemicalCargoStatus.blocked]: [ChemicalCargoStatus.canceled],
  [ChemicalCargoStatus.moving]: [ChemicalCargoStatus.done],
  [ChemicalCargoStatus.done]: [],
  [ChemicalCargoStatus.canceled]: [],
};

export function canTransition(from: string, to: string) {
  return ALLOWED_CHEMICAL_CARGO_MOVEMENTS[from]?.includes(to) ?? false;
}

const CANNOT_MOVE_REASON = {
  STATUS_BLOCKED: "Cargo status is blocked",
  STATUS_CANCELED: "Cargo status is canceled",
};

export function canMoveChemicalCargo(currentStatus: string) {
  const cannotMoveReasons: string[] = [];

  if (currentStatus === ChemicalCargoStatus.blocked) {
    cannotMoveReasons.push(CANNOT_MOVE_REASON.STATUS_BLOCKED);
  }

  if (currentStatus === ChemicalCargoStatus.canceled) {
    cannotMoveReasons.push(CANNOT_MOVE_REASON.STATUS_CANCELED);
  }

  return { canMove: cannotMoveReasons.length === 0, cannotMoveReasons };
}
