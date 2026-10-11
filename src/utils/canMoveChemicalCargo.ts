import type { ChemicalCargo } from "@/domain/entities/ChemicalCargo";
import ChemicalCargoStatus from "@/domain/status/ChemicalCargoStatus";
import ChemicalCargoStatusRepository from "@/infrastructure/database/repositories/chemical_cargo_status/ChemicalCargoStatusRepository";

const CANNOT_MOVE_REASON = {
  STATUS_BLOCKED: "Cargo status is blocked",
  STATUS_NOT_FOUND: "Cargo status not found",
};

export default async function canMoveChemicalCargo(cargo: ChemicalCargo) {
  let canMove = true;
  const cannotMoveReasons: string[] = [];

  const cargoStatus = await ChemicalCargoStatusRepository.readById(
    cargo.status_id,
  );

  if (!cargoStatus) {
    canMove = false;
    cannotMoveReasons.push(CANNOT_MOVE_REASON.STATUS_NOT_FOUND);
  }

  if (cargoStatus?.description === ChemicalCargoStatus.canceleted) {
    canMove = false;
    cannotMoveReasons.push(CANNOT_MOVE_REASON.STATUS_BLOCKED);
  }

  return { canMove, cannotMoveReasons };
}
