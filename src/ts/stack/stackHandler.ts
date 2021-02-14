import { DrawState } from "../draw/drawState";
import Card from "../draw/card";
import CardCollection from "../draw/cardCollection";

interface MoveCommand {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  length: number;
  card: Card;
  progress: number;
}

interface DropZone {
  x: number;
  y: number;
  width: number;
  height: number;
  stack: number;
}

export default class StackHandler {
  moveCommands: MoveCommand[] = [];
  collection: CardCollection = null;
  dirty: DrawState = DrawState.NONE;
  dropZones: DropZone[] = [];

  constructor(numCards: number[], cardBackImage: HTMLImageElement) {
    this.collection = new CardCollection(numCards, cardBackImage);
    this.collection.forEachCard((card, _index, stackIndex, cardIndex) => {
      const [homeX, homeY] = this.getHome(stackIndex, cardIndex);
      card.left = homeX;
      card.top = homeY;
    });
  }

  dropAt(x: number, y: number) {
    const dropTarget = this.dropZones.find((dropZone) => {
      return (
        x >= dropZone.x &&
        y >= dropZone.y &&
        x <= dropZone.x + dropZone.width &&
        y <= dropZone.y + dropZone.height
      );
    });
    if (dropTarget === undefined) {
      return;
    }

    console.log(`Drop at ${dropTarget.stack}`);
  }

  getHome(stack: number, index: number): [number, number] {
    return [0, 0];
  }
  moveToHome(stack: number, index: number): void {
    if (!this.collection.cardExists(stack, index)) {
      console.warn(`Attempt to move non existing card [${stack},${index}].`);
    }

    const card = this.collection.getCard(stack, index);
    const [homeX, homeY] = this.getHome(stack, index);

    this.moveCommands.push({
      startX: card.left,
      startY: card.top,
      endX: homeX,
      endY: homeY,
      length: Math.sqrt((homeX - card.left) ** 2 + (homeY - card.top) ** 2),
      card: card,
      progress: 0,
    });
    this.dirty = DrawState.MOVE_ONLY;
  }
  setToHome(stack: number, index: number): void {
    if (!this.collection.cardExists(stack, index)) {
      console.warn(`Attempt to set non existing card [${stack},${index}]`);
      return;
    }

    const card = this.collection.getCard(stack, index);
    const [homeX, homeY] = this.getHome(stack, index);
    card.left = homeX;
    card.top = homeY;
  }
  resetAll(): void {
    this.collection.forEachCard((card, _index, stackIndex, cardIndex) => {
      const [homeX, homeY] = this.getHome(stackIndex, cardIndex);
      card.top = homeY;
      card.left = homeX;
    });
  }

  drawUpdate(delta: number): DrawState {
    if (this.moveCommands.length == 0) {
      const result = this.dirty;
      this.dirty = DrawState.NONE;
      return result;
    }
    this.moveCommands = this.moveCommands.filter((command) => {
      command.progress = Math.min(
        command.progress + delta / command.length / 50,
        1
      );
      const smoothProgress = Math.max(
        0,
        Math.min(1, 3 * command.progress ** 2 - 2 * command.progress ** 3)
      );
      command.card.top =
        command.startY + smoothProgress * (command.endY - command.startY);
      command.card.left =
        command.startX + smoothProgress * (command.endX - command.startX);
      if (command.progress < 1) {
        return true;
      }

      command.card.isMoving = false;
      this.dirty = DrawState.ALL;

      return false;
    });
    const result = Math.max(DrawState.MOVE_ONLY, this.dirty);
    this.dirty = DrawState.NONE;
    return result;
  }
}
