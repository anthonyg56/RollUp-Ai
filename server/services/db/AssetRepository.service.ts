import { AssetType } from "@server/lib/constants";
import RootFileService from "../FileIO.service";
import type { FileService } from "../FileIO.service";

export class RepositoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RepositoryError";
  };
}

export type QueueAsset = {
  path: string;
  eTag?: string;
  assetId?: string;
};

export type AssetsRecord = Partial<{
  [key in AssetType]: QueueAsset;
}>;

export class AssetsRepository {
  constructor(
    protected readonly path: string,
    protected readonly fileService: FileService,
    protected records: AssetsRecord = {}
  ) {
    const initalized = this.fileService.verifyRepository(path);

    if (!initalized) {
      throw new RepositoryError(`Repository ${path} not initialized`);
    };
  }

  get assets() {
    return this.records;
  }

  /**
   * Returns the **Relative** path of the repository.
   */
  get Path() {
    return this.path;
  }

  getAsset(assetType: AssetType) {
    if (!this.records[assetType]) {
      throw new RepositoryError(`Asset type ${assetType} not found in repository`);
    }

    return this.records[assetType];
  };

  async createAsset(assetType: AssetType, filename: string) {
    const relativeDirPath = `/${assetType}`;

    await this.fileService.createPath(relativeDirPath);
    await this.fileService.createEmptyFile(relativeDirPath, filename);

    const relativeAssetPath = `${relativeDirPath}/${filename}`;

    this.records[assetType] = {
      path: relativeAssetPath,
    };

    return relativeAssetPath;
  };

  getAssetKeyByPath(path: string) {
    return Object
      .keys(this.records)
      .find(key => this.records[key as AssetType]!.path === path) as AssetType;
  }

  async removeAsset(assetType: AssetType) {
    this.checkAssetExists(assetType);
    this.fileService.deleteRepository(this.records[assetType]!.path);

    delete this.records[assetType];
  }

  async createAssetPath(assetType: AssetType) {
    const path = `/${assetType}`;

    await this.fileService.createPath(path);

    return path;
  }

  addAssetId(assetType: AssetType, assetId: string) {
    this.checkAssetExists(assetType);

    this.records[assetType]!.assetId = assetId;
  }

  addAssetETag(assetType: AssetType, eTag: string) {
    this.checkAssetExists(assetType);

    this.records[assetType]!.eTag = eTag;
  }

  checkAssetExists(assetType: AssetType) {
    if (!this.records[assetType]) {
      throw new RepositoryError(`Asset type ${assetType} not found in repository`);
    }

    return this.records[assetType];
  };

  async writeContent(relativePath: string, content: string) {
    await this.fileService.writeToEmptyFile(relativePath, content);
  }

  async readContent(assetType: AssetType) {
    this.checkAssetExists(assetType);

    const asset = this.records[assetType]!;

    return this.fileService.readFile(asset.path);
  };

  // removeAsset(assetType: AssetType) {}
  // insertToDb(assetType: AssetType) {}
  // uploadToR2(assetType: AssetType) {}
  // downloadFromR2(assetType: AssetType) {}
  // 
}
