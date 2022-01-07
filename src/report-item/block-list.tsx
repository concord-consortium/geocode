import { black } from "color-name";

function isBlock(candidate: Block | Element): candidate is Block {
  return (candidate as Block).comment !== undefined;
}

function isDocument(candidate: Document | any): candidate is Document {
  return (candidate as Document).querySelectorAll !== undefined;
}

export interface IBlockDiff {
  missingBlocks: BlockList;
  addedBlocks: BlockList;
  changedBlocks: BlockList;
  addedCount: number;
  missingCount: number;
  changedCount: number;
}

export interface IBlockComment {
  blockType: string;
  comment: string;
}
export interface IBlockStats {
  numBlocks: number;
  numComments: number;
  comments: IBlockComment[];
  blockNames: Record<string, number>;
  allBlocks: string;
}

class Block {
  public name: string;
  public type: string;
  public id: string;
  public comment: string;
  constructor(node: Element | Block) {
    this.comment = "";
    if (isBlock(node)) {
      this.name = node.name;
      this.type = node.type;
      this.id = node.id;
      this.comment = node.comment;
    }
    else {
      this.name = node.getAttribute("name")!;
      this.type = node.getAttribute("type")!.replace(/_/g, " ");
      this.id = node.getAttribute("id")!;
      node.querySelectorAll(":scope > comment").forEach((comment: Element) => {
        const commentText = comment.textContent;
        if (commentText && commentText.length > 0) {
          this.comment = this.comment.concat(commentText + "\n");
        }
      });
    }
  }
  public equals(other: Block) {
    return other.id === this.id;
  }
  public hasComment() {
    return this.comment.length > 1;
  }
}

export class BlockList {
  public blocks: Record<string, Block>;
  constructor(doc: Document | null) {
    this.blocks = {};
    if (doc) {
      doc.querySelectorAll("block").forEach((element: Element) => {
        this.addBlock(new Block(element));
      });
    }
  }
  public addBlock(block: Block) {
    this.blocks[block.id] = block;
  }
  public size() {
    return Object.keys(this.blocks).length;
  }
  public isEmpty() {
    return this.size() === 0;
  }
  public toArray() {
    return Object.values(this.blocks);
  }

  public comments(): IBlockComment[] {
    return this
      .toArray()
      .filter((block) => block.hasComment())
      .map(block => ({ blockType: block.type, comment: block.comment }));
  }

  public typeCount() {
    const results: Record<string, number> = {};
    this.toArray().forEach(block => {
      const count = results[block.type] || 0;
      results[block.type] = count + 1;
    });
    return results;
  }

  public diff(other: BlockList): IBlockDiff {
    const missingBlocks = new BlockList(null);
    const addedBlocks = new BlockList(null);
    const sameBlocks = new BlockList(null);
    const changedBlocks = new BlockList(null);

    Object.keys(other.blocks).forEach(k => {
      if (!this.blocks[k]) {
        missingBlocks.addBlock(other.blocks[k]);
      }
    });

    Object.keys(this.blocks).forEach(k => {
      if (!other.blocks[k]) {
        addedBlocks.addBlock(this.blocks[k]);
      } else {
        if (JSON.stringify(this.blocks[k]) === JSON.stringify(other.blocks[k])) {
          sameBlocks.addBlock(this.blocks[k]);
        }
        else {
          changedBlocks.addBlock(this.blocks[k]);
        }
      }
    });

    return {
      missingBlocks,
      addedBlocks,
      changedBlocks,
      addedCount: addedBlocks.size(),
      missingCount: missingBlocks.size(),
      changedCount: changedBlocks.size()
    };
  }

  public stats(): IBlockStats {
    return {
      numBlocks: this.size(),
      numComments: this.comments().length,
      comments: this.comments(),
      blockNames: this.typeCount(),
      allBlocks: Object.keys(this.blocks).join(", ")
    };
  }
}
